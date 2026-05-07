// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Silence non-essential console output in production (keep error/warn).
if (process.env.NODE_ENV === 'production') {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
}

// Environment validation
const requiredEnvVars = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_GEMINI_API_KEY',
  'PRIVATE_KEY_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ MISSING ENVIRONMENT VARIABLES:', missingEnvVars.join(', '));
  // We don't process.exit(1) here to allow the /api/health endpoint to report the issue
} else {
  console.log('✅ All required environment variables are set.');
}

// Database connection is lazy-loaded via getSupabase() when needed.


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  credentials: true,
}));
// Routes
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const characterRoutes = require('./routes/characterRoutes');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});

// Apply to authentication routes
app.use('/api/auth', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/users', userRoutes); // Add this new line

app.get('/api/health', (req, res) => {
  const status = {
    status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
    missingVariables: missingEnvVars,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  res.status(missingEnvVars.length === 0 ? 200 : 500).json(status);
});

app.get('/', (req, res) => {
  res.send('Hello from Express.js on Vercel!');
});

// Start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
