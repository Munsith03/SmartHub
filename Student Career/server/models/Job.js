import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CompanyProfile', 
    required: true 
  },
  title: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Internship', 'Full Time', 'Part Time', 'Contract', 'Remote']
  },
  location: { type: String, required: true },
  skills: [{ type: String }], // ADD THIS - Skills array for the job
  requirements: { type: String },
  applicationDeadline: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'closed'], 
    default: 'draft' 
  },
  closedReason: { type: String, default: null }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Add indexes for better search performance
jobSchema.index({ title: 'text', requirements: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ companyId: 1, status: 1 });

export default mongoose.model('Job', jobSchema);