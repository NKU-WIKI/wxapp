import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CommentDetail, CreateCommentParams, GetCommentsParams } from '@/types/api/comment';
import { Pagination } from '@/types/api/common';
import commentApi from '@/services/api/comment';
import { RootState } from '..';

// 获取评论列表的 Thunk
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (params: GetCommentsParams & { isAppend?: boolean }, { rejectWithValue }) => {
    try {
      console.log('获取评论列表参数:', params);
      const response = await commentApi.getComments(params);
      console.log('获取评论列表响应:', response);
      
      // 检查响应结构
      if (!response || !response.data) {
        console.error('评论列表响应格式错误:', response);
        return {
          items: [],
          pagination: { page: 1, page_size: 10, total: 0, has_more: false },
          isAppend: params.isAppend || false,
        };
      }
      
      // 从响应中提取数据
      // response 的结构是 { code, msg, data: CommentDetail[], pagination }
      const responseData = response as any; // 使用 any 类型绕过类型检查
      
      return {
        items: Array.isArray(responseData.data) ? responseData.data : [],
        pagination: responseData.pagination || { page: 1, page_size: 10, total: 0, has_more: false },
        isAppend: params.isAppend || false,
      };
    } catch (error: any) {
      console.error('获取评论列表失败:', error);
      return rejectWithValue(error.message || 'Failed to fetch comments');
    }
  }
);

// 创建评论的 Thunk
export const createComment = createAsyncThunk(
  'comments/createComment',
  async (params: CreateCommentParams, { rejectWithValue, dispatch }) => {
    try {
      const response = await commentApi.createComment(params);
      console.log('创建评论响应:', response);
      
      // 创建成功后，刷新评论列表
      dispatch(fetchComments({
        resource_id: params.resource_id,
        resource_type: params.resource_type
      }));
      
      return response.data.id;
    } catch (error: any) {
      console.error('创建评论失败:', error);
      return rejectWithValue(error.message || 'Failed to create comment');
    }
  }
);

// 删除评论的 Thunk
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId: number, { rejectWithValue }) => {
    try {
      await commentApi.deleteComment(commentId);
      return { commentId };
    } catch (error: any) {
      console.error('删除评论失败:', error);
      return rejectWithValue(error.message || 'Failed to delete comment');
    }
  }
);

interface CommentState {
  comments: any[]; // 使用 any 类型简化
  pagination: any | null; // 使用 any 类型简化
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  pagination: null,
  loading: 'idle',
  error: null,
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    resetComments: (state) => {
      state.comments = [];
      state.pagination = null;
      state.loading = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取评论列表
      .addCase(fetchComments.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        
        // 确保 items 是数组
        const items = Array.isArray(action.payload.items) 
          ? action.payload.items 
          : [];
          
        if (action.payload.isAppend) {
          // 追加新评论到现有列表后面
          state.comments = [...state.comments, ...items];
        } else {
          // 替换整个列表（刷新或首次加载）
          state.comments = items;
        }
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      
      // 处理创建评论
      .addCase(createComment.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = 'succeeded';
        // 创建评论后会自动刷新列表，所以这里不需要更新状态
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      
      // 处理删除评论
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        state.comments = state.comments.filter(comment => comment.id !== commentId);
        // 如果有分页信息，更新总评论数
        if (state.pagination) {
          state.pagination.total -= 1;
        }
      });
  },
});

export const { resetComments } = commentSlice.actions;

export const selectComments = (state: RootState) => state.comment.comments;
export const selectCommentsPagination = (state: RootState) => state.comment.pagination;
export const selectCommentsLoading = (state: RootState) => state.comment.loading;

export default commentSlice.reducer; 