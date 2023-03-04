const Comment = require("../models/comment");

exports.create = async (req, res) => {
  const { userId, postId } = req.params;
  const { text } = req.body;
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
};
