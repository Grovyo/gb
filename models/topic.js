const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    creator: { type: ObjectId, ref: "User", required: true },
    community: { type: ObjectId, ref: "Community", require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
