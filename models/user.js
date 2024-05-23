const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomStirng = require("randomstring");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Nmae should be under 40 characters"],
  },
  email: {
    type: String,
    rquired: [true, "Please provide a email"],
    validate: [validator.isEmail, "Please Provide a Email"],
    unique: true, //each email must be unique
  },
  password: {
    type: String,
    required: [true, "Please Provide a password"],
    minLength: [6, "password should be atleast 6 char"],
    select: false, // select: false means that the password field will not be included by default when querying the database.
    //you can explicitly require this password
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now, //not Date.now() we will use this when we want to insert it into our database
  },
});

//encrypt password before save (hook) in db
userSchema.pre("save", async function (next) {
  // save - hook ,next is the next task which you are going to do
  // note: arrow function doesnot work
  if (!this.isModified("password")) {
    // if password is not modified then continue with next work bcause bcrypt consumes time
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//validate the password with passed on user password
userSchema.methods.isValidatePassword = async function (usersendPassword) {
  return await bcrypt.compare(usersendPassword, this.password);
};

//create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id }, //payload _id comes from db
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
};

//getting a hash of forgot token and storing it in db
userSchema.methods.getForgotPasswordToken = async function () {
  const forgotToken = randomStirng.generate(10); //10 is length here
  //hash it
    
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  //time of token
  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema); //schema ko model mai convert kia with name:User
