import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../api";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import FileUpload from "../components/ui/FileUpload";
import SkillsInput from "../components/ui/SkillsInput";
import toast from "react-hot-toast";

/* ─── Animation Variants ─────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const schema = yup.object({
  phone: yup.string().nullable(),
  dob: yup.string().nullable(),
  bio: yup.string().max(1000, "Bio cannot exceed 1000 characters").nullable(),
  location: yup.string().nullable(),
  website: yup
    .string()
    .url("Must be a valid URL (include https://)")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  linkedin: yup
    .string()
    .url("Must be a valid URL (include https://)")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  github: yup
    .string()
    .url("Must be a valid URL (include https://)")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});

export default function EditProfile() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const bio = watch("bio", "");

  useEffect(() => {
    setCharCount((bio || "").length);
  }, [bio]);

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || "",
        dob: profile.dob
          ? new Date(profile.dob).toISOString().split("T")[0]
          : "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
      });
      setSkills(profile.skills || []);
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") formData.append(k, v);
      });

      skills.forEach((s) => formData.append("skills", s));
      if (profileImageFile) formData.append("profileImage", profileImageFile);
      if (resumeFile) formData.append("resume", resumeFile);

      if (profile) {
        await profileAPI.update(formData);
        toast.success("Profile updated successfully! ✨");
      } else {
        await profileAPI.create(formData);
        toast.success("Profile created! 🎉");
      }

      await refreshProfile();
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    }
  };

  return (
    <div
      className="dash-sans"
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "48px 24px",
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Page Header */}
        <motion.div
          variants={item}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              className="dash-serif"
              style={{
                fontSize: 32,
                lineHeight: 1.1,
                margin: 0,
                color: "var(--txt-1)",
                fontWeight: 400,
              }}
            >
              Edit Profile
            </h1>
            <p
              style={{ margin: "8px 0 0", color: "var(--txt-2)", fontSize: 15 }}
            >
              Keep your profile up to date to get noticed by opportunities
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => navigate("/profile")}
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
        </motion.div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Account Information */}
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ padding: 32 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div className="accent-dot" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--txt-3)",
                }}
              >
                Account Information
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <InputField
                label="Full Name"
                value={user?.name || ""}
                disabled
                helpText="Name cannot be changed here"
                icon={
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
              />
              <InputField
                label="Email"
                value={user?.email || ""}
                disabled
                helpText="Email cannot be changed"
                icon={
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
            </div>
          </motion.div>

          {/* Profile Photo */}
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ padding: 32 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div className="accent-dot" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--txt-3)",
                }}
              >
                Profile Photo
              </h2>
            </div>
            <FileUpload
              label="Profile Picture"
              type="image"
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
              currentFile={profile?.profileImage || null}
              onFileSelect={setProfileImageFile}
            />
          </motion.div>

          {/* Personal Information */}
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ padding: 32 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div className="accent-dot" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--txt-3)",
                }}
              >
                Personal Information
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <InputField
                label="Phone Number"
                type="tel"
                placeholder="+94 77 123 4567"
                error={errors.phone?.message}
                icon={
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
                {...register("phone")}
              />
              <InputField
                label="Date of Birth"
                type="date"
                error={errors.dob?.message}
                icon={
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                {...register("dob")}
              />
              <InputField
                label="Location"
                type="text"
                placeholder="Colombo, Sri Lanka"
                error={errors.location?.message}
                icon={
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
                {...register("location")}
              />
            </div>

            {/* Bio */}
            <div style={{ marginTop: 28 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--txt-2)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Bio / Professional Summary
              </label>
              <textarea
                rows={5}
                placeholder="Tell recruiters and opportunities about yourself..."
                className="dash-sans"
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  fontSize: 15,
                  color: "var(--txt-1)",
                  resize: "vertical",
                  minHeight: 120,
                }}
                {...register("bio")}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: charCount > 950 ? "var(--red)" : "var(--txt-3)",
                  }}
                >
                  {charCount}/1000
                </span>
              </div>
              {errors.bio && (
                <p style={{ color: "var(--red)", fontSize: 12, marginTop: 6 }}>
                  {errors.bio.message}
                </p>
              )}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ padding: 32 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div className="accent-dot" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--txt-3)",
                }}
              >
                Skills
              </h2>
            </div>
            <SkillsInput value={skills} onChange={setSkills} />
          </motion.div>

          {/* Resume */}
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ padding: 32 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div className="accent-dot" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--txt-3)",
                }}
              >
                Resume
              </h2>
            </div>
            <FileUpload
              label="PDF Resume"
              type="pdf"
              accept={{ "application/pdf": [".pdf"] }}
              currentFile={profile?.resume || null}
              onFileSelect={setResumeFile}
            />
          </motion.div>

          {/* Online Presence */}
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ padding: 32 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <div className="accent-dot" />
              <h2
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--txt-3)",
                }}
              >
                Online Presence
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <InputField
                label="Personal Website"
                type="url"
                placeholder="https://yourwebsite.com"
                error={errors.website?.message}
                icon={
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                }
                {...register("website")}
              />
              <InputField
                label="LinkedIn Profile"
                type="url"
                placeholder="https://linkedin.com/in/yourusername"
                error={errors.linkedin?.message}
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                  </svg>
                }
                {...register("linkedin")}
              />
              <InputField
                label="GitHub Profile"
                type="url"
                placeholder="https://github.com/yourusername"
                error={errors.github?.message}
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                }
                {...register("github")}
              />
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            variants={item}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 12,
            }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/profile")}
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              size="lg"
              style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600 }}
            >
              Save Profile Changes
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
