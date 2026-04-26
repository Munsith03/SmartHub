import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiBriefcase, FiMapPin, FiCalendar, 
  FiClock, FiUser, FiMail, FiPhone, FiAward,
  FiCheckCircle, FiAlertCircle, FiStar, FiDownload,
  FiGlobe, FiGithub, FiLinkedin
} from 'react-icons/fi';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function MyApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await API.get(`/applications/${id}`);
      setApplication(response.data);
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application details');
      navigate('/student/applications');
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

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <Link to="/student/applications" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Applications
        </Link>
      </div>
    );
  }

  const job = application.jobId || {};
  const company = job.companyId || {};
  const profile = application.profileSnapshot || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/student/applications" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <FiArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-6 ${getStatusColor(application.status)}`}>
          <div className="flex items-center gap-3">
            {application.status === 'selected' ? <FiCheckCircle className="h-6 w-6" /> : <FiAlertCircle className="h-6 w-6" />}
            <div>
              <p className="font-semibold">Application Status: {application.status}</p>
              <p className="text-sm opacity-80">Last updated: {formatDate(application.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <p className="text-gray-600 mt-1">{company.companyName}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FiBriefcase className="h-4 w-4" />
                {job.type}
              </span>
              <span className="flex items-center gap-1">
                <FiMapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar className="h-4 w-4" />
                Applied: {formatDate(application.appliedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Your Information */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
            <h2 className="text-xl font-bold text-gray-900">Your Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <FiUser className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{application.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{application.email}</p>
                </div>
              </div>
              {application.phone && (
                <div className="flex items-center gap-3">
                  <FiPhone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{application.phone}</p>
                  </div>
                </div>
              )}
              {application.skillMatchPercentage > 0 && (
                <div className="flex items-center gap-3">
                  <FiAward className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Skill Match</p>
                    <p className="font-medium text-green-600">{application.skillMatchPercentage}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        {(profile.skills?.length > 0 || profile.bio || profile.location || profile.education) && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
            </div>
            <div className="p-6">
              {profile.location && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-gray-900">{profile.location}</p>
                </div>
              )}
              {profile.education && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">Education</p>
                  <p className="text-gray-900">{profile.education}</p>
                </div>
              )}
              {profile.bio && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">Bio</p>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
              {profile.skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <FiGlobe className="h-4 w-4" /> Website
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <FiLinkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <FiGithub className="h-4 w-4" /> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resume */}
        {application.resume && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-xl font-bold text-gray-900">Resume/CV</h2>
            </div>
            <div className="p-6">
              <a
                href={application.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
              >
                <FiDownload className="h-4 w-4" />
                Download Resume
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}