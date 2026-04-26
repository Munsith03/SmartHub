import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOfficeBuilding, HiShieldCheck, HiChat, HiSearch, HiArrowRight,
  HiStar, HiUserGroup, HiCheckCircle, HiBriefcase, HiAcademicCap,
  HiTrendingUp, HiLightningBolt, HiGlobe, HiDocumentText
} from 'react-icons/hi';

const features = [
  {
    icon: HiBriefcase,
    title: 'Internship & Job Board',
    desc: 'Browse hundreds of internships and full-time roles curated for students and fresh graduates.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: HiAcademicCap,
    title: 'Student-First Platform',
    desc: 'Built specifically for students — from campus hires to entry-level positions across industries.',
    color: 'from-violet-500 to-purple-600'
  },
  {
    icon: HiShieldCheck,
    title: 'Verified Companies',
    desc: 'All companies go through a rigorous admin verification process so you apply with confidence.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: HiTrendingUp,
    title: 'Skill Match Engine',
    desc: 'Our AI-powered skill matcher shows how well your profile aligns with each opportunity.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: HiChat,
    title: 'Direct Messaging',
    desc: 'Chat in real-time with recruiters and company representatives without leaving the platform.',
    color: 'from-rose-500 to-pink-500'
  },
  {
    icon: HiDocumentText,
    title: 'One-Click Apply',
    desc: 'Apply to multiple positions instantly with your saved profile, resume, and skills.',
    color: 'from-indigo-500 to-blue-600'
  },
];

const steps = [
  { step: '01', title: 'Create Profile', desc: 'Sign up and build your student profile with skills, resume, and experience', icon: HiUserGroup },
  { step: '02', title: 'Explore Jobs', desc: 'Browse internships and positions matched to your skills and interests', icon: HiSearch },
  { step: '03', title: 'Apply Instantly', desc: 'One-click apply with your complete profile — no lengthy forms', icon: HiLightningBolt },
  { step: '04', title: 'Get Hired', desc: 'Track your applications and connect directly with hiring companies', icon: HiCheckCircle },
];

const liveJobs = [
  { title: 'Frontend Developer Intern', company: 'TechFlow Inc.', location: 'Bangalore, India', type: 'Internship', salary: '₹15,000/mo', tags: ['React', 'JavaScript', 'CSS'], status: 'New', color: 'from-blue-500 to-cyan-500' },
  { title: 'Data Science Intern', company: 'AnalytiQ Labs', location: 'Hyderabad, India', type: 'Internship', salary: '₹18,000/mo', tags: ['Python', 'ML', 'Pandas'], status: 'Hot', color: 'from-violet-500 to-purple-500' },
  { title: 'UI/UX Design Trainee', company: 'CreativeHub Co.', location: 'Remote', type: 'Part-time', salary: '₹12,000/mo', tags: ['Figma', 'Prototyping'], status: 'Urgent', color: 'from-rose-500 to-pink-500' },
  { title: 'Backend Developer', company: 'FinServ Ltd.', location: 'Mumbai, India', type: 'Full-time', salary: '₹4.5 LPA', tags: ['Node.js', 'MongoDB', 'REST'], status: 'New', color: 'from-emerald-500 to-teal-500' },
  { title: 'Cloud Engineer Intern', company: 'SkyStack Systems', location: 'Pune, India', type: 'Internship', salary: '₹20,000/mo', tags: ['AWS', 'Docker', 'Linux'], status: 'Hot', color: 'from-amber-500 to-orange-500' },
  { title: 'Marketing Analyst', company: 'BrandBoost Pvt.', location: 'Delhi, India', type: 'Full-time', salary: '₹3.8 LPA', tags: ['SEO', 'Analytics', 'Content'], status: 'New', color: 'from-indigo-500 to-blue-600' },
];

const stats = [
  { label: 'Active Jobs', value: '2,400+' },
  { label: 'Verified Companies', value: '680+' },
  { label: 'Students Hired', value: '12,000+' },
  { label: 'Success Rate', value: '94%' },
];

const testimonials = [
  { name: 'Arjun Mehta', role: 'SDE Intern @ TechFlow', text: 'Found my dream internship within 2 weeks of signing up. The skill match feature helped me target the right jobs!', avatar: 'AM' },
  { name: 'Priya Sharma', role: 'Data Analyst @ AnalytiQ', text: 'The verified company badge gave me confidence. I knew every company I applied to was legitimate.', avatar: 'PS' },
  { name: 'Rohit Verma', role: 'UI Designer @ CreativeHub', text: 'The one-click apply saved me hours. I applied to 20 companies in a single afternoon!', avatar: 'RV' },
];

const statusColors = {
  'New': 'badge-approved',
  'Hot': 'badge-pending',
  'Urgent': 'badge-rejected',
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="mesh-gradient">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
        <div className="floating-orb floating-orb-3" />
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-8">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  #1 Student Career Platform in India
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-8"
              >
                Launch Your{' '}
                <span className="gradient-text">Career</span>
                <br />
                <span className="text-text-secondary font-medium text-4xl sm:text-5xl lg:text-6xl">the smart way</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-text-secondary leading-relaxed mb-10 max-w-xl"
              >
                Discover internships and jobs perfectly matched to your skills. Apply in one click, chat with recruiters, and track every step of your journey — all in one place.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-10"
              >
                <Link to="/register" className="group glow-btn inline-flex items-center gap-2.5 px-8 py-4 text-sm font-medium">
                  Get Started Free <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link to="/student/jobs" className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--glass-border)] text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-[14px] transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                  Browse Jobs
                </Link>
              </motion.div>

              {/* Quick Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-wrap gap-6"
              >
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-text-primary">{s.value}</p>
                    <p className="text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Floating Dashboard UI */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateY: -5 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="glass-card p-6 accent-top">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <HiBriefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Job Matches for You</p>
                      <p className="text-xs text-text-muted">Based on your skills</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Open Jobs', val: '2,400', color: 'text-primary-400' },
                      { label: 'Applied', val: '7', color: 'text-success' },
                      { label: 'Shortlisted', val: '3', color: 'text-accent-400' },
                    ].map((s) => (
                      <div key={s.label} className="glass-card-light p-3 text-center">
                        <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Frontend Dev Intern', company: 'TechFlow Inc.', match: '92%', color: 'text-success' },
                      { name: 'Data Science Intern', company: 'AnalytiQ Labs', match: '78%', color: 'text-warning' },
                      { name: 'UI/UX Trainee', company: 'CreativeHub', match: '85%', color: 'text-success' },
                    ].map((job) => (
                      <div key={job.name} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-hover/50 group hover:bg-surface-hover transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">{job.name}</p>
                          <p className="text-[10px] text-text-muted">{job.company}</p>
                        </div>
                        <span className={`text-[11px] font-bold ${job.color} ml-2`}>{job.match}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 glass-card p-3 shadow-xl shadow-primary-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-medium text-text-primary">680 verified companies</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -left-6 glass-card p-3 shadow-xl shadow-accent-500/10"
                >
                  <div className="flex items-center gap-2">
                    <HiCheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs font-medium text-text-primary">Application sent! 🎉</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LIVE JOB LISTINGS ── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">Live Opportunities</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Trending jobs right now</h2>
            <p className="text-text-secondary max-w-lg mx-auto">Fresh internships and entry-level roles added daily — don't miss out.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {liveJobs.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-6 group hover:shadow-lg hover:shadow-primary-500/5 cursor-pointer"
              >
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-[20px] bg-gradient-to-r ${job.color}`} style={{ position: 'relative', marginBottom: 16, height: 3, borderRadius: 99, background: `linear-gradient(90deg, var(--tw-gradient-stops))` }} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center shadow-md`}>
                    <HiBriefcase className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[job.status]}`}>
                    {job.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-1 group-hover:text-primary-400 transition-colors">{job.title}</h3>
                <p className="text-xs text-text-secondary mb-3">{job.company} · {job.location}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-hover text-text-muted font-medium">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--glass-border)]">
                  <span className="text-xs font-semibold text-text-primary">{job.salary}</span>
                  <span className="text-[10px] text-text-muted px-2 py-0.5 rounded-full bg-surface-hover">{job.type}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/student/jobs" className="group glow-btn inline-flex items-center gap-2.5 px-8 py-4 text-sm font-medium">
              View All Jobs <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Everything you need to land your dream role</h2>
            <p className="text-text-secondary max-w-lg mx-auto">A complete suite of career tools built for the modern student job seeker.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-7 group hover:shadow-lg hover:shadow-primary-500/5 cursor-default"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-primary-400 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">From sign-up to offer letter</h2>
            <p className="text-text-secondary">Four simple steps to kick-start your professional career</p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px bg-gradient-to-r from-primary-500/30 via-accent-500/30 to-primary-500/30" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                    className="text-center relative"
                  >
                    <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 flex items-center justify-center relative z-10 transition-transform">
                      <Icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <span className="text-xs font-bold text-primary-400/60 mb-1 block">{item.step}</span>
                    <h3 className="text-sm font-semibold text-text-primary mb-1.5">{item.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">Success Stories</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Students who made it</h2>
            <p className="text-text-secondary">Real stories from real students who found their careers through STUCareer</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-7"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">"{t.text}"</p>
                <div className="flex gap-0.5 mt-4">
                  {[1,2,3,4,5].map(s => <HiStar key={s} className="w-3.5 h-3.5 text-warning" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="glass-card p-12 sm:p-16 accent-top">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-6">
                <HiLightningBolt className="w-3 h-3" /> Free to join, always
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Your career starts here</h2>
              <p className="text-text-secondary mb-10 max-w-md mx-auto">Join over 12,000 students already using STUCareer to find internships, connect with verified companies, and accelerate their professional journey.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 text-sm font-medium group">
                  Create Free Account <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/directory" className="inline-flex items-center gap-2 px-8 py-4 border border-[var(--glass-border)] text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-[14px] transition-all duration-300 text-sm font-medium">
                  Browse Companies
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 relative">
        <div className="nav-accent-line" style={{ top: 0, bottom: 'auto' }} />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <HiAcademicCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold gradient-text">STUCareer</span>
            </div>
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <Link to="/directory" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Companies</Link>
              <Link to="/student/jobs" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Browse Jobs</Link>
              <Link to="/login" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Sign In</Link>
              <Link to="/register" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Register</Link>
            </div>
            <p className="text-xs text-text-muted">© {new Date().getFullYear()} STUCareer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
