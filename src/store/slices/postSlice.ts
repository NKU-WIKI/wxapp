import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaginatedData, Pagination } from '@/types/api/common';
import { GetPostsParams, Post } from '@/types/api/post';
import postApi from '@/services/api/post';
import actionApi from '@/services/api/action';
import { ToggleActionParams, ToggleActionResponse } from '@/types/api/action.d';
import { RootState } from '..';

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
  async (params, { rejectWithValue }) => {
    try {
      // response的类型是BackendPaginatedResponse<Post>
      // 结构：{code, msg, data: Post[], pagination: Pagination}
      const response = await postApi.getPosts(params);
      
      // 将后端的扁平结构转换为前端Redux store需要的嵌套结构
      const paginatedData: PaginatedData<Post> = {
        items: response.data, // 后端的data字段是Post[]
        pagination: response.pagination, // 后端的pagination字段
      };

      return paginatedData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch posts');
    }
  }
);

// 通用动作 Thunk (点赞/收藏/关注)
export const toggleAction = createAsyncThunk<
  { postId: number; actionType: ToggleActionParams['action_type']; response: ToggleActionResponse },
  { postId: number; actionType: ToggleActionParams['action_type'] },
  { state: RootState; rejectValue: string }
>('posts/toggleAction', async ({ postId, actionType }, { rejectWithValue }) => {
  try {
    const targetType = actionType === 'follow' ? 'user' : 'post';
    const response = await actionApi.toggleAction({
      target_type: targetType,
      target_id: postId,
      action_type: actionType,
    });
    // response的类型是BaseResponse<ToggleActionResponse>，需要提取data字段
    return { postId, actionType, response: response.data };
  } catch (error: any) {
    return rejectWithValue(error.message || `Failed to toggle ${actionType}`);
  }
});

export const fetchPostById = createAsyncThunk<Post, number>(
  'posts/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postApi.getPostById(postId);
      // 后端返回的是 BaseResponse<Post>，数据在 data 字段
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch post');
    }
  }
);

// 创建帖子 Thunk
export const createPost = createAsyncThunk<
  { id: number },
  { title: string; content: string; category_id?: number; tag?: string[]; image?: string[]; allow_comment?: boolean; is_public?: boolean },
  { rejectValue: string }
>('posts/createPost', async (postData, { rejectWithValue }) => {
  try {
    const response = await postApi.createPost(postData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create post');
  }
});

// 删除帖子 Thunk
export const deletePost = createAsyncThunk<
  { postId: number },
  { postId: number },
  { rejectValue: string }
>('posts/deletePost', async ({ postId }, { rejectWithValue }) => {
  try {
    await postApi.deletePost(postId);
    return { postId };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete post');
  }
});

interface PostsState {
  list: Post[];
  pagination: Pagination | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: any;
  currentPost: Post | null;
  detailLoading: 'idle' | 'pending' | 'succeeded' | 'failed';
  detailError: any;
}

const initialState: PostsState = {
  list: [],
  pagination: null,
  loading: 'idle',
  error: null,
  currentPost: null,
  detailLoading: 'idle',
  detailError: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    list: [] as Post[],
    pagination: null as Pagination | null,
    loading: 'idle' as 'idle' | 'pending' | 'succeeded' | 'failed',
    error: null as any,
    currentPost: null as Post | null,
    detailLoading: 'idle' as 'idle' | 'pending' | 'succeeded' | 'failed',
    detailError: null as any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(
        fetchPosts.fulfilled,
        (state, action: PayloadAction<PaginatedData<Post>>) => {
          state.loading = 'succeeded';
          state.list = action.payload.items;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPostById.pending, (state) => {
        state.detailLoading = 'pending';
        state.currentPost = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<Post>) => {
        state.detailLoading = 'succeeded';
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.detailLoading = 'failed';
        state.detailError = action.payload as string;
      })
      .addCase(toggleAction.fulfilled, (state, action) => {
        const { postId, actionType, response } = action.payload;

        // 更新列表中的帖子状态
        const postInList = state.list.find((p) => p.id === postId);
        if (postInList) {
          if (actionType === 'like') {
            postInList.is_liked = response.is_active;
            postInList.like_count = response.count;
          } else if (actionType === 'favorite') {
            postInList.is_favorited = response.is_active;
            postInList.favorite_count = response.count;
          }
        }
        
        // 如果当前详情页的帖子是同一个，也更新它
        if (state.currentPost && state.currentPost.id === postId) {
          if (actionType === 'like') {
            state.currentPost.is_liked = response.is_active;
            state.currentPost.like_count = response.count;
          } else if (actionType === 'favorite') {
            state.currentPost.is_favorited = response.is_active;
            state.currentPost.favorite_count = response.count;
          }
        }
      })
      .addCase(createPost.fulfilled, (state, action) => {
        // 创建成功后，可以重置loading状态
        // 注意：创建成功后通常会导航到新帖子页面，所以这里不需要更新列表
        state.loading = 'succeeded';
      })
      .addCase(createPost.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { postId } = action.payload;
        state.list = state.list.filter((p) => p.id !== postId);
      });
  },
});

export default postsSlice.reducer;
