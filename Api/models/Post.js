const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  desc:     { type: String, default: "" },
  img:      { type: String, default: "" },
  audio:    { type: String, default: "" },
  likes:    { type: [String], default: [] },
  tags:     { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);