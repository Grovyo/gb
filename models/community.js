const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const communitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    members: { type: Number, required: true, default: 0 },
    creator: { type: ObjectId, ref: "User", required: true },
    dp: { type: String, required: true },
    members: [{ type: ObjectId, ref: "User", required: true }],
    memberscount: { type: Number, default: 0 },
    posts: [{ type: ObjectId, ref: "Post", required: true }],
    totalposts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
