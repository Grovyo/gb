const User = require("../models/userAuth");
const jwt = require("jsonwebtoken");
const sng = require("@sendgrid/mail");
const { errorHandler } = require("../helpers/dbErrorHandler");
const Minio = require("minio");
const Test = require("../models/test");
const uuid = require("uuid").v4;
const minioClient = new Minio.Client({
  endPoint: "192.168.1.50",
  port: 9000,
  useSSL: false,
  accessKey: "shreyansh379",
  secretKey: "shreyansh379",
});

//signup via email
exports.signup = async (req, res) => {
  sng.setApiKey(process.env.SENDGRID_API_KEY);
  const otp = Math.floor(10000 + Math.random() * 90000);
  const { email } = await req.body;
  const newUser = new User({ email, otp });
  const oldUser = await User.findOne({ email });
  if (oldUser) {
    try {
      const otp = Math.floor(10000 + Math.random() * 90000);
      const token = jwt.sign({ email }, process.env.JWT_ACCOUNT_ACTIVATION, {
        expiresIn: "10m",
      });
      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Hi, Your Otp for Grovyo",
        html: `<p>Your OTP is</p> <h1>${otp}</h1> and <br/>${token}
      <hr/>
      <p>This email may contain sensitive information<p/>
      <p>${process.env.CLIENT_URL}<p/>`,
      };
      oldUser.otp = otp;
      await oldUser.save();
      sng.send(emailData);
      return res.status(200).json({ message: "User exists but Otp Sent" });
    } catch (err) {
      res.status(400).json({ message: "Access Denied" });
    }
  }
  try {
    const token = jwt.sign({ email }, process.env.JWT_ACCOUNT_ACTIVATION, {
      expiresIn: "10m",
    });
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Hi, Your Otp for Grovyo",
      html: `<p>Your OTP is</p> <h1>${otp}</h1> and <br/>${token}
      <hr/>
      <p>This email may contain sensitive information<p/>
      <p>${process.env.CLIENT_URL}<p/>`,
    };

    await newUser.save();
    sng.send(emailData).then(() => {
      return res
        .status(200)
        .json({ message: `Email has been sent to ${email}.` });
    });
  } catch (err) {
    res.status(400).json(err.message);
  }
};

//signup via mobile
exports.signupmobile = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone: phone });
    if (user) {
      const token = jwt.sign({ phone }, process.env.JWT_ACCOUNT_ACTIVATION, {
        expiresIn: "7d",
      });
      res
        .status(200)
        .json({ message: "user exists signup via mobile success", token });
    }
    if (!user) {
      const u = new User({ phone: phone });
      const token = jwt.sign({ phone }, process.env.JWT_ACCOUNT_ACTIVATION, {
        expiresIn: "7d",
      });
      await u.save();
      res.status(200).json({
        message: "signup via mobile success",
        token,
        user: { role, _id },
      });
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "signout Success" });
};

exports.verify = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (user.otp === otp) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("t", token, { expire: new Date() + 9999 });
      const { _id, email, role } = user;
      return res.status(200).json({ token, user: { email, role, _id } });
    } else {
      return res.status(400).json({ message: "Invalid Otp" });
    }
  } catch (err) {
    res.status(400).json({ message: "Access Denied" });
  }
};

exports.filldetails = async (req, res, next) => {
  const { originalname, buffer } = req.file;
  const { fullname, username, phone, DOB } = req.body;
  const { userId } = req.params;
  const uuidString = uuid();
  try {
    // Save image to Minio
    const bucketName = "images";
    const objectName = `${Date.now()}_${uuidString}_${originalname}`;
    await minioClient.putObject(bucketName, objectName, buffer, buffer.length);

    const image = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          fullname: fullname,
          profilepic: objectName,
          username: username,
          phone: phone,
          DOB: DOB,
        },
      },
      { new: true }
    );

    res.status(200).json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.interests = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { interest } = req.body;
    await User.findByIdAndUpdate(
      { _id: userId },
      { $addToSet: { interest: interest } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Failed to update user interests" });
      });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

exports.gettest = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the image metadata in MongoDB
    const image = await Test.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Get image file from Minio
    const [bucketName, objectName] = image.location.split("/");
    const stream = await minioClient.getObject(bucketName, objectName);

    // Set response headers
    res.setHeader("Content-Type", stream.headers["content-type"]);
    res.setHeader("Content-Length", stream.headers["content-length"]);
    res.setHeader("Content-Disposition", `inline; filename="${image.name}"`);

    // Pipe the file stream to the response
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
