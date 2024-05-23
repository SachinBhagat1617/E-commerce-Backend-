const cloudinary = require("cloudinary").v2;
const Product = require("../models/product");
const whereClause = require("../utils/whereClause");

exports.addProduct = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(Error("images are required", 401));
    }
    let imageArr = [];
    const productPhotos = req.files.photos;
    for (let index = 0; index < productPhotos.length; index++) {
      const result = await cloudinary.uploader.upload(
        productPhotos[index].tempFilePath,
        {
          folder: "products",
        }
      );
      imageArr.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }

    req.body.photos = imageArr;
    req.body.user = req.user.id; // user of db mai jo add kar raha hai uska id store karo (req.user.id comes from middleware)
    const product = await Product.create(req.body); // req.body mai name,description,brand,photos,price, category, user, created_at sab aa gaya
    //console.log(product)
    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const resultPerPage = 3;
    const totalcountProduct = await Product.countDocuments();
    // base ->Product.find()

    // to getall the products use Product.find({}) // empty so it will give all
    const productObj = new whereClause(Product.find(), req.query)
      .search()
      .filter(); // whereClause(base,bigQ) return instance of object

    let products = await productObj.base; //humm log this.base property mai hi saara products store kare rahe hai
    const filteredProductNumber = products.length; //for frontend devloper to know how many products has came

    productObj.pager(resultPerPage);
    products = await productObj.base.clone(); //is used to ensure that the query with pagination applied gets executed separately from any previous query operations such as search and filter.
    //when you are firing two or more method thien use .clone() method {search,filter,pager}
    res.status(200).json({
      success: true,
      products,
      filteredProductNumber,
      totalcountProduct,
      resultPerPage,
    });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.adminGetAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({});
    //console.log(products)
    if (!products) {
      return next(Error("No products are available in Store"));
    }
    res.send({
      success: true,
      products,
    });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.getOneProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(Error("Product not found"));
    }
    res.send({
      success: true,
      product,
    });
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.adminUpdateOneProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(Error("Product not found"));
    }
    let imageArr = [];

    if (req.files) {
      //destroy photos
      for (let index = 0; index < product.photos.length; index++) {
        const res = await cloudinary.uploader.destroy(product.photos[index].id);
      }
      //update photos and other details
      for (let i = 0; i < req.files.photos.length; i++) {
        const element = await cloudinary.uploader.upload(
          req.files.photos[i].tempFilePath,
          {
            folder: "products",
          }
        );
        imageArr.push({
          id: element.public_id,
          secure_url: element.secure_url,
        });
      }
      req.body.photos = imageArr;
      product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // new is true so that all the parameters get updated by new value
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
        product,
      });
    }
  } catch (error) {
    res.send(error);
    console.log(error);
  }
};

exports.adminDeleteOneProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(Error("Product not found"));
    }
    for (let index = 0; index < product.photos.length; index++) {
      await cloudinary.uploader.destroy(product.photos[index].id);
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Product deleted !",
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return next(Error("Product not exist"));
    }
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    let alreadyReviewed = false;
    for (let index = 0; index < product.reviews.length; index++) {
      if (product.reviews[index].user.toString() === req.user._id.toString()) {
        alreadyReviewed = true;
        break;
      }
    }
    if (alreadyReviewed) {
      //@overwrite
      for (let index = 0; index < product.reviews.length; index++) {
        if (
          product.reviews[index].user.toString() === req.user._id.toString()
        ) {
          product.reviews[index].comment = comment;
          product.reviews[index].rating = rating;
          break;
        }
      }
    } else {
      product.reviews.push(review);
      product.numberofReviews = product.reviews.length;
    }
    let sum = 0;
    for (let index = 0; index < product.reviews.length; index++) {
      sum += product.reviews[index].rating;
    }
    product.ratings = sum / product.reviews.length;
    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const product_id = req.params.id;
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const reviews = product.reviews.filter(
      (rev) => rev.user.toString() !== req.user._id.toString()
    );
    product.reviews = reviews;
    product.numberofReviews = product.reviews.length;
    let sum = 0;
    for (let index = 0; index < product.reviews.length; index++) {
      sum += product.reviews[index].rating;
    }
    product.ratings = reviews.length === 0 ? 0 : sum / reviews.length;
    // console.log(product.reviews);
    // console.log(product.ratings);
    // console.log(product.numberofReviews);
    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Review Removed Successfully !",
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.getAllReviewsOfSingleProduct = async (req, res, next) => {
  try {
    const product_id = req.params.id;
    const product = Product.findById(product_id);
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    console.log(error)
    res.send(error)
  }
}
