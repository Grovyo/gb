const Topic = require("../models/topic");

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
