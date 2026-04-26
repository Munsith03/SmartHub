import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { HiCheckCircle, HiXCircle, HiEye } from 'react-icons/hi';

export default function PendingApprovals() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await API.get('/admin/companies?status=pending');
      setCompanies(res.data.companies);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/companies/${id}/approve`);
      setCompanies(companies.filter((c) => c._id !== id));
      toast.success('Company approved!');
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Please provide a reason');
    try {
      await API.put(`/admin/companies/${rejectModal.id}/reject`, { reason: rejectReason });
      setCompanies(companies.filter((c) => c._id !== rejectModal.id));
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      toast.success('Company rejected');
    } catch {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <LoadingSpinner text="Loading pending approvals..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Pending Approvals</h1>
        <p className="text-sm text-text-secondary mb-8">Review and manage company verification requests</p>

        {companies.length === 0 ? (
          <div className="glass-card p-16 text-center accent-top">
            <HiCheckCircle className="w-16 h-16 mx-auto text-success/30 mb-4" />
            <p className="text-lg font-semibold text-text-primary">All caught up!</p>
            <p className="text-sm text-text-muted mt-1.5">No pending applications to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company, i) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6"
                style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-warning)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary-400">{company.companyName?.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{company.companyName}</h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {company.industry} · {company.businessType} · Reg. #{company.registrationNumber}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {company.city}, {company.country} · {company.documents?.length || 0} documents
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/admin/companies/${company._id}`} className="p-2.5 text-text-muted hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all duration-200" title="View Details">
                      <HiEye className="w-5 h-5" />
                    </Link>
                    <button onClick={() => handleApprove(company._id)} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-success/10 text-success hover:bg-success/20 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-success/10">
                      <HiCheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setRejectModal({ open: true, id: company._id })} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-danger/10">
                      <HiXCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="glass-card p-7 w-full max-w-md mx-4 accent-top"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">Reject Company</h3>
              <p className="text-sm text-text-secondary mb-5">Please provide a reason for rejection. This will be shared with the company.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-surface-elevated/50 border border-[var(--glass-border)] rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-danger focus:ring-4 focus:ring-danger/15 transition-all duration-200 resize-none input-stripe"
                placeholder="Reason for rejection..."
              />
              <div className="flex gap-3 mt-5 justify-end">
                <button onClick={() => { setRejectModal({ open: false, id: null }); setRejectReason(''); }} className="px-5 py-2.5 text-sm border border-[var(--glass-border)] rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200">
                  Cancel
                </button>
                <button onClick={handleReject} className="px-5 py-2.5 text-sm bg-danger text-white rounded-xl hover:bg-red-600 transition-all duration-200 hover:shadow-lg hover:shadow-danger/25">
                  Reject Company
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
