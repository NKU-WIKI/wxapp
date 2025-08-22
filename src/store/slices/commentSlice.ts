import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  CreateCommentRequest,
  Comment,
  CommentUpdate,
} from "@/types/api/comment.d";
import {
  createComment as createCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  getComments,
} from "@/services/api/comment";

// 获取评论列表的 Thunk
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (params: { resource_id: string; resource_type: string }, { rejectWithValue }) => {
    try {
      const response = await getComments(params);
      return response.data;
    } catch (error: any) {
      console.error("获取评论失败:", error);
      return rejectWithValue(error.message || "Failed to fetch comments");
    }
  }
);

// 创建评论的 Thunk
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (params: CreateCommentRequest, { rejectWithValue }) => {
    try {
      const response = await createCommentApi(params);
      return response.data; // 返回数据部分
    } catch (error: any) {
      console.error("创建评论失败:", error);
      return rejectWithValue(error.message || "Failed to create comment");
    }
  }
);

// 更新评论的 Thunk
export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, data }: { commentId: number; data: CommentUpdate }, { rejectWithValue }) => {
    try {
      const response = await updateCommentApi(commentId, data);
      return response.data; // 返回数据部分
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update comment");
    }
  }
);

// 删除评论的 Thunk
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId: number, { rejectWithValue }) => {
    try {
      await deleteCommentApi(commentId);
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete comment");
    }
  }
);

export interface CommentState {
  // We can add a list to hold comments for a specific post
  comments: Comment[];
  fetchStatus: "idle" | "pending" | "succeeded" | "failed";
  createStatus: "idle" | "pending" | "succeeded" | "failed";
  updateStatus: "idle" | "pending" | "succeeded" | "failed";
  deleteStatus: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  fetchStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  error: null,
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取评论
      .addCase(fetchComments.pending, (state) => {
        state.fetchStatus = "pending";
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        // 规范化时间与作者昵称，确保 create_at 存在
        state.comments = (action.payload || []).map((c: any) => ({
          ...c,
          create_at: c?.create_at || c?.created_at || c?.create_time || c?.update_time || '',
          author_nickname: c?.author_nickname ?? c?.user?.nickname ?? c?.user?.name ?? '',
          author_avatar: c?.author_avatar ?? c?.avatar ?? c?.user?.avatar ?? '',
        }));
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload as string;
      })
      // 处理创建评论
      .addCase(createComment.pending, (state) => {
        state.createStatus = "pending";
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        const payload: any = action.payload;
        const normalized = {
          ...payload,
          create_at: payload?.create_at || payload?.created_at || payload?.create_time || new Date().toISOString(),
          author_nickname: payload?.author_nickname ?? payload?.user?.nickname ?? payload?.user?.name ?? '',
          author_avatar: payload?.author_avatar ?? payload?.avatar ?? payload?.user?.avatar ?? '',
        } as any;
        state.comments.push(normalized); // Add new comment to the list
      })
      .addCase(createComment.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload as string;
      })
      // 处理更新评论
      .addCase(updateComment.pending, (state) => {
        state.updateStatus = "pending";
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.comments.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload as string;
      })
      // 处理删除评论
      .addCase(deleteComment.pending, (state) => {
        state.deleteStatus = "pending";
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.comments = state.comments.filter(c => c.id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetCreateStatus } = commentSlice.actions;

export default commentSlice.reducer;