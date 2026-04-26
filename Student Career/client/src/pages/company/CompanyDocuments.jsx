import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiUpload, HiTrash, HiDocument, HiPhotograph, HiCheckCircle } from 'react-icons/hi';

const documentTypes = [
  { value: 'businessRegistrationCertificate', label: 'Business Registration Certificate', required: true },
  { value: 'taxIdentificationDocument', label: 'Tax Identification Document', required: true },
  { value: 'companyLogo', label: 'Company Logo', required: true },
  { value: 'ownerNICPassport', label: 'Owner NIC / Passport', required: true },
  { value: 'proofOfAddress', label: 'Proof of Address', required: true },
  { value: 'additionalCertificates', label: 'Additional Certificates', required: false },
];

export default function CompanyDocuments() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/company/profile');
      setProfile(res.data);
    } catch {
      toast.error('Please create a company profile first');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (docType, files) => {
    if (!files.length) return;
    setUploading(docType);
    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      for (const file of files) {
        formData.append('documents', file);
      }

      const res = await API.post('/company/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading('');
    }
  };

  const handleDelete = async (docId) => {
    try {
      const res = await API.delete(`/company/documents/${docId}`);
      setProfile(res.data);
      toast.success('Document removed');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  if (loading) return <LoadingSpinner text="Loading documents..." />;
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-text-secondary">Please create a company profile first.</p>
      </div>
    );
  }

  const getDocsByType = (type) => profile.documents?.filter((d) => d.type === type) || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Documents</h1>
        <p className="text-sm text-text-secondary mb-8">Upload required documents for verification. Supported formats: PDF, JPG, PNG (max 10MB)</p>

        <div className="space-y-4">
          {documentTypes.map((docType, i) => {
            const docs = getDocsByType(docType.value);
            const hasDoc = docs.length > 0;
            const isUploading = uploading === docType.value;

            return (
              <motion.div
                key={docType.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-5 ${hasDoc ? 'border-success/20' : ''}`}
                style={hasDoc ? { borderLeftWidth: '3px', borderLeftColor: 'var(--color-success)' } : {}}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      hasDoc ? 'bg-success/10' : 'bg-surface-elevated'
                    }`}>
                      {hasDoc ? (
                        <HiCheckCircle className="w-5 h-5 text-success" />
                      ) : docType.value === 'companyLogo' ? (
                        <HiPhotograph className="w-5 h-5 text-text-muted" />
                      ) : (
                        <HiDocument className="w-5 h-5 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-text-primary">{docType.label}</h3>
                        {docType.required && <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium">Required</span>}
                        {hasDoc && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Uploaded</span>}
                      </div>

                      {/* Show uploaded files */}
                      {docs.map((doc) => (
                        <div key={doc._id} className="flex items-center gap-2 mt-2.5 text-xs text-text-secondary">
                          <span className="truncate max-w-[200px]">{doc.originalName}</span>
                          <span className="text-text-muted">({(doc.size / 1024).toFixed(0)} KB)</span>
                          <button onClick={() => handleDelete(doc._id)} className="text-danger hover:text-red-400 transition-colors p-1 hover:bg-danger/10 rounded-lg">
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl cursor-pointer transition-all duration-200 ${
                    isUploading
                      ? 'bg-surface-elevated text-text-muted cursor-wait'
                      : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 hover:shadow-md hover:shadow-primary-500/10'
                  }`}>
                    {isUploading ? (
                      <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    ) : (
                      <HiUpload className="w-4 h-4" />
                    )}
                    {hasDoc ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => handleUpload(docType.value, Array.from(e.target.files))}
                    />
                  </label>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
