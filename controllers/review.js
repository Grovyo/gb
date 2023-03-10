const Review = require("../models/review");
const User = require("../models/userAuth");
const uuid = require("uuid").v4;
const Minio = require("minio");
const { response } = require("express");

const minioClient = new Minio.Client({
  endPoint: "192.168.1.50",
  port: 9000,
  useSSL: false,
  accessKey: "shreyansh379",
  secretKey: "shreyansh379",
});

//add a reveiw with image
exports.createrw = async (req, res) => {
  const { userId, productId } = req.params;
  const { text } = req.body;
  const uuidString = uuid();
  let a1, a2;
  if (!req.files) {
    res.status(400).json({ message: "Please upload an image" });
  }
  try {
    const bucketName = "images";
    const objectName = `${Date.now()}_${uuidString}_${
      req.files[0].originalname
    }`;
    a1 = objectName;
    a2 = req.files[0].mimetype;
    await minioClient.putObject(
      bucketName,
      objectName,
      req.files[0].buffer,
      req.files[0].buffer.length
    );
    const review = new Review({
      senderId: userId,
      productId: productId,
      text: text,
      content: a1,
      contentType: a2,
    });
    await review.save();
    res.status(200).json(review);
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//add a review
exports.create = async (req, res) => {
  const { userId, productId } = req.params;
  const { text } = req.body;
  try {
    const review = new Review({
      senderId: userId,
      productId: productId,
      text: text,
    });
    await review.save();
    res.status(200).json(review);
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//delete a product
exports.deletereview = async (req, res) => {
  const { userId, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  try {
    if (!review) {
      res.status(404).json({ message: "Review not found" });
    } else if (review.senderId.toString() != userId) {
      res.status(201).json({ message: "You can't delete others reviews" });
    } else {
      await Review.findByIdAndDelete(reviewId);
      res.status(200).json({ success: true });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//like a review
exports.like = async (req, res) => {
  const { userId, reviewId } = req.params;
  const user = await User.findById(userId);
  const review = await Review.findById(reviewId);
  if (!review) {
    res.status(400).json({ message: "No review found" });
  } else if (review.likedby.includes(user._id)) {
    try {
      await Review.updateOne(
        { _id: reviewId },
        { $pull: { likedby: user._id }, $inc: { like: -1 } }
      );
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  } else {
    try {
      await Review.updateOne(
        { _id: reviewId },
        { $push: { likedby: user._id }, $inc: { like: 1 } }
      );
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
};
