import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar({ darkMode, toggleDark }) {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const avatarSrc = profile?.profileImage
    ? profile.profileImage
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=111110&color=D4FF4E&size=128&bold=true`;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 76,
          }}
        >
          {/* Logo */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent)",
              }}
            >
              <span
                style={{
                  color: "var(--accent-fg)",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                SP
              </span>
            </div>
            <span
              className="dash-serif"
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: "var(--txt-1)",
                letterSpacing: "-0.02em",
              }}
            >
              StudentProfile
            </span>
          </Link>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--txt-2)",
                cursor: "pointer",
                transition: "all 180ms",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--txt-2)";
              }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "6px 8px 6px 6px",
                    borderRadius: 16,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "border-color 180ms",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = "var(--accent)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      objectFit: "cover",
                      border: "2px solid var(--accent)",
                    }}
                  />
                  <div
                    style={{
                      textAlign: "left",
                      display: "none",
                      sm: { display: "block" },
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--txt-1)",
                      }}
                    >
                      {user?.name?.split(" ")[0]}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: "var(--txt-3)",
                      transition: "transform 200ms",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 10,
                      }}
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 68,
                        width: 220,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 20,
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                        zIndex: 20,
                      }}
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="dash-action-card"
                        style={{
                          border: "none",
                          padding: "14px 20px",
                          borderRadius: 0,
                        }}
                      >
                        <div style={{ color: "var(--txt-2)" }}>🏠</div>
                        <span
                          style={{ fontWeight: 500, color: "var(--txt-1)" }}
                        >
                          Dashboard
                        </span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="dash-action-card"
                        style={{
                          border: "none",
                          padding: "14px 20px",
                          borderRadius: 0,
                        }}
                      >
                        <div style={{ color: "var(--txt-2)" }}>👤</div>
                        <span
                          style={{ fontWeight: 500, color: "var(--txt-1)" }}
                        >
                          My Profile
                        </span>
                      </Link>

                      <Link
                        to="/edit-profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="dash-action-card"
                        style={{
                          border: "none",
                          padding: "14px 20px",
                          borderRadius: 0,
                        }}
                      >
                        <div style={{ color: "var(--txt-2)" }}>✏️</div>
                        <span
                          style={{ fontWeight: 500, color: "var(--txt-1)" }}
                        >
                          Edit Profile
                        </span>
                      </Link>

                      <Link
                        to="/feed"
                        onClick={() => setUserMenuOpen(false)}
                        className="dash-action-card"
                        style={{
                          border: "none",
                          padding: "14px 20px",
                          borderRadius: 0,
                        }}
                      >
                        <div style={{ color: "var(--txt-2)" }}>📝</div>
                        <span
                          style={{ fontWeight: 500, color: "var(--txt-1)" }}
                        >
                          Activity Feed
                        </span>
                      </Link>

                      <div
                        style={{
                          height: 1,
                          background: "var(--border)",
                          margin: "4px 0",
                        }}
                      />

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "14px 20px",
                          color: "var(--red)",
                          fontWeight: 500,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          transition: "background 180ms",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background =
                            "color-mix(in srgb, var(--red) 8%, transparent)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
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
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link
                  to="/login"
                  className="hero-btn-outline"
                  style={{ padding: "9px 18px", fontSize: 13 }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hero-btn-accent"
                  style={{ padding: "9px 20px", fontSize: 13 }}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
