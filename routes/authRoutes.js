const express = require("express");
const router = express.Router();

//imports
const { signup, signin, verify, signout } = require("../controllers/userAuth");

router.post("/signup", signup);
router.post("/verify", verify);
router.post("/signin", signin);
router.get("/signout", signout);

module.exports = router;
