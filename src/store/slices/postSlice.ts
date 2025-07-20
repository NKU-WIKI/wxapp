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
export const fetchPosts = createAsyncThunk<
  PaginatedData<Post> & { isAppend?: boolean },
  GetPostsParams & { isAppend?: boolean }
>(
  'posts/fetchPosts',
  async (params, { rejectWithValue }) => {
    try {
      const { isAppend, ...apiParams } = params;
      console.log(apiParams);
      const response = await postApi.getPosts(apiParams);

      console.log('Fetched posts:', response);

      // 将后端的扁平结构转换为前端Redux store需要的嵌套结构
      const paginatedData: PaginatedData<Post> & { isAppend?: boolean } = {
        items: response.data,
        pagination: response.pagination,
        isAppend,
      };

      console.log(paginatedData)

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
    console.log('Fetched posts:', response);
    // response的类型是BaseResponse<ToggleActionResponse>，需要提取data字段
    return { postId, actionType, response: response.data };
  } catch (error: any) {
    return rejectWithValue(error.message || `Failed to toggle ${actionType}`);
  }
});

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
}

const initialState: PostsState = {
  list: [],
  pagination: null,
  loading: 'idle',
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    list: [] as Post[],
    pagination: null as Pagination | null,
    loading: 'idle' as 'idle' | 'pending' | 'succeeded' | 'failed',
    error: null as any,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(
        fetchPosts.fulfilled,
        (state, action: PayloadAction<PaginatedData<Post> & { isAppend?: boolean }>) => {
          state.loading = 'succeeded';

          if (action.payload.isAppend) {
            // 追加模式（加载更多）
            state.list = [...state.list, ...action.payload.items];
          } else {
            // 替换模式（刷新）
            state.list = action.payload.items;
          }

          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(toggleAction.fulfilled, (state, action) => {
        const { postId, actionType, response } = action.payload;
        if (actionType === 'follow') {
          // 在 post slice 中不直接处理关注状态的 UI 更新，
          // 因为一个用户的关注状态可能影响多个帖子。
          // 这种状态应该由 user slice 或其他地方管理。
          // 这里可以只记录一个日志或者什么都不做。
          console.log(`Follow action for user ${postId} completed.`);
          return;
        }

        const postIndex = state.list.findIndex((p) => p.id === postId);
        if (postIndex !== -1) {
          const post = state.list[postIndex];
          switch (actionType) {
            case 'like':
              post.is_liked = response.is_active;
              post.like_count = response.count;
              break;
            case 'favorite':
              post.is_favorited = response.is_active;
              post.favorite_count = response.count;
              break;
            default:
              break;
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
