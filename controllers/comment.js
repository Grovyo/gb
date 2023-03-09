const Comment = require("../models/comment");
const User = require("../models/userAuth");
const Post = require("../models/post");

//addcomment
exports.create = async (req, res) => {
  const { userId, postId } = req.params;
  const { text } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404).json({ message: "Post not found" });
  } else {
    try {
      const newComment = new Comment({
        senderId: userId,
        postId: postId,
        text: text,
      });
      await newComment.save();
      res.status(200).json(newComment);
    } catch (e) {
      res.status(400).json(e.message);
    }
  }
};

//like comment
exports.likecomment = async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
  }
  try {
    await Comment.updateOne({ _id: commentId }, { $inc: { like: 1 } });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

//dislike comment
exports.dislikecomment = async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
  }
  try {
    await Comment.updateOne({ _id: commentId }, { $inc: { like: -1 } });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

//deletecomment
exports.deletecomment = async (req, res) => {
  const { userId, commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
  } else if (comment.senderId.toString() !== userId) {
    res.status(400).json({ message: "You can't delete others comments" });
  } else {
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ success: true });
  }
};
