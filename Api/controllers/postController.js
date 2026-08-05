const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({ userId: req.user.id, ...req.body });
    res.status(201).json(post);
  } catch (err) { next(err); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    const updated = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updated);
  } catch (err) { next(err); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId !== req.user.id) return res.status(403).json({ message: "Unauthorized" });
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted" });
  } catch (err) { next(err); }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.likes.includes(req.user.id)) {
      await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user.id } });
      return res.status(200).json({ message: "Unliked" });
    }
    await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user.id } });
    res.status(200).json({ message: "Liked" });
  } catch (err) { next(err); }
};

exports.getTimelinePosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const posts = await Post.find({ userId: { $in: [req.user.id, ...user.followings] } }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) { next(err); }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) { next(err); }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) { next(err); }
};