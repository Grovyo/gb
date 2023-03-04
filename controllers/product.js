const Product = require("../models/product");
const uuid = require("uuid").v4;
const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "192.168.1.50",
  port: 9000,
  useSSL: false,
  accessKey: "shreyansh379",
  secretKey: "shreyansh379",
});

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

  if (!image1 && !image2 && !image3 && !image4) {
    res.status(400).json({ message: "Must have one image" });
  } else {
    try {
      const uuidString = uuid();
      let a, b, c, d;
      if (image1) {
        const bucketName = "images";
        const objectName = `${Date.now()}_${uuidString}_${image1.originalname}`;
        a = objectName;
        await minioClient.putObject(
          bucketName,
          objectName,
          image1.buffer,
          image1.buffer.length
        );
      }
      if (image2) {
        const bucketName = "images";
        const objectName = `${Date.now()}_${uuidString}_${image2.originalname}`;
        b = objectName;
        await minioClient.putObject(
          bucketName,
          objectName,
          image2.buffer,
          image2.buffer.length
        );
      }
      if (image3) {
        const bucketName = "images";
        const objectName = `${Date.now()}_${uuidString}_${image3.originalname}`;
        c = objectName;
        await minioClient.putObject(
          bucketName,
          objectName,
          image3.buffer,
          image3.buffer.length
        );
      }
      if (image4) {
        const bucketName = "images";
        const objectName = `${Date.now()}_${uuidString}_${image4.originalname}`;
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
};
