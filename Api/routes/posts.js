const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const { createPost, getPost, updatePost, deletePost, likePost, getTimelinePosts, getAllPosts, getUserPosts } = require("../controllers/postController");

router.post("/", verifyToken, createPost);
router.get("/timeline", verifyToken, getTimelinePosts);
router.get("/all", getAllPosts);
router.get("/user/:userId", getUserPosts);
router.get("/:id", getPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.put("/:id/like", verifyToken, likePost);

module.exports = router;