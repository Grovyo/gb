const express = require("express");
const router = express.Router();

const { create } = require("../controllers/topic");

router.post("/createtopic/:userId/:comId", create);

module.exports = router;
