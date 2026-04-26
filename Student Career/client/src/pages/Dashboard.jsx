import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { CardSkeleton } from "../components/ui/Loader";
import Button from "../components/ui/Button";

/* ─── Google Fonts injection ────────────────────────────── */
const fontLink = document.getElementById("dash-fonts");
if (!fontLink) {
  const el = document.createElement("link");
  el.id = "dash-fonts";
  el.rel = "stylesheet";
  el.href =
    "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@300;400;500;600&display=swap";
  document.head.appendChild(el);
}

/* ─── CSS variables & global resets ─────────────────────── */
const injectStyles = () => {
  if (document.getElementById("dash-styles")) return;
  const style = document.createElement("style");
  style.id = "dash-styles";
  style.textContent = `
    :root {
      --bg:       #F9F8F5;
      --surface:  #FFFFFF;
      --border:   #E5E4DF;
      --border-hover: #C8C6BF;
      --txt-1:    #111110;
      --txt-2:    #7A7A72;
      --txt-3:    #B0AFA8;
      --accent:   #D4FF4E;
      --accent-fg:#1A1A0E;
      --emerald:  #00C896;
      --amber:    #F59E0B;
      --red:      #EF4444;
    }
    .dark {
      --bg:       #111110;
      --surface:  #191918;
      --border:   #2A2A27;
      --border-hover: #3D3D38;
      --txt-1:    #F5F5F0;
      --txt-2:    #8A8A82;
      --txt-3:    #4A4A45;
      --accent:   #D4FF4E;
      --accent-fg:#111110;
    }

    .dash-serif { font-family: 'Instrument Serif', Georgia, serif; }
    .dash-sans  { font-family: 'Sora', system-ui, sans-serif; }

    .dash-stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      transition: border-color 200ms;
    }
    .dash-stat-card:hover { border-color: var(--border-hover); }

    .dash-action-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 18px;
      text-decoration: none;
      transition: border-color 200ms, background 200ms;
    }
    .dash-action-card:hover {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 4%, var(--surface));
    }

    .accent-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
    }

    .progress-bar {
      height: 3px;
      background: var(--border);
      border-radius: 99px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 99px;
    }

    .badge-warn {
      font-family: 'Sora', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.03em;
      padding: 4px 10px;
      border-radius: 99px;
      background: color-mix(in srgb, var(--amber) 12%, transparent);
      color: var(--amber);
    }
    .badge-miss {
      font-family: 'Sora', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.03em;
      padding: 4px 10px;
      border-radius: 99px;
      background: color-mix(in srgb, var(--red) 10%, transparent);
      color: var(--red);
    }

    .hero-btn-outline {
      font-family: 'Sora', sans-serif;
      font-size: 13px;
      font-weight: 500;
      padding: 9px 18px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.25);
      color: rgba(255,255,255,0.85);
      background: transparent;
      cursor: pointer;
      transition: background 180ms, border-color 180ms;
      text-decoration: none;
      display: inline-block;
    }
    .hero-btn-outline:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.4);
    }
    .hero-btn-accent {
      font-family: 'Sora', sans-serif;
      font-size: 13px;
      font-weight: 600;
      padding: 9px 18px;
      border-radius: 12px;
      border: none;
      color: var(--accent-fg);
      background: var(--accent);
      cursor: pointer;
      transition: opacity 180ms;
      text-decoration: none;
      display: inline-block;
    }
    .hero-btn-accent:hover { opacity: 0.88; }

    .icon-chip {
      width: 44px; height: 44px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      border: 1px solid var(--border);
      background: var(--bg);
    }
    .arrow-icon {
      transition: transform 200ms;
      color: var(--txt-3);
    }
    .dash-action-card:hover .arrow-icon {
      transform: translateX(4px);
      color: var(--accent-fg);
    }
    .dark .dash-action-card:hover .arrow-icon { color: var(--accent); }

    @media (max-width: 640px) {
      .stat-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
};
injectStyles();

/* ─── Animation variants ─────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Helpers ────────────────────────────────────────────── */
function pctColor(p) {
  if (p >= 80) return "var(--emerald)";
  if (p >= 50) return "var(--amber)";
  return "var(--red)";
}

/* ─── Sub-components ─────────────────────────────────────── */
function StatCard({ label, value, icon, accent }) {
  return (
    <motion.div
      variants={item}
      className="dash-stat-card dash-sans"
      style={{ color: "var(--txt-1)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--txt-3)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>
      <p
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--txt-1)",
          margin: 0,
        }}
      >
        {value}
      </p>
    </motion.div>
  );
}

function ActionRow({ to, icon, title, subtitle, badge }) {
  return (
    <motion.div variants={item}>
      <Link to={to} className="dash-action-card">
        <div className="icon-chip" style={{ color: "var(--txt-2)" }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 14,
              color: "var(--txt-1)",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 13,
              color: "var(--txt-2)",
              fontFamily: "'Sora', sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </p>
        </div>

        {badge === "Incomplete" && <span className="badge-warn">{badge}</span>}
        {badge === "Missing" && <span className="badge-miss">{badge}</span>}

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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </motion.div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const { user, profile, profileLoading, completionPercentage } = useAuth();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (profileLoading) {
    return (
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <CardSkeleton />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
          className="stat-grid"
        >
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const avatarSrc = profile?.profileImage
    ? profile.profileImage
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=111110&color=D4FF4E&size=200&bold=true`;

  const fillColor = pctColor(completionPercentage);

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
        {/* ── HERO CARD ── */}
        <motion.div
          variants={item}
          style={{
            borderRadius: 24,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.12)",
            background:
              "linear-gradient(135deg, #111110 0%, #1F1F1B 60%, #2A2A1E 100%)",
            padding: "40px 40px 36px",
            position: "relative",
          }}
        >
          {/* Accent grid lines */}
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

          {/* Accent glow blob */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(212,255,78,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            {/* Left: avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={avatarSrc}
                  alt="avatar"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    objectFit: "cover",
                    border: "2px solid rgba(212,255,78,0.3)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    border: "2px solid #111110",
                  }}
                />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(212,255,78,0.7)",
                  }}
                >
                  {greeting} 👋
                </p>
                <h1
                  className="dash-serif"
                  style={{
                    margin: "4px 0 3px",
                    fontSize: 32,
                    lineHeight: 1.1,
                    color: "#F5F5F0",
                    fontWeight: 400,
                  }}
                >
                  {user?.name}
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "rgba(245,245,240,0.4)",
                  }}
                >
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Right: buttons */}
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <Link to="/profile" className="hero-btn-outline">
                View Profile
              </Link>
              <Link to="/edit-profile" className="hero-btn-accent">
                Edit Profile
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── COMPLETION + STATS ROW ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
          className="stat-grid"
        >
          {/* Profile Completion Card */}
          <motion.div
            variants={item}
            className="dash-stat-card"
            style={{ gridColumn: "span 3" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--txt-3)",
                  }}
                >
                  Profile Completion
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "var(--txt-2)",
                  }}
                >
                  Complete your profile to get discovered by opportunities
                </p>
              </div>
              <span
                className="dash-serif"
                style={{
                  fontSize: 44,
                  lineHeight: 1,
                  color: fillColor,
                  fontStyle: "italic",
                }}
              >
                {completionPercentage}%
              </span>
            </div>

            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: fillColor }}
              />
            </div>

            {completionPercentage < 100 && (
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 12,
                  color: "var(--txt-3)",
                }}
              >
                {completionPercentage < 40
                  ? "Just getting started — fill in the basics to stand out."
                  : completionPercentage < 70
                    ? "Looking good. A few more details will make a big difference."
                    : "Almost there. Just a couple of fields remaining."}
              </p>
            )}
          </motion.div>

          {/* Stat Cards - Modern & Professional */}
          <StatCard
            label="Skills Listed"
            value={profile?.skills?.length ?? 0}
            accent="var(--accent-fg, #111110)"
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"
                />
              </svg>
            }
          />
          <StatCard
            label="Resume"
            value={profile?.resume ? "Uploaded ✓" : "Not uploaded"}
            accent="var(--emerald)"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
          <StatCard
            label="Profile Photo"
            value={profile?.profileImage ? "Uploaded ✓" : "Not set"}
            accent="var(--amber)"
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
        </div>

        {/* ── QUICK ACTIONS ── */}
        <motion.div variants={item}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div className="accent-dot" />
            <h2
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--txt-3)",
              }}
            >
              Quick Actions
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ActionRow
              to="/edit-profile"
              title="Edit Profile"
              subtitle="Update your personal information, bio, and skills"
              badge={completionPercentage < 100 ? "Incomplete" : undefined}
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            />
            <ActionRow
              to="/edit-profile"
              title="Upload Resume"
              subtitle={
                profile?.resume
                  ? "Update your existing PDF resume"
                  : "Upload your PDF resume to showcase your work"
              }
              badge={!profile?.resume ? "Missing" : undefined}
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              }
            />
            <ActionRow
              to="/profile"
              title="View Public Profile"
              subtitle="See how your profile appears to recruiters and others"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              }
            />
            <ActionRow
              to="/feed"
              title="Activity Feed"
              subtitle="Share updates, interact with posts, and connect with peers"
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
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2h-2z"
                  />
                </svg>
              }
            />
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          variants={item}
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--txt-3)",
            textAlign: "center",
            paddingBottom: 8,
          }}
        >
          Profile data syncs automatically · Last updated just now
        </motion.p>
      </motion.div>
    </div>
  );
}
