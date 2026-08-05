const User = require("../models/User");

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ message: "Unauthorized" });
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    const { password, ...others } = updated._doc;
    res.status(200).json(others);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ message: "Unauthorized" });
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) { next(err); }
};

exports.followUser = async (req, res, next) => {
  if (req.user.id === req.params.id) return res.status(403).json({ message: "Cannot follow yourself" });
  try {
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { followings: req.params.id } });
    res.status(200).json({ message: "Followed" });
  } catch (err) { next(err); }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $pull: { followings: req.params.id } });
    res.status(200).json({ message: "Unfollowed" });
  } catch (err) { next(err); }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({ _id: { $ne: req.user.id, $nin: currentUser.followings } }).limit(5);
    res.status(200).json(users.map(u => { const { password, ...o } = u._doc; return o; }));
  } catch (err) { next(err); }
};