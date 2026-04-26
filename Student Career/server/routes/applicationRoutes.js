// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const {
  // Student Controllers
  applyForJobWithDetails,
  uploadResume,
  getMyApplications,
  getApplicationDetails,
  
  // Company Controllers
  getApplicantsForJob,
  updateApplicationStatus,
  scheduleInterview,
  exportApplicantsToCSV,
  getApplicationAnalytics,
  getCompanyStatistics,
  updateInterviewDetails
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

// ==================== STUDENT ROUTES ====================
// Routes that students can access

// Apply for a job with additional details (cover letter, resume link, etc.)
router.post('/jobs/:jobId/apply-with-details', protect, uploadResume, authorize('student'), applyForJobWithDetails);  

// Get my applications
router.get('/my-applications', protect, authorize('student'), getMyApplications);

// Get single application details
router.get('/:applicationId', protect, getApplicationDetails);

// ==================== COMPANY ROUTES ====================
// Routes that companies can access

// Get applicants for a specific job (with filters)
router.get('/jobs/:jobId/applicants', protect, authorize('company'), getApplicantsForJob);

// Update application status
router.put('/:applicationId/status', protect, authorize('company'), updateApplicationStatus);

// Schedule interview
router.post('/:applicationId/interview', protect, authorize('company'), scheduleInterview);

// Update interview details
router.put('/:applicationId/interview', protect, authorize('company'), updateInterviewDetails);

// Export applicants to CSV
router.get('/jobs/:jobId/export', protect, authorize('company'), exportApplicantsToCSV);

// Get application analytics for a job
router.get('/jobs/:jobId/analytics', protect, authorize('company'), getApplicationAnalytics);

// Get company-wide statistics
router.get('/company/statistics', protect, authorize('company'), getCompanyStatistics);

module.exports = router;