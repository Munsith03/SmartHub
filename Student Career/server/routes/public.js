import express from 'express';
import CompanyProfile from '../models/CompanyProfile.js';
import Review from '../models/Review.js';

const router = express.Router();

// Get approved companies (public)
router.get('/companies', async (req, res) => {
  try {
    const { search, industry, businessType, country, city, page = 1, limit = 12 } = req.query;

    const filter = { status: 'approved' };

    if (search) {
      filter.$text = { $search: search };
    }
    if (industry) filter.industry = industry;
    if (businessType) filter.businessType = businessType;
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const companies = await CompanyProfile.find(filter)
      .select('companyName industry businessType city country companyLogo description documents')
      .sort({ approvedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get average ratings for all returned companies
    const companyIds = companies.map((c) => c._id);
    const ratings = await Review.aggregate([
      { $match: { companyId: { $in: companyIds } } },
      {
        $group: {
          _id: '$companyId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[r._id.toString()] = { avgRating: r.avgRating, reviewCount: r.count };
    });

    const companiesWithRatings = companies.map((c) => ({
      ...c.toObject(),
      rating: ratingMap[c._id.toString()] || { avgRating: 0, reviewCount: 0 },
    }));

    const total = await CompanyProfile.countDocuments(filter);

    res.json({
      companies: companiesWithRatings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Public companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single company details (public)
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({
      _id: req.params.id,
      status: 'approved',
    }).populate('userId', 'fullName isOnline lastSeen');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get reviews
    const reviews = await Review.find({ companyId: company._id })
      .populate('userId', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get average rating
    const ratingAgg = await Review.aggregate([
      { $match: { companyId: company._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const rating = ratingAgg[0] || { avgRating: 0, count: 0 };

    res.json({ company, reviews, rating });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get filter options
router.get('/filters', async (req, res) => {
  try {
    const [industries, businessTypes, countries] = await Promise.all([
      CompanyProfile.distinct('industry', { status: 'approved' }),
      CompanyProfile.distinct('businessType', { status: 'approved' }),
      CompanyProfile.distinct('country', { status: 'approved' }),
    ]);

    res.json({ industries, businessTypes, countries });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
