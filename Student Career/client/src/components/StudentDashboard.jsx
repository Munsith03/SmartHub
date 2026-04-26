import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiBriefcase, FiCheckCircle, FiClock, FiStar,
  FiTrendingUp, FiArrowRight, FiCalendar, FiAward,
  FiRefreshCw, FiBarChart2, FiUser, FiAlertCircle,
  FiThumbsUp, FiEye, FiZap, FiTarget, FiBookmark
} from 'react-icons/fi';
import { HiAcademicCap, HiOfficeBuilding, HiLightningBolt, HiChartBar } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } } };

const CAREER_TIPS = [
  { icon: '📝', title: 'Tailor Your Applications', tip: 'Customize your resume keywords to match each job description for a higher match score.' },
  { icon: '💼', title: 'Build Your Portfolio', tip: 'Showcase your projects on GitHub and link them in your profile for better visibility.' },
  { icon: '🎯', title: 'Target the Right Roles', tip: 'Use the skill match filter to focus on opportunities where you score above 70%.' },
  { icon: '🤝', title: 'Network Actively', tip: 'Use the Activity Feed to connect with peers and share your achievements regularly.' },
];

const FEATURED_JOBS = [
  { title: 'Frontend Developer Intern', company: 'TechFlow Inc.', location: 'Bangalore', type: 'Internship', match: 92, salary: '₹15,000/mo', tags: ['React', 'JS', 'CSS'] },
  { title: 'Data Science Intern', company: 'AnalytiQ Labs', location: 'Hyderabad', type: 'Internship', match: 78, salary: '₹18,000/mo', tags: ['Python', 'ML'] },
  { title: 'UI/UX Design Trainee', company: 'CreativeHub', location: 'Remote', type: 'Part-time', match: 85, salary: '₹12,000/mo', tags: ['Figma'] },
  { title: 'Backend Developer', company: 'FinServ Ltd.', location: 'Mumbai', type: 'Full-time', match: 65, salary: '₹4.5 LPA', tags: ['Node.js', 'MongoDB'] },
  { title: 'Cloud Engineer Intern', company: 'SkyStack Systems', location: 'Pune', type: 'Internship', match: 55, salary: '₹20,000/mo', tags: ['AWS', 'Docker'] },
  { title: 'Marketing Analyst', company: 'BrandBoost Pvt.', location: 'Delhi', type: 'Full-time', match: 70, salary: '₹3.8 LPA', tags: ['SEO', 'Analytics'] },
];

const StudentDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTip, setActiveTip] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, interview: 0, selected: 0, rejected: 0, shortlisted: 0, inReview: 0 });

  useEffect(() => { fetchApplications(); }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveTip(prev => (prev + 1) % CAREER_TIPS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await API.get('/applications/my-applications');
      let apps = [], statsData = {};
      if (response.data?.applications) { apps = response.data.applications; statsData = response.data.stats || {}; }
      else if (Array.isArray(response.data)) { apps = response.data; }
      setApplications(apps);
      setStats({
        total: statsData.total || apps.length,
        pending: statsData.pending || apps.filter(a => a.status === 'pending').length,
        interview: statsData.interview || apps.filter(a => a.status === 'interview').length,
        selected: statsData.selected || apps.filter(a => a.status === 'selected').length,
        rejected: statsData.rejected || apps.filter(a => a.status === 'rejected').length,
        shortlisted: statsData.shortlisted || apps.filter(a => a.status === 'shortlisted').length,
        inReview: statsData.inReview || apps.filter(a => a.status === 'inReview').length,
      });
    } catch {
      toast.error('Failed to load applications');
      setApplications([]);
    } finally { setLoading(false); setRefreshing(false); }
  };

  const handleRefresh = () => { setRefreshing(true); fetchApplications(); };

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    const map = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      inreview: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-violet-100 text-violet-800 border-violet-200',
      interview: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      selected: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return map[s] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    return { pending: FiClock, inreview: FiTrendingUp, shortlisted: FiStar, interview: FiCalendar, selected: FiCheckCircle, rejected: FiAlertCircle }[s] || FiBriefcase;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  const successRate = stats.total > 0 ? ((stats.selected / stats.total) * 100).toFixed(1) : 0;

  const matchColor = (pct) => {
    if (pct >= 70) return 'text-emerald-600';
    if (pct >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-[var(--glass-border)] border-t-[var(--color-accent-500)] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

          {/* ── WELCOME HERO CARD ── */}
          <motion.div variants={item}>
            <div className="glass-card p-6 sm:p-8 accent-top overflow-hidden relative">
              <div className="floating-orb floating-orb-3" style={{ opacity: 0.05, width: 300, height: 300, top: -50, right: -50 }} />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl font-bold text-white">{(user?.name || 'S')[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-1">
                      {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
                    </p>
                    <h1 className="text-2xl font-bold text-text-primary">{user?.name || 'Student'}</h1>
                    <p className="text-sm text-text-secondary">{user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to="/profile" className="px-4 py-2 text-sm border border-[var(--glass-border)] text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-all flex items-center gap-1.5">
                    <FiUser className="w-3.5 h-3.5" /> Profile
                  </Link>
                  <button onClick={handleRefresh} disabled={refreshing}
                    className="px-4 py-2 text-sm border border-[var(--glass-border)] text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-all flex items-center gap-1.5">
                    <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── STATS GRID ── */}
          <motion.div variants={item}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Applied', value: stats.total, icon: <FiBriefcase className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
                { label: 'In Review', value: stats.pending + stats.inReview, icon: <FiClock className="w-5 h-5" />, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
                { label: 'Interviews', value: stats.interview + stats.shortlisted, icon: <FiCalendar className="w-5 h-5" />, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20' },
                { label: 'Selected', value: stats.selected, icon: <FiCheckCircle className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                  className={`glass-card p-5 relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-10 rounded-bl-[60px]`} />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3 shadow-lg ${s.shadow}`}>
                    {s.icon}
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── SUCCESS RATE + TIPS ROW ── */}
          <motion.div variants={item}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Success Rate */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Success Rate</p>
                  <HiChartBar className="w-4 h-4 text-text-muted" />
                </div>
                <p className="text-3xl font-bold text-text-primary mb-1">{successRate}%</p>
                <p className="text-xs text-text-secondary">{stats.selected} offers from {stats.total} applications</p>
                <div className="mt-3 w-full bg-[var(--color-surface-elevated)] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${successRate}%` }} />
                </div>
              </div>

              {/* Career Tip Rotator */}
              <div className="sm:col-span-2 glass-card p-5 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <HiLightningBolt className="w-4 h-4 text-primary-400" />
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Career Tip</p>
                  <span className="ml-auto text-xs text-text-muted">{activeTip + 1}/{CAREER_TIPS.length}</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTip}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{CAREER_TIPS[activeTip].icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-text-primary mb-1">{CAREER_TIPS[activeTip].title}</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{CAREER_TIPS[activeTip].tip}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="flex gap-1 mt-4">
                  {CAREER_TIPS.map((_, i) => (
                    <button key={i} onClick={() => setActiveTip(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${i === activeTip ? 'w-6 bg-primary-400' : 'w-1.5 bg-[var(--glass-border)]'}`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── QUICK ACTIONS ── */}
          <motion.div variants={item}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { to: '/student/jobs', icon: <FiBriefcase className="w-6 h-6" />, label: 'Browse Jobs', desc: 'Find internships & roles', color: 'from-blue-500 to-cyan-500' },
                { to: '/student/applications', icon: <FiBarChart2 className="w-6 h-6" />, label: 'My Applications', desc: 'Track your progress', color: 'from-violet-500 to-purple-500' },
                { to: '/edit-profile', icon: <FiUser className="w-6 h-6" />, label: 'Edit Profile', desc: 'Improve your match score', color: 'from-emerald-500 to-teal-500' },
                { to: '/feed', icon: <HiAcademicCap className="w-6 h-6" />, label: 'Activity Feed', desc: 'Connect with peers', color: 'from-amber-500 to-orange-500' },
              ].map((action) => (
                <Link key={action.to} to={action.to}
                  className="glass-card p-5 group hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-bold text-text-primary group-hover:text-primary-400 transition-colors">{action.label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{action.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-text-muted group-hover:text-primary-400 transition-colors">
                    <span>Open</span>
                    <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── MAIN CONTENT: Applications + Featured Jobs ── */}
          <motion.div variants={item}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Recent Applications (2/3 width) */}
              <div className="lg:col-span-2">
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-primary-400" />
                      <h2 className="text-sm font-bold text-text-primary">Recent Applications</h2>
                    </div>
                    {applications.length > 5 && (
                      <Link to="/student/applications" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                        View All <FiArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  <div className="divide-y divide-[var(--glass-border)]">
                    <AnimatePresence>
                      {applications.length > 0 ? (
                        applications.slice(0, 5).map((app, index) => {
                          const StatusIcon = getStatusIcon(app.status);
                          return (
                            <motion.div
                              key={app._id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="px-6 py-4 hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-sm font-semibold text-text-primary truncate">
                                      {app.jobId?.title || app.title || 'Job Position'}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusStyle(app.status)}`}>
                                      <StatusIcon className="w-2.5 h-2.5" />
                                      {app.status || 'Pending'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-muted">
                                    {app.jobId?.companyId?.companyName && `${app.jobId.companyId.companyName} · `}
                                    Applied {formatDate(app.appliedAt || app.createdAt)}
                                  </p>
                                </div>
                                <Link
                                  to={`/student/application/${app._id}`}
                                  className="flex-shrink-0 p-2 text-text-muted hover:text-primary-400 hover:bg-surface-hover rounded-lg transition-colors"
                                  title="View details"
                                >
                                  <FiEye className="w-4 h-4" />
                                </Link>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="px-6 py-14 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center mx-auto mb-4">
                            <FiBriefcase className="h-8 w-8 text-text-muted" />
                          </div>
                          <p className="text-sm font-semibold text-text-primary mb-1">No applications yet</p>
                          <p className="text-xs text-text-muted mb-4">Start applying to internships and jobs!</p>
                          <Link to="/student/jobs" className="glow-btn px-5 py-2 text-xs font-medium rounded-xl inline-flex items-center gap-1.5">
                            Browse Jobs <FiArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Featured Jobs Sidebar (1/3 width) */}
              <div className="glass-card overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--glass-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiZap className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-bold text-text-primary">Top Matches</h2>
                  </div>
                  <Link to="/student/jobs" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">See all</Link>
                </div>
                <div className="divide-y divide-[var(--glass-border)]">
                  {FEATURED_JOBS.map((job, i) => (
                    <motion.div
                      key={job.title}
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                      className="px-5 py-3.5 hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-text-primary truncate">{job.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{job.company} · {job.location}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-medium text-text-secondary">{job.salary}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`text-xs font-bold ${matchColor(job.match)}`}>{job.match}%</span>
                          <p className="text-[9px] text-text-muted">match</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t border-[var(--glass-border)]">
                  <Link to="/student/jobs"
                    className="w-full block text-center glow-btn py-2 text-xs font-semibold rounded-xl">
                    Browse All Jobs
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── STATUS BREAKDOWN ── */}
          {stats.total > 0 && (
            <motion.div variants={item}>
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <HiChartBar className="w-4 h-4 text-primary-400" />
                  <h2 className="text-sm font-bold text-text-primary">Application Pipeline</h2>
                  <span className="ml-auto text-xs text-text-muted">{stats.total} total</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-100 border-amber-200' },
                    { label: 'In Review', value: stats.inReview, color: 'text-blue-600', bg: 'bg-blue-100 border-blue-200' },
                    { label: 'Shortlisted', value: stats.shortlisted, color: 'text-violet-600', bg: 'bg-violet-100 border-violet-200' },
                    { label: 'Interview', value: stats.interview, color: 'text-indigo-600', bg: 'bg-indigo-100 border-indigo-200' },
                    { label: 'Selected', value: stats.selected, color: 'text-emerald-600', bg: 'bg-emerald-100 border-emerald-200' },
                    { label: 'Rejected', value: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-100 border-rose-200' },
                  ].map(s => (
                    <div key={s.label} className={`p-3 rounded-xl border ${s.bg} text-center`}>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;