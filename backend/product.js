// This is a Mongoose schema (model) for a product.

const mongoose = require("mongoose");
const product = new mongoose.Schema({
  name: String,
  description: String,
  category: [{ type: String }],
  color: [{ type: String }],
  gender: [{ type: String }],
  imageurl: String,
  price: Number,
  rating: [{ type: Number }],
  reviews: [{ body: String, user: String, verified: String }],
  buyers: [{ type: String }],
  wishers: [{ type: String }],
  lensId: String,         // New field for unique lens ID
  lensGroupId: String     // Optional, if you use lens groups
});


module.exports = mongoose.model("Product", product);