const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  addProduct,
  adminGetAllProducts,
  getOneProduct,
  adminUpdateOneProduct,
  adminDeleteOneProduct,
  addReview,
  deleteReview,
} = require("../controllers/productController");
const { isLoggedIn, validateRole } = require("../middlewares/user");

//user routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getOneProduct);
router
  .route("/product/addReview/:id")
  .put(isLoggedIn, validateRole("user"), addReview);

router
  .route("/product/deleteReview/:id")
  .delete(isLoggedIn, validateRole("user"), deleteReview);

//admin routes
router
  .route("/admin/product/add")
  .post(isLoggedIn, validateRole("admin"), addProduct);

router
  .route("/admin/getAllProducts")
  .get(isLoggedIn, validateRole("admin"), adminGetAllProducts);

router
  .route("/admin/Product/:id")
  .put(isLoggedIn, validateRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, validateRole("admin"), adminDeleteOneProduct);

module.exports = router;
