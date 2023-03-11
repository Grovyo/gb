const express = require("express");
const {
  newconv,
  getallconv,
  getoneconv,
} = require("../controllers/conversation");
const router = express.Router();

//new conversation private
router.post("/newconv", newconv);

//get all conversations
router.get("/getconv/:userId", getallconv);

//get a conversation
router.get("/getoneconv/:convId", getoneconv);

module.exports = router;
