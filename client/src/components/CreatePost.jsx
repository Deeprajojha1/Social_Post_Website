import { useEffect, useMemo, useRef, useState } from "react";
import { api, unwrapData } from "../services/api";

const CreatePost = ({ onCreate, isSubmitting = false, error = null }) => {
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const emojis = useMemo(
    () => ["😀", "😂", "😍", "🥳", "😎", "🤩", "😅", "😢", "🔥", "💯", "👍", "🙏", "🎉", "❤️", "✨"],
    []
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!text.trim() && !mediaUrl.trim() && !showPoll) return;
    const pollPayload = showPoll
      ? {
          question: pollQuestion.trim(),
          options: pollOptions.map((option) => option.trim()).filter(Boolean),
        }
      : null;

    const mediaPayload =
      mediaType === "video"
        ? { video: mediaUrl }
        : mediaUrl
        ? { image: mediaUrl }
        : {};

    onCreate?.({ text, ...mediaPayload, poll: pollPayload });
    setText("");
    setMediaUrl("");
    setMediaType("");
    setUploadError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setShowEmojis(false);
    setShowPoll(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/")
    ) {
      setUploadError("Only image or video files are allowed.");
      return;
    }

    const detectedType = file.type.startsWith("video/") ? "video" : "image";
    setMediaType(detectedType);
    setUploadError(null);
    setIsUploading(true);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await api
        .post("/posts/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(unwrapData);
      setMediaUrl(data.url || "");
      setMediaType(data.mediaType || "");
    } catch (error) {
      setUploadError(error.response?.data?.message || error.message);
      setMediaUrl("");
      setMediaType("");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddOption = () => {
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleOptionChange = (index, value) => {
    setPollOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const handleEmojiPick = (emoji) => {
    setText((prev) => `${prev}${emoji}`);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form className="create-card" onSubmit={handleSubmit}>
      <div className="create-header">
        <h2>Create Post</h2>
      </div>
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <input
        ref={fileInputRef}
        className="file-input"
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
      />
      {previewUrl ? (
        <div className="post-image create-preview">
          {mediaType === "video" ? (
            <video src={previewUrl} controls />
          ) : (
            <img src={previewUrl} alt="upload preview" />
          )}
        </div>
      ) : null}
      {showPoll ? (
        <div className="poll-card">
          <input
            className="ghost-input"
            type="text"
            placeholder="Ask a question..."
            value={pollQuestion}
            onChange={(event) => setPollQuestion(event.target.value)}
          />
          {pollOptions.map((option, index) => (
            <input
              key={`poll-option-${index}`}
              className="ghost-input"
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(event) => handleOptionChange(index, event.target.value)}
            />
          ))}
          <button className="ghost-chip" type="button" onClick={handleAddOption}>
            + Add Option
          </button>
        </div>
      ) : null}
      {showEmojis ? (
        <div className="emoji-panel">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              className="emoji-button"
              type="button"
              onClick={() => handleEmojiPick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
      <div className="create-actions">
        <div className="action-icons">
          <button
            type="button"
            className="icon-button ghost-icon"
            onClick={() => fileInputRef.current?.click()}
            aria-label="upload image or video"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 7.5h2l1.6-2h4.8l1.6 2h2.5a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M12 10.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`icon-button ghost-icon ${showEmojis ? "active" : ""}`}
            onClick={() => setShowEmojis((prev) => !prev)}
            aria-label="pick emoji"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle
                cx="12"
                cy="12"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <circle cx="9.5" cy="10" r="1" fill="currentColor" />
              <circle cx="14.5" cy="10" r="1" fill="currentColor" />
              <path
                d="M8.5 14.2c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`icon-button ghost-icon ${showPoll ? "active" : ""}`}
            onClick={() => setShowPoll((prev) => !prev)}
            aria-label="create poll"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 7h14M5 12h10M5 17h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <button
          className="primary"
          type="submit"
          disabled={isSubmitting || isUploading}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 12l14-7-4.2 14-3.2-6L5 12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          {isUploading ? "Uploading..." : isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
      {uploadError ? <span className="error-text">{uploadError}</span> : null}
      {error ? <span className="error-text">{error}</span> : null}
    </form>
  );
};

export default CreatePost;
