const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const PostSchema = new mongoose.Schema(
  {
    likes: { type: Number, default: 0 },
    comments: { type: [String], default: [] },
    tags: { type: [String] },
    views: { type: Number, default: 0 },
    title: { type: String, maxLength: 100 },
    desc: { type: String, maxLength: 500 },
    community: { type: ObjectId, ref: "Community" },
    sender: { type: ObjectId, ref: "User" },
    isverified: { type: Boolean, default: false },
    commpic: { type: ObjectId, ref: "Community" },
    post: { type: [String] },
    contenttype: { type: [String] },
    user: { type: String },
    date: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
