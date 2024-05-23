//middeleware another function to pass all the detail of the user
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isLoggedIn = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // if token not found in cookies, check if header contains Auth field
    if (!token && req.header("Authorization")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }
    if (!token) {
      return next(Error("token not found"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify the token and decode it now this decoded contains all the payload like id,option

    //find the instance in db
    req.user = await User.findById(decoded.id); // setting user property in req so that we can access the details of the user since it is a middleware it will pass this detail
    next();
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.validateRole = (...roles)=> {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(Error("You are not authorised to view this section"))
        }
        console.log(req.user.role);
        next()
    }
}
