import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOfficeBuilding, HiDocumentText, HiChat, HiExclamationCircle, HiCheckCircle, HiClock, HiArrowRight } from 'react-icons/hi';

export default function CompanyDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/company/profile')
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-16 text-center accent-top">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/25">
            <HiOfficeBuilding className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Create Your Company Profile</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">Set up your company profile to get started. You'll need to provide your business details and upload required documents.</p>
          <Link to="/company/profile" className="glow-btn inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-medium group">
            <HiOfficeBuilding className="w-5 h-5" /> Create Profile
            <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Status',
      value: profile.status,
      icon: profile.status === 'approved' ? HiCheckCircle : profile.status === 'rejected' ? HiExclamationCircle : HiClock,
      color: profile.status === 'approved' ? 'text-success' : profile.status === 'rejected' ? 'text-danger' : 'text-warning',
      gradient: profile.status === 'approved' ? 'from-emerald-500 to-teal-500' : profile.status === 'rejected' ? 'from-red-500 to-rose-500' : 'from-amber-500 to-orange-500',
    },
    { label: 'Documents', value: profile.documents?.length || 0, icon: HiDocumentText, color: 'text-primary-400', gradient: 'from-slate-700 to-slate-500' },
    { label: 'Industry', value: profile.industry, icon: HiOfficeBuilding, color: 'text-accent-400', gradient: 'from-gray-700 to-gray-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{profile.companyName}</h1>
            <div className="flex items-center gap-3 mt-2.5">
              <StatusBadge status={profile.status} />
              <span className="text-sm text-text-muted">Reg. #{profile.registrationNumber}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/company/profile" className="px-5 py-2.5 text-sm bg-surface-elevated/50 border border-[var(--glass-border)] hover:border-primary-500/30 rounded-xl text-text-secondary hover:text-text-primary transition-all duration-200 backdrop-blur-sm">
              Edit Profile
            </Link>
            <Link to="/company/documents" className="glow-btn px-5 py-2.5 text-sm font-medium">
              Manage Documents
            </Link>
          </div>
        </div>

        {/* Rejection notice */}
        {profile.status === 'rejected' && profile.rejectionReason && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl border border-danger/20 bg-danger/5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <HiExclamationCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-danger">Application Rejected</p>
                <p className="text-sm text-text-secondary mt-1">{profile.rejectionReason}</p>
                <p className="text-xs text-text-muted mt-2">Please update your documents and resubmit.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 accent-top pulse-glow"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color} capitalize mt-0.5`}>{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-7">
            <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <HiOfficeBuilding className="w-3.5 h-3.5 text-primary-400" />
              </div>
              Business Information
            </h3>
            <dl className="space-y-3.5">
              {[
                ['Business Type', profile.businessType],
                ['Industry', profile.industry],
                ['Email', profile.email],
                ['Phone', profile.phoneNumber],
                ['Website', profile.websiteURL],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center text-sm py-0.5">
                  <dt className="text-text-muted">{label}</dt>
                  <dd className="text-text-primary font-medium">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="glass-card p-7">
            <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                <HiClock className="w-3.5 h-3.5 text-primary-400" />
              </div>
              Location
            </h3>
            <dl className="space-y-3.5">
              {[
                ['Address', profile.addressLine1],
                ['Address Line 2', profile.addressLine2],
                ['City', profile.city],
                ['Country', profile.country],
                ['Postal Code', profile.postalCode],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center text-sm py-0.5">
                  <dt className="text-text-muted">{label}</dt>
                  <dd className="text-text-primary font-medium">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-3">
          <Link to="/chat" className="flex items-center gap-2 px-5 py-2.5 text-sm glass-card hover:bg-surface-hover transition-all duration-200 text-text-secondary hover:text-text-primary group">
            <HiChat className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" /> Messages
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
