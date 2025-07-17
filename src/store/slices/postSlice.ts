import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaginatedData } from '@/types/api/common';
import { GetPostsParams, Post, CreatePostParams, CreatePostResponse } from '@/types/api/post';
import { postApi } from '@/services/api/post';

// 云存储链接转换函数
const convertCloudUrl = (cloudUrl: string): string => {
  if (!cloudUrl || !cloudUrl.startsWith('cloud://')) {
    return cloudUrl;
  }

  // 将 cloud:// 链接转换为 HTTP 链接
  // cloud://cloud1-7gu881ir0a233c29.636c-cloud1-7gu881ir0a233c29-1352978573/avatars/xxx.jpg
  // 转换为: https://636c-cloud1-7gu881ir0a233c29-1352978573.tcb.qcloud.la/avatars/xxx.jpg

  try {
    const cloudPath = cloudUrl.replace('cloud://', '');
    const parts = cloudPath.split('/');
    const envId = parts[0]; // cloud1-7gu881ir0a233c29.636c-cloud1-7gu881ir0a233c29-1352978573
    const filePath = parts.slice(1).join('/'); // avatars/xxx.jpg

    // 提取环境ID中的关键部分
    const envMatch = envId.match(/636c-cloud1-7gu881ir0a233c29-1352978573/);
    if (envMatch) {
      return `https://${envMatch[0]}.tcb.qcloud.la/${filePath}`;
    }

    // 如果匹配失败，返回原链接
    return cloudUrl;
  } catch (error) {
    console.warn('转换云存储链接失败:', cloudUrl, error);
    return cloudUrl;
  }
};

// 获取帖子列表的 Thunk
export const fetchPosts = createAsyncThunk<PaginatedData<Post>, GetPostsParams>(
  'posts/fetchPosts',
  async (params: GetPostsParams, { rejectWithValue }) => {
    try {
      // postApi.getPosts() 现在返回完整的业务响应体: { code, message, data, pagination, ... }
      const response = await postApi.getPosts(params);

      // API 返回的数据结构已经和 Post 类型匹配，无需手动转换
      // 直接返回 data 和 pagination
      const pagination = response.pagination || { page: 1, page_size: 10, total: 0, total_pages: 0 };
      const paginatedData: PaginatedData<Post> = {
        items: response.data, // response.data 就是 Post[]
        page: pagination.page,
        pageSize: pagination.page_size,
        total: pagination.total,
        totalPages: pagination.total_pages,
      };

      return paginatedData;
    } catch (error: any) {
      // 确保传递给 rejectWithValue 的是可序列化的值
      return rejectWithValue(error.message || 'Failed to fetch posts');
    }
  }
);

export const createPost = createAsyncThunk<void, CreatePostParams, { rejectValue: string }>(
  'posts/createPost',
  async (params, { dispatch, rejectWithValue }) => {
    try {
      await postApi.createPost(params);
      // 发帖成功后，立即刷新帖子列表
      dispatch(fetchPosts({ page: 1, pageSize: 10 }));
    } catch (error: any) {
      // 确保传递给 rejectWithValue 的是可序列化的值
      return rejectWithValue(error.message || 'Create post failed');
    }
  }
);

interface PostsState {
  list: Post[];
  pagination: Omit<PaginatedData<any>, 'items'> | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: any;
}

const initialState: PostsState = {
  list: [],
  pagination: null,
  loading: 'idle',
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.list = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createPost.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = 'succeeded';
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string || 'Failed to create post';
      });
  },
});

export default postsSlice.reducer;
