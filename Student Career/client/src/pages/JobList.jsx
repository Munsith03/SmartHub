import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMapPin, FiBriefcase, FiCalendar,
  FiStar, FiArrowRight, FiCheckCircle,
  FiAlertCircle, FiClock, FiFilter, FiX,
  FiCode, FiEye, FiTrendingUp, FiTarget,
  FiDollarSign, FiUsers, FiBookmark, FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const JOB_CATEGORIES = ['All', 'Technology', 'Design', 'Marketing', 'Finance', 'Operations'];

export default function JobList() {
  const { user, completionPercentage = 0, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [filters, setFilters] = useState({ type: 'all', location: 'all' });
  const [hasApplied, setHasApplied] = useState({});
  const [skillMatches, setSkillMatches] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState({});

  useEffect(() => { fetchJobs(); }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.location !== 'all') params.append('location', filters.location);
      const response = await API.get(`/jobs?${params}`);
      const jobsData = response.data || [];
      const normalized = jobsData.map(job => ({ ...job, _id: job._id || job.id }));
      setJobs(normalized);
      if (user && profile?.skills?.length > 0) {
        normalized.forEach(job => {
          if (job.skills?.length > 0) calculateAndSetSkillMatch(job._id, profile.skills, job.skills);
          else setSkillMatches(prev => ({ ...prev, [job._id]: null }));
        });
      }
    } catch {
      toast.error('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAndSetSkillMatch = (jobId, userSkills, jobSkills) => {
    if (!userSkills?.length || !jobSkills?.length) { setSkillMatches(prev => ({ ...prev, [jobId]: null })); return; }
    const userLow = userSkills.map(s => s.toLowerCase());
    const jobLow = jobSkills.map(s => s.toLowerCase());
    const matched = jobLow.filter(js => userLow.some(us => us.includes(js) || js.includes(us)));
    const percentage = Math.round((matched.length / jobSkills.length) * 100);
    setSkillMatches(prev => ({ ...prev, [jobId]: { percentage, matchedCount: matched.length, totalCount: jobSkills.length } }));
  };

  const checkAppliedStatus = async (jobId) => {
    if (!user || !jobId) return;
    try {
      const res = await API.get(`/applications/check/${jobId}`);
      setHasApplied(prev => ({ ...prev, [jobId]: res.data.hasApplied }));
    } catch { setHasApplied(prev => ({ ...prev, [jobId]: false })); }
  };

  useEffect(() => {
    if (user && jobs.length > 0) jobs.forEach(job => { if (job?._id) checkAppliedStatus(job._id); });
  }, [jobs, user]);

  const canApply = completionPercentage >= 80;

  const handleApply = (job) => {
    if (!user) { toast.error('Please login to apply'); return; }
    if (!canApply) { toast.error(`Profile ${completionPercentage}% complete. Need 80% to apply.`); return; }
    if (hasApplied[job._id]) { toast.error('Already applied for this position'); return; }
    setSelectedJob({ ...job, _id: job._id || job.id });
    setShowModal(true);
  };

  const confirmApply = async () => {
    const jobId = selectedJob?._id || selectedJob?.id;
    if (!selectedJob || !jobId) { toast.error('Invalid job selection.'); setShowModal(false); return; }
    setApplying(true);
    try {
      await API.post('/applications', { jobId, name: user?.name, email: user?.email, phone: profile?.phone || '', notes: '' });
      toast.success('Application submitted! 🎉');
      setHasApplied(prev => ({ ...prev, [jobId]: true }));
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally { setApplying(false); }
  };

  const clearFilters = () => { setFilters({ type: 'all', location: 'all' }); setSearchTerm(''); setTimeout(() => fetchJobs(), 0); };
  const getJobTypes = () => ['all', ...new Set(jobs.map(j => j.type).filter(Boolean))];
  const getLocations = () => ['all', ...new Set(jobs.map(j => j.location).filter(Boolean))];
  const hasActiveFilters = filters.type !== 'all' || filters.location !== 'all' || searchTerm;

  const getMatchColor = (pct) => {
    if (pct >= 70) return { bar: 'from-emerald-500 to-green-500', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200' };
    if (pct >= 40) return { bar: 'from-amber-500 to-yellow-500', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200' };
    return { bar: 'from-rose-500 to-red-500', text: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200' };
  };

  const typeColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('intern')) return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (t.includes('full')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (t.includes('part')) return 'bg-violet-100 text-violet-700 border border-violet-200';
    if (t.includes('remote')) return 'bg-cyan-100 text-cyan-700 border border-cyan-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const deadlineDays = (deadline) => {
    if (!deadline) return null;
    const d = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
    return d;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-[var(--glass-border)] border-t-[var(--color-accent-500)] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary font-medium">Loading opportunities...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── PAGE HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="glass-card p-8 sm:p-10 accent-top overflow-hidden relative">
            <div className="floating-orb floating-orb-3" style={{ opacity: 0.06, width: 300, height: 300 }} />
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-5">
              <FiZap className="w-3 h-3" /> {jobs.length} live opportunities
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
              Find Your Perfect <span className="gradient-text">Internship</span>
            </h1>
            <p className="text-text-secondary max-w-xl">
              Discover roles matched to your skills. Apply in one click and track every step of your journey.
            </p>

            {/* Profile completion warning */}
            {user && !canApply && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 max-w-2xl">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-amber-800">Profile {completionPercentage}% complete</p>
                    <span className="text-xs text-amber-700">Need 80% to apply</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }} />
                  </div>
                </div>
                <Link to="/edit-profile" className="flex-shrink-0 px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition">
                  Complete Now
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── SEARCH & FILTER BAR ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-7">
          <div className="glass-card p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, company, or skill..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && fetchJobs()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--color-surface-elevated)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[var(--color-accent-500)] transition-all text-sm"
                />
              </div>
              <select
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--color-surface-elevated)] text-text-secondary focus:outline-none focus:border-[var(--color-accent-500)] text-sm transition-all"
              >
                {getJobTypes().map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
              </select>
              <select
                value={filters.location}
                onChange={e => setFilters({ ...filters, location: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--color-surface-elevated)] text-text-secondary focus:outline-none focus:border-[var(--color-accent-500)] text-sm transition-all"
              >
                {getLocations().map(l => <option key={l} value={l}>{l === 'all' ? 'All Locations' : l}</option>)}
              </select>
              <button onClick={fetchJobs}
                className="px-6 py-2.5 glow-btn text-sm font-medium rounded-xl">
                Search
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="px-4 py-2.5 text-text-muted hover:text-text-primary border border-[var(--glass-border)] rounded-xl hover:bg-surface-hover transition text-sm flex items-center gap-2">
                  <FiX className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── RESULTS HEADER ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-text-secondary">
            <span className="font-bold text-text-primary text-base">{jobs.length}</span> opportunities found
          </p>
          {user && profile?.skills?.length > 0 && (
            <span className="text-xs text-text-muted px-3 py-1 rounded-full bg-surface-hover border border-[var(--glass-border)]">
              <FiTarget className="inline w-3 h-3 mr-1" /> Skill matching active
            </span>
          )}
        </div>

        {/* ── JOB GRID ── */}
        {jobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 glass-card">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center mx-auto mb-5">
              <FiBriefcase className="h-10 w-10 text-text-muted" />
            </div>
            <p className="text-text-primary font-semibold text-lg">No jobs found</p>
            <p className="text-sm text-text-muted mt-1 mb-5">Try adjusting your search or clearing filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="glow-btn px-6 py-2 text-sm font-medium rounded-xl">Clear Filters</button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {jobs.map((job, index) => {
              const matchData = skillMatches[job._id];
              const matchPct = matchData?.percentage || 0;
              const mc = matchData ? getMatchColor(matchPct) : null;
              const days = deadlineDays(job.applicationDeadline);
              const isUrgent = days !== null && days <= 3 && days >= 0;
              const applied = hasApplied[job._id];

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass-card overflow-hidden group"
                >
                  {/* Skill match top bar */}
                  {user && matchData && (
                    <div className={`h-1 bg-gradient-to-r ${mc.bar}`} style={{ width: `${matchPct}%` }} />
                  )}

                  <div className="p-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-base font-bold text-text-primary group-hover:text-[var(--color-accent-500)] transition-colors truncate">
                            {job.title}
                          </h3>
                          {isUrgent && (
                            <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-semibold animate-pulse">
                              ⚡ Closing Soon
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary flex-wrap">
                          <span className="font-medium">{job.companyId?.companyName || 'Company'}</span>
                          {job.companyId?.rating && (
                            <>
                              <span className="text-text-muted">·</span>
                              <span className="flex items-center gap-0.5">
                                <FiStar className="w-3 h-3 text-amber-500 fill-current" />
                                {job.companyId.rating}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSavedJobs(prev => ({ ...prev, [job._id]: !prev[job._id] }))}
                        className={`flex-shrink-0 p-2 rounded-xl transition-colors ${savedJobs[job._id] ? 'text-[var(--color-accent-500)] bg-[var(--color-accent-500)]/10' : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'}`}
                        title="Save job"
                      >
                        <FiBookmark className={`w-4 h-4 ${savedJobs[job._id] ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${typeColor(job.type)}`}>
                        <FiBriefcase className="w-3 h-3" /> {job.type || 'N/A'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <FiMapPin className="w-3 h-3" /> {job.location || 'N/A'}
                      </span>
                      {job.applicationDeadline && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${isUrgent ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                          <FiCalendar className="w-3 h-3" />
                          {days !== null && days >= 0 ? `${days}d left` : new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Skill Match Card */}
                    {user && matchData && matchData.totalCount > 0 && (
                      <div className={`mb-4 p-3 rounded-xl ${mc.bg} border ${mc.border}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                            <FiTarget className="w-3.5 h-3.5" /> Skill Match
                          </div>
                          <span className={`text-sm font-bold ${mc.text}`}>{matchPct}%</span>
                        </div>
                        <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${matchPct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`h-1.5 rounded-full bg-gradient-to-r ${mc.bar}`}
                          />
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">{matchData.matchedCount} of {matchData.totalCount} skills matched</p>
                      </div>
                    )}

                    {/* Skills Pills */}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.skills.slice(0, 4).map((sk, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-elevated)] text-text-muted text-[11px] border border-[var(--glass-border)]">
                            <FiCode className="w-2.5 h-2.5" /> {sk}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-[11px] text-text-muted px-2 py-0.5 rounded-md bg-surface-hover">+{job.skills.length - 4} more</span>
                        )}
                      </div>
                    )}

                    {/* Requirements preview */}
                    {job.requirements && (
                      <p className="text-xs text-text-secondary leading-relaxed mb-5 line-clamp-2">
                        {job.requirements.substring(0, 130)}...
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-[var(--glass-border)]">
                      <Link
                        to={`/student/job/${job._id}`}
                        className="flex-1 text-center px-4 py-2 border border-[var(--glass-border)] text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-1.5"
                      >
                        <FiEye className="w-3.5 h-3.5" /> View Details
                      </Link>
                      <button
                        onClick={() => handleApply(job)}
                        disabled={!user || !canApply || applied}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          applied
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                            : !user || !canApply
                            ? 'bg-surface-hover text-text-muted cursor-not-allowed border border-[var(--glass-border)]'
                            : 'glow-btn hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {applied
                          ? '✅ Applied'
                          : !user
                          ? '🔒 Login to Apply'
                          : !canApply
                          ? `📝 ${completionPercentage}% / 80%`
                          : '✨ Apply Now'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── APPLICATION MODAL ── */}
      <AnimatePresence>
        {showModal && selectedJob && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="glass-card max-w-md w-full p-7 shadow-2xl accent-top"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiCheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Confirm Application</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Applying for <span className="font-semibold text-text-primary">{selectedJob.title}</span>
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--glass-border)] p-4 mb-6 space-y-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Your application includes</p>
                {[
                  { icon: '👤', label: 'Name', val: user?.name || 'N/A' },
                  { icon: '📧', label: 'Email', val: user?.email || 'N/A' },
                  { icon: '📱', label: 'Phone', val: profile?.phone || 'Not provided' },
                  { icon: '📄', label: 'Resume', val: profile?.resume ? '✅ Uploaded' : '❌ Missing' },
                  { icon: '💡', label: 'Skills', val: `${profile?.skills?.length || 0} skills listed` },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <span>{item.icon}</span>
                    <span className="text-text-muted w-14">{item.label}</span>
                    <span className="text-text-primary font-medium">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[var(--glass-border)] rounded-xl text-text-secondary hover:bg-surface-hover transition text-sm font-medium">
                  Cancel
                </button>
                <button onClick={confirmApply} disabled={applying}
                  className="flex-1 px-4 py-2.5 glow-btn rounded-xl text-sm font-semibold disabled:opacity-60">
                  {applying ? 'Submitting...' : 'Confirm Apply 🚀'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}