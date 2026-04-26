import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiBriefcase, FiMapPin, FiCalendar, 
  FiEdit2, FiTrash2, FiMail, FiPhone, FiUsers,
  FiCheckCircle, FiXCircle, FiClock, FiStar,
  FiDownload, FiEye, FiSend, FiFilter, FiUser,
  FiTrendingUp, FiAward, FiVideo, FiMap, FiPhoneCall
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function CompanyJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [viewingApplicant, setViewingApplicant] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    mode: 'online',
    meetingLink: '',
    message: ''
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      fetchApplications();
    } else {
      toast.error('Invalid job ID');
      setLoading(false);
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await API.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
      navigate('/company/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await API.get(`/applications/job/${id}`);
      let apps = [];
      if (response.data && response.data.applicants) {
        apps = response.data.applicants;
      } else if (Array.isArray(response.data)) {
        apps = response.data;
      } else if (response.data && response.data.data) {
        apps = response.data.data;
      } else {
        apps = [];
      }
      
      const normalizedApps = apps.map(app => ({
        ...app,
        _id: app._id || app.id
      }));
      
      setApplications(normalizedApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This will also delete all applications.')) return;
    
    try {
      await API.delete(`/jobs/${id}`);
      toast.success('Job deleted successfully');
      navigate('/company/jobs');
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await API.put(`/jobs/${id}`, { status: newStatus });
      toast.success(`Job ${newStatus === 'published' ? 'published' : 'updated'}`);
      fetchJobDetails();
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  const handleUpdateApplicationStatus = async () => {
    const appId = selectedApplication?._id || selectedApplication?.id;
    
    if (!selectedApplication || !newStatus) {
      toast.error('Invalid application or status');
      return;
    }
    
    if (!appId) {
      toast.error('Application ID not found');
      return;
    }
    
    setUpdatingStatus(true);
    try {
      await API.put(`/applications/${appId}`, { 
        status: newStatus,
        notes: selectedApplication.notes || ''
      });
      toast.success(`Application status updated to ${newStatus}`);
      setShowStatusModal(false);
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
      setSelectedApplication(null);
      setNewStatus('');
    }
  };

  const handleScheduleInterview = async () => {
    const appId = selectedApplication?._id || selectedApplication?.id;
    
    if (!selectedApplication || !appId) {
      toast.error('Invalid application');
      return;
    }
    
    if (!interviewDetails.date || !interviewDetails.time) {
      toast.error('Please select interview date and time');
      return;
    }
    
    setUpdatingStatus(true);
    try {
      await API.post(`/applications/${appId}/schedule-interview`, interviewDetails);
      toast.success('Interview scheduled successfully!');
      setShowInterviewModal(false);
      setInterviewDetails({
        date: '',
        time: '',
        mode: 'online',
        meetingLink: '',
        message: ''
      });
      fetchApplications();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const viewApplicantDetails = (applicant) => {
    setViewingApplicant(applicant);
    setShowApplicantModal(true);
  };

  const openInterviewModal = (applicant) => {
    setSelectedApplication(applicant);
    setInterviewDetails({
      date: '',
      time: '',
      mode: 'online',
      meetingLink: '',
      message: ''
    });
    setShowInterviewModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'inReview': 'bg-blue-100 text-blue-800 border-blue-200',
      'shortlisted': 'bg-purple-100 text-purple-800 border-purple-200',
      'interview': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'selected': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return FiClock;
      case 'inReview': return FiEye;
      case 'shortlisted': return FiStar;
      case 'interview': return FiCalendar;
      case 'selected': return FiCheckCircle;
      case 'rejected': return FiXCircle;
      default: return FiClock;
    }
  };

  const getStatusOptions = () => {
    return [
      { value: 'pending', label: 'Pending Review', color: 'yellow' },
      { value: 'inReview', label: 'In Review', color: 'blue' },
      { value: 'shortlisted', label: 'Shortlisted', color: 'purple' },
      { value: 'interview', label: 'Schedule Interview', color: 'indigo' },
      { value: 'selected', label: 'Selected', color: 'green' },
      { value: 'rejected', label: 'Rejected', color: 'red' }
    ];
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' ? true : app.status === statusFilter
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    inReview: applications.filter(a => a.status === 'inReview').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview: applications.filter(a => a.status === 'interview').length,
    selected: applications.filter(a => a.status === 'selected').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <Link to="/company/jobs" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/company/jobs" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <FiArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      {/* Job Details Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <FiBriefcase className="h-4 w-4" />
                  {job.type}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <FiMapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                  <FiCalendar className="h-4 w-4" />
                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                to={`/company/job/${id}/edit`}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Edit Job"
              >
                <FiEdit2 className="h-5 w-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete Job"
              >
                <FiTrash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Status</h2>
            <select
              value={job.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
                job.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : job.status === 'draft'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{job.requirements || 'No requirements specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Applications ({applications.length})</h2>
              <p className="text-sm text-gray-500 mt-1">Review and manage candidate applications</p>
            </div>
            
            <div className="flex items-center gap-2">
              <FiFilter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="inReview">In Review ({stats.inReview})</option>
                <option value="shortlisted">Shortlisted ({stats.shortlisted})</option>
                <option value="interview">Interview ({stats.interview})</option>
                <option value="selected">Selected ({stats.selected})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500">In Review</p>
              <p className="text-lg font-bold text-blue-600">{stats.inReview}</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-500">Shortlisted</p>
              <p className="text-lg font-bold text-purple-600">{stats.shortlisted}</p>
            </div>
            <div className="text-center p-2 bg-indigo-50 rounded-lg">
              <p className="text-xs text-gray-500">Interview</p>
              <p className="text-lg font-bold text-indigo-600">{stats.interview}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-500">Selected</p>
              <p className="text-lg font-bold text-green-600">{stats.selected}</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-500">Rejected</p>
              <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No applications found</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter !== 'all' ? 'Try changing the status filter' : 'Applications will appear here once students apply'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {filteredApplications.map((app, index) => {
                const StatusIcon = getStatusIcon(app.status);
                const appId = app._id || app.id;
                const hasInterview = app.interviewDetails?.date;
                
                return (
                  <motion.div
                    key={appId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => viewApplicantDetails(app)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {app.name?.charAt(0) || <FiUser className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.name || 'Unknown'}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FiMail className="h-3 w-3" />
                                {app.email || 'No email'}
                              </span>
                              {app.phone && (
                                <span className="flex items-center gap-1">
                                  <FiPhone className="h-3 w-3" />
                                  {app.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Applied: {formatDate(app.appliedAt)}</span>
                          {app.skillMatchPercentage > 0 && (
                            <span className="flex items-center gap-1">
                              <FiAward className="h-3 w-3 text-green-500" />
                              Match: {app.skillMatchPercentage}%
                            </span>
                          )}
                          {hasInterview && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <FiCalendar className="h-3 w-3" />
                              Interview: {formatDate(app.interviewDetails.date)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          {app.status || 'pending'}
                        </span>
                        
                        {app.status === 'shortlisted' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openInterviewModal(app);
                            }}
                            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                          >
                            <FiVideo className="h-4 w-4 inline mr-1" />
                            Schedule Interview
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedApplication(app);
                            setNewStatus(app.status);
                            setShowStatusModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Update Status
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewApplicantDetails(app);
                          }}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          <FiEye className="h-4 w-4 inline mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                    
                    {hasInterview && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-800 flex items-center gap-2">
                          <FiCalendar className="h-4 w-4" />
                          <strong>Interview Scheduled:</strong>
                          {formatDate(app.interviewDetails.date)} at {app.interviewDetails.time}
                          {app.interviewDetails.mode && ` (${app.interviewDetails.mode})`}
                        </p>
                        {app.interviewDetails.meetingLink && (
                          <a href={app.interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline mt-1 inline-flex items-center gap-1">
                            <FiVideo className="h-3 w-3" />
                            Join Meeting
                          </a>
                        )}
                        {app.interviewDetails.message && (
                          <p className="text-sm text-purple-700 mt-2">{app.interviewDetails.message}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Applicant Details Modal */}
      <AnimatePresence>
        {showApplicantModal && viewingApplicant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApplicantModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">Applicant Details</h3>
                <button onClick={() => setShowApplicantModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {viewingApplicant.name?.charAt(0) || <FiUser className="h-8 w-8" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewingApplicant.name}</h2>
                  <p className="text-gray-500">{viewingApplicant.email}</p>
                  {viewingApplicant.phone && <p className="text-gray-500">{viewingApplicant.phone}</p>}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Application Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="text-gray-500">Applied for:</span> {job?.title}</p>
                  <p><span className="text-gray-500">Applied on:</span> {formatDate(viewingApplicant.appliedAt)}</p>
                  <p><span className="text-gray-500">Status:</span> 
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(viewingApplicant.status)}`}>
                      {viewingApplicant.status}
                    </span>
                  </p>
                  {viewingApplicant.skillMatchPercentage > 0 && (
                    <p><span className="text-gray-500">Skill Match:</span> {viewingApplicant.skillMatchPercentage}%</p>
                  )}
                </div>
              </div>

              {viewingApplicant.profileSnapshot && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Profile Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {viewingApplicant.profileSnapshot.location && <p><span className="text-gray-500">Location:</span> {viewingApplicant.profileSnapshot.location}</p>}
                    {viewingApplicant.profileSnapshot.education && <p><span className="text-gray-500">Education:</span> {viewingApplicant.profileSnapshot.education}</p>}
                    {viewingApplicant.profileSnapshot.bio && <div><p className="text-gray-500 mb-1">Bio:</p><p className="text-gray-700">{viewingApplicant.profileSnapshot.bio}</p></div>}
                    {viewingApplicant.profileSnapshot.skills?.length > 0 && (
                      <div>
                        <p className="text-gray-500 mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {viewingApplicant.profileSnapshot.skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {viewingApplicant.profileSnapshot.website && <a href={viewingApplicant.profileSnapshot.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">Website</a>}
                      {viewingApplicant.profileSnapshot.linkedin && <a href={viewingApplicant.profileSnapshot.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">LinkedIn</a>}
                      {viewingApplicant.profileSnapshot.github && <a href={viewingApplicant.profileSnapshot.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">GitHub</a>}
                    </div>
                  </div>
                </div>
              )}

              {viewingApplicant.resume && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Resume/CV</h4>
                  <a href={viewingApplicant.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                    <FiDownload className="h-4 w-4" /> Download Resume
                  </a>
                </div>
              )}

              {viewingApplicant.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{viewingApplicant.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedApplication(viewingApplicant);
                    setNewStatus(viewingApplicant.status);
                    setShowStatusModal(true);
                    setShowApplicantModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Status
                </button>
                <button onClick={() => setShowApplicantModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Update Application Status</h3>
                <p className="text-gray-600 mt-1">Update status for <strong>{selectedApplication.name}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowStatusModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleUpdateApplicationStatus} disabled={updatingStatus} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interview Scheduling Modal */}
      <AnimatePresence>
        {showInterviewModal && selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInterviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">Schedule Interview</h3>
                <p className="text-gray-600 mt-1">Schedule interview for <strong>{selectedApplication.name}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={interviewDetails.date}
                    onChange={(e) => setInterviewDetails({ ...interviewDetails, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Time *</label>
                  <input
                    type="time"
                    value={interviewDetails.time}
                    onChange={(e) => setInterviewDetails({ ...interviewDetails, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Mode</label>
                  <select
                    value={interviewDetails.mode}
                    onChange={(e) => setInterviewDetails({ ...interviewDetails, mode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">Online (Video Call)</option>
                    <option value="in-person">In Person</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                {interviewDetails.mode === 'online' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link</label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={interviewDetails.meetingLink}
                      onChange={(e) => setInterviewDetails({ ...interviewDetails, meetingLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {interviewDetails.mode === 'in-person' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="Office address, building, room number"
                      value={interviewDetails.message}
                      onChange={(e) => setInterviewDetails({ ...interviewDetails, message: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add any additional instructions or notes for the candidate..."
                    value={interviewDetails.message}
                    onChange={(e) => setInterviewDetails({ ...interviewDetails, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowInterviewModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleScheduleInterview} disabled={updatingStatus} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                  {updatingStatus ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}