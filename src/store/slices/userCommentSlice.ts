import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '@/services/api/user';
import postApi from '@/services/api/post';

// 定义包含帖子信息的评论项
interface CommentWithPostInfo {
  id: number;
  post_id: number;
  content: string;
  create_time: string;
  like_count: number;
  is_liked?: boolean;
  post_title: string;
  post_content: string;
  post_image?: string | string[] | undefined;
  author_info?: {
    id: number;
    nickname: string;
    avatar: string;
  };
}

// 定义状态类型
interface UserCommentState {
  items: CommentWithPostInfo[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_more: boolean;
  };
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// 初始状态
const initialState: UserCommentState = {
  items: [],
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    has_more: false
  },
  loading: 'idle',
  error: null
};

// 获取用户评论列表的异步thunk
export const fetchUserComments = createAsyncThunk(
  'userComment/fetchUserComments',
  async (params: { page?: number; page_size?: number; isAppend?: boolean }, { rejectWithValue }) => {
    try {
      // 获取用户评论列表
      const response = await userApi.getUserComments({
        page: params.page || 1,
        page_size: params.page_size || 10
      });
      
      // 提取响应数据
      const responseData = response as any;
      const comments = Array.isArray(responseData.data) ? responseData.data : [];
      const pagination = responseData.pagination || {
        page: params.page || 1,
        page_size: params.page_size || 10,
        total: 0,
        has_more: false
      };

      // 如果没有评论数据，直接返回空数组
      if (!comments.length) {
        return {
          items: [],
          pagination,
          isAppend: params.isAppend || false
        };
      }

      // 获取每个评论对应帖子的详细信息
      const commentsWithPostInfo = await Promise.all(
        comments.map(async (comment) => {
          try {
            if (!comment.post_id) {
              throw new Error('Missing post_id');
            }
            
            // 使用帖子详情接口获取完整信息
            const postResponse = await postApi.getPostById(comment.post_id);
            const postData = postResponse.data;
            
            // 合并评论和帖子信息
            return {
              id: comment.id,
              post_id: comment.post_id,
              content: comment.content || '',
              create_time: comment.create_time || '',
              like_count: comment.like_count || 0,
              is_liked: comment.is_liked || false,
              post_title: postData.title || '未知标题',
              post_content: postData.content || '',
              post_image: postData.image_urls || postData.image || undefined,
              author_info: postData.author_info
            } as CommentWithPostInfo;
          } catch (error) {
            // 如果获取详情失败，使用评论中的简略信息
            return {
              id: comment.id,
              post_id: comment.post_id,
              content: comment.content || '',
              create_time: comment.create_time || '',
              like_count: comment.like_count || 0,
              is_liked: false,
              post_title: '未知标题',
              post_content: '内容不可用',
              author_info: {
                id: 0,
                nickname: '未知用户',
                avatar: ''
              }
            } as CommentWithPostInfo;
          }
        })
      );
      
      return {
        items: commentsWithPostInfo,
        pagination,
        isAppend: params.isAppend || false
      };
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评论列表失败');
    }
  }
);

// 创建slice
const userCommentSlice = createSlice({
  name: 'userComment',
  initialState,
  reducers: {
    resetUserComments: (state) => {
      state.items = [];
      state.pagination = {
        page: 1,
        page_size: 10,
        total: 0,
        has_more: false
      };
      state.loading = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        
        if (action.payload.isAppend) {
          // 追加模式：添加新的评论项到现有列表
          state.items = [...state.items, ...action.payload.items];
        } else {
          // 替换模式：完全替换评论列表
          state.items = action.payload.items;
        }
        
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { resetUserComments } = userCommentSlice.actions;
export default userCommentSlice.reducer; 