const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  create,
  fetchallproducts,
  getaproduct,
  deleteproduct,
  highlight,
} = require("../controllers/product");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/createproduct/:userId", upload.any(), create);
router.get("/fetchallproducts/:userId", fetchallproducts);
router.get("/getaproduct/:productId", getaproduct);
router.delete("/deleteproduct/:userId/:productId", deleteproduct);
router.post("/addhightlights/:userId/:prodId", highlight);

module.exports = router;
