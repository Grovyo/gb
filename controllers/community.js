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

exports.create = async (req, res) => {
  const { title } = req.body;
  const { userId } = req.params;
  const image = req.file;
  const uuidString = uuid();
  if (!image) {
    res.status(400).json({ message: "Please upload an image" });
  }

  try {
    const bucketName = "images";
    const objectName = `${Date.now()}_${uuidString}_${image.originalname}`;
    a = objectName;
    await minioClient.putObject(
      bucketName,
      objectName,
      image.buffer,
      image.buffer.length
    );
    const community = new Community({
      title,
      creator: userId,
      dp: objectName,
    });

    await community.save();
    res.status(200).json(community);
  } catch (e) {
    res.status(400).json(e.message);
  }
};
