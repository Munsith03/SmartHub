import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";

const industries = [
  "IT & Technology",
  "Construction",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Hospitality",
  "Agriculture",
  "Transportation",
  "Real Estate",
  "Other",
];
const businessTypes = ["Private", "Public", "Startup", "NGO"];

const InputField = ({
  label,
  id,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
  error,
  as = "input",
  options = [],
  rows,
  maxLength,
}) => (
  <div>
    <label className="block text-xs font-medium text-text-secondary mb-1.5">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    {as === "select" ? (
      <select
        id={id}
        required={required}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 bg-surface-elevated/50 border ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-[var(--glass-border)] focus:border-primary-500 focus:ring-primary-500/15"} rounded-xl text-sm text-text-primary focus:outline-none focus:ring-4 transition-all duration-200 input-stripe`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : as === "textarea" ? (
      <textarea
        id={id}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-4 py-3 bg-surface-elevated/50 border ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-[var(--glass-border)] focus:border-primary-500 focus:ring-primary-500/15"} rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-4 transition-all duration-200 resize-none input-stripe`}
      />
    ) : (
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-surface-elevated/50 border ${error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-[var(--glass-border)] focus:border-primary-500 focus:ring-primary-500/15"} rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-4 transition-all duration-200 input-stripe`}
      />
    )}
    {error && (
      <p className="text-[10px] text-danger mt-1 font-medium">{error}</p>
    )}
  </div>
);

export default function CompanyProfile() {
  const [form, setForm] = useState({
    companyName: "",
    registrationNumber: "",
    businessType: "",
    industry: "",
    email: "",
    phoneNumber: "",
    websiteURL: "",
    country: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/company/profile")
      .then((res) => {
        setForm(res.data);
        setIsEdit(true);
      })
      .catch(() => setIsEdit(false))
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName.trim())
      newErrors.companyName = "Company name is required";
    else if (!/^[a-zA-Z0-9\s.,&-]{2,100}$/.test(form.companyName))
      newErrors.companyName =
        "Must be 2-100 characters, valid symbols only (.,&-)";

    if (!form.registrationNumber.trim())
      newErrors.registrationNumber = "Registration number is required";
    else if (!/^[A-Za-z0-9-]+$/.test(form.registrationNumber))
      newErrors.registrationNumber = "Alphanumeric and dashes only";

    if (!form.businessType)
      newErrors.businessType = "Business type is required";
    if (!form.industry) newErrors.industry = "Industry is required";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";

    if (form.phoneNumber) {
      const phone = form.phoneNumber.replace(/[\s-]/g, "");

      if (!/^(?:0|94|\+94)?7\d{8}$/.test(phone)) {
        newErrors.phoneNumber =
          "Invalid Sri Lankan phone number (e.g., 0712345678 or +94712345678)";
      }
    }

    if (
      form.websiteURL &&
      !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
        form.websiteURL,
      )
    ) {
      newErrors.websiteURL = "Invalid URL format";
    }

    if (!form.country.trim()) newErrors.country = "Country is required";
    else if (!/^[a-zA-Z\s-]{2,50}$/.test(form.country))
      newErrors.country = "Letters, spaces, and hyphens only";

    if (!form.city.trim()) newErrors.city = "City is required";
    else if (!/^[a-zA-Z\s-]{2,50}$/.test(form.city))
      newErrors.city = "Letters, spaces, and hyphens only";

    if (!form.addressLine1.trim())
      newErrors.addressLine1 = "Address line 1 is required";

    if (form.postalCode && !/^[A-Za-z0-9\s-]{3,10}$/.test(form.postalCode)) {
      newErrors.postalCode = "Invalid postal code format";
    }

    if (form.description && form.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await API.put("/company/profile", form);
        toast.success("Profile updated!");
      } else {
        await API.post("/company/profile", form);
        toast.success("Profile created!");
      }
      navigate("/company");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  const sections = [
    {
      num: "01",
      title: "Basic Information",
      gradient: "from-slate-700 to-slate-500",
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Company Name"
            id="c-name"
            required
            value={form.companyName || ""}
            onChange={update("companyName")}
            placeholder="Acme Corp"
            error={errors.companyName}
          />
          <InputField
            label="Registration Number"
            id="c-reg"
            required
            value={form.registrationNumber || ""}
            onChange={update("registrationNumber")}
            placeholder="REG-12345"
            error={errors.registrationNumber}
          />
          <InputField
            label="Business Type"
            id="c-btype"
            as="select"
            options={businessTypes}
            required
            value={form.businessType || ""}
            onChange={update("businessType")}
            error={errors.businessType}
          />
          <InputField
            label="Industry"
            id="c-ind"
            as="select"
            options={industries}
            required
            value={form.industry || ""}
            onChange={update("industry")}
            error={errors.industry}
          />
        </div>
      ),
    },
    {
      num: "02",
      title: "Contact Details",
      gradient: "from-blue-500 to-cyan-500",
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Email"
            id="c-email"
            type="email"
            required
            value={form.email || ""}
            onChange={update("email")}
            placeholder="contact@company.com"
            error={errors.email}
          />
          <InputField
            label="Phone"
            id="c-phone"
            type="tel"
            value={form.phoneNumber || ""}
            onChange={update("phoneNumber")}
            placeholder="0712345678"
            error={errors.phoneNumber}
          />
          <div className="sm:col-span-2">
            <InputField
              label="Website URL"
              id="c-url"
              type="url"
              value={form.websiteURL || ""}
              onChange={update("websiteURL")}
              placeholder="https://company.com"
              error={errors.websiteURL}
            />
          </div>
        </div>
      ),
    },
    {
      num: "03",
      title: "Location",
      gradient: "from-emerald-500 to-teal-500",
      fields: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Country"
            id="c-country"
            required
            value={form.country || ""}
            onChange={update("country")}
            placeholder="United States"
            error={errors.country}
          />
          <InputField
            label="City"
            id="c-city"
            required
            value={form.city || ""}
            onChange={update("city")}
            placeholder="New York"
            error={errors.city}
          />
          <InputField
            label="Address Line 1"
            id="c-add1"
            required
            value={form.addressLine1 || ""}
            onChange={update("addressLine1")}
            placeholder="123 Business Ave"
            error={errors.addressLine1}
          />
          <InputField
            label="Address Line 2"
            id="c-add2"
            value={form.addressLine2 || ""}
            onChange={update("addressLine2")}
            placeholder="Suite 100"
          />
          <InputField
            label="Postal Code"
            id="c-post"
            value={form.postalCode || ""}
            onChange={update("postalCode")}
            placeholder="10001"
            error={errors.postalCode}
          />
        </div>
      ),
    },
    {
      num: "04",
      title: "Description",
      gradient: "from-gray-700 to-gray-500",
      fields: (
        <>
          <InputField
            label="Description"
            as="textarea"
            rows={4}
            maxLength={2000}
            value={form.description || ""}
            onChange={update("description")}
            placeholder="Tell us about your company..."
            error={errors.description}
          />
          <p className="text-xs text-text-muted mt-1.5">
            {(form.description || "").length}/2000
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {isEdit ? "Edit" : "Create"} Company Profile
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Fill in your business details to get verified
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {sections.map((section, i) => (
            <motion.div
              key={section.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-7"
            >
              <h3 className="text-sm font-semibold text-text-primary mb-5 flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-md`}
                >
                  <span className="text-xs font-bold text-white">
                    {section.num}
                  </span>
                </div>
                {section.title}
              </h3>
              {section.fields}
            </motion.div>
          ))}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => navigate("/company")}
              className="px-6 py-3 text-sm border border-[var(--glass-border)] rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="glow-btn px-7 py-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Profile"
                  : "Create Profile"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
