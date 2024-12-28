// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { decryptPrivateKey,encryptPrivateKey } = require('../utils/crypto');


const nodemailer = require('nodemailer');
 
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'Gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Traditional Signup

// Traditional Signup

exports.signup = async (req, res) => {
  const { username, email, password, publicKey, privateKey } = req.body;

  if (!username || !email || !password || !publicKey || !privateKey) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  console.log('private key',privateKey)

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Strip PEM headers and footers from the public key
    const strippedPublicKey = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '');

    // Encrypt the private key
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    // Create new user
    user = new User({
      username,
      email,
      password,
      publicKey: strippedPublicKey, // Store without headers
      encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
    });

    await user.save();

    // Generate JWT and send it back
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email, 
        publicKey: user.publicKey,
        privateKey:  privateKey,
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};


// Traditional Login

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Decrypt the private key
    const encryptedPrivateKey = JSON.parse(user.encryptedPrivateKey);
    const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey);

    // Generate JWT including the decrypted privateKey
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email, 
        publicKey: user.publicKey,
        privateKey: decryptedPrivateKey,
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.googleAuth = async (req, res) => {
  const { credential, email, name, publicKey, encryptedPrivateKey } = req.body;
  
  try {
    // Clean the publicKey
    const cleanedPublicKey = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .trim();

    // Check if user already exists by email
    let user = await User.findOne({ email });
    
    if (!user) {
      // Generate a unique username if the default one exists
      let baseUsername = name;
      let username = baseUsername;
      let counter = 1;
      
      // Keep checking until we find a unique username
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user following the schema
      user = new User({
        username,
        email,
        googleId: credential,
        publicKey: cleanedPublicKey,
        encryptedPrivateKey: JSON.stringify(encryptedPrivateKey),
      });
      
      // Validate and save the new user
      await user.validate();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Google Auth Error:', error);
    if (error.code === 11000) {
      res.status(400).json({ 
        message: 'Username or email already exists.' 
      });
    } else if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ 
        message: 'Validation error', 
        errors: messages 
      });
    } else {
      res.status(500).json({ 
        message: 'Google authentication failed.',
        error: error.message 
      });
    }
  }
};


// Forgot Password - Request Reset Link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // To prevent email enumeration, respond with success even if user doesn't exist
      return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate a reset token (secure random bytes)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving to the database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiration on user document
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Create reset URL
    const resetURL = `${process.env.CLIENT_BASE_URL}/reset-password/${resetToken}`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n` +
            `Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it:\n\n` +
            `${resetURL}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Error sending password reset email.' });
  }
};

// Reset Password - Set New Password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    // Hash the received token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching reset token and token not expired
    const user = await User.findOne({ 
      resetPasswordToken: hashedToken, 
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Update user's password
    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Optionally, send a confirmation email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your password has been changed',
      text: `Hello,\n\n` +
            `This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};




// Get Public Key Controller
exports.getPublicKey = async (req, res) => {
  console.log('user',req.params.username)
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
  