import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import {
  commentPost,
  createPost,
  deletePost,
  fetchOnlineUsers,
  fetchPosts,
  markSharesSeen,
  likePost,
  sharePost,
  votePollOption,
} from "../features/post/postSlice";

const Feed = () => {
  const dispatch = useDispatch();
  const {
    items,
    onlineUsers,
    fetchStatus,
    onlineUsersStatus,
    createStatus,
    actionStatus,
    error,
    lastAction,
  } = useSelector((state) => state.post);
  const currentUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("all");
  const [toast, setToast] = useState(null);
  const prevCreateStatus = useRef(createStatus);
  const prevActionStatus = useRef(actionStatus);

  const actionSuccessText = {
    like: "Like updated",
    comment: "Comment added",
    share: "Post shared",
    delete: "Post deleted",
    votePoll: "Poll vote saved",
  };

  const tabs = [
    { id: "all", label: "All Post" },
    { id: "forYou", label: "For You" },
    { id: "mostLiked", label: "Most Liked" },
    { id: "mostCommented", label: "Most Commented" },
    { id: "mostShared", label: "Most Shared" },
  ];

  const visibleItems = useMemo(() => {
    const list = items.slice();
    const currentUserId = currentUser?._id;

    switch (activeTab) {
      case "forYou":
        return list
          .filter((post) => post.user?._id === currentUserId)
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          );
      case "mostLiked":
        return list
          .filter((post) => (post.likes?.length || 0) > 0)
          .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      case "mostCommented":
        return list
          .filter((post) => (post.comments?.length || 0) > 0)
          .sort(
            (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
          );
      case "mostShared":
        return list
          .filter((post) => (post.shares?.length || 0) > 0)
          .sort((a, b) => (b.shares?.length || 0) - (a.shares?.length || 0));
      default:
        return list;
    }
  }, [items, activeTab, currentUser]);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser?._id && fetchStatus === "succeeded") {
      dispatch(markSharesSeen());
    }
  }, [dispatch, currentUser?._id, fetchStatus]);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchOnlineUsers());
    }
  }, [dispatch, currentUser?._id]);

  useEffect(() => {
    if (
      prevCreateStatus.current !== createStatus &&
      createStatus === "succeeded"
    ) {
      setToast({ type: "success", message: "Post created successfully" });
    }

    if (
      prevCreateStatus.current !== createStatus &&
      createStatus === "failed" &&
      error &&
      lastAction === "create"
    ) {
      setToast({ type: "error", message: error });
    }

    prevCreateStatus.current = createStatus;
  }, [createStatus, error, lastAction]);

  useEffect(() => {
    if (
      prevActionStatus.current !== actionStatus &&
      actionStatus === "succeeded" &&
      actionSuccessText[lastAction]
    ) {
      setToast({ type: "success", message: actionSuccessText[lastAction] });
    }

    if (
      prevActionStatus.current !== actionStatus &&
      actionStatus === "failed" &&
      error &&
      lastAction !== "create"
    ) {
      setToast({ type: "error", message: error });
    }

    prevActionStatus.current = actionStatus;
  }, [actionStatus, error, lastAction]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="feed">
      <Navbar />
      <main className="feed-content">
        <CreatePost
          onCreate={(payload) => dispatch(createPost(payload))}
          isSubmitting={createStatus === "loading"}
          error={lastAction === "create" ? error : null}
        />
        <div className="feed-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`pill ${activeTab === tab.id ? "active" : ""}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {fetchStatus === "loading" ? (
          <div className="loading-center">
            <div className="loading-row">
            <span className="spinner" aria-hidden="true" />
            <span className="muted">Loading posts...</span>
            </div>
          </div>
        ) : null}
        {fetchStatus === "failed" && error ? (
          <div className="error-banner">
            <span>{error}</span>
            <button type="button" onClick={() => dispatch(fetchPosts())}>
              Retry
            </button>
          </div>
        ) : null}
        {actionStatus === "failed" && lastAction !== "create" && error ? (
          <div className="error-banner subtle">
            <span>{error}</span>
          </div>
        ) : null}
        <section className="post-grid">
          {visibleItems.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              allowDelete={activeTab === "forYou"}
              isBusy={actionStatus === "loading"}
              onlineUsers={onlineUsers}
              onlineUsersStatus={onlineUsersStatus}
              onLike={(postId) => dispatch(likePost(postId))}
              onComment={(postId, text) =>
                dispatch(commentPost({ postId, text }))
              }
              onOpenShare={() => dispatch(fetchOnlineUsers())}
              onShare={(postId, targetUserId) =>
                dispatch(sharePost({ postId, targetUserId }))
              }
              onVotePoll={(postId, optionIndex) =>
                dispatch(votePollOption({ postId, optionIndex }))
              }
              onDelete={(postId) => dispatch(deletePost(postId))}
            />
          ))}
          {!visibleItems.length && fetchStatus === "succeeded" ? (
            <div className="empty-state">
              <h3>No posts yet</h3>
              <p>Create your first post to start the feed.</p>
            </div>
          ) : null}
        </section>
      </main>
      {toast ? (
        <div className={`toast ${toast.type === "error" ? "error" : "success"}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="close toast">
            x
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Feed;
