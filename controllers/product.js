const Product = require("../models/product");
const uuid = require("uuid").v4;
const Minio = require("minio");
const User = require("../models/userAuth");

const minioClient = new Minio.Client({
  endPoint: "192.168.1.50",
  port: 9000,
  useSSL: false,
  accessKey: "shreyansh379",
  secretKey: "shreyansh379",
});

// add a product
exports.create = async (req, res) => {
  const { userId } = req.params;
  const {
    name,
    brandname,
    desc,
    quantity,
    shippingcost,
    price,
    inclusiveprice,
    sellername,
    totalstars,
  } = req.body;

  const image1 = req.files[0];
  const image2 = req.files[1];
  const image3 = req.files[2];
  const image4 = req.files[3];

  const user = await User.findById(userId);
  if (!user) {
    res.status(400).json({ message: "User not found", success: false });
  } else {
    if (!image1 && !image2 && !image3 && !image4) {
      res.status(400).json({ message: "Must have one image" });
    } else {
      try {
        const uuidString = uuid();
        let a, b, c, d;
        if (image1) {
          const bucketName = "products";
          const objectName = `${Date.now()}_${uuidString}_${
            image1.originalname
          }`;
          a = objectName;
          await minioClient.putObject(
            bucketName,
            objectName,
            image1.buffer,
            image1.buffer.length
          );
        }
        if (image2) {
          const bucketName = "products";
          const objectName = `${Date.now()}_${uuidString}_${
            image2.originalname
          }`;
          b = objectName;
          await minioClient.putObject(
            bucketName,
            objectName,
            image2.buffer,
            image2.buffer.length
          );
        }
        if (image3) {
          const bucketName = "products";
          const objectName = `${Date.now()}_${uuidString}_${
            image3.originalname
          }`;
          c = objectName;
          await minioClient.putObject(
            bucketName,
            objectName,
            image3.buffer,
            image3.buffer.length
          );
        }
        if (image4) {
          const bucketName = "products";
          const objectName = `${Date.now()}_${uuidString}_${
            image4.originalname
          }`;
          d = objectName;
          await minioClient.putObject(
            bucketName,
            objectName,
            image4.buffer,
            image4.buffer.length
          );
        }
        const p = new Product({
          name,
          brandname,
          desc,
          creator: userId,
          quantity,
          shippingcost,
          price,
          inclusiveprice,
          sellername,
          totalstars,
          images: [a, b, c, d],
        });
        await p.save();
        res.status(200).json(p);
      } catch (e) {
        res.status(500).json({ message: e.message });
      }
    }
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

//get all products of a user
exports.fetchallproducts = async (req, res) => {
  const { userId } = req.params;
  const product = await Product.find({ creator: userId });
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
    res.status(400).json({ message: e.message });
  }
};

//add product hightlights
exports.highlight = async (req, res) => {
  const { prodId, userId } = req.params;
  const { key, value } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(400).json({ message: "User not found" });
    } else {
      const product = await Product.findOne({ creator: user._id });
      if (!product) {
        res.status(400).json({ message: "Product not found" });
      } else {
        await Product.findByIdAndUpdate(
          { _id: prodId },
          {
            $set: { producthighlightskey: key, producthighlightsvalue: value },
          },
          { new: true }
        );
        res.status(200).json({ success: true });
      }
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//get a single product
exports.getaproduct = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  try {
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    } else {
      const urls = [];
      for (let i = 0; i < product.images.length; i++) {
        const a = await generatePresignedUrl(
          "products",
          product.images[i].toString(),
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

//delete a product
exports.deleteproduct = async (req, res) => {
  const { userId, productId } = req.params;
  const product = await Product.findById(productId);
  try {
    if (!product) {
      res.status(404).json({ message: "Product not found" });
    } else if (product.creator.toString() != userId) {
      res.status(404).json({ message: "You can't delete others products" });
    } else {
      await Product.findByIdAndDelete(productId);
      res.status(200).json({ success: true });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};
