import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiBriefcase, FiMapPin, FiCalendar, 
  FiClock, FiCheckCircle, FiAlertCircle, FiStar,
  FiCode, FiUser, FiMail, FiPhone, FiAward,
  FiDownload, FiGlobe, FiGithub, FiLinkedin, 
  FiTrendingUp, FiTarget, FiZap, FiThumbsUp, FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function UserJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, completionPercentage = 0, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [skillMatch, setSkillMatch] = useState(null);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      if (user) checkAppliedStatus();
    }
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      const response = await API.get(`/jobs/${id}`);
      const jobData = response.data;
      setJob(jobData);
      
      if (jobData.companyId) {
        if (jobData.companyId.companyName) {
          setCompany(jobData.companyId);
        } else {
          let companyId = jobData.companyId;
          if (typeof companyId === 'object') {
            companyId = companyId._id || companyId.id;
          }
          if (companyId) {
            try {
              const companyRes = await API.get(`/companies/${companyId}`);
              setCompany(companyRes.data);
            } catch (err) {
              console.error('Error fetching company:', err);
            }
          }
        }
      }
      
      if (profile?.skills && profile.skills.length > 0 && jobData.skills && jobData.skills.length > 0) {
        calculateSkillMatch(profile.skills, jobData.skills);
      } else if (jobData.skills && jobData.skills.length > 0) {
        setSkillMatch({ percentage: 0, matchedSkills: [], missingSkills: jobData.skills, matchedCount: 0, totalCount: jobData.skills.length });
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      navigate('/student/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkAppliedStatus = async () => {
    try {
      const response = await API.get(`/applications/check/${id}`);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const calculateSkillMatch = (userSkills, jobSkills) => {
    if (!userSkills?.length || !jobSkills?.length) {
      setSkillMatch({ percentage: 0, matchedSkills: [], missingSkills: jobSkills || [], matchedCount: 0, totalCount: jobSkills?.length || 0 });
      return;
    }
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase().trim());
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase().trim());
    
    const matchedSkillsList = jobSkillsLower.filter(jobSkill => 
      userSkillsLower.some(userSkill => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill) || userSkill === jobSkill
      )
    );
    
    const matchedCount = matchedSkillsList.length;
    const totalCount = jobSkills.length;
    const percentage = Math.round((matchedCount / totalCount) * 100);
    
    const matchedSkills = jobSkills.filter((_, i) => 
      matchedSkillsList.includes(jobSkills[i].toLowerCase())
    );
    
    const missingSkills = jobSkills.filter((_, i) => 
      !matchedSkillsList.includes(jobSkills[i].toLowerCase())
    );
    
    setSkillMatch({
      percentage,
      matchedSkills,
      missingSkills,
      matchedCount,
      totalCount
    });
  };

  const canApply = completionPercentage >= 80 && !hasApplied;

  const handleApply = () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (completionPercentage < 80) {
      toast.error(`Profile ${completionPercentage}% complete. Need 80% to apply.`);
      return;
    }
    if (hasApplied) {
      toast.error('You have already applied for this position');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmApply = async () => {
    setApplying(true);
    try {
      await API.post('/applications', {
        jobId: id,
        name: user?.name,
        email: user?.email,
        phone: profile?.phone || '',
        notes: ''
      });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error applying:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 70) return { 
      bg: 'from-green-500 to-emerald-600', 
      text: 'text-green-600', 
      light: 'bg-gradient-to-r from-green-50 to-emerald-50', 
      border: 'border-green-200',
      icon: 'text-green-500',
      badge: 'bg-green-100 text-green-700'
    };
    if (percentage >= 40) return { 
      bg: 'from-yellow-500 to-orange-500', 
      text: 'text-yellow-600', 
      light: 'bg-gradient-to-r from-yellow-50 to-amber-50', 
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      badge: 'bg-yellow-100 text-yellow-700'
    };
    return { 
      bg: 'from-red-500 to-rose-600', 
      text: 'text-red-600', 
      light: 'bg-gradient-to-r from-red-50 to-rose-50', 
      border: 'border-red-200',
      icon: 'text-red-500',
      badge: 'bg-red-100 text-red-700'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Job not found</p>
          <Link to="/student/jobs" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const matchColor = skillMatch ? getMatchColor(skillMatch.percentage) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/student/jobs" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group transition-colors">
            <FiArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </Link>
        </motion.div>

        {/* Profile Completion Warning */}
        {user && completionPercentage < 80 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiAlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">Profile {completionPercentage}% Complete</p>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-1">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <p className="text-xs text-yellow-700 mt-1">Complete your profile to 80% to start applying!</p>
              </div>
              <Link to="/edit-profile" className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition text-sm font-medium shadow-sm">
                Complete Now
              </Link>
            </div>
          </motion.div>
        )}

        {/* Already Applied Message */}
        {hasApplied && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Application Submitted!</p>
                <p className="text-xs text-green-700">You have already applied for this position</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Job Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">{job.title}</h1>
            <p className="text-blue-100 mt-2">{company?.companyName || job.companyId?.companyName || 'Company'}</p>
          </div>
          
          <div className="p-6">
            {/* Job Details Tags - Using all model fields */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-medium">
                <FiBriefcase className="h-4 w-4" />
                {job.type || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-sm font-medium">
                <FiMapPin className="h-4 w-4" />
                {job.location || 'N/A'}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-lg text-sm font-medium">
                <FiCalendar className="h-4 w-4" />
                Deadline: {formatDate(job.applicationDeadline)}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-lg text-sm">
                <FiClock className="h-4 w-4" />
                Posted: {formatDate(job.createdAt)}
              </span>
            </div>

            {/* Skill Match Section - Enhanced */}
            {skillMatch && user && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`mb-6 p-5 rounded-xl border-2 ${matchColor.border} ${matchColor.light}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${matchColor.badge} flex items-center justify-center`}>
                      <FiTarget className={`h-4 w-4 ${matchColor.icon}`} />
                    </div>
                    Skill Match Analysis
                  </h3>
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className={`h-4 w-4 ${matchColor.icon}`} />
                    <span className={`text-2xl font-bold ${matchColor.text}`}>{skillMatch.percentage}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-white rounded-full h-2.5 mb-4 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skillMatch.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-2.5 rounded-full bg-gradient-to-r ${matchColor.bg} relative`}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                  </motion.div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {skillMatch.matchedSkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                        <FiCheckCircle className="h-4 w-4" />
                        Matching Skills ({skillMatch.matchedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillMatch.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {skillMatch.missingSkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                        <FiAlertCircle className="h-4 w-4" />
                        Missing Skills ({skillMatch.missingSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillMatch.missingSkills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {skillMatch.percentage < 50 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FiZap className="h-4 w-4 text-yellow-500" />
                      💡 Tip: Consider developing these missing skills to improve your chances!
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Job Description - Using requirements field */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiBriefcase className="h-5 w-5 text-blue-600" />
                Job Description & Requirements
              </h3>
              <div className="prose max-w-none bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{job.requirements || 'No description provided'}</p>
              </div>
            </div>

            {/* Required Skills - Using skills array */}
            {job.skills && job.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FiCode className="h-5 w-5 text-blue-600" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiBarChart2 className="h-5 w-5 text-purple-600" />
                Job Status
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  job.status === 'published' ? 'bg-green-100 text-green-700' :
                  job.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {job.status === 'published' ? '✓ Active' : job.status === 'draft' ? '📝 Draft' : '🔒 Closed'}
                </span>
                {job.closedReason && (
                  <span className="text-sm text-gray-500">Reason: {job.closedReason}</span>
                )}
              </div>
            </div>

            {/* Apply Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              disabled={!user || !canApply}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                !user ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                canApply ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg' :
                hasApplied ? 'bg-green-100 text-green-600 cursor-not-allowed' :
                'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {!user ? '🔒 Login to Apply' :
               hasApplied ? '✅ Already Applied' :
               canApply ? '✨ Apply Now' : `📝 Complete Profile (${completionPercentage}%)`}
            </motion.button>
          </div>
        </motion.div>

        {/* Company Info - Using company fields */}
        {(company || job.companyId) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">About the Company</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-xl font-bold text-white">
                    {(company?.companyName || job.companyId?.companyName)?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{company?.companyName || job.companyId?.companyName}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <FiStar className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{company?.rating?.avgRating || job.companyId?.rating || 'New'}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{company?.description || job.companyId?.description || 'No description available'}</p>
              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                {(company?.email || job.companyId?.email) && (
                  <a href={`mailto:${company?.email || job.companyId?.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition">
                    <FiMail className="h-4 w-4" /> Email
                  </a>
                )}
                {(company?.website || job.companyId?.website) && (
                  <a href={company?.website || job.companyId?.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition">
                    <FiGlobe className="h-4 w-4" /> Website
                  </a>
                )}
                {(company?.location || job.companyId?.location) && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <FiMapPin className="h-4 w-4" /> {company?.location || job.companyId?.location}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Application Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiCheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Confirm Application</h3>
                <p className="text-gray-600 mt-2">
                  Apply for <span className="font-semibold text-blue-600">{job.title}</span>?
                </p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Your application includes:</p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">👤 Name: {user?.name || 'N/A'}</li>
                  <li className="flex items-center gap-2">📧 Email: {user?.email || 'N/A'}</li>
                  <li className="flex items-center gap-2">📱 Phone: {profile?.phone || 'Not provided'}</li>
                  <li className="flex items-center gap-2">📄 Resume: {profile?.resume ? '✅ Uploaded' : '❌ Not uploaded'}</li>
                  <li className="flex items-center gap-2">💡 Skills: {profile?.skills?.length || 0} skills listed</li>
                  {skillMatch && <li className="flex items-center gap-2">📊 Skill Match: {skillMatch.percentage}%</li>}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApply}
                  disabled={applying}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Confirm Apply'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}