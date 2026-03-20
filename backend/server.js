require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const apiGateway = require('./gateway');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Determine allowed origins based on environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4200'];

// Attach Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Alumni Connect API is running ✅', version: '1.0.0' });
});

// Mount API Gateway
app.use('/api', apiGateway);

// Socket.io handler
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
