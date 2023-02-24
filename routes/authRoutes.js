const express = require("express");
const router = express.Router();

//imports
const { signup } = require("../controllers/userAuth");

router.post("/signup", signup);

module.exports = router;
