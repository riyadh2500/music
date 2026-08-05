import React, { useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiMessageCircle, FiMoreHorizontal, FiTrash2, FiEdit2 } from "react-icons/fi";
import toast from "react-hot-toast";

const SAMPLE_COMMENTS = [
  {
    id: 1,
    user: "CryptoBeats",
    avatar: "C",
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    text: "This track is absolute fire! 🔥 The bassline hits different on-chain.",
    time: "2h ago",
    likes: 12,
    replies: [
      {
        id: 11,
        user: "Web3Artist",
        avatar: "W",
        gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
        text: "Totally agree, the production is insane!",
        time: "1h ago",
        likes: 4,
      },
    ],
  },
  {
    id: 2,
    user: "SynthWave3",
    avatar: "S",
    gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    text: "Can't stop replaying this. When is the NFT drop?",
    time: "5h ago",
    likes: 8,
    replies: [],
  },
  {
    id: 3,
    user: "NFTGroove",
    avatar: "N",
    gradient: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    text: "Just minted this one. Best investment I made this week 💎",
    time: "1d ago",
    likes: 21,
    replies: [],
  },
];

const CommentItem = ({ comment, onDelete, isReply = false }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState(comment.replies || []);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [text, setText] = useState(comment.text);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : n - 1));
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    const newReply = {
      id: Date.now(),
      user: "You",
      avatar: "Y",
      gradient: "linear-gradient(135deg,#10b981,#059669)",
      text: replyText.trim(),
      time: "just now",
      likes: 0,
    };
    setReplies((prev) => [...prev, newReply]);
    setReplyText("");
    setShowReply(false);
    toast.success("Reply posted!");
  };

  const handleEdit = () => {
    setText(editText);
    setEditing(false);
    toast.success("Comment updated!");
  };

  return (
    <div style={{ marginLeft: isReply ? 44 : 0 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: comment.gradient, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13,
          }}
        >
          {comment.avatar}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "#f9f9f9", borderRadius: "0 12px 12px 12px",
              padding: "10px 14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>
                {comment.user}
              </span>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
                >
                  <FiMoreHorizontal size={14} color="#a3a3a3" />
                </button>
                {showMenu && (
                  <div
                    style={{
                      position: "absolute", right: 0, top: "100%",
                      background: "#fff", border: "1px solid #e5e5e5",
                      borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 100, minWidth: 120, overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => { setEditing(true); setShowMenu(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#404040",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <FiEdit2 size={12} /> Edit
                    </div>
                    <div
                      onClick={() => { onDelete && onDelete(comment.id); setShowMenu(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#ef4444",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <FiTrash2 size={12} /> Delete
                    </div>
                  </div>
                )}
              </div>
            </div>

            {editing ? (
              <div style={{ marginTop: 6 }}>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  style={{
                    width: "100%", padding: "8px 10px",
                    border: "1px solid #10b981", borderRadius: 6,
                    fontSize: 13, outline: "none", resize: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button
                    onClick={handleEdit}
                    style={{
                      padding: "5px 14px", background: "#10b981", color: "#fff",
                      border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >Save</button>
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      padding: "5px 14px", background: "#f5f5f5", color: "#525252",
                      border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer",
                    }}
                  >Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#404040", lineHeight: 1.5 }}>
                {text}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 16, marginTop: 4, paddingLeft: 4 }}>
            <button
              onClick={handleLike}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: liked ? "#ef4444" : "#a3a3a3", padding: 0,
              }}
            >
              {liked ? <AiFillHeart size={13} /> : <AiOutlineHeart size={13} />} {likes}
            </button>
            {!isReply && (
              <button
                onClick={() => setShowReply((v) => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: "#a3a3a3", padding: 0,
                }}
              >
                <FiMessageCircle size={12} /> Reply
              </button>
            )}
            <span style={{ fontSize: 11, color: "#c4c4c4", marginLeft: "auto" }}>{comment.time}</span>
          </div>

          {/* Reply input */}
          {showReply && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                style={{
                  flex: 1, padding: "7px 12px",
                  border: "1px solid #e5e5e5", borderRadius: 20,
                  fontSize: 13, outline: "none",
                }}
              />
              <button
                onClick={handleReply}
                style={{
                  padding: "7px 14px", background: "#10b981", color: "#fff",
                  border: "none", borderRadius: 20, fontSize: 12,
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Reply
              </button>
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {replies.map((r) => (
                <CommentItem key={r.id} comment={r} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentComp = ({ postId }) => {
  const [comments, setComments] = useState(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (!newComment.trim()) return;
    const c = {
      id: Date.now(),
      user: "You",
      avatar: "Y",
      gradient: "linear-gradient(135deg,#10b981,#059669)",
      text: newComment.trim(),
      time: "just now",
      likes: 0,
      replies: [],
    };
    setComments((prev) => [c, ...prev]);
    setNewComment("");
    toast.success("Comment posted!");
  };

  const deleteComment = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success("Comment deleted");
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: "#171717", marginBottom: 14 }}>
        Comments ({comments.length})
      </div>

      {/* New comment input */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#10b981,#059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 13,
          }}
        >Y</div>
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            onKeyDown={(e) => e.key === "Enter" && addComment()}
            style={{
              flex: 1, padding: "9px 14px",
              border: "1px solid #e5e5e5", borderRadius: 20,
              fontSize: 13, outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
          />
          <button
            onClick={addComment}
            style={{
              padding: "9px 18px", background: "#10b981", color: "#fff",
              border: "none", borderRadius: 20, fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Post
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onDelete={deleteComment} />
      ))}
    </div>
  );
};

export default CommentComp;
