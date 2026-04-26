import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiPhone, HiLockClosed, HiOfficeBuilding, HiUserGroup, HiShieldCheck } from 'react-icons/hi';

const roles = [
  { value: 'user', label: 'User', desc: 'Browse & review companies', icon: HiUserGroup, color: 'from-blue-500 to-cyan-500' },
  { value: 'company', label: 'Company', desc: 'Register your business', icon: HiOfficeBuilding, color: 'from-primary-500 to-accent-500' },
  { value: 'admin', label: 'Admin', desc: 'Manage the platform', icon: HiShieldCheck, color: 'from-amber-500 to-orange-500' },
];

const InputField = ({ label, id, type = 'text', required, value, onChange, placeholder, icon: Icon, prefix, error }) => (
  <div>
    <label className="block text-xs font-medium text-text-secondary mb-1.5">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />}
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">{prefix}</span>}
      <input
        id={id} type={type} required={required} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full ${Icon || prefix ? 'pl-9' : 'pl-4'} pr-3 py-2.5 bg-surface-elevated/50 border ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-[var(--glass-border)] focus:border-primary-500 focus:ring-primary-500/15'} rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-4 transition-all duration-200 input-stripe`}
      />
    </div>
    {error && <p className="text-[10px] text-danger mt-1 font-medium">{error}</p>}
  </div>
);

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', role: 'user', username: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required';
    else if (!/^[a-zA-Z\s]{2,50}$/.test(form.fullName)) newErrors.fullName = 'Must be 2-50 characters, letters only';

    if (!form.username.trim()) newErrors.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) newErrors.username = '3-20 chars, alphanumeric/underscore only';

    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';

    if (form.phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(form.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone format (e.g., +1234567890)';
    }

    if (!form.password) newErrors.password = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
      newErrors.password = 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char';
    }

    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const user = await register(data);
      toast.success('Account created successfully!');
      switch (user.role) {
        case 'admin': navigate('/admin'); break;
        case 'company': navigate('/company'); break;
        default: navigate('/directory');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
        className="w-full max-w-lg"
      >
        <div className="glass-card p-8 sm:p-10 accent-top">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
            <p className="text-sm text-text-secondary mt-1.5">Choose your role and get started</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3.5 rounded-2xl border text-center transition-all duration-300 ${
                    form.role === r.value
                      ? 'border-primary-500/50 bg-primary-500/8 shadow-lg shadow-primary-500/10 scale-[1.02]'
                      : 'border-[var(--glass-border)] hover:border-primary-500/20 hover:bg-surface-hover'
                  }`}
                >
                  <div className={`w-9 h-9 mx-auto mb-2 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-text-primary">{r.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{r.desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Full Name" id="register-name" required value={form.fullName} onChange={update('fullName')}
                placeholder="John Doe" icon={HiUser} error={errors.fullName}
              />
              <InputField
                label="Username" id="register-username" required value={form.username} onChange={update('username')}
                placeholder="johndoe" prefix="@" error={errors.username}
              />
            </div>

            <InputField
              label="Email" id="register-email" type="email" required value={form.email} onChange={update('email')}
              placeholder="you@example.com" icon={HiMail} error={errors.email}
            />

            <InputField
              label="Phone Number" id="register-phone" type="tel" value={form.phoneNumber} onChange={update('phoneNumber')}
              placeholder="+1 234 567 890" icon={HiPhone} error={errors.phoneNumber}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Password" id="register-password" type="password" required value={form.password} onChange={update('password')}
                placeholder="••••••••" icon={HiLockClosed} error={errors.password}
              />
              <InputField
                label="Confirm Password" id="register-confirm" type="password" required value={form.confirmPassword} onChange={update('confirmPassword')}
                placeholder="••••••••" icon={HiLockClosed} error={errors.confirmPassword}
              />
            </div>

            <button id="register-submit" type="submit" disabled={loading}
              className="glow-btn w-full py-3.5 text-sm font-medium mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
