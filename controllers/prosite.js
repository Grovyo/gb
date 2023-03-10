const User = require("../models/userAuth");
const Glimpse = require("../models/glimpse");
const Product = require("../models/product");
const Community = require("../models/community");
const uuid = require("uuid").v4;
const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "192.168.1.50",
  port: 9000,
  useSSL: false,
  accessKey: "shreyansh379",
  secretKey: "shreyansh379",
});

//edit users bio
exports.editbio = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shortdesc, desc } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { shortdesc: shortdesc, desc: desc },
      { new: true }
    );
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//function to generate a presignedurl of minio
async function generatePresignedUrl(bucketName, objectName, expiry = 604800) {
  try {
    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      objectName,
      expiry
    );
    return presignedUrl;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to generate presigned URL");
  }
}

//fetch media
exports.fetchmedia = async (req, res) => {
  try {
    const { userId } = req.params;
    const glimpse = await Glimpse.find({ creator: userId });
    if (!glimpse) {
      res.status(200).json({ message: "Not media found" });
    } else {
      const url = await generatePresignedUrl(
        "glimpse",
        glimpse[0].content.toString(),
        60 * 60
      );
      res.status(200).json({ data: { glimpse, url } });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//fetch products
exports.fetchproducts = async (req, res) => {
  const { userId } = req.params;
  const product = await Product.find({ creator: userId });
  try {
    if (!product) {
      res.status(404).json({ message: "No products found" });
    } else {
      const urls = [];
      for (let i = 0; i < product.length; i++) {
        const a = await generatePresignedUrl(
          "images",
          product[i].images.toString(),
          60 * 60
        );
        urls.push(a);
      }
      res.status(200).json({ data: { product, urls } });
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

//fetch a single product
exports.getproduct = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  try {
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    } else {
      const urls = [];
      for (let i = 0; i < product.length; i++) {
        const a = await generatePresignedUrl(
          "images",
          product[i].images.toString(),
          60 * 60
        );
        urls.push(a);
      }
      res.status(200).json({ data: { product, urls } });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//get communities
exports.getcommunities = async (req, res) => {
  const { userId } = req.params;
  const community = await Community.find({ creator: userId });
  try {
    if (!community) {
      res.status(404).json({ message: "No communities found" });
    } else {
      res.status(200).json(community);
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//get bio
exports.getbio = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  try {
    if (!user) {
      res.status(404).json({ message: "No user found" });
    } else {
      res.status(200).json(user);
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};
