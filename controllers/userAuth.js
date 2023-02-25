const User = require("../models/userAuth");
const jwt = require("jsonwebtoken");
const sng = require("@sendgrid/mail");

exports.signup = async (req, res) => {
  sng.setApiKey(process.env.SENDGRID_API_KEY);

  const { email, password } = await req.body;
  const OTP = Math.floor(10000 + Math.random() * 90000);

  try {
    const user = User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    user.otp = OTP;
    await user.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save OTP" });
    return;
  }
  try {
    User.findOne({ email }).exec((err, user) => {
      if (user) {
        return res.status(400).json({ message: "Email is already taken" });
      }

      const token = jwt.sign(
        { email, password },
        process.env.JWT_ACCOUNT_ACTIVATION,
        { expiresIn: "10m" }
      );

      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Hi, Your Otp for Grovyo",
        html: `<p>Your OTP is</p> <h1>${OTP}</h1> and <br/>${token}
      <hr/>
      <p>This email may contain sensitive information<p/>
      <p>${process.env.CLIENT_URL}<p/>`,
      };

      sng.send(emailData).then(() => {
        return res
          .status(200)
          .json({ message: `Email has been sent to ${email}.` });
      });
    });
  } catch (err) {
    res.status(400).json({ message: "Access Denied" });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = await req.body;
  try {
    User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res.json(400).json({
          error: "User with that email does not exist Please signup",
        });
      }
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: "Email and Password do not match",
        });
      }
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("t", token, { expire: new Date() + 9999 });
      const { _id, email, role } = user;
      return res.status(200).json({ token, user: { email, role, _id } });
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
};
