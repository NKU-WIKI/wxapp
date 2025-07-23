import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '@/services/api/user';
import { Post } from '@/types/api/post';
import postApi from '@/services/api/post';
import { BackendPaginatedResponse } from '@/types/api/common';

// 定义收藏项的类型
interface FavoriteItem {
  type: string;
  id: number;
  title: string;
  content: string;
  image?: string | string[];
  create_time: string;
  author_nickname: string;
  author_avatar: string;
}

// 定义状态类型
interface FavoriteState {
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
const initialState: FavoriteState = {
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

// 获取收藏列表的异步thunk
export const fetchFavorites = createAsyncThunk(
  'favorite/fetchFavorites',
  async (params: { page?: number; page_size?: number; isAppend?: boolean }, { rejectWithValue }) => {
    try {
      // 获取收藏列表
      const response = await userApi.getUserFavorites({
        page: params.page || 1,
        page_size: params.page_size || 10
      });

      // 提取响应数据
      const responseData = response as BackendPaginatedResponse<FavoriteItem>;
      const favorites = responseData.data || [];
      const pagination = responseData.pagination || {
        page: 1,
        page_size: 10,
        total: 0,
        has_more: false
      };

      // 获取每个收藏帖子的详细信息
      const postDetails = await Promise.all(
        favorites
          .filter(item => item.type === 'post')
          .map(async (item) => {
            try {
              // 使用帖子详情接口获取完整信息
              const postResponse = await postApi.getPostById(item.id);
              return postResponse.data;
            } catch (error) {
              console.error(`获取帖子详情失败，ID: ${item.id}`, error);
              // 如果获取详情失败，使用列表中的简略信息
              return {
                id: item.id,
                title: item.title,
                content: item.content,
                image: item.image,
                create_time: item.create_time,
                author_info: {
                  nickname: item.author_nickname,
                  avatar: item.author_avatar
                },
                is_favorited: true // 这是收藏列表，所以一定是已收藏的
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
      return rejectWithValue(error.message || '获取收藏列表失败');
    }
  }
);

// 创建slice
const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    resetFavorites: (state) => {
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
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        
        if (action.payload.isAppend) {
          // 追加模式：添加新的收藏项到现有列表
          state.items = [...state.items, ...action.payload.items];
        } else {
          // 替换模式：完全替换收藏列表
          state.items = action.payload.items;
        }
        
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { resetFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer; 