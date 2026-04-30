// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { getSupabase } = require('../utils/dbConnect');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized, no token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, public_key')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Map to a consistent format for downstream controllers
    req.user = {
      id: user.id,
      _id: user.id, // backward compatibility
      username: user.username,
      email: user.email,
      publicKey: user.public_key,
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};
