const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const { newConversation, getConversations, getConversation } = require("../controllers/conversationController");

router.post("/", verifyToken, newConversation);
router.get("/:userId", verifyToken, getConversations);
router.get("/find/:firstUserId/:secondUserId", verifyToken, getConversation);

module.exports = router;