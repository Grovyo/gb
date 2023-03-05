const express = require("express");
const router = express.Router();
const formidable = require("express-formidable");
const multer = require("multer");

//imports
const {
  signup,
  verify,
  signout,
  filldetails,
  interests,
  test,
  gettest,
  signupmobile,
  filldetailsphone,
} = require("../controllers/userAuth");
const { userbyId } = require("../controllers/user");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/signup", signup);
router.post("/signup-mobile", signupmobile);
router.post("/verify", verify);
router.get("/signout", signout);

router.post("/filldetails-email/:userId", upload.single("image"), filldetails);

router.post(
  "/filldetails-phone/:userId",
  upload.single("image"),
  filldetailsphone
);
router.post("/interest/:userId", interests);
router.get("/:id", gettest);
router.post("/test", upload.single("image"), test);

router.param("userId", userbyId);

module.exports = router;
