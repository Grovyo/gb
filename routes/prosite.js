const express = require("express");
const router = express.Router();

const {
  editbio,
  fetchmedia,
  fetchproducts,
  getproduct,
  getcommunities,
  getbio,
} = require("../controllers/prosite");

router.post("/edituser/:userId", editbio);
router.get("/fetchmedia/:userId", fetchmedia);
router.get("/fetchproduct/:userId", fetchproducts);
router.get("/getproduct/:productId", getproduct);
router.get("/getcommunities/:userId", getcommunities);
router.get("/getbio/:userId", getbio);

module.exports = router;
