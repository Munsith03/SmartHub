import { NavLink, Outlet, Link } from "react-router-dom";
import { Briefcase, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useState } from "react";

export default function ClientLayout() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-sky-400/10 blur-[120px] dark:bg-sky-500/5" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-400/10 blur-[100px] dark:bg-indigo-500/5" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/40 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[color:var(--color-sliit)] to-sky-400 text-white shadow-lg transition-transform group-hover:scale-110">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                SLIIT <span className="text-sky-500 dark:text-sky-400">Careers</span>
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                }`
              }
            >
              Browse Jobs
            </NavLink>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-label="Toggle Theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/40 py-8 backdrop-blur-md dark:border-white/5 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} SLIIT Career Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
