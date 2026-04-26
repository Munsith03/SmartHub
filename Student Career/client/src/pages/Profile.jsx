import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../api";
import { CardSkeleton } from "../components/ui/Loader";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import toast from "react-hot-toast";

/* ─── Animation Variants ─────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Profile() {
  const { user, profile, profileLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await profileAPI.delete();
      await logout();
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  if (profileLoading) {
    return (
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <CardSkeleton />
        <div style={{ height: 40 }} />
        <CardSkeleton />
      </div>
    );
  }

  const avatarSrc = profile?.profileImage
    ? profile.profileImage
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "U",
      )}&background=111110&color=D4FF4E&size=200&bold=true`;

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
        style={{ display: "flex", flexDirection: "column", gap: 28 }}
      >
        {/* ── HERO PROFILE CARD ── */}
        <motion.div variants={item}>
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.12)",
              background:
                "linear-gradient(135deg, #111110 0%, #1F1F1B 60%, #2A2A1E 100%)",
              position: "relative",
            }}
          >
            {/* Subtle grid overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(212,255,78,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,255,78,0.04) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                padding: "40px 40px 36px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 28 }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 22,
                      objectFit: "cover",
                      border: "3px solid rgba(212,255,78,0.3)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 6,
                      right: 6,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      border: "3px solid #111110",
                    }}
                  />
                </div>

                {/* Name & Bio */}
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <h1
                    className="dash-serif"
                    style={{
                      margin: 0,
                      fontSize: 36,
                      lineHeight: 1.05,
                      color: "#F5F5F0",
                      fontWeight: 400,
                    }}
                  >
                    {user?.name}
                  </h1>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "rgba(245,245,240,0.5)",
                      fontSize: 15,
                    }}
                  >
                    {user?.email}
                  </p>

                  {profile?.bio && (
                    <p
                      style={{
                        margin: "16px 0 0",
                        color: "rgba(245,245,240,0.75)",
                        fontSize: 15,
                        lineHeight: 1.6,
                        maxWidth: "580px",
                      }}
                    >
                      {profile.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {profile?.skills?.length > 0 && (
                    <div
                      style={{
                        marginTop: 20,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {profile.skills.map((skill, i) => (
                        <span
                          key={i}
                          style={{
                            background:
                              "color-mix(in srgb, var(--accent) 12%, transparent)",
                            color: "var(--accent-fg)",
                            padding: "6px 14px",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                  <Link to="/edit-profile">
                    <button className="hero-btn-outline">Edit Profile</button>
                  </Link>
                  {profile?.resume && (
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-btn-accent"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── PERSONAL INFORMATION CARD ── */}
        <motion.div
          variants={item}
          className="dash-stat-card"
          style={{ padding: 32 }}
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "28px 40px",
            }}
          >
            {/* Phone */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--txt-3)",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                }}
              >
                PHONE
              </p>
              <p
                style={{ fontSize: 16, color: "var(--txt-1)", fontWeight: 500 }}
              >
                {profile?.phone || (
                  <span style={{ color: "var(--txt-3)", fontStyle: "italic" }}>
                    Not provided
                  </span>
                )}
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--txt-3)",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                }}
              >
                DATE OF BIRTH
              </p>
              <p
                style={{ fontSize: 16, color: "var(--txt-1)", fontWeight: 500 }}
              >
                {profile?.dob ? (
                  new Date(profile.dob).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                ) : (
                  <span style={{ color: "var(--txt-3)", fontStyle: "italic" }}>
                    Not provided
                  </span>
                )}
              </p>
            </div>

            {/* Location */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--txt-3)",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                }}
              >
                LOCATION
              </p>
              <p
                style={{ fontSize: 16, color: "var(--txt-1)", fontWeight: 500 }}
              >
                {profile?.location || (
                  <span style={{ color: "var(--txt-3)", fontStyle: "italic" }}>
                    Not provided
                  </span>
                )}
              </p>
            </div>

            {/* Member Since */}
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--txt-3)",
                  marginBottom: 6,
                  letterSpacing: "0.04em",
                }}
              >
                MEMBER SINCE
              </p>
              <p
                style={{ fontSize: 16, color: "var(--txt-1)", fontWeight: 500 }}
              >
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── LINKS CARD ── */}
        {(profile?.website || profile?.linkedin || profile?.github) && (
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ padding: 32 }}
          >
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                  Online Links
                </h2>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-action-card"
                  style={{ textDecoration: "none" }}
                >
                  <div className="icon-chip">🌐</div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "var(--txt-1)",
                      }}
                    >
                      Website
                    </p>
                    <p
                      style={{
                        margin: 4,
                        fontSize: 14,
                        color: "var(--txt-2)",
                        wordBreak: "break-all",
                      }}
                    >
                      {profile.website}
                    </p>
                  </div>
                  <svg
                    className="arrow-icon"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L9 15"
                    />
                  </svg>
                </a>
              )}

              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-action-card"
                  style={{ textDecoration: "none" }}
                >
                  <div className="icon-chip" style={{ color: "#0A66C2" }}>
                    in
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "var(--txt-1)",
                      }}
                    >
                      LinkedIn
                    </p>
                    <p
                      style={{ margin: 4, fontSize: 14, color: "var(--txt-2)" }}
                    >
                      Professional Profile
                    </p>
                  </div>
                  <svg
                    className="arrow-icon"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L9 15"
                    />
                  </svg>
                </a>
              )}

              {profile?.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-action-card"
                  style={{ textDecoration: "none" }}
                >
                  <div className="icon-chip">🐙</div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "var(--txt-1)",
                      }}
                    >
                      GitHub
                    </p>
                    <p
                      style={{ margin: 4, fontSize: 14, color: "var(--txt-2)" }}
                    >
                      Developer Profile
                    </p>
                  </div>
                  <svg
                    className="arrow-icon"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L9 15"
                    />
                  </svg>
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* ── DANGER ZONE ── */}
        <motion.div variants={item}>
          <div
            className="dash-stat-card"
            style={{
              borderColor: "var(--red)",
              background: "color-mix(in srgb, var(--red) 4%, var(--surface))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ color: "var(--red)", fontSize: 20 }}>⚠︎</div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "var(--red)",
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  Danger Zone
                </h3>
                <p style={{ margin: 4, fontSize: 13, color: "var(--txt-2)" }}>
                  Permanently delete your account and all data
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              onClick={() => setDeleteModal(true)}
              style={{
                background: "var(--red)",
                color: "#fff",
                border: "none",
              }}
            >
              Delete my account
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Account"
        onConfirm={handleDelete}
        confirmText="Yes, delete my account"
        confirmVariant="danger"
        loading={deleting}
      >
        <p>
          Are you sure you want to permanently delete your account? All your
          profile data, resume, and profile image will be deleted.{" "}
          <strong>This action cannot be undone.</strong>
        </p>
      </Modal>
    </div>
  );
}
