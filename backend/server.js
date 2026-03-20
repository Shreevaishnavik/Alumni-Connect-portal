require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const apiGateway = require('./gateway');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === 'production';

// Determine allowed origins based on environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4200'];

// Attach Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: isProduction ? '*' : allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Middleware
app.use(cors({
  origin: isProduction ? '*' : allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount API Gateway
app.use('/api', apiGateway);

// Serve React build in production
if (isProduction) {
  const reactBuild = path.join(__dirname, '../react-app/dist');
  app.use(express.static(reactBuild));

  // All non-API routes serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuild, 'index.html'));
  });
}

// Socket.io handler
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
