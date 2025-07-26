import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '@/services/api/user';
import { Post } from '@/types/api/post';
import postApi from '@/services/api/post';
import { BackendPaginatedResponse } from '@/types/api/common';

// 定义点赞项的类型 - 根据实际API返回结构
interface LikeItem {
  type: string;
  id: number;
  title: string;
  content: string;
  image: string | null;
  create_time: string;
  author_nickname: string;
  author_avatar: string;
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

      // 🔥 后端联调 - 打印点赞列表原始数据
      console.log('🔥 点赞列表 - 原始API响应:', responseData);
      console.log('🔥 点赞列表 - 数据项数量:', likes.length);

      // 过滤出帖子类型的点赞
      const postLikes = likes.filter(item => item.type === 'post');
      console.log('🔥 点赞列表 - 帖子类型点赞数量:', postLikes.length);

      // 用ID请求完整帖子详情，失败时兜底用原始数据
      const postDetails: Post[] = await Promise.all(
        postLikes.map(async (item) => {
          // 处理图片字段 - 如果是字符串"[]"或null，转换为空数组
          let imageUrls: string[] = [];
          if (item.image && item.image !== '[]' && item.image !== 'null') {
            try {
              imageUrls = JSON.parse(item.image);
            } catch {
              imageUrls = [item.image];
            }
          }
          try {
            const postResponse = await postApi.getPostById(item.id);
            return postResponse.data;
          } catch (error) {
            console.error(`获取帖子详情失败，ID: ${item.id}`, error);
            // 兜底用API原始数据
            return {
              id: item.id,
              user_id: 0,
              title: item.title,
              content: item.content,
              image_urls: imageUrls,
              tag: null,
              location: null,
              create_time: item.create_time,
              author_info: {
                id: 0,
                nickname: item.author_nickname,
                avatar: item.author_avatar,
                level: '1',
                bio: '',
                gender: 1,
              },
              is_liked: true,
              is_favorited: false,
              is_following_author: false,
              like_count: 0,
              favorite_count: 0,
              comment_count: 0,
              view_count: 0,
            } as Post;
          }
        })
      );

      // 🔥 后端联调 - 打印转换后的数据
      console.log('🔥 点赞列表 - 转换后的帖子数据:', postDetails);
      console.log('🔥 点赞列表 - 分页信息:', pagination);

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