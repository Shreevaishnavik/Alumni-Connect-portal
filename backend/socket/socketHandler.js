module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('send-message', ({ to, text, senderId }) => {
      io.to(to).emit('receive-message', { text, senderId, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
