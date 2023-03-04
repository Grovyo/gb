const express = require("express");
const router = express.Router();
const multer = require("multer");

const { create } = require("../controllers/product");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/createproduct/:userId", upload.any(), create);

module.exports = router;
