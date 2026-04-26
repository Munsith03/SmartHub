import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { HiCheckCircle, HiXCircle, HiDocument, HiExternalLink, HiArrowLeft, HiOfficeBuilding, HiLocationMarker } from 'react-icons/hi';

export default function CompanyReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    API.get(`/admin/companies/${id}`)
      .then((res) => setCompany(res.data))
      .catch(() => toast.error('Company not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    try {
      const res = await API.put(`/admin/companies/${id}/approve`);
      setCompany(res.data);
      toast.success('Company approved!');
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Reason required');
    try {
      const res = await API.put(`/admin/companies/${id}/reject`, { reason: rejectReason });
      setCompany(res.data);
      setShowReject(false);
      toast.success('Company rejected');
    } catch {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <LoadingSpinner text="Loading company..." />;
  if (!company) return <p className="text-center text-text-muted py-12">Company not found</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors group">
          <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>

        {/* Header */}
        <div className="glass-card p-7 mb-6 accent-top">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{company.companyName}</h1>
              <div className="flex items-center gap-3 mt-2.5">
                <StatusBadge status={company.status} />
                <span className="text-sm text-text-muted">{company.industry} · {company.businessType}</span>
              </div>
            </div>
            {company.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={handleApprove} className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-success text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 hover:shadow-lg hover:shadow-success/25">
                  <HiCheckCircle className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => setShowReject(true)} className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-danger text-white rounded-xl hover:bg-red-600 transition-all duration-200 hover:shadow-lg hover:shadow-danger/25">
                  <HiXCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {showReject && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 glass-card p-5">
            <h3 className="text-sm font-semibold text-danger mb-2">Rejection Reason</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
              className="w-full px-4 py-3 bg-surface-elevated/50 border border-[var(--glass-border)] rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-danger focus:ring-4 focus:ring-danger/15 transition-all duration-200 resize-none input-stripe mb-3"
              placeholder="Explain why this company is being rejected..." />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowReject(false)} className="px-4 py-2 text-xs border border-[var(--glass-border)] rounded-xl text-text-secondary hover:bg-surface-hover transition-all duration-200">Cancel</button>
              <button onClick={handleReject} className="px-4 py-2 text-xs bg-danger text-white rounded-xl hover:bg-red-600 transition-all duration-200">Confirm Reject</button>
            </div>
          </motion.div>
        )}

        {/* Company Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-7">
            <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <HiOfficeBuilding className="w-3.5 h-3.5 text-primary-400" />
              </div>
              Business Information
            </h3>
            <dl className="space-y-3.5">
              {[
                ['Registration #', company.registrationNumber],
                ['Business Type', company.businessType],
                ['Industry', company.industry],
                ['Email', company.email],
                ['Phone', company.phoneNumber],
                ['Website', company.websiteURL],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-center text-sm">
                  <dt className="text-text-muted">{l}</dt>
                  <dd className="text-text-primary font-medium">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="glass-card p-7">
            <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <HiLocationMarker className="w-3.5 h-3.5 text-primary-400" />
              </div>
              Location & Contact
            </h3>
            <dl className="space-y-3.5">
              {[
                ['Address', company.addressLine1],
                ['Address 2', company.addressLine2],
                ['City', company.city],
                ['Country', company.country],
                ['Postal Code', company.postalCode],
                ['Account Owner', company.userId?.fullName],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-center text-sm">
                  <dt className="text-text-muted">{l}</dt>
                  <dd className="text-text-primary font-medium">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Documents */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--glass-border)]">
            <h3 className="text-sm font-semibold text-text-primary">Uploaded Documents ({company.documents?.length || 0})</h3>
          </div>
          <div className="divide-y divide-[var(--glass-border)]">
            {company.documents?.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover/50 transition-colors duration-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <HiDocument className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-text-primary font-medium">{doc.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xs text-text-muted mt-0.5">{doc.originalName} · {(doc.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <a href={doc.path} target="_blank" rel="noopener noreferrer" className="p-2.5 text-text-muted hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all duration-200">
                  <HiExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
            {(!company.documents || company.documents.length === 0) && (
              <p className="text-center text-sm text-text-muted py-10">No documents uploaded</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
