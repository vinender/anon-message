// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
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

    // Trust the JWT payload — no DB round-trip.
    // JWT is cryptographically signed, user existence was verified at login/signup.
    req.user = {
      id: decoded.userId,
      _id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      publicKey: decoded.publicKey,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
