const Message = require("../models/Message");

exports.addMessage = async (req, res, next) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json(msg);
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const msgs = await Message.find({ conversationId: req.params.conversationId });
    res.status(200).json(msgs);
  } catch (err) { next(err); }
};