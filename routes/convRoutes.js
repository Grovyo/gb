const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation");

router.post("/newconv", async (req, res) => {
  const conv = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const savedConv = await conv.save();
    res.status(200).json(savedConv);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get("/getconv/:userId", async (req, res) => {
  try {
    const conv = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conv);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
