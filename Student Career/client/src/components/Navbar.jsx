import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiMenu, HiX, HiChat, HiLogout, HiUser, HiOfficeBuilding,
  HiShieldCheck, HiSun, HiMoon, HiBriefcase, HiAcademicCap,
  HiCollection, HiClipboardList, HiBell
} from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'company': return '/company';
      default: return '/jobseekerdashboard';
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path) =>
    `relative px-3 py-2 text-sm rounded-lg transition-all duration-200 group flex items-center gap-1.5 ${
      isActive(path)
        ? 'text-text-primary bg-[var(--color-surface-elevated)]'
        : 'text-text-secondary hover:text-text-primary hover:bg-[var(--color-surface-elevated)]'
    }`;

  const getRoleIcon = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin': return <HiShieldCheck className="w-3.5 h-3.5" />;
      case 'company': return <HiOfficeBuilding className="w-3.5 h-3.5" />;
      default: return <HiUser className="w-3.5 h-3.5" />;
    }
  };

  // Role-specific nav links
  const getUserNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard', icon: <HiCollection className="w-4 h-4" /> },
          { to: '/admin/approvals', label: 'Approvals', icon: <HiClipboardList className="w-4 h-4" /> },
          { to: '/admin/companies', label: 'Companies', icon: <HiOfficeBuilding className="w-4 h-4" /> },
          { to: '/admin/users', label: 'Users', icon: <HiUser className="w-4 h-4" /> },
        ];
      case 'company':
        return [
          { to: '/company', label: 'Dashboard', icon: <HiCollection className="w-4 h-4" /> },
          { to: '/company/jobs', label: 'My Jobs', icon: <HiBriefcase className="w-4 h-4" /> },
          { to: '/company/new-job', label: 'Post Job', icon: <HiClipboardList className="w-4 h-4" /> },
        ];
      default:
        return [
          { to: '/jobseekerdashboard', label: 'Dashboard', icon: <HiCollection className="w-4 h-4" /> },
          { to: '/student/jobs', label: 'Browse Jobs', icon: <HiBriefcase className="w-4 h-4" /> },
          { to: '/student/applications', label: 'My Applications', icon: <HiClipboardList className="w-4 h-4" /> },
          { to: '/feed', label: 'Feed', icon: <HiAcademicCap className="w-4 h-4" /> },
          { to: '/chat', label: 'Chat', icon: <HiChat className="w-4 h-4" /> },
        ];
    }
  };

  const userNavLinks = getUserNavLinks();

  return (
    <nav className="sticky top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl transition-all duration-300">
      <div className="nav-accent-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── LOGO ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <HiAcademicCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold gradient-text hidden sm:block">STUCareer</span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <div className="hidden md:flex items-center gap-0.5">
            {!user && (
              <Link to="/directory" className={navLinkClass('/directory')}>
                <HiOfficeBuilding className="w-4 h-4" /> Companies
              </Link>
            )}
            {!user && (
              <Link to="/student/jobs" className={navLinkClass('/student/jobs')}>
                <HiBriefcase className="w-4 h-4" /> Browse Jobs
              </Link>
            )}
            {user && userNavLinks.map(link => (
              <Link key={link.to} to={link.to} className={navLinkClass(link.to)}>
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* ── RIGHT SIDE ── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-knob">
                {theme === 'dark'
                  ? <HiMoon className="w-3 h-3 text-white" />
                  : <HiSun className="w-3 h-3 text-white" />}
              </div>
            </button>

            {user ? (
              <div className="flex items-center gap-2">

                {/* User chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    {getRoleIcon()}
                  </div>
                  <span className="text-sm text-text-secondary max-w-[120px] truncate">{user.name || user.fullName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gradient-to-r from-primary-500/15 to-accent-500/15 text-primary-400 capitalize font-medium">
                    {user.role}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all duration-200"
                  title="Logout"
                >
                  <HiLogout className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary rounded-xl transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="glow-btn px-5 py-2 text-sm font-medium rounded-[12px]">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ── MOBILE TOGGLE ── */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              <div className="theme-toggle-knob">
                {theme === 'dark' ? <HiMoon className="w-3 h-3 text-white" /> : <HiSun className="w-3 h-3 text-white" />}
              </div>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-[var(--color-surface-elevated)] rounded-xl transition-colors"
            >
              {menuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--glass-border)] bg-[var(--nav-bg)] backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {!user && (
                <>
                  <Link to="/directory" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors">
                    <HiOfficeBuilding className="w-4 h-4" /> Companies
                  </Link>
                  <Link to="/student/jobs" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors">
                    <HiBriefcase className="w-4 h-4" /> Browse Jobs
                  </Link>
                </>
              )}
              {user && userNavLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                    isActive(link.to)
                      ? 'text-text-primary bg-surface-hover font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}

              <div className="border-t border-[var(--glass-border)] pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 mb-1">
                      <p className="text-xs font-semibold text-text-primary">{user.name || user.fullName}</p>
                      <p className="text-[11px] text-text-muted capitalize">{user.role} · {user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-danger hover:bg-danger/10 rounded-xl transition-colors"
                    >
                      <HiLogout className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm text-primary-400 hover:bg-primary-500/10 rounded-xl font-medium transition-colors">
                      Get Started Free →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
