import { usePortal } from "../context/PortalContext";
import { Bell, CheckCheck } from "lucide-react";

export default function Notifications() {
  const { state, markNotificationRead, markAllNotificationsRead } = usePortal();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            New applications, auto-expired jobs, and shortlist alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAllNotificationsRead()}
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      <div className="glass divide-y divide-slate-200/80 dark:divide-slate-700/80">
        {state.notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">You&apos;re all caught up</p>
            <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
              When candidates apply or jobs expire, notifications will appear here.
            </p>
          </div>
        ) : (
          state.notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => markNotificationRead(n.id)}
              className={`flex w-full flex-col gap-1 px-5 py-4 text-left transition hover:bg-white/50 dark:hover:bg-white/5 ${
                n.read ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</span>
                {!n.read && (
                  <span className="shrink-0 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
              <span className="text-[11px] text-slate-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
