const Review = require("../models/review");
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
