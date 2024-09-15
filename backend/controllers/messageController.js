// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
const analyzeMessage = require('../utils/analyzeMessage');

exports.sendMessage = async (req, res) => {
  const { message, recipientUsername } = req.body;

  try {
    // Find recipient
    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found.' });
    }

    // Analyze sentiment
    const isPositive = await analyzeMessage(message);
    console.log('is postive',isPositive)

    if (isPositive) {
      // Save message
      const newMessage = new Message({
        content: message,
        recipient: recipient._id,
        sender: req.user ? req.user._id : null, // If sender is logged in
      });
      await newMessage.save();

      res.json({ status: 'Message sent!' });
    } else {
      res.json({ status: 'Message not sent. Negative sentiment detected.' });
    }
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Error sending message.' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    // Get messages for the authenticated user
    const messages = await Message.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.json({ messages });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
};

exports.getSentMessages = async (req, res) => {
  try {
    // Get messages sent by the authenticated user
    const messages = await Message.find({ sender: req.user._id }).populate('recipient', 'username');
    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      content: msg.content,
      recipientUsername: msg.recipient.username,
      createdAt: msg.createdAt,
    }));
    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Get Sent Messages Error:', error);
    res.status(500).json({ message: 'Error retrieving sent messages.' });
  }
};
