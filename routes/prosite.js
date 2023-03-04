const express = require("express");
const router = express.Router();

const { editbio } = require("../controllers/prosite");

router.post("/edituser/:userId", editbio);

module.exports = router;
