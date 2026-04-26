import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, username, password, role } = req.body;

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, ...(username ? [{ username }] : [])],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const validRoles = ['user', 'company', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create user
    const user = new User({
      fullName,
      email,
      phoneNumber,
      username: username || email,
      password,
      role: role || 'user',
    });

    await user.save();

    // Auto-create profile for the user
    const profileData = {
      userId: user._id,
      phone: phoneNumber || '', // Use the phone number from registration if provided
      fullName: fullName || '', // Use the full name from registration if provided
    };
    
    const profile = await Profile.create(profileData);
    console.log(`Auto-created profile for user: ${user.email}`);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: user.toJSON(),
      profile: profile.toJSON(),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Also fetch the profile
    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      token,
      user: user.toJSON(),
      profile: profile ? profile.toJSON() : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user with profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json({ 
      user: req.user,
      profile: profile ? profile.toJSON() : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;