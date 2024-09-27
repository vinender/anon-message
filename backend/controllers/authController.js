// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');




exports.signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Generate RSA key pair in DER format
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'der'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Convert DER-encoded public key to Base64
    const publicKeyBase64 = publicKey.toString('base64');

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({  
      username, 
      password,            // Plaintext password; hashing handled by pre-save hook
      publicKey: publicKeyBase64,
      privateKey          // Ensure this is stored securely on the server
    });

    console.log('new user', user);

    await user.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
};
// Get Public Key Controller
exports.getPublicKey = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ publicKey: user.publicKey }); // Send Base64-encoded DER public key
  } catch (error) {
    console.error('Get Public Key Error:', error);
    res.status(500).json({ message: 'Error fetching public key' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('is matched', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        publicKey: user.publicKey,
        privateKey: user.privateKey // Be cautious about including the private key
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '1d',
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Error logging in.' });
  }
};