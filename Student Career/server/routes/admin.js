import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import CompanyProfile from '../models/CompanyProfile.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get dashboard stats
router.get('/stats', auth, roleCheck('admin'), async (req, res) => {
  try {
    const [totalCompanies, pendingCompanies, approvedCompanies, rejectedCompanies, totalUsers] =
      await Promise.all([
        CompanyProfile.countDocuments(),
        CompanyProfile.countDocuments({ status: 'pending' }),
        CompanyProfile.countDocuments({ status: 'approved' }),
        CompanyProfile.countDocuments({ status: 'rejected' }),
        User.countDocuments({ role: 'user' }),
      ]);

    res.json({
      totalCompanies,
      pendingCompanies,
      approvedCompanies,
      rejectedCompanies,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all companies (with filters)
router.get('/companies', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const companies = await CompanyProfile.find(filter)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CompanyProfile.countDocuments(filter);

    res.json({ companies, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single company details (admin)
router.get('/companies/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const company = await CompanyProfile.findById(req.params.id).populate(
      'userId',
      'fullName email phoneNumber'
    );
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve company
router.put('/companies/:id/approve', auth, roleCheck('admin'), async (req, res) => {
  try {
    const company = await CompanyProfile.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedAt: new Date(),
        rejectionReason: '',
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject company
router.put('/companies/:id/reject', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const company = await CompanyProfile.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, roleCheck('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, roleCheck('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete associated data
    if (user.role === 'company') {
      await CompanyProfile.findOneAndDelete({ userId: user._id });
    }
    await Review.deleteMany({ userId: user._id });
    await Message.deleteMany({ $or: [{ senderId: user._id }, { receiverId: user._id }] });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
