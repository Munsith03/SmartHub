import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'businessRegistrationCertificate',
      'taxIdentificationDocument',
      'companyLogo',
      'ownerNICPassport',
      'proofOfAddress',
      'additionalCertificates',
    ],
    required: true,
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
});

const companyProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Basic Information
    companyName: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true },
    businessType: {
      type: String,
      enum: ['Private', 'Public', 'Startup', 'NGO'],
      required: true,
    },
    industry: { type: String, required: true, trim: true },

    // Contact Details
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    websiteURL: { type: String, trim: true },

    // Location Details
    country: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    postalCode: { type: String, trim: true },

    // Description
    description: { type: String, trim: true, maxlength: 2000 },

    // Documents
    documents: [documentSchema],

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true }
);

companyProfileSchema.index({ companyName: 'text', industry: 'text', city: 'text' });
companyProfileSchema.index({ status: 1 });
companyProfileSchema.index({ industry: 1 });
companyProfileSchema.index({ businessType: 1 });

export default mongoose.model('CompanyProfile', companyProfileSchema);
