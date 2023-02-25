const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");

//imports
const {
  signup,
  verify,
  signout,
  filldetails,
  interests,
} = require("../controllers/userAuth");
const { userbyId } = require("../controllers/user");

router.post("/signup", signup);
router.post("/verify", verify);
router.get("/signout", signout);
router.post("/filldetails/:userId", formidable(), filldetails);
router.post("/interest/:userId", interests);

router.param("userId", userbyId);

module.exports = router;
