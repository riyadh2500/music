const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const { getUser, updateUser, deleteUser, followUser, unfollowUser, getSuggestions } = require("../controllers/userController");

router.get("/suggestions", verifyToken, getSuggestions);
router.get("/:id", getUser);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.put("/:id/follow", verifyToken, followUser);
router.put("/:id/unfollow", verifyToken, unfollowUser);

module.exports = router;