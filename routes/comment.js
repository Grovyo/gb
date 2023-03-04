const express = require("express");
const router = express.Router();
const multer = require("multer");

const { create } = require("../controllers/comment");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/addcomment/:userId/:postId", upload.single("image"), create);

module.exports = router;
