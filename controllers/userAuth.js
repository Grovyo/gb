const User = require("../models/userAuth");
const jwt = require("jsonwebtoken");
const sng = require("@sendgrid/mail");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = async (req, res) => {
  sng.setApiKey(process.env.SENDGRID_API_KEY);
  const otp = Math.floor(10000 + Math.random() * 90000);
  const { email } = await req.body;
  const newUser = new User({ email, otp });
  const oldUser = await User.findOne({ email });
  if (oldUser) {
    try {
      const otp = Math.floor(10000 + Math.random() * 90000);
      const token = jwt.sign(
        { email, otp },
        process.env.JWT_ACCOUNT_ACTIVATION,
        {
          expiresIn: "10m",
        }
      );

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
    const token = jwt.sign({ email, otp }, process.env.JWT_ACCOUNT_ACTIVATION, {
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
    res.status(400).json({ message: "Access Denied" });
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
  try {
    const userId = req.params.userId;
    const { fullname, username, phone, DOB } = req.fields;
    const { photo } = req.files;

    switch (true) {
      case !fullname.trim():
        res.json({ err: "Name is required" });
      case !username:
        res.json({ err: "UserName is required" });
      case !DOB:
        res.json({ err: "Date of Birth is required" });
      case !photo || photo.length > 500000:
        res.json({ err: "Image must be less than 5mb" });
    }
    await User.findByIdAndUpdate(
      { _id: userId },
      { fullname, username, phone, DOB, photo },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Failed to update user details" });
      });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
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
