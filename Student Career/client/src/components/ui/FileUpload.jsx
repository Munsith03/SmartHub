import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";

export default function FileUpload({
  onFileSelect,
  accept,
  label,
  currentFile,
  type = "image", // 'image' | 'pdf'
  error,
}) {
  const [localPreview, setLocalPreview] = useState(null);

  const onDrop = (accepted) => {
    if (!accepted.length) return;
    const file = accepted[0];
    onFileSelect(file);

    if (type === "image") {
      const reader = new FileReader();
      reader.onload = (e) => setLocalPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setLocalPreview(file.name);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const displayPreview = localPreview || currentFile;

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
        </label>
      )}

      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${error ? "var(--red)" : isDragActive ? "var(--accent)" : "var(--border)"}`,
          background: isDragActive
            ? "color-mix(in srgb, var(--accent) 6%, var(--surface))"
            : "var(--surface)",
          borderRadius: "20px",
          padding: "32px 24px",
          minHeight: "168px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {/* Image Preview */}
          {type === "image" && displayPreview ? (
            <motion.div
              key="image-preview"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              style={{ position: "relative" }}
            >
              <img
                src={displayPreview}
                alt="Preview"
                style={{
                  width: "108px",
                  height: "108px",
                  borderRadius: "20px",
                  objectFit: "cover",
                  border: "3px solid var(--accent)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -6,
                  right: -6,
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                ✓
              </div>
            </motion.div>
          ) : /* PDF Preview */
          type === "pdf" && displayPreview ? (
            <motion.div
              key="pdf-preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  background: "color-mix(in srgb, var(--red) 12%, transparent)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={34} color="var(--red)" strokeWidth={1.8} />
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--txt-1)",
                  fontWeight: 500,
                  textAlign: "center",
                  maxWidth: "220px",
                  wordBreak: "break-all",
                }}
              >
                {typeof displayPreview === "string"
                  ? displayPreview.split("/").pop()
                  : displayPreview}
              </p>
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "18px",
                  background: isDragActive
                    ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                    : "var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke={isDragActive ? "var(--accent)" : "var(--txt-3)"}
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--txt-1)",
                    marginBottom: 4,
                  }}
                >
                  {isDragActive
                    ? "Drop your file here"
                    : "Drag & drop or click to upload"}
                </p>
                <p style={{ fontSize: "13px", color: "var(--txt-3)" }}>
                  {type === "image"
                    ? "PNG, JPG, JPEG, WEBP • Max 10MB"
                    : "PDF only • Max 10MB"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p
          style={{
            marginTop: 6,
            fontSize: "12px",
            color: "var(--red)",
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
