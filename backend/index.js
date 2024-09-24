// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConnect = require('./utils/dbConnect');

// Load environment variables
dotenv.config();

// Connect to MongoDB
dbConnect();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'https://anon-message-bh9p.vercel.app/api', // Replace with your frontend URL
    credentials: true,
  })
);

// Routes
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);


app.get('/', (req, res) => {
  res.send('Hello from Express.js on Vercel!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
