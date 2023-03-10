const Community = require("../models/community");
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

exports.create = async (req, res) => {
  const { title } = req.body;
  const { userId } = req.params;
  const image = req.file;
  const uuidString = uuid();
  if (!image) {
    res.status(400).json({ message: "Please upload an image" });
  } else {
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
      const savedcom = await community.save();
      await Community.updateOne(
        { _id: savedcom._id },
        { $push: { members: userId }, $inc: { memberscount: 1 } }
      );
      await User.updateOne(
        { _id: userId },
        { $push: { communityjoined: savedcom._id }, $inc: { totalcom: 1 } }
      );
      res.status(200).json(savedcom);
    } catch (e) {
      res.status(400).json(e.message);
    }
  }
};

//community join
exports.joinmember = async (req, res) => {
  const { userId, comId } = req.params;
  const user = await User.findById(userId);
  const community = await Community.findById(comId);
  if (!comId) {
    res.status(400).json({ message: "Community not found" });
  }
  const isOwner = community.creator.equals(user._id);
  const isSubscriber = community.members.includes(user._id);
  try {
    if (isOwner) {
      res
        .status(201)
        .json({ message: "You already have joined your own community!" });
    } else if (isSubscriber) {
      res.status(201).json({ message: "Already Subscriber" });
    } else {
      await Community.updateOne(
        { _id: comId },
        { $push: { members: user._id }, $inc: { memberscount: 1 } }
      );
      await User.updateOne(
        { _id: userId },
        { $push: { communityjoined: community._id }, $inc: { totalcom: 1 } }
      );
      res.status(200).json({ success: true });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//community unjoin
exports.unjoinmember = async (req, res) => {
  const { userId, comId } = req.params;
  const user = await User.findById(userId);
  const community = await Community.findById(comId);

  const isOwner = community.creator.equals(user._id);
  const isSubscriber = community.members.includes(user._id);
  try {
    if (isOwner) {
      res.status(201).json({ message: "You can't unjoin your own community!" });
    } else if (!isSubscriber) {
      res.status(201).json({ message: "Not Subscribed" });
    } else {
      await Community.updateOne(
        { _id: comId },
        { $pull: { members: user._id }, $inc: { memberscount: -1 } }
      );
      await User.updateOne(
        { _id: userId },
        { $pull: { communityjoined: community._id }, $inc: { totalcom: -1 } }
      );
      res.status(200).json({ success: true });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};
