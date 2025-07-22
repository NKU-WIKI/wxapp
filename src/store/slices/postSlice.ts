import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { PaginatedData, Pagination } from '@/types/api/common';
import { GetPostsParams, Post } from '@/types/api/post';
import { User } from '@/types/api/user';
import postApi from '@/services/api/post';
import actionApi from '@/services/api/action';
import { ToggleActionParams, ToggleActionResponse } from '@/types/api/action.d';
import { RootState } from '..';

// 本地存储用户点赞状态的工具函数
const getUserLikeState = (postId: number): { isLiked: boolean; likeCount: number } | null => {
  try {
    const likeStates = Taro.getStorageSync('user_like_states') || {};
    const result = likeStates[postId] || null;
    return result;
  } catch (error) {
    console.error('获取用户点赞状态失败:', error);
    return null;
  }
};

const saveUserLikeState = (postId: number, isLiked: boolean, likeCount: number) => {
  try {
    const likeStates = Taro.getStorageSync('user_like_states') || {};
    likeStates[postId] = { isLiked, likeCount };
    Taro.setStorageSync('user_like_states', likeStates);
  } catch (error) {
    console.error('保存用户点赞状态失败:', error);
  }
};

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
  { items: Post[]; pagination: Pagination; isAppend: boolean },
  GetPostsParams
>(
  'posts/fetchPosts',
  async (params, { rejectWithValue }) => {
    try {
      // response的类型是BackendPaginatedResponse<Post>
      // 结构：{code, msg, data: Post[], pagination: Pagination}
      const response = await postApi.getPosts(params);

      // 将后端的扁平结构转换为前端Redux store需要的嵌套结构
      return {
        items: response.data, // 后端的data字段是Post[]
        pagination: response.pagination, // 后端的pagination字段
        isAppend: params.isAppend || false, // 传递isAppend参数
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch posts');
    }
  }
);

// 获取帖子详情的 Thunk
export const fetchPostDetail = createAsyncThunk<Post, number>(
  'posts/fetchPostDetail',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postApi.getPostById(postId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.msg || 'Failed to fetch post detail');
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

// 创建帖子 Thunk
export const createPost = createAsyncThunk<
  { id: number },
  { title: string; content: string; category_id?: number; tag?: string[]; image_urls?: string[]; allow_comment?: boolean; is_public?: boolean },
  { rejectValue: string }
>('posts/createPost', async (postData, { rejectWithValue }) => {
  try {
    // 确保参数名称与API一致
    const apiData = {
      ...postData,
      image: postData.image_urls // 将 image_urls 转换为 image 以匹配 API 接口
    };
    delete apiData.image_urls; // 删除多余的字段

    const response = await postApi.createPost(apiData);
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
  currentPost: Post | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  detailLoading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: any;
}

const initialState: PostsState = {
  list: [],
  pagination: null,
  currentPost: null,
  loading: 'idle',
  detailLoading: 'idle',
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
      .addCase(
        fetchPosts.fulfilled,
        (state, action: PayloadAction<{ items: Post[]; pagination: Pagination; isAppend: boolean }>) => {
          state.loading = 'succeeded';
          
          // 定义一个默认的作者信息，以防API返回的数据不完整
          const defaultAuthor: User = {
            id: -1,
            nickname: '未知用户',
            avatar: 'https://via.placeholder.com/150', // 一个默认头像
            gender: 0,
            level: '0',
            bio: '该用户很神秘，什么也没留下',
          };

          // 处理返回的帖子列表，应用本地存储的点赞状态和默认作者信息
          const processedItems = action.payload.items.map(post => {
            let updatedPost = { ...post };

            // 如果 author_info 不存在或不完整，则使用默认值
            if (!updatedPost.author_info) {
              updatedPost.author_info = defaultAuthor;
            }

            // 检查本地存储的点赞状态
            const localLikeState = getUserLikeState(post.id);
            if (localLikeState) {
              // 如果有本地存储的点赞状态，覆盖后端返回的状态
              updatedPost.is_liked = localLikeState.isLiked;
              updatedPost.like_count = localLikeState.likeCount;
            }
            
            return updatedPost;
          });
          
          if (action.payload.isAppend) {
            // 追加新帖子到现有列表后面
            state.list = [...state.list, ...processedItems];
          } else {
            // 替换整个列表（刷新或首次加载）
            state.list = processedItems;
          }
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      // 处理获取帖子详情的状态
      .addCase(fetchPostDetail.pending, (state) => {
        state.detailLoading = 'pending';
      })
      .addCase(fetchPostDetail.fulfilled, (state, action: PayloadAction<Post>) => {
        state.detailLoading = 'succeeded';

        // 检查本地存储的用户点赞状态
        const localLikeState = getUserLikeState(action.payload.id);

        // 如果有本地存储的状态，使用本地状态覆盖后端状态
        if (localLikeState) {
          action.payload.is_liked = localLikeState.isLiked;
          action.payload.like_count = localLikeState.likeCount;
        }

        state.currentPost = action.payload;
      })
      .addCase(fetchPostDetail.rejected, (state, action) => {
        state.detailLoading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(toggleAction.fulfilled, (state, action) => {
        const { postId, actionType, response } = action.payload;

        if (actionType === 'follow') {
          // 在 post slice 中不直接处理关注状态的 UI 更新，
          // 因为一个用户的关注状态可能影响多个帖子。
          // 这种状态应该由 user slice 或其他地方管理。
          // 这里可以只记录一个日志或者什么都不做。
          return;
        }

        // 更新列表中的帖子
        const postIndex = state.list.findIndex((p) => p.id === postId);
        if (postIndex !== -1) {
          const post = state.list[postIndex];
          switch (actionType) {
            case 'like':
              post.is_liked = response.is_active;
              post.like_count = response.count;
              // 保存到本地存储
              saveUserLikeState(postId, response.is_active, response.count);
              break;
            case 'favorite':
              post.is_favorited = response.is_active;
              post.favorite_count = response.count;
              break;
            default:
              break;
          }
        }

        // 更新当前查看的帖子详情
        if (state.currentPost && state.currentPost.id === postId) {
          switch (actionType) {
            case 'like':
              state.currentPost.is_liked = response.is_active;
              state.currentPost.like_count = response.count;
              // 保存到本地存储
              saveUserLikeState(postId, response.is_active, response.count);
              break;
            case 'favorite':
              state.currentPost.is_favorited = response.is_active;
              state.currentPost.favorite_count = response.count;
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
        // 如果当前查看的帖子被删除，清空当前帖子
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost = null;
        }
      });
  },
});

export default postsSlice.reducer;
