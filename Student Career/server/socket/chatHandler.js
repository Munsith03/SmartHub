import Message from '../models/Message.js';
import User from '../models/User.js';

const onlineUsers = new Map();

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // User comes online
    socket.on('user_online', async (userId) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId);

      try {
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
        io.emit('user_status', { userId, isOnline: true });
      } catch (err) {
        console.error('Error updating online status:', err);
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, messageText } = data;

        const message = new Message({ senderId, receiverId, messageText });
        await message.save();

        // Send to receiver
        io.to(receiverId).emit('new_message', {
          _id: message._id,
          senderId,
          receiverId,
          messageText,
          isRead: false,
          createdAt: message.createdAt,
        });

        // Confirm to sender
        socket.emit('message_sent', {
          _id: message._id,
          senderId,
          receiverId,
          messageText,
          isRead: false,
          createdAt: message.createdAt,
        });
      } catch (error) {
        console.error('Socket send_message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('user_typing', { userId: senderId });
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
      io.to(receiverId).emit('user_stop_typing', { userId: senderId });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany(
          { senderId, receiverId, isRead: false },
          { isRead: true, readAt: new Date() }
        );
        io.to(senderId).emit('messages_read', { by: receiverId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        try {
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          io.emit('user_status', { userId, isOnline: false });
        } catch (err) {
          console.error('Error updating offline status:', err);
        }
      }
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
}
