const Story = require("../models/Story");

exports.createStory = async (req, res, next) => {
  try {
    const story = await Story.create({ userId: req.user.id, ...req.body });
    res.status(201).json(story);
  } catch (err) { next(err); }
};

exports.getStories = async (req, res, next) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json(stories);
  } catch (err) { next(err); }
};

exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    if (story.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    await Story.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Story deleted" });
  } catch (err) { next(err); }
};