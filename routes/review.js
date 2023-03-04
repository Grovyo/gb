const express = require("express");
const router = express.Router();
const multer = require("multer");

const { createrw, create } = require("../controllers/review");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//review with image
router.post("/addreviewimage/:userId/:productId/", upload.any(), createrw);

//text reveiw
router.post("/addreview/:userId/:productId/", create);

module.exports = router;
