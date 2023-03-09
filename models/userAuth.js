const mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    hashed_password: {
      type: String,
    },
    otp: { type: String },
    salt: String,
    role: {
      type: String,
      default: "User",
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
    fullname: {
      type: String,
      maxLength: 30,
    },
    phone: { type: Number, trim: true, maxLength: 12, minLength: 10 },
    DOB: { type: String },
    username: {
      type: String,
      maxLength: 30,
      trim: true,
    },
    profilepic: {
      type: String,
    },
    interest: {
      type: [String],
      default: [],
    },
    puchase_history: {
      type: [String],
      default: [],
    },
    subscriptions: {
      type: [String],
      default: [],
    },
    cart_history: {
      type: [String],
      default: [],
    },
    notifications: {
      type: [String],
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: [String],
    },
    desc: { type: String, maxLength: 500 },
    shortdesc: { type: String, maxLength: 150 },
    communityjoined: [{ type: ObjectId, ref: "Community", required: true }],
    totalcom: { type: Number, default: 0 },
    likedposts: [{ type: ObjectId, ref: "Post", required: true }],
  },
  { timestamps: true }
);

//virtualfields

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//virtual methods

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

module.exports = mongoose.model("User", userSchema);
