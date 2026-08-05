const Conversation = require("../models/Conversation");

exports.newConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.create({ members: [req.user.id, req.body.receiverId] });
    res.status(201).json(conv);
  } catch (err) { next(err); }
};

exports.getConversations = async (req, res, next) => {
  try {
    const convs = await Conversation.find({ members: { $in: [req.params.userId] } });
    res.status(200).json(convs);
  } catch (err) { next(err); }
};

exports.getConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.findOne({ members: { $all: [req.params.firstUserId, req.params.secondUserId] } });
    res.status(200).json(conv);
  } catch (err) { next(err); }
};