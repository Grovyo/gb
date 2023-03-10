const express = require("express");
const router = express.Router();

const { create, deletetopic } = require("../controllers/topic");

router.post("/createtopic/:userId/:comId", create);

router.delete("/deletetopic/:topicId", deletetopic);

module.exports = router;
