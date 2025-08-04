import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { PaginatedData, Pagination } from '@/types/api/common';
import { GetPostsParams, Post } from '@/types/api/post';
import { User } from '@/types/api/user';
import postApi from '@/services/api/post';
import actionApi from '@/services/api/action';
import { ToggleActionParams, ToggleActionResponse } from '@/types/api/action.d';
import { RootState } from '..';

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 云存储链接转换函数
const convertCloudUrl = (cloudUrl: string): string => {
  if (!cloudUrl || !cloudUrl.startsWith('cloud://')) {
    return cloudUrl;
  }

  try {
    const cloudPath = cloudUrl.replace('cloud://', '');
    const parts = cloudPath.split('/');
    const envId = parts[0]; 
    const filePath = parts.slice(1).join('/');

    const envMatch = envId.match(/636c-cloud1-7gu881ir0a233c29-1352978573/);
    if (envMatch) {
      return `https://${envMatch[0]}.tcb.qcloud.la/${filePath}`;
    }

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
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const response = await postApi.getPosts(params);

      if (response.data && response.data.length > 0 && !params.isAppend) {
        const postsToFetch = response.data.slice(0, 3);
        
        postsToFetch.forEach(post => {
          dispatch(fetchPostDetail(post.id));
        });
      }

      return {
        items: response.data,
        pagination: response.pagination,
        isAppend: params.isAppend || false,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch posts');
    }
  }
);

// 获取帖子详情的 Thunk（带重试机制）
export const fetchPostDetail = createAsyncThunk<Post, number>(
  'posts/fetchPostDetail',
  async (postId, { rejectWithValue }) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 500; // ms

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await postApi.getPostById(postId);
        return response.data;
      } catch (error: any) {
        // 只对404错误进行重试
        if (error.statusCode === 404 && attempt < MAX_RETRIES) {
          console.log(`获取帖子 ${postId} 失败 (尝试 ${attempt}/${MAX_RETRIES})，${RETRY_DELAY}ms后重试...`);
          await delay(RETRY_DELAY);
        } else {
          // 如果不是404或已达到最大重试次数，则直接失败
          return rejectWithValue(error.msg || `获取帖子详情失败 (尝试 ${attempt})`);
        }
      }
    }
    // 循环结束后如果还未成功，则最终失败
    return rejectWithValue(`获取帖子 ${postId} 失败，已达最大重试次数`);
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
    const apiData = {
      ...postData,
      image: postData.image_urls
    };
    delete apiData.image_urls;

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

export interface PostsState {
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
          
          const defaultAuthor: User = {
            id: -1,
            nickname: '未知用户',
            avatar: 'https://via.placeholder.com/150',
            gender: 0,
            level: '0',
            bio: '该用户很神秘，什么也没留下',
          };

          const existingPostsMap = new Map<number, Post>();
          state.list.forEach(post => {
            existingPostsMap.set(post.id, post);
          });

          const processedItems = action.payload.items.map(post => {
            let updatedPost = { ...post };

            if (!updatedPost.author_info) {
              updatedPost.author_info = defaultAuthor;
            }
            
            const existingPost = existingPostsMap.get(post.id);
            if (existingPost) {
              updatedPost = {
                ...updatedPost,
                is_liked: post.is_liked === true ? true : (existingPost.is_liked === true),
                is_favorited: post.is_favorited === true ? true : (existingPost.is_favorited === true),
                is_following_author: post.is_following_author === true ? true : (existingPost.is_following_author === true),
              };
            }
            
            return updatedPost;
          });
          
          if (action.payload.isAppend) {
            state.list = [...state.list, ...processedItems];
          } else {
            state.list = processedItems;
          }
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchPostDetail.pending, (state) => {
        state.detailLoading = 'pending';
      })
      .addCase(fetchPostDetail.fulfilled, (state, action: PayloadAction<Post>) => {
        state.detailLoading = 'succeeded';
        
        state.currentPost = action.payload;
        
        const postIndex = state.list.findIndex(p => p.id === action.payload.id);
        if (postIndex !== -1) {
          const existingPost = state.list[postIndex];
          
          state.list[postIndex] = {
            ...state.list[postIndex],
            is_liked: action.payload.is_liked === true ? true : (existingPost.is_liked === true),
            is_favorited: action.payload.is_favorited === true ? true : (existingPost.is_favorited === true),
            is_following_author: action.payload.is_following_author === true ? true : (existingPost.is_following_author === true),
          };
        }
      })
      .addCase(fetchPostDetail.rejected, (state, action) => {
        state.detailLoading = 'failed';
        state.error = action.payload as string;
      })
      .addCase(toggleAction.fulfilled, (state, action) => {
        const { postId, actionType, response } = action.payload;

        if (actionType === 'follow') {
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

        if (state.currentPost && state.currentPost.id === postId) {
          switch (actionType) {
            case 'like':
              state.currentPost.is_liked = response.is_active;
              state.currentPost.like_count = response.count;
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
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost = null;
        }
      });
  },
});

export default postsSlice.reducer;
