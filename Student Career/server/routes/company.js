import express from 'express';
import auth from '../middleware/auth.js';
import roleCheck from '../middleware/roleCheck.js';
import upload from '../middleware/upload.js';
import CompanyProfile from '../models/CompanyProfile.js';

const router = express.Router();

// Create company profile
router.post('/profile', auth, roleCheck('company'), async (req, res) => {
  try {
    const existing = await CompanyProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Company profile already exists' });
    }

    const profile = new CompanyProfile({
      userId: req.user._id,
      ...req.body,
    });

    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get own company profile
router.get('/profile', auth, roleCheck('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company profile
router.put('/profile', auth, roleCheck('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload documents
router.post(
  '/documents',
  auth,
  roleCheck('company'),
  upload.array('documents', 10),
  async (req, res) => {
    try {
      const profile = await CompanyProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found. Create a profile first.' });
      }

      const docType = req.body.documentType;
      const newDocs = req.files.map((file) => ({
        type: docType || 'additionalCertificates',
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        path: `/uploads/${file.filename}`,
        size: file.size,
      }));

      // If re-uploading same type, remove old ones
      if (docType) {
        profile.documents = profile.documents.filter((d) => d.type !== docType);
      }

      profile.documents.push(...newDocs);

      // Reset status to pending if rejected
      if (profile.status === 'rejected') {
        profile.status = 'pending';
        profile.rejectionReason = '';
      }

      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// Delete a document
router.delete('/documents/:docId', auth, roleCheck('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.documents = profile.documents.filter(
      (d) => d._id.toString() !== req.params.docId
    );

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company status
router.get('/status', auth, roleCheck('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user._id }).select(
      'status rejectionReason approvedAt rejectedAt'
    );
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company details by ID 
router.get('/:companyId', auth, async (req, res) => {
  try {
    const company = await CompanyProfile.findById(req.params.companyId)
      .select('companyName industry city logoUrl description email phone website');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company ID for the authenticated user
router.get('/my-company-id', auth, roleCheck('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user._id }).select('_id status');
    if (!profile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    
    res.json({ 
      companyId: profile._id, 
      status: profile.status,
      isApproved: profile.status === 'approved'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
