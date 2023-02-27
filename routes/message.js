const express = require("express");
const router = express.Router();
const Message = require("../models/message");

router.post("/newmessage", async (req, res) => {
  const m = new Message(req.body);
  try {
    const newM = await m.save();
    res.status(200).json(newM);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.get("/getmessage/:conversationId", async (req, res) => {
  try {
    const getM = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(getM);
  } catch (e) {
    res.status(500).json(e.message);
  }
});
module.exports = router;
