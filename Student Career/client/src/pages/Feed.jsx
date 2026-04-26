import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../api";
import toast from "react-hot-toast";
import {
  ThumbsUp,
  Heart,
  PartyPopper,
  Lightbulb,
  Laugh
} from "lucide-react";

/* ─── Constants ──────────────────────────────────────────── */
const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "celebrate", emoji: "👏", label: "Celebrate" },
  { type: "insightful", emoji: "💡", label: "Insightful" },
  { type: "funny", emoji: "😂", label: "Funny" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Helpers ────────────────────────────────────────────── */
function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  if (dy < 7) return `${dy}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function avatar(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=111110&color=D4FF4E&size=128&bold=true`;
}

/* ─── Reaction Picker ────────────────────────────────────── */
function ReactionPicker({ onReact, currentReaction }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const current = REACTIONS.find((r) => r.type === currentReaction);

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => { clearTimeout(timeoutRef.current); setOpen(true); }}
      onMouseLeave={() => { timeoutRef.current = setTimeout(() => setOpen(false), 300); }}
    >
      <button
        onClick={() => onReact(currentReaction ? currentReaction : "like")}
        style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
          borderRadius: 10, border: "none",
          background: currentReaction ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
          color: currentReaction ? "var(--accent-fg)" : "var(--txt-2)",
          fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 200ms",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        <span style={{ fontSize: 16 }}>{current ? current.emoji : "👍"}</span>
        {current ? current.label : "Like"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", bottom: "110%", left: 0, display: "flex", gap: 4,
              padding: "8px 10px", borderRadius: 30,
              background: "var(--surface)", border: "1px solid var(--border)",
              boxShadow: "0 12px 40px -8px rgba(0,0,0,0.2)", zIndex: 30,
              whiteSpace: "nowrap",
            }}
          >
            {REACTIONS.map((r) => (
              <motion.button
                key={r.type}
                whileHover={{ scale: 1.35, y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { onReact(r.type); setOpen(false); }}
                title={r.label}
                style={{
                  width: 38, height: 38, borderRadius: "50%", border: "none",
                  background: currentReaction === r.type ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "transparent",
                  fontSize: 20, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", transition: "background 150ms",
                }}
              >
                {r.emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Reaction Summary (who reacted) ─────────────────────── */
function ReactionSummary({ reactions }) {
  if (!reactions || reactions.length === 0) return null;
  const grouped = {};
  reactions.forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r.user?.name || "Someone");
  });
  const emojis = Object.keys(grouped).map((t) => REACTIONS.find((r) => r.type === t)?.emoji).filter(Boolean);
  const names = reactions.slice(0, 3).map((r) => r.user?.name?.split(" ")[0] || "Someone");
  const rest = reactions.length - names.length;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px 10px", fontSize: 12, color: "var(--txt-3)", fontFamily: "'Sora', sans-serif" }}>
      <span style={{ display: "flex", gap: 2 }}>{emojis.map((e, i) => <span key={i}>{e}</span>)}</span>
      <span>{names.join(", ")}{rest > 0 ? ` and ${rest} other${rest > 1 ? "s" : ""}` : ""}</span>
    </div>
  );
}

/* ─── Poll Component ─────────────────────────────────────── */
function PollView({ poll, postId, currentUserId, onUpdate }) {
  const [voting, setVoting] = useState(false);
  const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0);
  const userVotedOption = poll.options.find((o) => o.votes.some((v) => (v._id || v) === currentUserId));

  const handleVote = async (optionId) => {
    if (voting) return;
    setVoting(true);
    try {
      const { data } = await postsAPI.votePoll(postId, optionId);
      onUpdate(data.post);
    } catch { toast.error("Failed to vote"); }
    finally { setVoting(false); }
  };

  return (
    <div style={{ padding: "0 24px 16px" }}>
      <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600, color: "var(--txt-1)", fontFamily: "'Sora', sans-serif" }}>
        📊 {poll.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {poll.options.map((opt) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
          const isVoted = opt.votes.some((v) => (v._id || v) === currentUserId);
          return (
            <motion.button
              key={opt._id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote(opt._id)}
              disabled={voting}
              style={{
                position: "relative", overflow: "hidden", padding: "12px 16px",
                borderRadius: 12, border: `1.5px solid ${isVoted ? "var(--accent)" : "var(--border)"}`,
                background: "var(--bg)", cursor: "pointer", textAlign: "left",
                fontFamily: "'Sora', sans-serif", transition: "all 200ms",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  position: "absolute", top: 0, left: 0, bottom: 0,
                  background: isVoted ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "color-mix(in srgb, var(--txt-3) 8%, transparent)",
                  borderRadius: 10,
                }}
              />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: isVoted ? 600 : 500, color: "var(--txt-1)" }}>
                  {isVoted && "✓ "}{opt.text}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: isVoted ? "var(--accent-fg)" : "var(--txt-3)" }}>
                  {pct}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--txt-3)", fontFamily: "'Sora', sans-serif" }}>
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

/* ─── Tag Pills ──────────────────────────────────────────── */
function TagPills({ tags, activeTag, onTagClick }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 24px 10px" }}>
      {tags.map((t) => (
        <button
          key={t} onClick={() => onTagClick(t)}
          style={{
            padding: "4px 12px", borderRadius: 99, border: "none",
            background: activeTag === t ? "var(--accent)" : "color-mix(in srgb, var(--accent) 10%, transparent)",
            color: activeTag === t ? "var(--accent-fg)" : "var(--txt-2)",
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif",
            transition: "all 180ms",
          }}
        >
          #{t}
        </button>
      ))}
    </div>
  );
}

/* ─── CreatePostCard ─────────────────────────────────────── */
function CreatePostCard({ user, onPostCreated }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (t && !tags.includes(t) && tags.length < 5) { setTags([...tags, t]); setTagInput(""); }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      if (imageFile) formData.append("image", imageFile);
      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));
      if (showPoll && pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2) {
        formData.append("pollQuestion", pollQuestion.trim());
        formData.append("pollOptions", JSON.stringify(pollOptions.filter((o) => o.trim())));
      }
      const { data } = await postsAPI.create(formData);
      onPostCreated(data.post);
      setContent(""); setImageFile(null); setImagePreview(null);
      setTags([]); setShowPoll(false); setPollQuestion(""); setPollOptions(["", ""]);
      setFocused(false);
      toast.success("Post published! 🚀");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create post"); }
    finally { setLoading(false); }
  };

  const btnStyle = (active) => ({
    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
    borderRadius: 10, border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "var(--bg)",
    color: active ? "var(--accent-fg)" : "var(--txt-2)",
    fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 180ms",
    fontFamily: "'Sora', sans-serif",
  });

  return (
    <motion.div variants={item} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <img src={avatar(user?.name)} alt="avatar" style={{ width: 42, height: 42, borderRadius: 12, objectFit: "cover", border: "2px solid var(--accent)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)} onFocus={() => setFocused(true)}
            placeholder="What's on your mind? Share an update..." maxLength={2000} rows={focused ? 4 : 2}
            style={{
              width: "100%", resize: "none", border: "1px solid var(--border)", borderRadius: 14,
              padding: "14px 16px", fontSize: 14, fontFamily: "'Sora', sans-serif",
              background: "var(--bg)", color: "var(--txt-1)", outline: "none", transition: "all 200ms",
              ...(focused && { borderColor: "var(--accent)" }),
            }}
          />

          {imagePreview && (
            <div style={{ position: "relative", marginTop: 12 }}>
              <img src={imagePreview} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }} />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>×</button>
            </div>
          )}

          {/* Tags display */}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {tags.map((t) => (
                <span key={t} style={{ padding: "3px 10px", borderRadius: 99, background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent-fg)", fontSize: 12, fontWeight: 600, fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                  #{t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Poll builder */}
          <AnimatePresence>
            {showPoll && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 12, padding: 16, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg)" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-1)", fontFamily: "'Sora', sans-serif" }}>📊 Create Poll</span>
                  <button onClick={() => setShowPoll(false)} style={{ background: "none", border: "none", color: "var(--txt-3)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
                <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Ask a question..." maxLength={200}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--txt-1)", fontSize: 13, outline: "none", marginBottom: 8, fontFamily: "'Sora', sans-serif" }}
                />
                {pollOptions.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input value={o} onChange={(e) => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                      placeholder={`Option ${i + 1}`} maxLength={100}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--txt-1)", fontSize: 13, outline: "none", fontFamily: "'Sora', sans-serif" }}
                    />
                    {pollOptions.length > 2 && (
                      <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} style={{ width: 32, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--red)", cursor: "pointer", fontSize: 14 }}>×</button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 5 && (
                  <button onClick={() => setPollOptions([...pollOptions, ""])} style={{ ...btnStyle(false), padding: "6px 12px", fontSize: 12, marginTop: 4 }}>+ Add option</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions row */}
          {(focused || content.trim()) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 8 }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <label style={btnStyle(!!imageFile)}>
                  📷 Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </label>
                <button onClick={() => setShowPoll(!showPoll)} style={btnStyle(showPoll)}>📊 Poll</button>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="#tag" maxLength={20}
                    style={{ width: 70, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--txt-2)", fontSize: 12, outline: "none", fontFamily: "'Sora', sans-serif" }}
                  />
                  {tagInput.trim() && <button onClick={addTag} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "var(--accent-fg)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+</button>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: content.length > 1800 ? "var(--red)" : "var(--txt-3)" }}>{content.length}/2000</span>
                <button onClick={handleSubmit} disabled={!content.trim() || loading}
                  style={{ padding: "8px 22px", borderRadius: 10, border: "none", background: content.trim() ? "var(--accent)" : "var(--border)", color: content.trim() ? "var(--accent-fg)" : "var(--txt-3)", fontWeight: 600, fontSize: 13, cursor: content.trim() ? "pointer" : "default", transition: "all 180ms", opacity: loading ? 0.6 : 1, fontFamily: "'Sora', sans-serif" }}>
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── PostCard ─────────────────────────────────────────────── */
function PostCard({ post, currentUserId, onUpdate, onDelete, onTagClick, activeTag }) {
  const myReaction = post.reactions?.find((r) => (r.user?._id || r.user) === currentUserId)?.type || null;
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarks?.some((id) => (id._id || id) === currentUserId));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editLoading, setEditLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const isOwner = post.author?._id === currentUserId;

  const handleReaction = async (type) => {
    try {
      const { data } = await postsAPI.toggleReaction(post._id, type);
      onUpdate(data.post);
    } catch { toast.error("Failed to react"); }
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    try {
      const { data } = await postsAPI.toggleBookmark(post._id);
      onUpdate(data.post);
      toast.success(data.bookmarked ? "Post saved 🔖" : "Bookmark removed");
    } catch { setIsBookmarked(isBookmarked); toast.error("Failed to bookmark"); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const { data } = await postsAPI.addComment(post._id, commentText.trim());
      setComments(data.post.comments); setCommentText("");
    } catch { toast.error("Failed to add comment"); }
    finally { setCommentLoading(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await postsAPI.deleteComment(post._id, commentId);
      setComments(data.post.comments); toast.success("Comment deleted");
    } catch { toast.error("Failed to delete comment"); }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", editContent.trim());
      const { data } = await postsAPI.update(post._id, formData);
      onUpdate(data.post); setIsEditing(false); toast.success("Post updated ✏️");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update post"); }
    finally { setEditLoading(false); }
  };

  const handleDelete = async () => {
    try { await postsAPI.delete(post._id); onDelete(post._id); toast.success("Post deleted 🗑️"); }
    catch { toast.error("Failed to delete post"); }
  };

  return (
    <motion.div variants={item} layout style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", transition: "border-color 200ms" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={avatar(post.author?.name)} alt={post.author?.name} style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover", border: "1.5px solid var(--border)" }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--txt-1)", fontFamily: "'Sora', sans-serif" }}>{post.author?.name}</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--txt-3)", fontFamily: "'Sora', sans-serif" }}>{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Bookmark */}
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleBookmark} title={isBookmarked ? "Remove bookmark" : "Save post"}
            style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isBookmarked ? "var(--accent-fg)" : "var(--txt-3)", transition: "all 180ms" }}>
            <svg width="18" height="18" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </motion.button>
          {/* Owner menu */}
          {isOwner && (
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowMenu(!showMenu)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent", color: "var(--txt-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
              </button>
              {showMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ position: "absolute", right: 0, top: 38, width: 140, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 12px 30px -8px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 20 }}>
                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", color: "var(--txt-1)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>✏️ Edit</button>
                    <button onClick={() => { setDeleteConfirm(true); setShowMenu(false); }}
                      style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", color: "var(--red)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>🗑️ Delete</button>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ margin: "12px 24px 0", padding: "14px 18px", borderRadius: 12, background: "color-mix(in srgb, var(--red) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--red) 20%, transparent)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--red)", fontWeight: 500, fontFamily: "'Sora', sans-serif" }}>Delete this post?</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setDeleteConfirm(false)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--txt-2)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "var(--red)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>Delete</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ padding: "16px 24px" }}>
        {isEditing ? (
          <div>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} maxLength={2000} rows={4}
              style={{ width: "100%", resize: "none", border: "1px solid var(--accent)", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontFamily: "'Sora', sans-serif", background: "var(--bg)", color: "var(--txt-1)", outline: "none" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
              <button onClick={() => { setIsEditing(false); setEditContent(post.content); }} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--txt-2)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>Cancel</button>
              <button onClick={handleEdit} disabled={!editContent.trim() || editLoading} style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: "var(--accent)", color: "var(--accent-fg)", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: editLoading ? 0.6 : 1, fontFamily: "'Sora', sans-serif" }}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "var(--txt-1)", fontFamily: "'Sora', sans-serif", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{post.content}</p>
        )}
      </div>

      {/* Image */}
      {post.image && <div style={{ padding: "0 24px 16px" }}><img src={post.image} alt="post" style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 14, border: "1px solid var(--border)" }} /></div>}

      {/* Poll */}
      {post.poll && <PollView poll={post.poll} postId={post._id} currentUserId={currentUserId} onUpdate={onUpdate} />}

      {/* Tags */}
      <TagPills tags={post.tags} activeTag={activeTag} onTagClick={onTagClick} />

      {/* Reaction summary */}
      <ReactionSummary reactions={post.reactions} />

      {/* Actions */}
      <div style={{ padding: "0 24px 16px", display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid var(--border)", margin: "0 24px", paddingTop: 14, paddingLeft: 0, paddingRight: 0 }}>
        <ReactionPicker onReact={handleReaction} currentReaction={myReaction} />
        <button onClick={() => setShowComments(!showComments)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "none", background: showComments ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent", color: showComments ? "var(--accent-fg)" : "var(--txt-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 200ms", fontFamily: "'Sora', sans-serif" }}>
          💬 {comments.length > 0 ? comments.length : "Comment"}
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddComment(); } }} placeholder="Write a comment..." maxLength={500}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--txt-1)", fontSize: 13, outline: "none", fontFamily: "'Sora', sans-serif" }} />
                <button onClick={handleAddComment} disabled={!commentText.trim() || commentLoading}
                  style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: commentText.trim() ? "var(--accent)" : "var(--border)", color: commentText.trim() ? "var(--accent-fg)" : "var(--txt-3)", fontSize: 13, fontWeight: 600, cursor: commentText.trim() ? "pointer" : "default", fontFamily: "'Sora', sans-serif", flexShrink: 0 }}>
                  {commentLoading ? "..." : "Post"}
                </button>
              </div>
              {comments.map((c) => (
                <motion.div key={c._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <img src={avatar(c.user?.name)} alt={c.user?.name} style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt-1)", fontFamily: "'Sora', sans-serif" }}>{c.user?.name}</span>
                      <span style={{ fontSize: 11, color: "var(--txt-3)" }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--txt-2)", lineHeight: 1.5, fontFamily: "'Sora', sans-serif", wordBreak: "break-word" }}>{c.text}</p>
                  </div>
                  {(c.user?._id) === currentUserId && (
                    <button onClick={() => handleDeleteComment(c._id)} title="Delete"
                      style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "transparent", color: "var(--txt-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                  )}
                </motion.div>
              ))}
              {comments.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "var(--txt-3)", textAlign: "center", padding: "8px 0", fontFamily: "'Sora', sans-serif" }}>No comments yet — be the first!</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */
function PostSkeleton() {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--border)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div>
          <div style={{ width: 120, height: 14, borderRadius: 6, background: "var(--border)", marginBottom: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ width: 70, height: 10, borderRadius: 6, background: "var(--border)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <div style={{ width: "100%", height: 60, borderRadius: 10, background: "var(--border)", animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ─── MAIN FEED PAGE ─────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════ */
export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTag, setActiveTag] = useState("");
  const [activeTab, setActiveTab] = useState("feed"); // feed | bookmarks

  const fetchPosts = useCallback(async (pageNum = 1, append = false, tag = "") => {
    try {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      const { data } = await postsAPI.getFeed(pageNum, 10, tag);
      if (append) setPosts((prev) => [...prev, ...data.posts]); else setPosts(data.posts);
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch { toast.error("Failed to load posts"); }
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await postsAPI.getBookmarked();
      setPosts(data.posts); setHasMore(false);
    } catch { toast.error("Failed to load bookmarks"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "bookmarks") fetchBookmarks();
    else fetchPosts(1, false, activeTag);
  }, [fetchPosts, fetchBookmarks, activeTab, activeTag]);

  const handlePostCreated = (p) => setPosts((prev) => [p, ...prev]);
  const handlePostUpdate = (p) => setPosts((prev) => prev.map((x) => (x._id === p._id ? p : x)));
  const handlePostDelete = (id) => setPosts((prev) => prev.filter((x) => x._id !== id));
  const handleTagClick = (tag) => { setActiveTag(activeTag === tag ? "" : tag); setActiveTab("feed"); };
  const loadMore = () => { if (!loadingMore && hasMore) fetchPosts(page + 1, true, activeTag); };

  useEffect(() => {
    if (document.getElementById("feed-pulse-style")) return;
    const s = document.createElement("style"); s.id = "feed-pulse-style";
    s.textContent = `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`;
    document.head.appendChild(s);
  }, []);

  const tabStyle = (active) => ({
    padding: "8px 20px", borderRadius: 10, border: "none",
    background: active ? "var(--accent)" : "transparent",
    color: active ? "var(--accent-fg)" : "var(--txt-2)",
    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif",
    transition: "all 180ms",
  });

  return (
    <div className="dash-sans" style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px", background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
            <h1 className="dash-serif" style={{ margin: 0, fontSize: 28, fontWeight: 400, color: "var(--txt-1)", letterSpacing: "-0.01em" }}>Activity Feed</h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--txt-2)", paddingLeft: 18 }}>Share updates and connect with your peers</p>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 99, background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent-fg)", fontSize: 12, fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
          {posts.length} post{posts.length !== 1 ? "s" : ""}
        </div>
      </motion.div>

      {/* Tabs + Tag filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <button onClick={() => { setActiveTab("feed"); setActiveTag(""); }} style={tabStyle(activeTab === "feed")}>🌐 Feed</button>
          <button onClick={() => setActiveTab("bookmarks")} style={tabStyle(activeTab === "bookmarks")}>🔖 Saved</button>
        </div>
        {activeTag && (
          <button onClick={() => setActiveTag("")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: "var(--accent)", color: "var(--accent-fg)", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
            #{activeTag} ✕
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}><PostSkeleton /><PostSkeleton /><PostSkeleton /></div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activeTab === "feed" && <CreatePostCard user={user} onPostCreated={handlePostCreated} />}

          {posts.length === 0 ? (
            <motion.div variants={item} style={{ textAlign: "center", padding: "60px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "color-mix(in srgb, var(--accent) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
                {activeTab === "bookmarks" ? "🔖" : "📝"}
              </div>
              <h3 className="dash-serif" style={{ margin: "0 0 8px", fontSize: 22, color: "var(--txt-1)", fontWeight: 400 }}>
                {activeTab === "bookmarks" ? "No saved posts" : "No posts yet"}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--txt-2)", fontFamily: "'Sora', sans-serif", maxWidth: 320, marginInline: "auto" }}>
                {activeTab === "bookmarks" ? "Save posts to revisit them later!" : "Be the first to share something!"}
              </p>
            </motion.div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} currentUserId={user?._id} onUpdate={handlePostUpdate} onDelete={handlePostDelete} onTagClick={handleTagClick} activeTag={activeTag} />)
          )}

          {hasMore && (
            <motion.div variants={item} style={{ textAlign: "center" }}>
              <button onClick={loadMore} disabled={loadingMore}
                style={{ padding: "12px 32px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--txt-1)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif", opacity: loadingMore ? 0.6 : 1 }}>
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
