import { useParams, Link, Navigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Copy,
  Trash2,
  Send,
  Briefcase,
  MapPin,
  Calendar,
} from "lucide-react";
import { usePortal, useAuth } from "../context/PortalContext";
import { getJobDisplayStatus } from "../data/portalStore";

const PAGE_SIZE = 6;

export default function CompanyJobs() {
  const { id } = useParams();
  const companyId = Number(id);
  const { state, deleteJob, duplicateJob, bulkDeleteJobs, bulkPublishJobs, updateJob } =
    usePortal();
  const { canManageCompany, isSuperAdmin } = useAuth();

  const company = state.companies.find((c) => c.id === companyId);
  const canManage = canManageCompany(companyId);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locFilter, setLocFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());

  useEffect(() => {
    setSelected(new Set());
    setPage(1);
  }, [companyId]);

  if (!company) {
    return <Navigate to="/admin/companies" replace />;
  }

  if (!isSuperAdmin && company.active === false) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/50 dark:bg-amber-950/30">
        <p className="font-semibold text-amber-900 dark:text-amber-200">Company inactive</p>
        <p className="mt-2 text-sm text-amber-800/90 dark:text-amber-200/80">
          This organization is deactivated. Contact a Super Admin.
        </p>
        <Link to="/admin/companies" className="mt-4 inline-block text-sm font-medium text-[color:var(--color-sliit)] dark:text-sky-400">
          Back to companies
        </Link>
      </div>
    );
  }

  const jobs = state.jobs.filter((j) => j.companyId === companyId);

  const filtered = useMemo(() => {
    let list = [...jobs];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((j) => j.title.toLowerCase().includes(q));
    if (typeFilter !== "all") list = list.filter((j) => j.type === typeFilter);
    if (locFilter !== "all") list = list.filter((j) => (j.location || "") === locFilter);
    if (statusFilter !== "all") {
      list = list.filter((j) => {
        const v = getJobDisplayStatus(j).variant;
        if (statusFilter === "draft") return v === "draft";
        if (statusFilter === "active") return v === "active";
        if (statusFilter === "closed") return v === "closed";
        if (statusFilter === "expired") return v === "expired";
        return true;
      });
    }
    return list.sort((a, b) => b.id - a.id);
  }, [jobs, search, typeFilter, locFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const types = useMemo(() => {
    const s = new Set(jobs.map((j) => j.type).filter(Boolean));
    return Array.from(s);
  }, [jobs]);
  const locs = useMemo(() => {
    const s = new Set(jobs.map((j) => j.location || "").filter(Boolean));
    return Array.from(s);
  }, [jobs]);

  const toggleSelect = (jobId) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(jobId)) n.delete(jobId);
      else n.add(jobId);
      return n;
    });
  };

  const toggleSelectAllOnPage = () => {
    const ids = slice.map((j) => j.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const n = new Set(prev);
      if (allOn) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  };

  const selectedIds = Array.from(selected);
  const bulkDraftIds = selectedIds.filter((id) => {
    const j = jobs.find((x) => x.id === id);
    return j?.status === "draft";
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/admin/companies"
            className="focus-ring mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[color:var(--color-sliit)] dark:text-slate-400 dark:hover:text-sky-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Companies
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-600 dark:bg-slate-800">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Briefcase className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.location}
                </span>
                {company.description && (
                  <span className="line-clamp-1 max-w-xl">{company.description}</span>
                )}
              </p>
            </div>
          </div>
        </div>
        {canManage && (
          <Link
            to={`/admin/company/${companyId}/new`}
            className="focus-ring inline-flex items-center gap-2 self-start rounded-xl bg-[color:var(--color-sliit)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[color:var(--color-sliit-hover)] dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            <Plus className="h-4 w-4" />
            Post new job
          </Link>
        )}
      </div>

      <div className="glass flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search job title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="focus-ring w-full rounded-xl border border-slate-200/80 bg-white/90 py-2.5 pl-10 pr-3 text-sm dark:border-slate-600 dark:bg-slate-900/80"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="focus-ring rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/80"
        >
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={locFilter}
          onChange={(e) => {
            setLocFilter(e.target.value);
            setPage(1);
          }}
          className="focus-ring rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/80"
        >
          <option value="all">All locations</option>
          {locs.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="focus-ring rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/80"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {canManage && selectedIds.length > 0 && (
        <div className="glass-subtle flex flex-wrap items-center gap-2 px-4 py-3 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {selectedIds.length} selected
          </span>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(`Publish ${bulkDraftIds.length} draft(s)?`)) return;
              bulkPublishJobs(bulkDraftIds);
              setSelected(new Set());
            }}
            disabled={bulkDraftIds.length === 0}
            className="focus-ring inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Publish drafts
          </button>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(`Delete ${selectedIds.length} job(s)?`)) return;
              bulkDeleteJobs(selectedIds);
              setSelected(new Set());
            }}
            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="focus-ring rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-400"
          >
            Clear
          </button>
        </div>
      )}

      {slice.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No jobs match</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Post a role or adjust filters.
          </p>
          {canManage && (
            <Link
              to={`/company/${companyId}/new`}
              className="text-sm font-semibold text-[color:var(--color-sliit)] dark:text-sky-400"
            >
              Create a job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {canManage && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              <input type="checkbox" checked={slice.length > 0 && slice.every((j) => selected.has(j.id))} onChange={toggleSelectAllOnPage} />
              Select all on this page
            </label>
          )}
          {slice.map((j) => {
            const disp = getJobDisplayStatus(j);
            const applicantCount = state.applicants.filter((a) => a.jobId === j.id).length;
            const badgeClass =
              disp.variant === "active"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                : disp.variant === "draft"
                  ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  : disp.variant === "expired"
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
            return (
              <div
                key={j.id}
                className="glass-subtle flex flex-col gap-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:flex-row sm:items-center"
              >
                {canManage && (
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0"
                    checked={selected.has(j.id)}
                    onChange={() => toggleSelect(j.id)}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{j.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badgeClass}`}>
                      {disp.badge}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {j.type}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {j.location || "—"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Deadline {j.applicationDeadline}
                    </span>
                    <span>{applicantCount} applications</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Link
                    to={`/admin/job/${j.id}`}
                    className="focus-ring inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200"
                  >
                    View
                  </Link>
                  {canManage && (
                    <>
                      <Link
                        to={`/admin/job/${j.id}/edit`}
                        className="focus-ring inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => duplicateJob(j.id)}
                        className="focus-ring inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/80"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <select
                        value={j.status}
                        onChange={(e) =>
                          updateJob(j.id, {
                            status: e.target.value,
                            closedReason: null,
                          })
                        }
                        className="focus-ring rounded-xl border border-slate-200 bg-white/90 px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900/80"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm("Delete this job?")) return;
                          deleteJob(j.id);
                        }}
                        className="focus-ring inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <button
            type="button"
            disabled={pageSafe <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="focus-ring rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-600"
          >
            Prev
          </button>
          <span>
            Page {pageSafe} / {totalPages}
          </span>
          <button
            type="button"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="focus-ring rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
