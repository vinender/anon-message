// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
const analyzeMessage = require('../utils/analyzeMessage');
const crypto = require('crypto');


exports.sendMessage = async (req, res) => {
  const { encryptedMessage, recipientUsername } = req.body;
  try {
    // Find recipient
    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found.' });
    }


      // Analyze sentiment
      const isPositive = await analyzeMessage(encryptedMessage);
      console.log('is postive',isPositive)

    // Save encrypted message
    const newMessage = new Message({
      content: encryptedMessage,
      recipient: recipient._id,
      sender: req.user ? req.user._id : null,
    });
    await newMessage.save();
    res.json({ status: 'Message sent!' });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Error sending message.' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    
    // Send encrypted messages to the client
    res.json({ messages: messages.map(msg => ({
      _id: msg._id,
      sender: msg.sender,
      content: msg.content, // This is still encrypted
      createdAt: msg.createdAt
    }))});
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
};

async function decryptMessage(encryptedMessage, privateKey) {
  const buffer = Buffer.from(encryptedMessage, 'base64');
  console.log('buffer',buffer)
  console.log('encryped messsge',encryptedMessage)
  const decrypted = crypto.privateDecrypt(
    {
      key: Buffer.from(privateKey, 'base64').toString(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );
  return decrypted.toString('utf8');
}



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
