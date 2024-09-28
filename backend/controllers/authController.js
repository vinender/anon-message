// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

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
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if username or email exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    // Generate RSA key pair in PEM format
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({  
      username, 
      email,
      password, // Plaintext password; hashing handled by pre-save hook
      publicKey, // PEM format
      privateKey, // PEM format; consider not storing on server if possible
    });

    console.log('New user:', user);

    await user.save();

    // Generate JWT token without privateKey
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

    res.status(201).json({ token });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
};

// Traditional Login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] // Allow login via email or username
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password only if the user has a password (not Google-authenticated)
    if (user.password) {
      const isMatch = await user.comparePassword(password);
      console.log('Is matched:', isMatch);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }
    } else {
      return res.status(400).json({ message: 'Please log in using Google Sign-In.' });
    }

    // Generate token without privateKey
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
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Error logging in.' });
  }
};

// Google Authentication
exports.googleAuth = async (req, res) => {
  const { credential } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ message: 'Credential is required.' });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Extract necessary information
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // If not, check if a user with the same email exists
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
      } else {
        // Create new user
        // Generate RSA key pair
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        });

        // Create new user
        user = new User({
          username: name.replace(/\s+/g, '').toLowerCase(), // Simple username generation
          email,
          googleId,
          publicKey, // PEM format
          privateKey, // PEM format; consider security implications
        });
      }

      await user.save();
    }

    // Generate JWT token without privateKey
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
    res.status(500).json({ message: 'Google authentication failed.' });
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
  