import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import Review from '../models/Review.js';

const router = express.Router();

// Create a review
router.post('/', auth, roleCheck('user'), async (req, res) => {
  try {
    const { companyId, rating, comment } = req.body;

    // Check if user already reviewed this company
    const existing = await Review.findOne({ userId: req.user._id, companyId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this company' });
    }

    const review = new Review({
      userId: req.user._id,
      companyId,
      rating,
      comment,
    });

    await review.save();
    await review.populate('userId', 'fullName avatar');

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reviews for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const reviews = await Review.find({ companyId: req.params.companyId })
      .populate('userId', 'fullName avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete own review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
