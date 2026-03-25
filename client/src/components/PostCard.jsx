import { useState } from "react";
import { useSelector } from "react-redux";

const PostCard = ({
  post,
  onLike,
  onComment,
  onOpenShare,
  onShare,
  onVotePoll,
  onDelete,
  allowDelete = false,
  onlineUsers = [],
  onlineUsersStatus = "idle",
  isBusy = false,
}) => {
  const currentUserId = useSelector((state) => state.auth.user?._id);
  const [comment, setComment] = useState("");
  const [showShareList, setShowShareList] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [shareError, setShareError] = useState(null);
  const likes = post.likes || [];
  const comments = post.comments || [];
  const pollVotes = post.pollVotes || [];
  const isLikedByCurrentUser = likes.some((id) => id?.toString() === currentUserId);
  const authorLabel = post.user?.name || post.user?.email || "User";
  const ownerId = post.user?._id?.toString?.() || String(post.user?._id || "");
  const viewerId = currentUserId?.toString?.() || String(currentUserId || "");
  const isOwner = Boolean(ownerId && viewerId && ownerId === viewerId);
  const myPollVote = pollVotes.find(
    (vote) => (vote.user?._id || vote.user)?.toString() === viewerId
  );

  const handleComment = (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    onComment?.(post._id, comment);
    setComment("");
  };

  const handleOpenShare = () => {
    setShareError(null);
    setShowShareList((prev) => !prev);
    onOpenShare?.();
  };

  const handleShareToUser = async (targetUserId) => {
    setShareError(null);
    const result = await onShare?.(post._id, targetUserId);
    if (result?.type?.endsWith("/fulfilled")) {
      setShowShareList(false);
      return;
    }
    setShareError(result?.payload || "Share failed");
  };

  const handleDelete = async () => {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;
    await onDelete?.(post._id);
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <div className="avatar" aria-hidden="true">
          {authorLabel?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="meta">
          <div className="name-row">
            <strong>{authorLabel}</strong>
            <span className="handle">@{post.user?.handle || "member"}</span>
          </div>
          <span className="time">
            {new Date(post.createdAt || Date.now()).toLocaleString()}
          </span>
        </div>
      </div>
      <p className="post-text">{post.text}</p>
      {post.image ? (
        <div className="post-image">
          <img src={post.image} alt="post visual" />
        </div>
      ) : null}
      {post.video ? (
        <div className="post-image">
          <video src={post.video} controls />
        </div>
      ) : null}
      {post.poll?.question ? (
        <div className="post-poll">
          <h4>{post.poll.question}</h4>
          <ul>
            {(post.poll.options || []).map((option, index) => {
              const votesForOption = pollVotes.filter(
                (vote) => Number(vote.optionIndex) === index
              ).length;
              const isSelected = Number(myPollVote?.optionIndex) === index;
              return (
                <li
                  className={isSelected ? "selected" : ""}
                  key={`${post._id}-poll-option-${index}`}
                >
                  <button
                    type="button"
                    onClick={() => onVotePoll?.(post._id, index)}
                    disabled={isBusy}
                  >
                    <span>{option}</span>
                    <strong className="vote-tag">{votesForOption} votes</strong>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="poll-total">Total votes: {pollVotes.length}</p>
        </div>
      ) : null}
      <div className="post-actions">
        <button
          className={isLikedByCurrentUser ? "liked" : ""}
          type="button"
          onClick={() => onLike?.(post._id)}
          disabled={isBusy}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 20s-7-4.6-7-10.1A4.4 4.4 0 0 1 9.5 5c1.4 0 2.7.7 3.5 1.8A4.5 4.5 0 0 1 16.5 5 4.4 4.4 0 0 1 21 9.9C21 15.4 12 20 12 20Z"
              fill={isLikedByCurrentUser ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          {likes.length}
        </button>
        <button
          className={showComments ? "active" : ""}
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          disabled={isBusy}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 6.5h16v9H8l-4 3v-12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          Comments {comments.length}
        </button>
        <button type="button" onClick={handleOpenShare} disabled={isBusy}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 12l8-6v4h4v4h-4v4l-8-6Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          Share {post.shares?.length || 0}
        </button>
        {allowDelete && isOwner ? (
          <button
            className="danger"
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
          >
            Delete
          </button>
        ) : null}
      </div>
      {showShareList ? (
        <div className="share-menu">
          <p className="share-title">Share with online users</p>
          {onlineUsersStatus === "loading" ? (
            <span className="muted">Loading users...</span>
          ) : onlineUsers.length ? (
            <div className="share-user-list">
              {onlineUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleShareToUser(user._id)}
                  disabled={isBusy}
                >
                  {user.name || user.email}
                </button>
              ))}
            </div>
          ) : (
            <span className="muted">No other online users right now.</span>
          )}
          {shareError ? <span className="error-text">{shareError}</span> : null}
        </div>
      ) : null}
      {showComments ? (
        <div className="comment-thread">
          {comments.length ? (
            comments.map((item, index) => (
              <div className="comment-item" key={`${post._id}-comment-${index}`}>
                <strong>{item.user?.name || item.user?.email || "User"}</strong>
                <span>{item.text}</span>
              </div>
            ))
          ) : (
            <span className="muted">No comments yet.</span>
          )}
        </div>
      ) : null}
      <form className="comment-form" onSubmit={handleComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <button type="submit" disabled={isBusy}>
          Send
        </button>
      </form>
    </article>
  );
};

export default PostCard;
