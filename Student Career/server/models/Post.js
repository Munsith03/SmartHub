import mongoose from 'mongoose';

// ─── Reaction types ────────────────────────────────────────
export const REACTION_TYPES = ['like', 'love', 'celebrate', 'insightful', 'funny'];

// ─── Comment subdoc ────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// ─── Reaction subdoc ──────────────────────────────────────
const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: REACTION_TYPES,
      required: true,
    },
  },
  { _id: true, timestamps: false }
);

// ─── Poll option subdoc ───────────────────────────────────
const pollOptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Poll option cannot exceed 100 characters'],
    },
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { _id: true }
);

// ─── Poll subdoc ──────────────────────────────────────────
const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Poll question cannot exceed 200 characters'],
    },
    options: {
      type: [pollOptionSchema],
      validate: {
        validator: (v) => v.length >= 2 && v.length <= 5,
        message: 'Poll must have between 2 and 5 options',
      },
    },
    endsAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// ─── Main Post schema ─────────────────────────────────────
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => tags.map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, '')),
    },

    // Reactions (replaces simple likes)
    reactions: [reactionSchema],

    // Backward-compat: keep likes as virtual for total reaction count
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Poll (optional)
    poll: {
      type: pollSchema,
      default: null,
    },

    comments: [commentSchema],
  },
  { timestamps: true }
);

// ─── Virtuals ──────────────────────────────────────────────
postSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Group reactions by type with counts
postSchema.virtual('reactionSummary').get(function () {
  const summary = {};
  this.reactions.forEach((r) => {
    if (!summary[r.type]) summary[r.type] = { count: 0, users: [] };
    summary[r.type].count += 1;
    summary[r.type].users.push(r.user);
  });
  return summary;
});

// Total poll votes
postSchema.virtual('totalPollVotes').get(function () {
  if (!this.poll) return 0;
  return this.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// ─── Indexes ───────────────────────────────────────────────
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'bookmarks': 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;