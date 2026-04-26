import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBriefcase, FiCalendar, FiClock, FiStar, FiEye,
  FiArrowLeft, FiFilter, FiCheckCircle, FiXCircle,
  FiTrendingUp, FiAlertCircle, FiMapPin, FiUser,
  FiVideo, FiMap, FiPhone, FiMessageSquare
} from 'react-icons/fi';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await API.get('/applications/my-applications');
      
      let apps = [];
      let statsData = {};
      
      if (response.data && response.data.applications) {
        apps = response.data.applications;
        statsData = response.data.stats || {};
      } else if (Array.isArray(response.data)) {
        apps = response.data;
      } else {
        apps = [];
      }
      
      // Normalize application IDs
      const normalizedApps = apps.map(app => ({
        ...app,
        _id: app._id || app.id
      }));
      
      setApplications(normalizedApps);
      setStats({
        total: statsData.total || normalizedApps.length,
        pending: statsData.pending || normalizedApps.filter(a => a.status === 'pending').length,
        inReview: statsData.inReview || normalizedApps.filter(a => a.status === 'inReview').length,
        shortlisted: statsData.shortlisted || normalizedApps.filter(a => a.status === 'shortlisted').length,
        interview: statsData.interview || normalizedApps.filter(a => a.status === 'interview').length,
        selected: statsData.selected || normalizedApps.filter(a => a.status === 'selected').length,
        rejected: statsData.rejected || normalizedApps.filter(a => a.status === 'rejected').length
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'inReview': 'bg-blue-100 text-blue-800',
      'shortlisted': 'bg-purple-100 text-purple-800',
      'interview': 'bg-indigo-100 text-indigo-800',
      'selected': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return FiClock;
      case 'inReview': return FiTrendingUp;
      case 'shortlisted': return FiStar;
      case 'interview': return FiCalendar;
      case 'selected': return FiCheckCircle;
      case 'rejected': return FiXCircle;
      default: return FiBriefcase;
    }
  };

  const getInterviewModeIcon = (mode) => {
    switch(mode) {
      case 'online': return <FiVideo className="h-3 w-3" />;
      case 'in-person': return <FiMap className="h-3 w-3" />;
      case 'phone': return <FiPhone className="h-3 w-3" />;
      default: return <FiCalendar className="h-3 w-3" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' ? true : app.status === statusFilter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/jobseekerdashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <FiArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Track the status of all your job applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Applications</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.interview}</p>
            <p className="text-xs text-gray-500">Interviews</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.selected}</p>
            <p className="text-xs text-gray-500">Selected</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Applications ({stats.total})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="inReview">In Review ({stats.inReview})</option>
              <option value="shortlisted">Shortlisted ({stats.shortlisted})</option>
              <option value="interview">Interview ({stats.interview})</option>
              <option value="selected">Selected ({stats.selected})</option>
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FiBriefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No applications found</p>
            <Link to="/student/jobs" className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-700">
              Browse Jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredApplications.map((app, index) => {
                const StatusIcon = getStatusIcon(app.status);
                const job = app.jobId || {};
                const company = job.companyId || {};
                const hasInterview = app.interviewDetails?.date;
                const interviewMode = app.interviewDetails?.mode;
                
                return (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title || 'Job Title'}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                              <StatusIcon className="h-3 w-3" />
                              {app.status || 'pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{company.companyName || 'Company Name'}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiMapPin className="h-3 w-3" />
                              {job.location || 'Location N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiCalendar className="h-3 w-3" />
                              Applied: {formatDate(app.appliedAt)}
                            </span>
                            {app.skillMatchPercentage > 0 && (
                              <span className="flex items-center gap-1 text-green-600">
                                <FiStar className="h-3 w-3" />
                                Match: {app.skillMatchPercentage}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/student/application/${app._id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                        >
                          <FiEye className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                      
                      {/* Interview Details if scheduled */}
                      {hasInterview && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            {getInterviewModeIcon(interviewMode)}
                            <p className="text-sm font-semibold text-purple-800">Interview Scheduled</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-purple-700">
                              <FiCalendar className="h-4 w-4" />
                              <span>Date: {formatDate(app.interviewDetails.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-700">
                              <FiClock className="h-4 w-4" />
                              <span>Time: {formatTime(app.interviewDetails.time)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-700">
                              {getInterviewModeIcon(interviewMode)}
                              <span>Mode: {interviewMode === 'online' ? 'Online (Video Call)' : interviewMode === 'in-person' ? 'In Person' : 'Phone Call'}</span>
                            </div>
                            {app.interviewDetails.mode === 'online' && app.interviewDetails.meetingLink && (
                              <div className="flex items-center gap-2 text-purple-700">
                                <FiVideo className="h-4 w-4" />
                                <a href={app.interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                  Join Meeting
                                </a>
                              </div>
                            )}
                          </div>
                          {app.interviewDetails.message && (
                            <div className="mt-3 p-2 bg-white/50 rounded-lg">
                              <p className="text-sm text-purple-700 flex items-start gap-2">
                                <FiMessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{app.interviewDetails.message}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}