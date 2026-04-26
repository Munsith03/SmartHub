import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SkillsInput({ value = [], onChange, error }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const addSkill = (raw) => {
    const skill = raw.trim();
    if (!skill || value.includes(skill) || value.length >= 20) return;
    onChange([...value, skill]);
    setInput("");
  };

  const removeSkill = (skill) => onChange(value.filter((s) => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      removeSkill(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--txt-2)",
          letterSpacing: "0.02em",
        }}
      >
        Skills
      </label>

      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          minHeight: "58px",
          background: "var(--surface)",
          border: error ? "1px solid var(--red)" : "1px solid var(--border)",
          borderRadius: "16px",
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          cursor: "text",
          transition: "border-color 180ms, box-shadow 180ms",
        }}
        onFocus={() => {
          // This is handled via focus-within in the container
        }}
      >
        <AnimatePresence>
          {value.map((skill) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                background:
                  "color-mix(in srgb, var(--accent) 12%, transparent)",
                color: "var(--accent-fg)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {skill}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(skill);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  color: "inherit",
                  opacity: 0.7,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "0.7")}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(input)}
          placeholder={
            value.length ? "" : "Type a skill and press Enter or comma..."
          }
          style={{
            flex: 1,
            minWidth: "140px",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "15px",
            color: "var(--txt-1)",
            padding: "8px 4px",
          }}
        />
      </div>

      {error ? (
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
      ) : (
        <p
          style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--txt-3)" }}
        >
          Press Enter or comma to add • Maximum 20 skills
        </p>
      )}
    </div>
  );
}
