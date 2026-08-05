const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId:  { type: String, required: true },
  userId:  { type: String, required: true },
  desc:    { type: String, required: true },
  likes:   { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);