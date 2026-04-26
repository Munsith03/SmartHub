import Profile from '../models/Profile.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id }).populate(
      'userId',
      'fullName email createdAt'
    );

    // If profile doesn't exist, create one automatically
    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        phone: req.user.phoneNumber || '',
        fullName: req.user.fullName || '',
      });
      await profile.populate('userId', 'fullName email createdAt');
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Create profile
// @route   POST /api/profile
// @access  Private
export const createProfile = async (req, res, next) => {
  try {
    const existing = await Profile.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Profile already exists. Use PUT to update.' });
    }

    const { phone, dob, skills, bio, location, website, linkedin, github } = req.body;

    const profileData = {
      userId: req.user.id,
      phone: phone || req.user.phoneNumber || '',
      dob,
      bio,
      location,
      website,
      linkedin,
      github,
      skills: skills ? (Array.isArray(skills) ? skills : JSON.parse(skills)) : [],
    };

    if (req.files) {
      if (req.files.profileImage) {
        profileData.profileImage = `/uploads/images/${req.files.profileImage[0].filename}`;
      }
      if (req.files.resume) {
        profileData.resume = `/uploads/resumes/${req.files.resume[0].filename}`;
      }
    }

    const profile = await Profile.create(profileData);
    await profile.populate('userId', 'fullName email createdAt');

    res.status(201).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      // If profile doesn't exist, create it first
      const { phone, dob, skills, bio, location, website, linkedin, github } = req.body;
      
      const profileData = {
        userId: req.user.id,
        phone: phone || req.user.phoneNumber || '',
        dob,
        bio,
        location,
        website,
        linkedin,
        github,
        skills: skills ? (Array.isArray(skills) ? skills : JSON.parse(skills)) : [],
      };

      if (req.files) {
        if (req.files.profileImage) {
          profileData.profileImage = `/uploads/images/${req.files.profileImage[0].filename}`;
        }
        if (req.files.resume) {
          profileData.resume = `/uploads/resumes/${req.files.resume[0].filename}`;
        }
      }

      profile = await Profile.create(profileData);
      await profile.populate('userId', 'fullName email createdAt');
      
      return res.status(201).json({ success: true, profile, message: 'Profile created successfully' });
    }

    const { phone, dob, skills, bio, location, website, linkedin, github } = req.body;

    const updates = {
      phone,
      dob,
      bio,
      location,
      website,
      linkedin,
      github,
    };

    if (skills !== undefined) {
      updates.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }

    if (req.files) {
      if (req.files.profileImage) {
        // Delete old image
        if (profile.profileImage) {
          const oldPath = path.join(__dirname, '..', profile.profileImage);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updates.profileImage = `/uploads/images/${req.files.profileImage[0].filename}`;
      }
      if (req.files.resume) {
        // Delete old resume
        if (profile.resume) {
          const oldPath = path.join(__dirname, '..', profile.resume);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updates.resume = `/uploads/resumes/${req.files.resume[0].filename}`;
      }
    }

    // Remove undefined keys
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email createdAt');

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile and user account
// @route   DELETE /api/profile
// @access  Private
export const deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });

    if (profile) {
      // Delete files
      if (profile.profileImage) {
        const imgPath = path.join(__dirname, '..', profile.profileImage);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      if (profile.resume) {
        const resPath = path.join(__dirname, '..', profile.resume);
        if (fs.existsSync(resPath)) fs.unlinkSync(resPath);
      }
      await Profile.findByIdAndDelete(profile._id);
    }

    await User.findByIdAndDelete(req.user.id);

    // Clear cookie
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};