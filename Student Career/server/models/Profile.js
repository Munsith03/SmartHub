import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]{7,20}$/, 'Please enter a valid phone number'],
    },
    dob: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: null,
    },
    resume: {
      type: String,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtual: profile completion percentage
profileSchema.virtual('completionPercentage').get(function () {
  const fields = [
    'phone',
    'dob',
    'profileImage',
    'resume',
    'bio',
    'location',
    'website',
    'linkedin',
    'github',
  ];
  let filled = 0;
  fields.forEach((f) => {
    if (this[f]) filled++;
  });
  if (this.skills && this.skills.length > 0) filled++;
  const total = fields.length + 1;
  return Math.round((filled / total) * 100);
});

profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;