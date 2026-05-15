// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getSupabase } = require('../utils/dbConnect');
const nodemailer = require('nodemailer');

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
  const { email, password, publicKey, encryptedPrivateKey } = req.body;

  if (!email || !password || !publicKey || !encryptedPrivateKey) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const supabase = getSupabase();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email}`)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Strip PEM headers and footers from the public key
    const strippedPublicKey = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate username from email
    const username = email.split('@')[0] + '_' + crypto.randomBytes(3).toString('hex');

    // encryptedPrivateKey is already encrypted client-side with user's passphrase.
    // Server never sees the raw private key.
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        public_key: strippedPublicKey,
        encrypted_private_key: JSON.stringify(encryptedPrivateKey),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ message: 'Error creating user.' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.public_key,
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
    const supabase = getSupabase();

    // Find user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT — server never decrypts the private key.
    // The encrypted private key is returned so the client can decrypt it
    // with the user's passphrase.
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.public_key,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      encryptedPrivateKey: user.encrypted_private_key,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Check existing user
exports.checkUser = async (req, res) => {
  try {
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, encrypted_private_key, public_key')
      .eq('email', req.query.email)
      .single();

    if (error || !user) {
      return res.status(200).json({ exists: false });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.public_key,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      exists: true,
      encryptedPrivateKey: user.encrypted_private_key,
      publicKey: user.public_key,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking user', error: error.message });
  }
};

// Google Auth
exports.googleAuth = async (req, res) => {
  const { credential, email, name, publicKey, encryptedPrivateKey } = req.body;
  try {
    const supabase = getSupabase();

    const base = (name || 'user').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user';
    const username = `${base}_${crypto.randomBytes(4).toString('hex')}`;

    // Single RPC call — find or create user in one query (avoids free-tier timeout)
    const { data: user, error } = await supabase.rpc('upsert_user_by_email', {
      p_email: email,
      p_username: username,
      p_google_id: credential,
      p_public_key: publicKey,
      p_encrypted_private_key: JSON.stringify(encryptedPrivateKey),
    });

    if (error || !user) {
      console.error('upsert_user_by_email RPC error:', error);

      // Retry once on username collision
      if (error && error.code === '23505') {
        const retryUsername = `${base}_${crypto.randomBytes(6).toString('hex')}`;
        const { data: retryUser, error: retryError } = await supabase.rpc('upsert_user_by_email', {
          p_email: email,
          p_username: retryUsername,
          p_google_id: credential,
          p_public_key: publicKey,
          p_encrypted_private_key: JSON.stringify(encryptedPrivateKey),
        });

        if (retryError || !retryUser) {
          return res.status(500).json({ message: 'Error creating user.', error: retryError });
        }

        const token = jwt.sign(
          { userId: retryUser.id, username: retryUser.username, email: retryUser.email, publicKey: retryUser.public_key },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );
        return res.status(retryUser.is_new ? 201 : 200).json({ token });
      }

      return res.status(500).json({ message: 'Error creating user.', error });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, publicKey: user.public_key },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(user.is_new ? 201 : 200).json({ token });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({
      message: 'Google authentication failed.',
      error: error.message,
    });
  }
};

// Forgot Password - Request Reset Link
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiration
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_password_token: hashedToken,
        reset_password_expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ message: 'Error processing request.' });
    }

    // Create reset URL
    const resetURL = `${process.env.CLIENT_BASE_URL}/reset-password/${resetToken}`;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n` +
        `Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it:\n\n` +
        `${resetURL}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

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

    const supabase = getSupabase();

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching reset token and token not expired
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('reset_password_token', hashedToken)
      .gt('reset_password_expires', new Date().toISOString())
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ message: 'Error updating password.' });
    }

    // Send confirmation email
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
  console.log('user', req.params.username);
  try {
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('public_key')
      .eq('username', req.params.username)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ publicKey: user.public_key });
  } catch (error) {
    console.error('Get Public Key Error:', error);
    res.status(500).json({ message: 'Error fetching public key' });
  }
};