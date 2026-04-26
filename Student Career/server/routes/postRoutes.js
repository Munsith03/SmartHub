import express from 'express';
const router = express.Router();
import {
  getFeedPosts,
  getMyPosts,
  getBookmarkedPosts,
  createPost,
  updatePost,
  deletePost,
  toggleReaction,
  toggleBookmark,
  votePoll,
  addComment,
  deleteComment,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { postImageUpload } from '../middleware/uploadMiddleware.js';

// All routes require authentication
router.use(protect);

// Feed, my posts, bookmarks
router.get('/', getFeedPosts);
router.get('/me', getMyPosts);
router.get('/bookmarks', getBookmarkedPosts);

// CRUD
router.post('/', postImageUpload.single('image'), createPost);
router.put('/:id', postImageUpload.single('image'), updatePost);
router.delete('/:id', deletePost);

// Reactions
router.put('/:id/react', toggleReaction);

// Bookmarks
router.put('/:id/bookmark', toggleBookmark);

// Poll
router.put('/:id/poll/vote', votePoll);

// Comments
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;