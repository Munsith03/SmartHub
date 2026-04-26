import express from 'express';
const router = express.Router();
import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);

router.get('/', protect, getProfile);
router.post('/', protect, uploadFields, createProfile);
router.put('/', protect, uploadFields, updateProfile);
router.delete('/', protect, deleteProfile);

export default router;