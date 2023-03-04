const express = require("express");
const router = express.Router();
const multer = require("multer");

const { create } = require("../controllers/community");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/createcom/:userId", upload.single("image"), create);

module.exports = router;
