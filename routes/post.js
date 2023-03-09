const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createPhoto,
  createVideo,
  getpost,
  fetchfeed,
} = require("../controllers/post");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/createphoto/:userId/:commId", upload.any(), createPhoto);
router.post("/createvideo/:userId/:commId", upload.any(), createVideo);
router.get("/getfeed/:userId", fetchfeed);
router.get("/getpost/:userId", getpost);
module.exports = router;
