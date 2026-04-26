import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiBriefcase, FiUsers, FiCheckCircle, FiXCircle, 
  FiTrendingUp, FiPlus, FiList, FiEye, FiCalendar,
  FiBarChart2, FiUserCheck, 
  FiArrowRight, FiRefreshCw, FiClock, FiEdit2, FiTrash2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';

const CompanyAnalytics = ({ user }) => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalJobs: 0,
    activeJobs: 0,
    draftJobs: 0,
    pending: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0
  });
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const navigate = useNavigate();

  // Fetch company profile to get the company ID
  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const response = await API.get('/company/profile');
      const profile = response.data;
      setCompanyProfile(profile);
      
      // Extract company ID from profile
      const id = profile._id || profile.id;
      setCompanyId(id);
      
      // Store in localStorage for other components
      if (id) {
        localStorage.setItem('companyId', id);
      }
      
      // After getting company ID, fetch dashboard data
      await fetchDashboardData(id);
    } catch (error) {
      console.error('Error fetching company profile:', error);
      if (error.response?.status === 404) {
        toast.error('Please complete your company profile first');
      } else {
        toast.error('Failed to load company profile');
      }
      setLoading(false);
    }
  };

  const fetchDashboardData = async (id) => {
    if (!id) return;
    
    try {
      // Fetch jobs for this company
      const jobsResponse = await API.get(`/jobs/company/${id}`);
      const jobsData = jobsResponse.data || [];
      setJobs(jobsData);
      
      // Calculate job stats
      const totalJobs = jobsData.length;
      const activeJobs = jobsData.filter(j => j.status === 'published').length;
      const draftJobs = jobsData.filter(j => j.status === 'draft').length;
      
      // Fetch application stats
      try {
        const statsResponse = await API.get(`/applications/company/${id}/stats`);
        const data = statsResponse.data;
        
        setStats({
          totalApplications: data.summary?.totalApplications || 0,
          totalJobs: totalJobs,
          activeJobs: activeJobs,
          draftJobs: draftJobs,
          pending: data.summary?.pending || 0,
          shortlisted: data.summary?.shortlisted || 0,
          interview: data.summary?.interview || 0,
          selected: data.summary?.selected || 0,
          rejected: data.summary?.rejected || 0
        });
        
        setTopJobs(data.topJobs || []);
        setRecentApplications(data.recentApplications || []);
      } catch (statsError) {
        console.error('Error fetching application stats:', statsError);
        // Set default stats
        setStats(prev => ({
          ...prev,
          totalJobs: totalJobs,
          activeJobs: activeJobs,
          draftJobs: draftJobs
        }));
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (companyId) {
      fetchDashboardData(companyId);
    } else {
      fetchCompanyProfile();
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'shortlisted': 'bg-purple-100 text-purple-800',
      'interview': 'bg-indigo-100 text-indigo-800',
      'selected': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-green-100 text-green-800',
      'closed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }
    
    try {
      await API.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      if (companyId) {
        await fetchDashboardData(companyId);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const statsCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FiUsers,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs || 0,
      icon: FiBriefcase,
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Shortlisted',
      value: stats.shortlisted || 0,
      icon: FiUserCheck,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Selected',
      value: stats.selected || 0,
      icon: FiCheckCircle,
      gradient: 'from-teal-500 to-teal-600'
    }
  ];

  const handlePostNewJob = () => {
    if (companyId) {
      navigate(`/company/new-job`);
    } else {
      toast.error('Company profile not found. Please complete your profile first.');
    }
  };

  const handleManageJobs = () => {
    if (companyId) {
      navigate(`/company/jobs`);
    } else {
      toast.error('Company profile not found. Please complete your profile first.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no company profile, show create profile prompt
  if (!companyProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
              <FiBriefcase className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Complete Your Company Profile</h2>
            <p className="text-gray-600 mb-8">Set up your company profile to start posting jobs and reviewing applicants.</p>
            <Link to="/company/profile" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              Create Profile <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {companyProfile?.companyName || 'Company'}!
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your job postings and review applicants
              </p>
              {companyProfile?.status === 'pending' && (
                <p className="mt-2 text-sm text-yellow-600 bg-yellow-50 inline-block px-3 py-1 rounded-full">
                  ⏳ Profile pending admin approval
                </p>
              )}
              {companyProfile?.status === 'approved' && (
                <p className="mt-2 text-sm text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full">
                  ✓ Profile approved - You can post jobs
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                to="/companydashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition"
              >
                <FiUserCheck className="h-4 w-4" />
                <span>Company Profile</span>
              </Link>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition"
              >
                <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${stat.gradient} rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90">{stat.title}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Status Breakdown Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending Review', value: stats.pending || 0, color: 'yellow', icon: FiClock },
            { label: 'Shortlisted', value: stats.shortlisted || 0, color: 'purple', icon: FiUserCheck },
            { label: 'Interview', value: stats.interview || 0, color: 'indigo', icon: FiCalendar },
            { label: 'Selected', value: stats.selected || 0, color: 'green', icon: FiCheckCircle }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</p>
                </div>
                <item.icon className={`h-8 w-8 text-${item.color}-500 opacity-50`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Jobs Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiBriefcase className="mr-2 text-blue-600" />
                  Recent Jobs
                </h2>
                <button
                  onClick={handleManageJobs}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  View All <FiArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {jobs && jobs.length > 0 ? (
                jobs.slice(0, 5).map((job, index) => (
                  <motion.div
                    key={job._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="px-6 py-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {job.status || 'draft'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Deadline: {formatDate(job.applicationDeadline)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <FiBriefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No jobs posted yet</p>
                  <button
                    onClick={handlePostNewJob}
                    className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <FiPlus className="mr-1" />
                    Create your first job posting
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FiBarChart2 className="mr-2 text-purple-600" />
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handlePostNewJob}
                disabled={companyProfile?.status !== 'approved'}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                  companyProfile?.status === 'approved'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center">
                  <FiPlus className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">Post New Job</p>
                    <p className="text-sm opacity-90">Create a new job posting</p>
                  </div>
                </div>
                <FiArrowRight className="h-5 w-5" />
              </button>

              <button
                onClick={handleManageJobs}
                className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center">
                  <FiList className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">Manage Jobs</p>
                    <p className="text-sm opacity-90">Edit, delete, or view jobs</p>
                  </div>
                </div>
                <FiArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalytics;