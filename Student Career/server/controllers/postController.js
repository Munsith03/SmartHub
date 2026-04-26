import Post from '../models/Post.js';
import { REACTION_TYPES } from '../models/Post.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helper: populate post ────────────────────────────────
const populatePost = (query) =>
  query
    .populate('author', 'name email')
    .populate('reactions.user', 'name email')
    .populate('comments.user', 'name email')
    .populate('poll.options.votes', 'name');

// @desc    Get all posts (feed) — supports tag filtering
// @route   GET /api/posts
// @access  Private
export const getFeedPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const tag = req.query.tag;

    const filter = tag ? { tags: tag.toLowerCase() } : {};

    const [posts, total] = await Promise.all([
      populatePost(
        Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      ),
      Post.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's posts
// @route   GET /api/posts/me
// @access  Private
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await populatePost(
      Post.find({ author: req.user.id }).sort({ createdAt: -1 })
    );
    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmarked posts
// @route   GET /api/posts/bookmarks
// @access  Private
export const getBookmarkedPosts = async (req, res, next) => {
  try {
    const posts = await populatePost(
      Post.find({ bookmarks: req.user.id }).sort({ createdAt: -1 })
    );
    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a post (supports polls + tags)
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { content, tags, pollQuestion, pollOptions } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    const postData = {
      author: req.user.id,
      content: content.trim(),
    };

    // Tags
    if (tags) {
      postData.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    }

    // Image
    if (req.file) {
      postData.image = `/uploads/posts/${req.file.filename}`;
    }

    // Poll
    if (pollQuestion && pollOptions) {
      const options = Array.isArray(pollOptions) ? pollOptions : JSON.parse(pollOptions);
      if (options.length >= 2 && options.length <= 5) {
        postData.poll = {
          question: pollQuestion.trim(),
          options: options.map((text) => ({ text: text.trim(), votes: [] })),
        };
      }
    }

    const post = await Post.create(postData);
    const populated = await populatePost(Post.findById(post._id));

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (own post only)
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { content, tags } = req.body;
    const updates = {};

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
      }
      updates.content = content.trim();
    }

    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    }

    if (req.file) {
      if (post.image) {
        const oldPath = path.join(__dirname, '..', post.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.image = `/uploads/posts/${req.file.filename}`;
    }

    post = await populatePost(
      Post.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
    );

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (own post only)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    if (post.image) {
      const imgPath = path.join(__dirname, '..', post.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle reaction on a post (like, love, celebrate, insightful, funny)
// @route   PUT /api/posts/:id/react
// @access  Private
export const toggleReaction = async (req, res, next) => {
  try {
    const { type } = req.body;

    if (!type || !REACTION_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reaction. Must be one of: ${REACTION_TYPES.join(', ')}`,
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.id;
    const existingIdx = post.reactions.findIndex(
      (r) => r.user.toString() === userId
    );

    if (existingIdx > -1) {
      if (post.reactions[existingIdx].type === type) {
        // Same reaction → remove (toggle off)
        post.reactions.splice(existingIdx, 1);
      } else {
        // Different reaction → switch
        post.reactions[existingIdx].type = type;
      }
    } else {
      // New reaction
      post.reactions.push({ user: userId, type });
    }

    await post.save();
    const populated = await populatePost(Post.findById(post._id));

    res.status(200).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark on a post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user.id;
    const isBookmarked = post.bookmarks.some((id) => id.toString() === userId);

    if (isBookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== userId);
    } else {
      post.bookmarks.push(userId);
    }

    await post.save();
    const populated = await populatePost(Post.findById(post._id));

    res.status(200).json({
      success: true,
      post: populated,
      bookmarked: !isBookmarked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on a poll option
// @route   PUT /api/posts/:id/poll/vote
// @access  Private
export const votePoll = async (req, res, next) => {
  try {
    const { optionId } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!post.poll) {
      return res.status(400).json({ success: false, message: 'This post has no poll' });
    }

    // Check if poll has ended
    if (post.poll.endsAt && new Date() > post.poll.endsAt) {
      return res.status(400).json({ success: false, message: 'This poll has ended' });
    }

    const userId = req.user.id;

    // Remove previous vote if any
    post.poll.options.forEach((opt) => {
      opt.votes = opt.votes.filter((id) => id.toString() !== userId);
    });

    // Add vote to selected option
    const option = post.poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ success: false, message: 'Poll option not found' });
    }

    option.votes.push(userId);

    await post.save();
    const populated = await populatePost(Post.findById(post._id));

    res.status(200).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await post.save();
    const populated = await populatePost(Post.findById(post._id));

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private (own comment only)
export const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();
    const populated = await populatePost(Post.findById(post._id));

    res.status(200).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};