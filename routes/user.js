const express = require("express");
const router = express.Router(); // note capital R

const {
  signUp,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changePassword,
  uploadUserDetails,
  getAllUSerDetails,
  getUserDetails,
  getOneUserDetails,
  adminUpdateOneUserDetails,
  adminDeleteOneUserDetails,
} = require("../controllers/userController");
const { isLoggedIn, validateRole } = require("../middlewares/user");

router.route("/signUp").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").put(passwordReset);
router.route("/userDashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changePassword);
router.route("/userDashboard/update").post(isLoggedIn, uploadUserDetails);
router
  .route("/admin/user")
  .post(isLoggedIn, validateRole("admin"), getAllUSerDetails);
router
  .route("/manager/user")
  .post(isLoggedIn, validateRole("manager"), getUserDetails);

router
  .route("/admin/user/:id")
  .get(isLoggedIn, validateRole("admin"), getOneUserDetails)
  .put(isLoggedIn, validateRole("admin"), adminUpdateOneUserDetails)
  .delete(isLoggedIn, validateRole("admin"), adminDeleteOneUserDetails);


module.exports = router;
