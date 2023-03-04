const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const reviewSchema = new mongoose.Schema(
  {
    senderId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    productId: { type: ObjectId, ref: "Product", required: true },
    text: {
      type: String,
      required: true,
    },
    dp: { type: String },
    name: { type: String },
    like: { type: Number, default: 0 },
    disklike: { type: Number, default: 0 },
    reply: { type: [String] },
    content: { type: String },
    contentType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);