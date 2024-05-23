const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please Provide Product name"],
    trim: true, // removes extra space
    maxLength: [120, "Product name should be within 120 digits"],
  },
  price: {
    type: Number,
    require: [true, "Product price is required"],
    maxLength: [10, "Price should be within 10 digits"],
  },
  description: {
    type: String,
    require: [true, "Description of Product is required"],
  },
  // since multiple photos will be ther so store it in an array
  photos: [
    {
      id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "please select category from- short-sleeves, long-sleeves, sweat-shirts, hoodies",
    ],
    //Enums in Mongoose are particularly useful for fields that should only accept a limited number of predefined values.
    //used to provide options
    enum: {
      values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
    },
    message:
      "please select category ONLY from - short-sleeves, long-sleeves, sweat-shirts and hoodies ",
  },

  stock: {
    type: Number,
    require: [true, "Please provide the number of stocks available"],
  },

  ratings: {
    type: Number,
    default: 0,
  },

  brand: {
    type: String,
    required: [true, "please add a brand for clothing"],
  },

  numberofReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      // jo login hai wahi user review de sakta hai to
      // tumhe User model se refference (ref) lena padega
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],

  // now you have to know which user is adding the the product
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // name
  // price
  // description
  // photos []
  // category
  // brand
  // stock
  // ratings
  // numofReviews
  // reviews [user, name, rating, comment]
  // user
  // createdAt
});
module.exports = mongoose.model("Product", productSchema);
