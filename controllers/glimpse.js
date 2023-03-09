const Glimpse = require("../models/glimpse");
const User = require("../models/userAuth");
const uuid = require("uuid").v4;
const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "192.168.1.50",
  port: 9000,
  useSSL: false,
  accessKey: "shreyansh379",
  secretKey: "shreyansh379",
});

//add glimpse
exports.create = async (req, res) => {
  const uuidString = uuid();
  if (!req.file) {
    res.status(400).json({ message: "Please upload a video" });
  } else {
    try {
      const { userId } = req.params;
      const { text, tags } = req.body;
      const { originalname, buffer, mimetype } = req.file;
      const size = buffer.byteLength;
      const bucketName = "glimpse";
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

//fetch glimpse acc to interest
exports.fetchglimpse = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  const glimpse = await Glimpse.find({ tags: { $in: user.interest } });
  if (!glimpse) {
    res.status(404).json({ message: "Glimpse not found" });
  } else if (!glimpse[0].tags) {
    res
      .status(404)
      .json({ message: "Users interest doesn't match with any glimpse" });
  } else {
    try {
      const url = await generatePresignedUrl(
        "glimpse",
        glimpse[0].content.toString(),
        60 * 60
      );
      res.status(200).json({ data: { glimpse, url } });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
};

//fetch one glimpse
exports.fetchoneglimpse = async (req, res) => {
  const { glimpseId } = req.params;
  const glimpse = await Glimpse.findById(glimpseId);
  if (!glimpse) {
    res.status(404).json({ message: "Glimpse not found" });
  } else {
    try {
      const url = await generatePresignedUrl(
        "glimpse",
        glimpse.content.toString(),
        60 * 60
      );
      res.status(200).json({ data: { glimpse, url } });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
};

//like a glimpse
exports.likeglimpse = async (req, res) => {
  const { glimpseId } = req.params;
  const glimpse = await Glimpse.findByIdAndUpdate(glimpseId, {
    $inc: { like: 1 },
  });
  if (!glimpse) {
    res.status(400).json({ message: "No glimpse found" });
  }
  res.status(200).json({ success: true });
};

//dislike glimpse
exports.dislikeglimpse = async (req, res) => {
  const { glimpseId } = req.params;
  const glimpse = await Glimpse.findByIdAndUpdate(glimpseId, {
    $inc: { dislike: 1 },
  });
  if (!glimpse) {
    res.status(400).json({ message: "No glimpse found" });
  }
  res.status(200).json({ success: true });
};

//delete glimpse
exports.deleteglimpse = async (req, res) => {
  const { userId, glimpseId } = req.params;
  const glimpse = await Glimpse.findById(glimpseId);

  try {
    if (!glimpse) {
      res.status(404).json({ message: "Glimpse not found" });
    } else if (glimpse.creator.toString() !== userId) {
      res.status(400).json({ message: "You can't delete others glimpse" });
    } else {
      await Glimpse.findByIdAndDelete(glimpseId);
      await minioClient.removeObject("glimpse", glimpse.content);
      res.status(200).json({ success: true });
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
