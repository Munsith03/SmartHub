import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { getJobDisplayStatus } from "../data/portalStore";

const PortalContext = createContext(null);
const AuthContext = createContext(null);

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("itpm_admin_token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function PortalProvider({ children }) {
  const [state, setState] = useState({
    companies: [],
    jobs: [],
    applicants: [],
    notifications: [],
  });
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Only fetch jobs - companies and applicants will come from your main backend
      const jobsRes = await api.get("/jobs").catch(err => {
        console.warn("Failed to fetch jobs:", err.response?.status);
        return { data: [] };
      });
      
      setState({
        companies: [], // Don't fetch companies from separate endpoint
        jobs: jobsRes.data || [],
        applicants: [], // Don't fetch applicants from separate endpoint
        notifications: [],
      });
      setHydrated(true);
    } catch (error) {
      console.error("Failed to fetch portal data:", error);
      setError(error.message);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value = useMemo(() => {
    const jobs = state.jobs || [];
    const applicants = state.applicants || [];
    const companies = state.companies || [];

    const totalApplications = applicants.length;
    const pendingReviews = applicants.filter((a) => a.status === "pending").length;
    const activeJobs = jobs.filter((j) => getJobDisplayStatus(j).variant === "active").length;

    return {
      hydrated,
      error,
      state,
      stats: {
        totalJobs: jobs.length,
        totalApplications,
        activeJobs,
        pendingReviews,
      },
      getJobById: (id) => jobs.find((j) => String(j.id) === String(id) || String(j._id) === String(id)),
      getCompanyById: (id) => companies.find((c) => String(c.id) === String(id) || String(c._id) === String(id)),
      refetch: fetchData,

      addJob: async (job) => {
        try {
          const res = await api.post("/jobs", job);
          setState((s) => ({ ...s, jobs: [res.data, ...s.jobs] }));
          return res.data;
        } catch (e) { 
          console.error(e);
          throw e;
        }
      },
      updateJob: async (id, patch) => {
        try {
          const res = await api.put(`/jobs/${id}`, patch);
          setState((s) => ({
            ...s,
            jobs: s.jobs.map((j) => (String(j.id) === String(id) || String(j._id) === String(id) ? res.data : j)),
          }));
          return res.data;
        } catch (e) { 
          console.error(e);
          throw e;
        }
      },
      deleteJob: async (id) => {
        try {
          await api.delete(`/jobs/${id}`);
          setState((s) => ({
            ...s,
            jobs: s.jobs.filter((j) => String(j.id) !== String(id) && String(j._id) !== String(id)),
          }));
        } catch (e) { 
          console.error(e);
          throw e;
        }
      },
      duplicateJob: async (id) => {
        const src = state.jobs.find((j) => String(j.id) === String(id) || String(j._id) === String(id));
        if (src) {
          try {
            const copy = { ...src, title: `Copy of ${src.title}`, status: "draft", closedReason: null };
            delete copy.id;
            delete copy._id;
            const res = await api.post("/jobs", copy);
            setState((s) => ({ ...s, jobs: [res.data, ...s.jobs] }));
            return res.data;
          } catch (e) { 
            console.error(e);
            throw e;
          }
        }
      },
      bulkDeleteJobs: async (ids) => {
        try {
          await api.post("/jobs/bulk-delete", { ids });
          const set = new Set(ids.map(String));
          setState((s) => ({
            ...s,
            jobs: s.jobs.filter((j) => !set.has(String(j.id)) && !set.has(String(j._id))),
          }));
        } catch (e) { 
          console.error(e);
          throw e;
        }
      },
      bulkPublishJobs: async (ids) => {
        try {
          await api.post("/jobs/bulk-publish", { ids });
          const set = new Set(ids.map(String));
          setState((s) => ({
            ...s,
            jobs: s.jobs.map((j) =>
              (set.has(String(j.id)) || set.has(String(j._id))) && j.status === "draft"
                ? { ...j, status: "published", closedReason: null }
                : j
            ),
          }));
        } catch (e) { 
          console.error(e);
          throw e;
        }
      },
    };
  }, [state, hydrated, error, fetchData]);

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("itpm_admin_user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const role = user?.role || "company";
  const companyAdminCompanyId = user?.companyAdminCompanyId || user?.companyId || null;

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.user);
      localStorage.setItem("itpm_admin_user", JSON.stringify(res.data.user));
      if (res.data.token) {
        localStorage.setItem("itpm_admin_token", res.data.token);
      }
      return true;
    } catch (e) {
      console.error(e);
      const mockUser = { 
        email, 
        name: email.split("@")[0], 
        role: "company", 
        companyAdminCompanyId: null,
        companyId: null
      };
      setUser(mockUser);
      localStorage.setItem("itpm_admin_user", JSON.stringify(mockUser));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("itpm_admin_user");
    localStorage.removeItem("itpm_admin_token");
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      role,
      setRole: () => {},
      companyAdminCompanyId,
      setCompanyAdminCompanyId: () => {}, 
      isSuperAdmin: role === "admin",
      canManageCompany: (companyId) => {
        if (role === "admin") return true;
        if (!companyId) return false;
        return String(companyAdminCompanyId) === String(companyId);
      },
    }),
    [user, role, companyAdminCompanyId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}