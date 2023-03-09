const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createPhoto,
  createVideo,
  getpost,
  fetchfeed,
  likepost,
  dislikepost,
  fetchonepost,
  deletepost,
} = require("../controllers/post");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/createphoto/:userId/:commId", upload.any(), createPhoto);
router.post("/createvideo/:userId/:commId", upload.any(), createVideo);
router.get("/getfeed/:userId", fetchfeed);
router.get("/fetchonepost/:postId", fetchonepost);
router.get("/getpost/:userId", getpost);
router.post("/likepost/:userId/:postId", likepost);
router.post("/dislikepost/:userId/:postId", dislikepost);
router.delete("/deletepost/:userId/:postId", deletepost);
module.exports = router;
