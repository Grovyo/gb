const Topic = require("../models/topic");

//create a new topic
exports.create = async (req, res) => {
  const { title } = req.body;
  const { userId, comId } = req.params;
  try {
    const community = new Topic({
      title,
      creator: userId,
      community: comId,
    });
    await community.save();
    res.status(200).json(community);
  } catch (e) {
    res.status(400).json(e.message);
  }
};

//Delete Topic
exports.deletetopic = async (req, res) => {
  const { topicId } = req.params;
  const topic = await Topic.findById(topicId);
  try {
    if (!topicId) {
      res.status(400).json({ message: "No community found" });
    } else if (topic.creator.toString() != topicId) {
      res
        .status(400)
        .json({ message: "Not Authorized - You can't delete others topic" });
    } else {
      await Topic.findByIdAndDelete(topicId);
      res.status(200).json({ success: true });
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
