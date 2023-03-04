const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { create } = require("../controllers/glimpse");

router.post("/glimpse/:userId", upload.single("video"), create);

module.exports = router;
