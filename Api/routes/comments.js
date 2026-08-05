const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const { createComment, getComments, deleteComment } = require("../controllers/commentController");

router.post("/", verifyToken, createComment);
router.get("/:postId", getComments);
router.delete("/:id", verifyToken, deleteComment);

module.exports = router;