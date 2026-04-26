import { forwardRef } from "react";

const InputField = forwardRef(
  (
    {
      label,
      error,
      helpText,
      icon,
      type = "text",
      required,
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--txt-2)",
              letterSpacing: "0.02em",
            }}
          >
            {label}
            {required && (
              <span style={{ color: "var(--red)", marginLeft: "4px" }}>*</span>
            )}
          </label>
        )}

        <div style={{ position: "relative" }}>
          {icon && (
            <div
              style={{
                position: "absolute",
                left: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--txt-3)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            style={{
              width: "100%",
              background: "var(--surface)",
              border: error
                ? "1px solid var(--red)"
                : "1px solid var(--border)",
              borderRadius: "16px",
              padding: icon ? "14px 20px 14px 52px" : "14px 20px",
              fontSize: "15px",
              color: "var(--txt-1)",
              fontFamily: "'Sora', system-ui, sans-serif",
              transition: "border-color 180ms, box-shadow 180ms",
            }}
            className={className}
            onFocus={(e) => {
              e.target.style.borderColor = error
                ? "var(--red)"
                : "var(--accent)";
              e.target.style.boxShadow = `0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error
                ? "var(--red)"
                : "var(--border)";
              e.target.style.boxShadow = "none";
            }}
            {...props}
          />
        </div>

        {error && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "12px",
              color: "var(--red)",
              fontWeight: 500,
            }}
          >
            {error}
          </p>
        )}

        {helpText && !error && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "12px",
              color: "var(--txt-3)",
            }}
          >
            {helpText}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";
export default InputField;
