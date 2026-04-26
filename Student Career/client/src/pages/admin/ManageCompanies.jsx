import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    API.get(`/admin/companies${params}`)
      .then((res) => setCompanies(res.data.companies))
      .catch(() => toast.error('Failed to load companies'))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <LoadingSpinner text="Loading companies..." />;

  const filterTabs = ['', 'pending', 'approved', 'rejected'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Manage Companies</h1>
            <p className="text-sm text-text-secondary mt-1.5">{companies.length} companies found</p>
          </div>
          <div className="flex gap-1.5 bg-surface-elevated/50 p-1 rounded-xl border border-[var(--glass-border)] backdrop-blur-sm">
            {filterTabs.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 capitalize ${
                  filter === f
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}>
                {f || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Company</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Industry</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Type</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Location</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Status</th>
                  <th className="text-right text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-hover/50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-400">{c.companyName?.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-text-primary">{c.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.industry}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.businessType}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{c.city}, {c.country}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/companies/${c._id}`} className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {companies.length === 0 && (
            <p className="text-center text-sm text-text-muted py-10">No companies found</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
