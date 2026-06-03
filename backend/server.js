const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const admin = require('./config/firebase');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/listings',   require('./routes/listings'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/chat',       require('./routes/chat'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/wishlist',   require('./routes/wishlist'));
app.use('/api/reports',    require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'Server running', time: new Date() }));

// Socket.io real-time chat
require('./socket/chatHandler')(io);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { app, io };
