const Conversation = require("../models/conversation");
const Message = require("../models/message");
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

exports.newconv = async (req, res) => {
  const conv = new Conversation({
    members: [req.body.first, req.body.second],
  });

  try {
    const savedConv = await conv.save();
    res.status(200).json(savedConv);
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.getallconv = async (req, res) => {
  try {
    const conv = await Conversation.find({
      members: req.params.userId,
    }).populate("members", "fullname profilepic");

    //check latest message
    let message = [];
    for (let i = 0; i < conv.length; i++) {
      const m = await Message.find({ conversationId: conv[i]._id })
        .sort({ createdAt: -1 })
        .limit(1);
      message.push(m);
    }

    const receiver = [];
    //checking the reciever
    for (let i = 0; i < conv.length; i++) {
      for (let j = 0; j < conv[i].members.length; j++) {
        if (conv[i].members[j]._id.toString() !== req.params.userId) {
          const receiving = conv[i].members[j];
          receiver.push(receiving);
        }
      }
    }

    //for genrating prsignurl of reciever
    const receiverdp = [];
    for (let i = 0; i < conv.length; i++) {
      for (let j = 0; j < conv[i].members.length; j++) {
        if (conv[i].members[j]._id.toString() !== req.params.userId) {
          const a = await generatePresignedUrl(
            "images",
            conv[i].members[j].profilepic.toString(),
            60 * 60
          );
          receiverdp.push(a);
        }
      }
    }

    res.status(200).json({ data: { conv, receiver, receiverdp, message } });
  } catch (e) {
    res.status(500).json(e.message);
  }
};

exports.getoneconv = async (req, res) => {
  const { convId } = req.params;
  try {
    const conv = await Message.find({ conversationId: convId });
    if (!conv) {
      res.status(404).json({ message: "Conversation not found" });
    } else {
      res.status(200).json(conv);
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
};
