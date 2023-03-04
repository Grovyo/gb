const Glimpse = require("../models/glimpse");
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
  const { text, tags } = req.body;
  const { originalname, buffer, mimetype } = req.file;
  const uuidString = uuid();
  if (!originalname) {
    res.status(400).json({ message: "Please upload a video" });
  } else {
    try {
      const size = buffer.byteLength;
      const bucketName = "videos";
      const objectName = `${Date.now()}_${uuidString}_${originalname}`;
      await minioClient.putObject(
        bucketName,
        objectName,
        buffer,
        size,
        mimetype
      );
      const glimpse = new Glimpse({
        creator: userId,
        text: text,
        tags: tags,
        content: objectName,
        size: size,
      });

      await glimpse.save();
      res.status(200).json(glimpse);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
};
