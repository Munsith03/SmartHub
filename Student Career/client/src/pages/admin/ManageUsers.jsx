import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiTrash, HiUser, HiOfficeBuilding, HiShieldCheck } from 'react-icons/hi';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const roleIcons = { admin: HiShieldCheck, company: HiOfficeBuilding, user: HiUser };
  const roleGradients = { admin: 'from-amber-500 to-orange-500', company: 'from-slate-700 to-slate-500', user: 'from-blue-500 to-cyan-500' };
  const roleColors = { admin: 'text-amber-400', company: 'text-primary-400', user: 'text-blue-400' };

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Manage Users</h1>
        <p className="text-sm text-text-secondary mb-8">{users.length} users on the platform</p>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">User</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Email</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Role</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Status</th>
                  <th className="text-left text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Joined</th>
                  <th className="text-right text-xs font-medium text-text-muted px-6 py-3.5 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {users.map((u) => {
                  const RoleIcon = roleIcons[u.role] || HiUser;
                  return (
                    <tr key={u._id} className="hover:bg-surface-hover/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center ring-2 ring-[var(--glass-border)]">
                            <span className="text-xs font-bold text-primary-400">{u.fullName?.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-text-primary">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${roleColors[u.role]}`}>
                          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${roleGradients[u.role]} flex items-center justify-center`}>
                            <RoleIcon className="w-3 h-3 text-white" />
                          </div>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isOnline ? 'text-success' : 'text-text-muted'}`}>
                          <span className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-success shadow-sm shadow-success/50' : 'bg-text-muted/30'}`} />
                          {u.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(u._id, u.fullName)} className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all duration-200" title="Delete user">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <p className="text-center text-sm text-text-muted py-10">No users found</p>}
        </div>
      </motion.div>
    </div>
  );
}
