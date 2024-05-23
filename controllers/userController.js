const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/emailHelper");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
exports.signUp = async (req, res, next) => {
  try {
    let result;
    if (req.files) {
      let file = req.files.photo;
      result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "user",
        width: 120,
        crop: "scale",
      });
    }
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
      return next(Error("Please enter name, email and password")); // since error is an middleware use next
    }
    const user = await User.create({
      name: name, // or name
      email,
      password,
      photo: {
        id: result.public_id,
        secure_url: result.secure_url,
      },
    });
    cookieToken(user, res);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(Error("Please Provide Email and password", 400));
    }
    const user = await User.findOne({ email : email }).select("+password"); // we use select password because in db we mention select is false so that no one can access it
    if (!user) {
      return next(Error("User not exit in our db", 400));
    }
    const isPasswordValid = await user.isValidatePassword(password);
    if (!isPasswordValid) {
      return next(Error("Please Provide Correct Password", 400));
    }
    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: "True",
      message: "Logout Successfully",
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email);
    if (!email) {
      return next(Error("Please send Email"));
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return next(Error("User not found"));
    }
    const forgotToken = await user.getForgotPasswordToken();
    //console.log(forgotToken)

    //now save this token in the database so that when the user try to login using link you validat it with saved db token and url params token
    await user.save({ validateBeforeSave: false }); // validateDeforeSave: false because you are not sending any photo or password here to save only token you are sending

    //craft the url to send it to the user
    const myUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1//password/reset/${forgotToken}`; // req.protocol ->http/https

    const message = `Copy paste this link in your URL and hit Enter \n\n ${myUrl}`;
    //sending an email is tricky one  so wrap in try catch block specially error part
    console.log(message);
    try {
      await mailHelper({
        email: user.email,
        subject: "TStore - Passwword reset email",
        message,
      });
      res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (error) {
      //if error occurs flush out the token from user and update/save db
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
      //now savethis in db
      await user.save({ validateBeforeSave: false });
      return next(Error(error.message, 500));
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.passwordReset = async (req, res, next) => {
  try {
    const token = req.params.token;
    console.log(token);
    if (!token) {
      return next(Error("Token not found from URL,  Check the URL"));
    }

    // hash the token because hash token is saved in db
    const hashToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(hashToken);
    // now find the data using hashToken
    const user = await User.findOne({
      forgotPasswordToken: hashToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return next(Error("User not found or token invalid or expired"));
    }
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return next(
        next(Error("newPassword and confirmPassword doesnot matches"))
      );
    }
    //update in user which is an instance of db
    user.password = confirmPassword;

    //reset token fields
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    //save it into db
    await user.save();

    // send a JSON response OR send token
    cookieToken(user, res);
  } catch (error) {
    console.log("hi");
    console.log(error);
    res.send(error);
  }
};

exports.getLoggedInUserDetails = async (req, res, next) => {
  try {
    //console.log(req.user.id)
    const user = await User.findById(req.user.id);
    console.log(user);
    res.status(200).json({
      success: "true",
      user,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    //while changing the password user must be loggedIn otherwise he have to do forgotPassword , so it will contain a middleware to check it is loggedIn
    const user = await User.findById(req.user.id).select("+password"); //// we use select password because in db we mention select is false so that no one can access it and now we want to acess it
    const verifyPassword = user.isValidatePassword(oldPassword);
    if (!verifyPassword) {
      return next(Error("OldPassword doesnot matches"));
    }
    user.password = newPassword;
    await user.save();
    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.uploadUserDetails = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return next(Error("email and name are required"));
    }

    const user = await User.findById(req.user.id);

    user.name = name;
    user.email = email;
    if (req.files) {
      // if photo is there
      // first destroy the photo you saved in cloudinary
      const photoId = user.photo.id;
      const resp = await cloudinary.uploader.destroy(photoId);

      const photoUpload = await cloudinary.uploader.upload(
        req.files.photo.tempFilePath,
        {
          folder: "user",
          width: 150,
          crop: "scale",
        }
      );
      user.photo = {
        id: photoUpload.public_id,
        secure_url: photoUpload.secure_url,
      };
    }
    await user.save();
    res.status(200).json({
      success: "true",
      user,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.getAllUSerDetails = async (req, res, next) => {
  const user = await User.find();
  if (!user) {
    return next(Error("User not found"));
  }
  res.status(200).json({
    success: "true",
    user,
  });
};

exports.getUserDetails = async (req, res, next) => {
  const user = await User.find({ role: "user" });
  if (!user) {
    return next(Error("User not found"));
  }
  res.status(200).json({
    success: "true",
    user,
  });
};

exports.getOneUserDetails = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(Error("User not found"));
  }
  res.status(200).json({
    success: "true",
    user,
  });
};

exports.adminUpdateOneUserDetails = async (req, res, next) => {
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
    // console.log(data)
    if(!req.params.id) return next(Error("User not found"))
    const user =await User.findByIdAndUpdate(req.params.id, data, {
      new: true, // returns the modified document
      runValidators: true,
      useFindandModify: false,
      //By default, Mongoose uses findAndModify() under the hood for operations like findByIdAndUpdate().
      //However, findAndModify() is deprecated in MongoDB, so setting useFindAndModify to false instructs
      //Mongoose to use the MongoDB findOneAndUpdate() function instead, which is the recommended approach.
    });
    
    res.status(200).json({
      success: "true",
      user,
    });
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}


exports.adminDeleteOneUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    console.log(user)
    if (!user) return next(Error("User not found"))
    
    const imageId = user.photo.id;
    await cloudinary.uploader.destroy(imageId)

    await user.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: "true",
      message:"user removed"
    })
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

