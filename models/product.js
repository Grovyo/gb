const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    maxLength: 150,
    required: true,
  },
  brandname: {
    type: String,
    maxLength: 50,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  creator: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  quantity: {
    type: Number,
  },
  shippingcost: {
    type: Number,
  },
  price: {
    type: Number,
  },
  inclusiveprice: { type: Number },
  sellername: { type: String },
  images: { type: [String] },

  totalstars: {
    type: Number,
    default: 0,
  },
  reviews: { type: Number, default: 0 },
  producthighlightskey: { type: [String] },
  producthighlightsvalue: { type: [String] },
  percentoff: { type: Number, default: 0 },
  questions: { type: Number, default: 0 },
});

module.exports = mongoose.model("Product", productSchema);
