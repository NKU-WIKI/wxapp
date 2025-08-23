import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  CreateCommentRequest,
  Comment,
  CommentDetail,
  CommentUpdate,
} from "@/types/api/comment.d";
import {
  createComment as createCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  getComments,
} from "@/services/api/comment";
// 由于后端暂无 /users/{id} 用户详情接口，不进行远程查询，使用本地回退

const getFallbackUserInfo = (userId: string) => {
  const suffix = userId ? userId.slice(-8) : "匿名";
  return { nickname: `用户${suffix}`, avatar: "" };
};

// 获取评论列表的 Thunk
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (params: { 
    resource_id: string; 
    resource_type: string;
    parent_id?: string;
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_desc?: boolean;
  }, { rejectWithValue, getState }) => {
    try {
      // 设置默认参数（仅在提供时传递 parent_id，避免传入字符串 'undefined'）
      const apiParams: {
        resource_id: string;
        resource_type: string;
        parent_id?: string;
        skip: number;
        limit: number;
        sort_by: string;
        sort_desc: boolean;
      } = {
        resource_id: params.resource_id,
        resource_type: params.resource_type,
        skip: params.skip || 0,
        limit: params.limit || 20,
        sort_by: params.sort_by || 'created_at',
        sort_desc: params.sort_desc !== undefined ? params.sort_desc : true
      };

      if (params.parent_id && params.parent_id !== 'undefined' && params.parent_id !== 'null') {
        apiParams.parent_id = params.parent_id;
      }
      
      const response = await getComments(apiParams);
      const state = getState() as any;
      const currentUser = state?.user;
      
      // 兼容后端返回：data 可能是数组或包含分页的对象
      // 1) { code, data: Comment[] }
      // 2) { code, data: { items: Comment[], total, skip, limit } }
      const rawData: any = response?.data;
      const commentsData: any[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.items)
          ? rawData.items
          : [];
      
      // 并行获取所有评论的用户信息
      const processedComments = await Promise.all(
        commentsData.map(async (c: any) => {
          // 如果是当前用户，直接使用当前用户信息
          if (currentUser?.currentUser?.user_id === c?.user_id) {
            return {
              ...c,
              // 统一字段
              created_at: c?.created_at || c?.update_time || c?.create_time || new Date().toISOString(),
              create_at: c?.create_at || c?.created_at || c?.update_time || c?.create_time || new Date().toISOString(),
              like_count: c?.like_count ?? c?.likes_count ?? 0,
              is_liked: c?.is_liked ?? c?.has_liked ?? false,
              author_nickname: currentUser?.currentUser?.nickname || currentUser?.userProfile?.nickname || '我',
              author_avatar: currentUser?.userProfile?.avatar || '',
            } as CommentDetail;
          }

          // 没有用户详情接口，使用本地回退
          const userInfo = getFallbackUserInfo(c?.user_id);
          
          return {
            ...c,
            // 统一字段
            created_at: c?.created_at || c?.update_time || c?.create_time || new Date().toISOString(),
            create_at: c?.create_at || c?.created_at || c?.update_time || c?.create_time || new Date().toISOString(),
            like_count: c?.like_count ?? c?.likes_count ?? 0,
            is_liked: c?.is_liked ?? c?.has_liked ?? false,
            author_nickname: c?.author_nickname ?? c?.user?.nickname ?? userInfo.nickname,
            author_avatar: c?.author_avatar ?? c?.avatar ?? c?.user?.avatar ?? userInfo.avatar,
          } as CommentDetail;
        })
      );
      
      return processedComments;
    } catch (error: any) {
      console.error("获取评论失败:", error);
      return rejectWithValue(error.message || "Failed to fetch comments");
    }
  }
);

// 创建评论的 Thunk
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (params: CreateCommentRequest, { rejectWithValue, getState }) => {
    try {
      const response = await createCommentApi(params);
      const state = getState() as any;
      const currentUser = state?.user;
      
      // 确保response.data存在
      const payload = (response.data || response) as any;
      
      // 如果是当前用户，直接使用当前用户信息
      if (currentUser?.currentUser?.user_id === payload?.user_id) {
        const normalized = {
          ...payload,
          // 统一字段
          created_at: payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
          create_at: payload?.create_at || payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
          like_count: payload?.like_count ?? payload?.likes_count ?? 0,
          is_liked: payload?.is_liked ?? payload?.has_liked ?? false,
          author_nickname: currentUser?.currentUser?.nickname || currentUser?.userProfile?.nickname || '我',
          author_avatar: currentUser?.userProfile?.avatar || '',
        } as CommentDetail;
        return normalized;
      }

      // 否则查询用户信息
      const userInfo = getFallbackUserInfo(payload?.user_id);
      
      const normalized = {
        ...payload,
        // 统一字段
        created_at: payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
        create_at: payload?.create_at || payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
        like_count: payload?.like_count ?? payload?.likes_count ?? 0,
        is_liked: payload?.is_liked ?? payload?.has_liked ?? false,
        author_nickname: payload?.author_nickname ?? payload?.user?.nickname ?? userInfo.nickname,
        author_avatar: payload?.author_avatar ?? payload?.avatar ?? payload?.user?.avatar ?? userInfo.avatar,
      } as CommentDetail;
      
      return normalized;
    } catch (error: any) {
      console.error("创建评论失败:", error);
      return rejectWithValue(error.message || "Failed to create comment");
    }
  }
);

// 更新评论的 Thunk
export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, data }: { commentId: string; data: CommentUpdate }, { rejectWithValue }) => {
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
  async (commentId: string, { rejectWithValue }) => {
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
  comments: CommentDetail[];
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
        // 数据已在thunk中处理完毕，直接使用
        state.comments = action.payload || [];
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
        // 数据已在thunk中处理完毕，直接使用
        state.comments.push(action.payload); // Add new comment to the list
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