import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, unwrapData } from "../../services/api";

const initialState = {
  items: [],
  onlineUsers: [],
  unreadShareCount: 0,
  fetchStatus: "idle",
  onlineUsersStatus: "idle",
  unreadCountStatus: "idle",
  createStatus: "idle",
  actionStatus: "idle",
  error: null,
  lastAction: null,
};

export const fetchPosts = createAsyncThunk(
  "post/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/posts").then(unwrapData);
      return data.posts || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  "post/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await api.post("/posts", payload).then(unwrapData);
      return data.post || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  "post/like",
  async (postId, { rejectWithValue }) => {
    try {
      const data = await api.post(`/posts/${postId}/like`).then(unwrapData);
      return data.post || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const commentPost = createAsyncThunk(
  "post/comment",
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const data = await api
        .post(`/posts/${postId}/comment`, { text })
        .then(unwrapData);
      return data.post || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchOnlineUsers = createAsyncThunk(
  "post/fetchOnlineUsers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/auth/online").then(unwrapData);
      return data.users || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const sharePost = createAsyncThunk(
  "post/share",
  async ({ postId, targetUserId }, { rejectWithValue }) => {
    try {
      const data = await api
        .post(`/posts/${postId}/share`, { targetUserId })
        .then(unwrapData);
      return data.post || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUnreadShareCount = createAsyncThunk(
  "post/fetchUnreadShareCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.get("/posts/shares/unread-count").then(unwrapData);
      return data.unreadShareCount || 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markSharesSeen = createAsyncThunk(
  "post/markSharesSeen",
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.post("/posts/shares/seen").then(unwrapData);
      return data.unreadShareCount || 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/delete",
  async (postId, { rejectWithValue }) => {
    try {
      const data = await api.delete(`/posts/${postId}`).then(unwrapData);
      return data.postId || postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markPollCorrectAnswer = createAsyncThunk(
  "post/markPollCorrect",
  async ({ postId, optionIndex }, { rejectWithValue }) => {
    try {
      const data = await api
        .post(`/posts/${postId}/poll/correct`, { optionIndex })
        .then(unwrapData);
      return data.post || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const votePollOption = createAsyncThunk(
  "post/votePoll",
  async ({ postId, optionIndex }, { rejectWithValue }) => {
    try {
      const data = await api
        .post(`/posts/${postId}/poll/vote`, { optionIndex })
        .then(unwrapData);
      return data.post || data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setPosts(state, action) {
      state.items = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.fetchStatus = "loading";
        state.error = null;
        state.lastAction = "fetch";
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload || "Failed to load posts";
        state.lastAction = "fetch";
      })
      .addCase(fetchOnlineUsers.pending, (state) => {
        state.onlineUsersStatus = "loading";
      })
      .addCase(fetchOnlineUsers.fulfilled, (state, action) => {
        state.onlineUsersStatus = "succeeded";
        state.onlineUsers = action.payload || [];
      })
      .addCase(fetchOnlineUsers.rejected, (state, action) => {
        state.onlineUsersStatus = "failed";
        state.error = action.payload || "Failed to load online users";
      })
      .addCase(fetchUnreadShareCount.pending, (state) => {
        state.unreadCountStatus = "loading";
      })
      .addCase(fetchUnreadShareCount.fulfilled, (state, action) => {
        state.unreadCountStatus = "succeeded";
        state.unreadShareCount = action.payload || 0;
      })
      .addCase(fetchUnreadShareCount.rejected, (state, action) => {
        state.unreadCountStatus = "failed";
        state.error = action.payload || "Failed to load unread share count";
      })
      .addCase(createPost.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
        state.lastAction = "create";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items = [action.payload, ...state.items];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload || "Failed to create post";
        state.lastAction = "create";
      })
      .addCase(likePost.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
        state.lastAction = "like";
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const index = state.items.findIndex(
          (post) => post._id === action.payload._id
        );
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload || "Failed to like post";
        state.lastAction = "like";
      })
      .addCase(commentPost.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
        state.lastAction = "comment";
      })
      .addCase(commentPost.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const index = state.items.findIndex(
          (post) => post._id === action.payload._id
        );
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(commentPost.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload || "Failed to add comment";
        state.lastAction = "comment";
      })
      .addCase(sharePost.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
        state.lastAction = "share";
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const index = state.items.findIndex(
          (post) => post._id === action.payload._id
        );
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload || "Failed to share post";
        state.lastAction = "share";
      })
      .addCase(deletePost.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
        state.lastAction = "delete";
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.items = state.items.filter((post) => post._id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload || "Failed to delete post";
        state.lastAction = "delete";
      })
      .addCase(markPollCorrectAnswer.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
        state.lastAction = "markCorrect";
      })
      .addCase(markPollCorrectAnswer.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const index = state.items.findIndex(
          (post) => post._id === action.payload._id
        );
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(markPollCorrectAnswer.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload || "Failed to mark correct answer";
        state.lastAction = "markCorrect";
      })
      .addCase(votePollOption.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
        state.lastAction = "votePoll";
      })
      .addCase(votePollOption.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        const index = state.items.findIndex(
          (post) => post._id === action.payload._id
        );
        if (index >= 0) state.items[index] = action.payload;
      })
      .addCase(votePollOption.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload || "Failed to vote in poll";
        state.lastAction = "votePoll";
      })
      .addCase(markSharesSeen.fulfilled, (state, action) => {
        state.unreadShareCount = action.payload || 0;
      })
      .addCase(markSharesSeen.rejected, (state, action) => {
        state.error = action.payload || "Failed to mark shares seen";
      });
  },
});

export const { setPosts } = postSlice.actions;
export default postSlice.reducer;
