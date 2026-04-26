import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiLocationMarker, HiMail, HiPhone, HiGlobe, HiChat, HiStar, HiArrowLeft } from 'react-icons/hi';

export default function CompanyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingInfo, setRatingInfo] = useState({ avgRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get(`/public/companies/${id}`)
      .then((res) => {
        setCompany(res.data.company);
        setReviews(res.data.reviews);
        setRatingInfo(res.data.rating);
      })
      .catch(() => toast.error('Company not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      const res = await API.post('/reviews', { companyId: id, ...reviewForm });
      setReviews([res.data, ...reviews]);
      setReviewForm({ rating: 0, comment: '' });
      toast.success('Review submitted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getLogoUrl = () => {
    const logo = company?.documents?.find((d) => d.type === 'companyLogo');
    return logo ? logo.path : null;
  };

  if (loading) return <LoadingSpinner text="Loading company..." />;
  if (!company) return <p className="text-center text-text-muted py-12">Company not found</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/directory" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors group">
          <HiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Directory
        </Link>

        {/* Company Header */}
        <div className="glass-card p-8 mb-6 accent-top">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-[var(--glass-border)]">
              {getLogoUrl() ? (
                <img src={getLogoUrl()} alt={company.companyName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary-400">{company.companyName?.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary">{company.companyName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2.5">
                <span className="text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 font-medium ring-1 ring-primary-500/15">{company.businessType}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-surface-elevated text-text-secondary border border-[var(--glass-border)]">{company.industry}</span>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={Math.round(ratingInfo.avgRating || 0)} readonly size="sm" />
                  <span className="text-xs text-text-muted">({ratingInfo.count || 0} reviews)</span>
                </div>
              </div>
              {company.description && (
                <p className="text-sm text-text-secondary mt-4 leading-relaxed">{company.description}</p>
              )}
            </div>
          </div>

          {/* Contact & Chat */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[var(--glass-border)]">
            {company.email && (
              <a href={`mailto:${company.email}`} className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-text-secondary hover:text-primary-400 bg-surface-elevated/50 rounded-xl border border-[var(--glass-border)] transition-all duration-200 hover:border-primary-500/30">
                <HiMail className="w-4 h-4" /> {company.email}
              </a>
            )}
            {company.phoneNumber && (
              <span className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-text-secondary bg-surface-elevated/50 rounded-xl border border-[var(--glass-border)]">
                <HiPhone className="w-4 h-4" /> {company.phoneNumber}
              </span>
            )}
            {company.websiteURL && (
              <a href={company.websiteURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-text-secondary hover:text-primary-400 bg-surface-elevated/50 rounded-xl border border-[var(--glass-border)] transition-all duration-200 hover:border-primary-500/30">
                <HiGlobe className="w-4 h-4" /> Website
              </a>
            )}
            <div className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-text-secondary bg-surface-elevated/50 rounded-xl border border-[var(--glass-border)]">
              <HiLocationMarker className="w-4 h-4" /> {company.city}, {company.country}
            </div>
            {user && user.role === 'user' && (
              <Link to={`/chat?partner=${company.userId?._id}`} className="glow-btn flex items-center gap-1.5 px-5 py-2 text-xs font-medium ml-auto">
                <HiChat className="w-4 h-4" /> Chat with Company
              </Link>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-5 border-b border-[var(--glass-border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <HiStar className="w-4 h-4 text-amber-400" /> Reviews ({reviews.length})
            </h3>
          </div>

          {/* Write Review */}
          {user && user.role === 'user' && (
            <form onSubmit={handleSubmitReview} className="px-6 py-5 border-b border-[var(--glass-border)] bg-surface-elevated/20">
              <p className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Write a Review</p>
              <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm({...reviewForm, rating: r})} size="md" />
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                rows={3}
                className="w-full mt-3 px-4 py-3 bg-surface-elevated/50 border border-[var(--glass-border)] rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 transition-all duration-200 resize-none input-stripe"
                placeholder="Share your experience..."
              />
              <div className="flex justify-end mt-3">
                <button type="submit" disabled={submitting} className="glow-btn px-5 py-2.5 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="divide-y divide-[var(--glass-border)]">
            {reviews.map((review) => (
              <div key={review._id} className="px-6 py-5 hover:bg-surface-hover/30 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center ring-1 ring-[var(--glass-border)]">
                      <span className="text-[10px] font-bold text-primary-400">{review.userId?.fullName?.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary">{review.userId?.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} readonly size="sm" />
                    <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-center text-sm text-text-muted py-10">No reviews yet. Be the first!</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
