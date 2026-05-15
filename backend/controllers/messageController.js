// controllers/messageController.js
const { getSupabase } = require('../utils/dbConnect');

const MAX_ENCRYPTED_LENGTH = 10000; // generous max for hybrid-encrypted payload

exports.sendMessage = async (req, res) => {
  const { encryptedMessage, recipientUsername } = req.body;

  if (typeof encryptedMessage !== 'string' || encryptedMessage.trim().length === 0) {
    return res.status(400).json({ message: 'Encrypted message is required.' });
  }

  if (encryptedMessage.length > MAX_ENCRYPTED_LENGTH) {
    return res
      .status(400)
      .json({ message: `Message payload must be ${MAX_ENCRYPTED_LENGTH} bytes or fewer.` });
  }

  try {
    const supabase = getSupabase();

    // Find recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id')
      .eq('username', recipientUsername)
      .single();

    if (recipientError || !recipient) {
      return res.status(404).json({ message: 'Recipient not found.' });
    }

    // Store only encrypted ciphertext. Server never sees plaintext.
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        content: encryptedMessage,
        recipient_id: recipient.id,
        sender_id: null, // always anonymous — sender identity never stored
      });

    if (insertError) {
      console.error('Message insert error:', insertError);
      return res.status(500).json({ message: 'Error saving message.' });
    }

    res.json({ status: 'Message sent!' });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Error sending message.' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const supabase = getSupabase();

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('recipient_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({ message: 'Error retrieving messages.' });
    }

    // Map to match the frontend's expected format
    res.json({
      messages: messages.map((msg) => ({
        _id: msg.id,
        sender: msg.sender_id,
        content: msg.content,
        createdAt: msg.created_at,
      })),
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
};

// API endpoint to fetch anonymous messages
exports.getAnonymousMessages = async (req, res) => {
  try {
    const supabase = getSupabase();

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, content, created_at')
      .eq('recipient_id', req.user.id)
      .is('sender_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get anonymous messages error:', error);
      return res.status(500).json({ message: 'Failed to fetch anonymous messages' });
    }

    // Map to match frontend format
    res.status(200).json({
      messages: messages.map((msg) => ({
        _id: msg.id,
        content: msg.content,
        createdAt: msg.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching anonymous messages:', error);
    res.status(500).json({ message: 'Failed to fetch anonymous messages' });
  }
};

exports.getSentMessages = async (req, res) => {
  try {
    const supabase = getSupabase();

    // Get messages sent by the authenticated user, with recipient username
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, content, created_at, recipient:users!messages_recipient_id_fkey(username)')
      .eq('sender_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get sent messages error:', error);
      return res.status(500).json({ message: 'Error retrieving sent messages.' });
    }

    const formattedMessages = messages.map((msg) => ({
      _id: msg.id,
      content: msg.content,
      recipientUsername: msg.recipient?.username || 'Unknown',
      createdAt: msg.created_at,
    }));

    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Get Sent Messages Error:', error);
    res.status(500).json({ message: 'Error retrieving sent messages.' });
  }
};
