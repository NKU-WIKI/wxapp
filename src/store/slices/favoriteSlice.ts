import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMyFavorites } from '@/services/api/user';
import { getPostById } from '@/services/api/post';
import { PaginationParams } from '@/types/api/common';

// 收藏项的动作类型
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

// 收藏项类型，包含具体内容信息
export interface FavoriteItem extends ActionRead {
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
    type?: 'post' | 'note' | 'knowledge';
  };
}

// 获取收藏列表的参数类型
export interface GetFavoritesParams {
  skip?: number;
  limit?: number;
  isAppend?: boolean;
}

// 获取用户收藏列表
export const fetchFavorites = createAsyncThunk<
  {
    items: FavoriteItem[];
    pagination: {
      skip: number;
      limit: number;
      total: number;
      has_more: boolean;
    };
  },
  GetFavoritesParams,
  { rejectValue: string }
>('favorite/fetchFavorites', async (params, { rejectWithValue }) => {
  try {
    console.log('Fetching favorites with params:', params);
    
    const { skip = 0, limit = 20 } = params;
    const paginationParams: PaginationParams = { skip, limit };

    // 直接获取我的收藏列表
    const favoritesResponse = await getMyFavorites(paginationParams);
    console.log('Favorites response:', favoritesResponse);
    
    if (favoritesResponse.code !== 0) {
      throw new Error(favoritesResponse.message || 'Failed to fetch favorites');
    }

    const favoriteActions = favoritesResponse.data || [];
    
    console.log('Raw favorites data:', favoriteActions);
    
    // 检查数据结构，如果有 action_type 字段就过滤，否则直接使用所有数据
    let activeFavorites = favoriteActions;
    if (favoriteActions.length > 0 && favoriteActions[0].action_type !== undefined) {
      // 只过滤 action_type 为 'favorite' 的项目，不检查 is_active 字段
      activeFavorites = favoriteActions.filter(
        action => action.action_type === 'favorite'
      );
    }
    
    console.log('Active favorites after filtering:', activeFavorites);

    // 获取收藏内容的详细信息
    const favoriteItems: FavoriteItem[] = await Promise.all(
      activeFavorites.map(async (action) => {
        // 设置默认的 target_type，如果没有的话假设是 post
        const targetType = action.target_type || 'post';
        
        const favoriteItem: FavoriteItem = { 
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
              
              favoriteItem.content = {
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
          // TODO: 添加对 knowledge、note 等其他类型的支持
        } catch (error) {
          console.warn(`Failed to fetch content for ${action.target_type} ${action.target_id}:`, error);
          // 即使获取内容失败，也保留收藏记录，但没有详细内容
        }

        return favoriteItem;
      })
    );

    // 计算分页信息
    const hasMore = favoriteItems.length >= limit;
    
    return {
      items: favoriteItems,
      pagination: {
        skip,
        limit,
        total: favoriteItems.length,
        has_more: hasMore
      }
    };
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    
    // 根据错误类型返回不同的提示
    if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
      return rejectWithValue('网络连接异常，请检查网络设置');
    }
    
    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return rejectWithValue('登录已过期，请重新登录');
    }
    
    return rejectWithValue(error.message || '获取收藏列表失败，请稍后重试');
  }
});

export interface FavoriteState {
  items: FavoriteItem[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FavoriteState = {
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

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    resetFavorites: (state) => {
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
    // 同步设置收藏列表的后备action
    setFavorites: (
      state,
      action: PayloadAction<{
        items: FavoriteItem[];
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
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const { items, pagination } = action.payload;
        
        // 检查是否是追加模式
        const isAppend = (action.meta.arg as GetFavoritesParams).isAppend;
        
        if (isAppend && pagination.skip > 0) {
          // 追加数据
          state.items = [...state.items, ...items];
        } else {
          // 重置数据（第一页或刷新）
          state.items = items;
        }
        
        state.pagination = pagination;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetFavorites, setFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
