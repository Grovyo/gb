const User = require("../models/userAuth");

//edit users bio
exports.editbio = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shortdesc, desc } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { shortdesc: shortdesc, desc: desc },
      { new: true }
    );
    await user.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json(e.message);
  }
};
