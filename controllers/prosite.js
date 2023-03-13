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

//fetch media
exports.fetchmedia = async (req, res) => {
  try {
    const { userId } = req.params;
    const glimpse = await Glimpse.find({ creator: userId });
    if (!glimpse) {
      res.status(404).json({ message: "No media found" });
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

//fetch all glimpses of users
exports.fetchallglimpse = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    res.status(400).json({ message: "No user found with this id" });
  } else {
    const glimpse = await Glimpse.find({ creator: user._id });
    if (!glimpse) {
      res.status(404).json({ success: false, message: "No media found" });
    } else {
      try {
        const urls = [];
        for (let i = 0; i < glimpse.length; i++) {
          const a = await generatePresignedUrl(
            "glimpse",
            glimpse[i].content.toString(),
            60 * 60
          );
          urls.push(a);
        }
        res.status(200).json({ data: { glimpse, urls } });
      } catch (e) {
        res.status(400).json(e.message);
      }
    }
  }
};

//fetch products
exports.fetchproducts = async (req, res) => {
  const { userId } = req.params;
  const product = await Product.find({ creator: userId }).populate(
    "creator",
    "fullname isverified"
  );
  try {
    if (!product) {
      res.status(404).json({ message: "No products found" });
    } else {
      const urls = [];
      for (let i = 0; i < product.length; i++) {
        const a = await generatePresignedUrl(
          "products",
          product[i].images[0].toString(),
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
  const community = await Community.find({ creator: userId }).populate(
    "creator",
    "fullname"
  );
  try {
    if (!community) {
      res.status(404).json({ message: "No communities found" });
    } else {
      const previews = [];
      for (let i = 0; i < community.length; i++) {
        for (let j = 0; j < community[i].preview.length; j++) {
          const a = await generatePresignedUrl(
            "images",
            community[i].preview[j].toString(),
            60 * 60
          );
          previews.push(a);
        }
      }
      const urls = [];
      for (let i = 0; i < community.length; i++) {
        const a = await generatePresignedUrl(
          "images",
          community[i].dp.toString(),
          60 * 60
        );
        urls.push(a);
      }
      res.status(200).json({ data: { community, urls, previews } });
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

//get prosite
exports.getprosite = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  try {
    if (!user) {
      res.status(404).json({ message: "No user found" });
    } else {
      const url = await generatePresignedUrl(
        "prosites",
        user.prositepic.toString(),
        60 * 60 * 24
      );
      res.status(200).json({ data: { url } });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};
