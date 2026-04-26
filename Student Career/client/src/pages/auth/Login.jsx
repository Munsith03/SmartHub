import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiOfficeBuilding } from 'react-icons/hi';

const InputField = ({ label, id, type = 'text', required, value, onChange, placeholder, icon: Icon, error }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary mb-1.5">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />}
      <input
        id={id} type={type} required={required} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-surface-elevated/50 border ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-[var(--glass-border)] focus:border-primary-500 focus:ring-primary-500/15'} rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-4 transition-all duration-200 input-stripe`}
      />
    </div>
    {error && <p className="text-[11px] text-danger mt-1.5 font-medium">{error}</p>}
  </div>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);
      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'company': navigate('/company'); break;
        default: navigate('/jobseekerdashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="mesh-gradient">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 sm:p-10 accent-top">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/25">
              <HiOfficeBuilding className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-sm text-text-secondary mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <InputField
              label="Email" id="login-email" type="email" required value={email} onChange={handleEmailChange}
              placeholder="you@example.com" icon={HiMail} error={errors.email}
            />

            <InputField
              label="Password" id="login-password" type="password" required value={password} onChange={handlePasswordChange}
              placeholder="••••••••" icon={HiLockClosed} error={errors.password}
            />

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="glow-btn w-full py-3.5 text-sm font-medium mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
