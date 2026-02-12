const Chat = require("../models/Chat");
const mongoose = require("mongoose");



exports.getChatList = async (req, res) => {
  const { me } = req.query;

  try {
    const messages = await Chat.find({
      $or: [{ sender: me }, { receiver: me }]
    })
      .sort({ createdAt: -1 })
      .populate("sender receiver", "name avatar");

    const chatMap = {};

    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === me
          ? msg.receiver
          : msg.sender;

      if (!chatMap[otherUser._id]) {
        chatMap[otherUser._id] = {
          _id: otherUser._id,
          user: otherUser,
          lastMessage: msg.text,
          unseenCount: 0,
          createdAt: msg.createdAt
        };
      }

      if (
        msg.receiver._id.toString() === me &&
        !msg.seen
      ) {
        chatMap[otherUser._id].unseenCount++;
      }
    });

    res.json(Object.values(chatMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load chats" });
  }
};
