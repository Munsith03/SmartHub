import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { HiOfficeBuilding, HiUserGroup, HiClock, HiCheckCircle, HiXCircle, HiChartBar, HiArrowRight } from 'react-icons/hi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats'),
      API.get('/admin/companies?limit=5'),
    ])
      .then(([statsRes, companiesRes]) => {
        setStats(statsRes.data);
        setRecentCompanies(companiesRes.data.companies);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const statCards = [
    { label: 'Total Companies', value: stats?.totalCompanies || 0, icon: HiOfficeBuilding, gradient: 'from-slate-700 to-slate-500', textColor: 'text-primary-400' },
    { label: 'Pending Review', value: stats?.pendingCompanies || 0, icon: HiClock, gradient: 'from-amber-500 to-orange-500', textColor: 'text-warning' },
    { label: 'Approved', value: stats?.approvedCompanies || 0, icon: HiCheckCircle, gradient: 'from-emerald-500 to-teal-500', textColor: 'text-success' },
    { label: 'Rejected', value: stats?.rejectedCompanies || 0, icon: HiXCircle, gradient: 'from-red-500 to-rose-500', textColor: 'text-danger' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: HiUserGroup, gradient: 'from-gray-700 to-gray-500', textColor: 'text-accent-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <HiChartBar className="w-5 h-5 text-white" />
              </div>
              Admin Dashboard
            </h1>
            <p className="text-sm text-text-secondary mt-1.5 ml-[52px]">System overview and management</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5 accent-top pulse-glow"
              >
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-xs text-text-muted mt-1 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { to: '/admin/approvals', title: 'Pending Approvals', desc: 'Review and manage company applications', value: `${stats?.pendingCompanies || 0} pending`, valueColor: 'text-warning', gradient: 'from-amber-500 to-orange-500' },
            { to: '/admin/companies', title: 'All Companies', desc: 'View and manage all registered companies', value: `${stats?.totalCompanies || 0} total`, valueColor: 'text-primary-400', gradient: 'from-slate-700 to-slate-500' },
            { to: '/admin/users', title: 'Users', desc: 'Manage platform users', value: `${stats?.totalUsers || 0} users`, valueColor: 'text-accent-400', gradient: 'from-gray-700 to-gray-500' },
          ].map((card) => (
            <Link key={card.to} to={card.to} className="glass-card p-6 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 group">
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary-400 transition-colors duration-300 flex items-center justify-between">
                {card.title}
                <HiArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary-400" />
              </h3>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{card.desc}</p>
              <p className={`text-lg font-bold ${card.valueColor} mt-3`}>{card.value}</p>
            </Link>
          ))}
        </div>

        {/* Recent Companies */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--glass-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Recent Applications</h3>
            <Link to="/admin/approvals" className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium flex items-center gap-1 group">
              View all <HiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--glass-border)]">
            {recentCompanies.map((company) => (
              <Link
                key={company._id}
                to={`/admin/companies/${company._id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-400">{company.companyName?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{company.companyName}</p>
                    <p className="text-xs text-text-muted mt-0.5">{company.industry} · {company.businessType}</p>
                  </div>
                </div>
                <StatusBadge status={company.status} />
              </Link>
            ))}
            {recentCompanies.length === 0 && (
              <p className="text-center text-sm text-text-muted py-10">No applications yet</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
