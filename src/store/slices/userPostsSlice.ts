import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMe, getUserPosts } from '@/services/api/user';
import { Post } from '@/types/api/post.d';
import { PaginationParams } from '@/types/api/common';

// 获取用户帖子的参数类型
export interface GetUserPostsParams {
  skip?: number;
  limit?: number;
  isAppend?: boolean; // 是否是追加加载
}

// 获取用户发布的帖子列表
export const fetchUserPosts = createAsyncThunk<
  {
    items: Post[];
    pagination: {
      skip: number;
      limit: number;
      total: number;
      has_more: boolean;
    };
  },
  GetUserPostsParams,
  { rejectValue: string }
>('userPosts/fetchUserPosts', async (params, { rejectWithValue }) => {
  try {
    const { skip = 0, limit = 20 } = params;
    const paginationParams: PaginationParams = { skip, limit };

    // 先获取当前用户信息
    const userResponse = await getMe();
    
    if (userResponse.code !== 0) {
      throw new Error(`获取用户信息失败: ${userResponse.message || '未知错误'}`);
    }
    
    // 兼容处理：API返回的字段可能是 id 或 user_id
    const userId = userResponse.data?.user_id || (userResponse.data as any)?.id;
    
    if (!userId) {
      console.error('用户数据结构异常:', userResponse.data);
      throw new Error('用户信息中缺少用户ID字段');
    }

    // 获取用户帖子列表
    const postsResponse = await getUserPosts(userId, paginationParams);
    
    if (postsResponse.code !== 0) {
      throw new Error(postsResponse.message || 'Failed to fetch user posts');
    }

    const posts = postsResponse.data || [];
    
    // 计算分页信息
    const hasMore = posts.length >= limit;
    
    return {
      items: posts,
      pagination: {
        skip,
        limit,
        total: posts.length,
        has_more: hasMore
      }
    };
  } catch (error: any) {
    console.error('Error fetching user posts:', error);
    
    // 如果是认证相关错误，给出更具体的提示
    if (error.message?.includes('用户信息') || error.message?.includes('用户ID') || error.message?.includes('user_id')) {
      return rejectWithValue('用户登录状态异常，请重新登录');
    }
    
    // 根据错误类型返回不同的提示
    if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
      return rejectWithValue('网络连接异常，请检查网络设置');
    }
    
    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return rejectWithValue('登录已过期，请重新登录');
    }
    
    return rejectWithValue(error.message || '获取我的帖子失败，请稍后重试');
  }
});

export interface UserPostsState {
  items: Post[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserPostsState = {
  items: [],
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
    has_more: false
  },
  loading: 'idle',
  error: null
};

const userPostsSlice = createSlice({
  name: 'userPosts',
  initialState,
  reducers: {
    resetUserPosts: (state) => {
      state.items = [];
      state.pagination = {
        skip: 0,
        limit: 20,
        total: 0,
        has_more: false
      };
      state.loading = 'idle';
      state.error = null;
    },
    // 同步设置帖子列表的后备action
    setUserPosts: (
      state,
      action: PayloadAction<{
        items: Post[];
        pagination: { skip: number; limit: number; total: number; has_more: boolean };
        append?: boolean;
      }>
    ) => {
      const { items, pagination, append } = action.payload;
      if (append) {
        state.items = [...state.items, ...items];
      } else {
        state.items = items;
      }
      state.pagination = pagination;
      state.loading = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const { items, pagination } = action.payload;
        
        // 检查是否是追加模式
        const isAppend = (action.meta.arg as GetUserPostsParams).isAppend;
        
        if (isAppend && pagination.skip > 0) {
          // 追加数据
          state.items = [...state.items, ...items];
        } else {
          // 重置数据（第一页或刷新）
          state.items = items;
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetUserPosts, setUserPosts } = userPostsSlice.actions;
export default userPostsSlice.reducer;
