import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '@/services/api/user';
import { Post } from '@/types/api/post';
import postApi from '@/services/api/post';
import { BackendPaginatedResponse } from '@/types/api/common';

// 定义点赞项的类型
interface LikeItem {
  type: string;
  post_info?: {
    id: number;
    title: string;
    content: string;
    image?: string | string[];
    create_time: string;
    author_info: {
      nickname: string;
      avatar: string;
    };
  };
  comment_info?: any; // 评论的点赞信息，暂时不处理
}

// 定义状态类型
interface LikeState {
  items: Post[];
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
const initialState: LikeState = {
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

// 获取点赞列表的异步thunk
export const fetchLikes = createAsyncThunk(
  'like/fetchLikes',
  async (params: { page?: number; page_size?: number; isAppend?: boolean }, { rejectWithValue }) => {
    try {
      // 获取点赞列表
      const response = await userApi.getUserLikes({
        page: params.page || 1,
        page_size: params.page_size || 10
      });

      // 提取响应数据
      const responseData = response as BackendPaginatedResponse<LikeItem>;
      const likes = responseData.data || [];
      const pagination = responseData.pagination || {
        page: 1,
        page_size: 10,
        total: 0,
        has_more: false
      };

      // 过滤出帖子类型的点赞
      const postLikes = likes.filter(item => item.type === 'post' && item.post_info);

      // 获取每个点赞帖子的详细信息
      const postDetails = await Promise.all(
        postLikes.map(async (item) => {
          try {
            if (!item.post_info) {
              throw new Error('Missing post_info');
            }
            
            // 使用帖子详情接口获取完整信息
            const postResponse = await postApi.getPostById(item.post_info.id);
            return postResponse.data;
          } catch (error) {
            console.error(`获取帖子详情失败，ID: ${item.post_info?.id}`, error);
            // 如果获取详情失败，使用列表中的简略信息
            return {
              id: item.post_info?.id,
              title: item.post_info?.title,
              content: item.post_info?.content,
              image: item.post_info?.image,
              create_time: item.post_info?.create_time,
              author_info: {
                nickname: item.post_info?.author_info.nickname,
                avatar: item.post_info?.author_info.avatar
              },
              is_liked: true // 这是点赞列表，所以一定是已点赞的
            } as Post;
          }
        })
      );

      return {
        items: postDetails,
        pagination,
        isAppend: params.isAppend || false
      };
    } catch (error: any) {
      return rejectWithValue(error.message || '获取点赞列表失败');
    }
  }
);

// 创建slice
const likeSlice = createSlice({
  name: 'like',
  initialState,
  reducers: {
    resetLikes: (state) => {
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
      .addCase(fetchLikes.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        
        if (action.payload.isAppend) {
          // 追加模式：添加新的点赞项到现有列表
          state.items = [...state.items, ...action.payload.items];
        } else {
          // 替换模式：完全替换点赞列表
          state.items = action.payload.items;
        }
        
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { resetLikes } = likeSlice.actions;
export default likeSlice.reducer; 