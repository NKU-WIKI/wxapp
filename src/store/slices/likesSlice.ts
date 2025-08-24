import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMyLikes } from '@/services/api/user';
import { getPostById } from '@/services/api/post';
import { PaginationParams } from '@/types/api/common';

// 点赞项的动作类型 (复用收藏的类型定义)
export interface ActionRead {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  target_id: string;
  target_type: 'post' | 'comment' | 'user' | 'knowledge';
  action_type: 'like' | 'favorite' | 'follow';
  is_active: boolean;
}

// 点赞项类型，包含具体内容信息
export interface LikeItem extends ActionRead {
  content?: {
    id: string;
    title?: string;
    content?: string;
    author_info?: {
      id: string;
      nickname: string;
      avatar?: string;
    };
    created_at?: string;
    view_count?: number;
    like_count?: number;
    comment_count?: number;
    type?: 'post' | 'note' | 'knowledge' | 'comment';
  };
}

// 获取用户点赞的参数类型
export interface GetLikesParams {
  skip?: number;
  limit?: number;
  isAppend?: boolean;
}

// 获取用户点赞列表
export const fetchLikes = createAsyncThunk<
  {
    items: LikeItem[];
    pagination: {
      skip: number;
      limit: number;
      total: number;
      has_more: boolean;
    };
  },
  GetLikesParams,
  { rejectValue: string }
>('likes/fetchLikes', async (params, { rejectWithValue }) => {
  try {
    console.log('Fetching likes with params:', params);
    
    const { skip = 0, limit = 20 } = params;
    const paginationParams: PaginationParams = { skip, limit };

    // 直接获取我的点赞列表
    const likesResponse = await getMyLikes(paginationParams);
    console.log('Likes response:', likesResponse);
    
    if (likesResponse.code !== 0) {
      throw new Error(likesResponse.message || 'Failed to fetch likes');
    }

    const likeActions = likesResponse.data || [];
    
    console.log('Raw likes data:', likeActions);
    
    // 检查数据结构，如果有 action_type 字段就过滤，否则直接使用所有数据
    let activeLikes = likeActions;
    if (likeActions.length > 0 && likeActions[0].action_type !== undefined) {
      // 只过滤 action_type 为 'like' 的项目，不检查 is_active 字段
      activeLikes = likeActions.filter(
        action => action.action_type === 'like'
      );
    }
    
    console.log('Active likes after filtering:', activeLikes);

    // 获取点赞内容的详细信息
    const likeItems: LikeItem[] = await Promise.all(
      activeLikes.map(async (action) => {
        // 设置默认的 target_type，如果没有的话假设是 post
        const targetType = action.target_type || 'post';
        
        const likeItem: LikeItem = { 
          ...action, 
          target_type: targetType 
        };

        try {
          // 根据目标类型获取具体内容
          if (targetType === 'post') {
            const postResponse = await getPostById(action.target_id);
            console.log('Post response for target_id:', action.target_id, postResponse);
            if (postResponse.code === 0 && postResponse.data) {
              const post = postResponse.data;
              console.log('Post data author_info:', post.author_info);
              console.log('Post data user:', post.user);
              
              // 获取作者信息，优先使用 author_info，其次使用 user
              const authorInfo = post.author_info || post.user;
              
              likeItem.content = {
                id: post.id,
                title: post.title,
                content: post.content,
                author_info: authorInfo ? {
                  id: authorInfo.id,
                  nickname: authorInfo.nickname,
                  avatar: authorInfo.avatar || undefined
                } : undefined,
                created_at: post.created_at,
                view_count: post.view_count,
                like_count: post.like_count,
                comment_count: post.comment_count,
                type: 'post'
              };
            }
          }
          // TODO: 添加对 comment、knowledge 等其他类型的支持
        } catch (error) {
          console.warn(`Failed to fetch content for ${action.target_type} ${action.target_id}:`, error);
          // 即使获取内容失败，也保留点赞记录，但没有详细内容
        }

        return likeItem;
      })
    );

    // 计算分页信息
    const hasMore = likeItems.length >= limit;
    
    return {
      items: likeItems,
      pagination: {
        skip,
        limit,
        total: likeItems.length,
        has_more: hasMore
      }
    };
  } catch (error: any) {
    console.error('Error fetching likes:', error);
    
    // 根据错误类型返回不同的提示
    if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
      return rejectWithValue('网络连接异常，请检查网络设置');
    }
    
    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return rejectWithValue('登录已过期，请重新登录');
    }
    
    return rejectWithValue(error.message || '获取点赞列表失败，请稍后重试');
  }
});

export interface LikesState {
  items: LikeItem[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LikesState = {
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

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    resetLikes: (state) => {
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
    // 同步设置点赞列表的后备action
    setLikes: (
      state,
      action: PayloadAction<{
        items: LikeItem[];
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
      .addCase(fetchLikes.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const { items, pagination } = action.payload;
        
        // 检查是否是追加模式
        const isAppend = (action.meta.arg as GetLikesParams).isAppend;
        
        if (isAppend && pagination.skip > 0) {
          // 追加数据
          state.items = [...state.items, ...items];
        } else {
          // 重置数据（第一页或刷新）
          state.items = items;
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetLikes, setLikes } = likesSlice.actions;
export default likesSlice.reducer;
