export function CardSkeleton() {
  return (
    <div
      className="dash-stat-card animate-pulse"
      style={{
        padding: "32px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* Avatar skeleton */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "var(--border)",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 16,
              width: "65%",
              background: "var(--border)",
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
          <div
            style={{
              height: 12,
              width: "45%",
              background: "var(--border)",
              borderRadius: 6,
            }}
          />
        </div>
      </div>

      {/* Content lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            height: 14,
            width: "100%",
            background: "var(--border)",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            height: 14,
            width: "82%",
            background: "var(--border)",
            borderRadius: 6,
          }}
        />
        <div
          style={{
            height: 14,
            width: "58%",
            background: "var(--border)",
            borderRadius: 6,
          }}
        />
      </div>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Premium spinner */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "4px solid var(--border)",
            borderTopColor: "var(--accent)",
            animation: "spin 1s linear infinite",
          }}
        />

        <p
          style={{
            fontSize: "14px",
            color: "var(--txt-3)",
            fontWeight: 500,
            letterSpacing: "0.03em",
          }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}

export function Spinner({ size = "md" }) {
  const dimensions = size === "sm" ? "24px" : size === "lg" ? "40px" : "32px";

  return (
    <div
      style={{
        width: dimensions,
        height: dimensions,
        borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "var(--accent)",
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}

/* Add this to your global styles (in injectStyles) if not already present */
const spinnerKeyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
