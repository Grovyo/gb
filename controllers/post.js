const Post = require("../models/post");
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

//Photo posting
exports.createPhoto = async (req, res) => {
  const { userId, commId } = req.params;
  const { title, desc } = req.body;

  const image1 = req.files[0];
  const image2 = req.files[1];
  const image3 = req.files[2];
  const image4 = req.files[3];

  if (!image1 && !image2 && !image3 && !image4) {
    res.status(400).json({ message: "Must have one image" });
  } else {
    try {
      const uuidString = uuid();
      let a1, a2, b1, b2, c1, c2, d1, d2;
      if (image1) {
        const bucketName = "images";
        const objectName = `${Date.now()}_${uuidString}_${image1.originalname}`;
        a1 = objectName;
        a2 = image1.mimetype;
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
        b1 = objectName;
        b2 = image2.mimetype;
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
        c1 = objectName;
        c2 = image3.mimetype;
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
        d1 = objectName;
        d2 = image4.mimetype;
        await minioClient.putObject(
          bucketName,
          objectName,
          image4.buffer,
          image4.buffer.length
        );
      }
      const p = new Post({
        title,
        desc,
        community: commId,
        sender: userId,
        post: [a1, b1, c1, d1],
        contenttype: [a2, b2, c2, d2],
      });
      await p.save();
      res.status(200).json(p);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
};

//videos posting
exports.createVideo = async (req, res) => {
  const { userId, commId } = req.params;
  const { title, desc } = req.body;
  const { originalname, buffer, mimetype } = req.files[0];
  const uuidString = uuid();
  if (!originalname) {
    res.status(400).json({ message: "Please upload a video" });
  } else {
    try {
      const size = buffer.byteLength;
      const bucketName = "videos";
      const objectName = `${Date.now()}_${uuidString}_${originalname}`;
      console.log(objectName);
      await minioClient.putObject(
        bucketName,
        objectName,
        buffer,
        size,
        mimetype
      );
      const v = new Post({
        title,
        desc,
        community: commId,
        sender: userId,
        post: objectName,
        size: size,
        contenttype: mimetype,
      });
      await v.save();
      res.status(200).json(v);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
};

//get posts
exports.getpost = async (req, res) => {
  try {
    const posts = await Post.find({ sender: req.params.userId }).populate(
      "sender",
      "fullname profilepic"
    );
    res.status(200).json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
//fetch userfeed
exports.fetchfeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const post = await Post.find({ tags: { $in: user.interest } })
      .populate("sender", "fullname profilepic")
      .populate("community", "title dp members");

    const dps = [];
    for (let i = 0; i < post.length; i++) {
      const a = await generatePresignedUrl(
        "images",
        post[i].community.dp.toString(),
        60 * 60
      );
      dps.push(a);
    }
    const urls = [];
    for (let i = 0; i < post.length; i++) {
      const a = await generatePresignedUrl(
        "videos",
        post[i].post.toString(),
        60 * 60
      );
      urls.push(a);
    }
    res.status(200).json({ data: { urls, dps, post } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
