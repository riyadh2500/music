const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const { createStory, getStories, deleteStory } = require("../controllers/storyController");

router.post("/", verifyToken, createStory);
router.get("/", getStories);
router.delete("/:id", verifyToken, deleteStory);

module.exports = router;