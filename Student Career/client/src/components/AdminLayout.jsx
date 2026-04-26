import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Bell,
  Moon,
  Sun,
  Menu,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { usePortal, useAuth } from "../context/PortalContext";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/companies", label: "Companies", icon: Building2 },
  { to: "/admin/applicants", label: "Applicants", icon: Users },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
];

export default function AdminLayout() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = usePortal();
  const unread = state.notifications.filter((n) => !n.read).length;
  const { user, logout, role, setRole, companyAdminCompanyId, setCompanyAdminCompanyId, isSuperAdmin } =
    useAuth();

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="glass-bg" />
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/40 bg-white/80 p-4 backdrop-blur-xl transition-transform dark:border-white/10 dark:bg-slate-900/80 lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center gap-2 px-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-sm" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                SLIIT
              </div>
              <div className="text-sm font-bold text-[color:var(--color-sliit)] dark:text-sky-300">
                Career Portal
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-ring ${
                    isActive
                      ? "bg-[color:var(--color-sliit)] text-white shadow-lg shadow-sky-900/20 dark:bg-sky-600"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                {label}
                {to === "/notifications" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 rounded-xl border border-slate-200/80 bg-white/60 p-3 text-xs dark:border-white/10 dark:bg-slate-800/50">
            <div className="mb-2 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
              <Shield className="h-3.5 w-3.5" />
              Role (demo)
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="focus-ring mb-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="super_admin">Super Admin</option>
              <option value="company_admin">Company Admin</option>
            </select>
            {!isSuperAdmin && (
              <label className="block text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Company scope
                <select
                  value={companyAdminCompanyId}
                  onChange={(e) => setCompanyAdminCompanyId(Number(e.target.value))}
                  className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-900"
                >
                  {state.companies
                    .filter((c) => c.active)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
          </div>
        </aside>

        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/40 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="focus-ring rounded-lg p-2 text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="hidden text-sm font-semibold text-slate-600 dark:text-slate-300 sm:inline">
                Admin console
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden flex-col items-end mr-2 md:flex">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{role.replace("_", " ")}</span>
              </div>
              <Link
                to="/admin/notifications"
                className="focus-ring relative rounded-xl p-2 text-slate-600 transition hover:bg-white/80 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="focus-ring rounded-xl p-2 text-slate-600 transition hover:bg-white/80 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={logout}
                className="focus-ring rounded-xl px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
