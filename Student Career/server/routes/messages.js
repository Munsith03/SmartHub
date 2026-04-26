import express from 'express';
import auth from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Get conversations list (unique chat partners)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unique conversation partners
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$senderId', userId] },
              then: '$receiverId',
              else: '$senderId',
            },
          },
          lastMessage: { $first: '$messageText' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    // Populate user details
    const partnerIds = conversations.map((c) => c._id);
    const partners = await User.find({ _id: { $in: partnerIds } }).select(
      'fullName email role isOnline lastSeen avatar'
    );

    const partnerMap = {};
    partners.forEach((p) => {
      partnerMap[p._id.toString()] = p;
    });

    const result = conversations.map((c) => ({
      partner: partnerMap[c._id.toString()],
      lastMessage: c.lastMessage,
      lastMessageTime: c.lastMessageTime,
      unreadCount: c.unreadCount,
    }));

    res.json(result);
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages with a specific user
router.get('/:partnerId', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const partnerId = req.params.partnerId;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { senderId: partnerId, receiverId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message (REST fallback)
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, messageText } = req.body;

    const message = new Message({
      senderId: req.user._id,
      receiverId,
      messageText,
    });

    await message.save();

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
