const admin = require('../config/firebase');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('send-message', async ({ roomId, senderId, senderName, senderPhoto, message }) => {
      try {
        const msgData = {
          senderId, senderName, senderPhoto: senderPhoto || '',
          message, createdAt: admin.firestore.FieldValue.serverTimestamp(), read: false
        };
        const msgRef = await admin.firestore()
          .collection('chatRooms').doc(roomId)
          .collection('messages').add(msgData);

        await admin.firestore().collection('chatRooms').doc(roomId).update({
          lastMessage: message,
          lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
          unread: admin.firestore.FieldValue.increment(1)
        });

        io.to(roomId).emit('new-message', { id: msgRef.id, ...msgData, createdAt: new Date() });
      } catch (err) {
        console.error('Socket message error:', err.message);
      }
    });

    socket.on('typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('user-typing', { userId });
    });

    socket.on('stop-typing', ({ roomId }) => {
      socket.to(roomId).emit('stop-typing');
    });

    socket.on('mark-read', async ({ roomId }) => {
      try {
        await admin.firestore().collection('chatRooms').doc(roomId).update({ unread: 0 });
      } catch (err) {}
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
