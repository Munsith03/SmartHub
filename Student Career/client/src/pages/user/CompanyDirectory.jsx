import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { motion } from 'framer-motion';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiSearch, HiFilter, HiLocationMarker, HiOfficeBuilding, HiX, HiArrowRight } from 'react-icons/hi';

export default function CompanyDirectory() {
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({ search: '', industry: '', businessType: '', country: '' });
  const [filterOptions, setFilterOptions] = useState({ industries: [], businessTypes: [], countries: [] });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    API.get('/public/filters')
      .then((res) => setFilterOptions(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.businessType) params.set('businessType', filters.businessType);
    if (filters.country) params.set('country', filters.country);
    params.set('page', page);

    API.get(`/public/companies?${params}`)
      .then((res) => {
        setCompanies(res.data.companies);
        setTotalPages(res.data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  const clearFilters = () => {
    setFilters({ search: '', industry: '', businessType: '', country: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.industry || filters.businessType || filters.country;

  const getLogoUrl = (company) => {
    const logo = company.documents?.find((d) => d.type === 'companyLogo');
    return logo ? logo.path : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-primary-400 mb-3 block">Directory</span>
        <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">Discover Companies</h1>
        <p className="text-text-secondary max-w-lg mx-auto">Browse verified and trusted companies. Search by industry, location, or name.</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <HiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
            className="w-full pl-13 pr-14 py-4 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 transition-all duration-300 shadow-lg shadow-primary-500/5 input-stripe"
            placeholder="Search companies by name, industry, or location..."
          />
          <button onClick={() => setShowFilters(!showFilters)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-200 ${showFilters ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md' : 'text-text-muted hover:text-primary-400 hover:bg-primary-500/10'}`}>
            <HiFilter className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="max-w-2xl mx-auto mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Filters</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium">
                  <HiX className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: filters.industry, options: filterOptions.industries, label: 'All Industries', key: 'industry' },
                { value: filters.businessType, options: filterOptions.businessTypes, label: 'All Types', key: 'businessType' },
                { value: filters.country, options: filterOptions.countries, label: 'All Countries', key: 'country' },
              ].map((f) => (
                <select key={f.key} value={f.value} onChange={(e) => { setFilters({ ...filters, [f.key]: e.target.value }); setPage(1); }}
                  className="px-4 py-2.5 bg-surface-elevated/50 border border-[var(--glass-border)] rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 transition-all duration-200 input-stripe">
                  <option value="">{f.label}</option>
                  {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Searching companies..." />
      ) : companies.length === 0 ? (
        <div className="text-center py-20">
          <HiOfficeBuilding className="w-16 h-16 mx-auto text-text-muted/15 mb-4" />
          <p className="text-lg font-semibold text-text-primary">No companies found</p>
          <p className="text-sm text-text-muted mt-1.5">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((company, i) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link to={`/company/${company._id}`} className="block glass-card p-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 group h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary-500/15 to-accent-500/15 flex items-center justify-center flex-shrink-0 group-hover:from-primary-500/25 group-hover:to-accent-500/25 transition-all duration-300 overflow-hidden ring-2 ring-[var(--glass-border)]" style={{ width: '52px', height: '52px' }}>
                      {getLogoUrl(company) ? (
                        <img src={getLogoUrl(company)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-primary-400">{company.companyName?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary-400 transition-colors duration-300 truncate">{company.companyName}</h3>
                      <p className="text-xs text-text-muted mt-0.5">{company.industry}</p>
                    </div>
                    <HiArrowRight className="w-4 h-4 text-text-muted/0 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0 mt-1" />
                  </div>

                  {company.description && (
                    <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">{company.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <HiLocationMarker className="w-3.5 h-3.5" />
                      {company.city}, {company.country}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={Math.round(company.rating?.avgRating || 0)} readonly size="sm" />
                      <span className="text-xs text-text-muted">({company.rating?.reviewCount || 0})</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-500/8 text-primary-400 font-medium ring-1 ring-primary-500/15">{company.businessType}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                    page === i + 1
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-surface-elevated/50 text-text-secondary hover:bg-surface-hover border border-[var(--glass-border)]'
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
