const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const { addMessage, getMessages } = require("../controllers/messageController");

router.post("/", verifyToken, addMessage);
router.get("/:conversationId", verifyToken, getMessages);

module.exports = router;