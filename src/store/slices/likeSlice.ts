import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Post } from '@/types/api/post.d';
import type { NoteListItem } from '@/types/api/note.d';
import type { Pagination } from '@/types/api/common.d';
import { getUserLikedPosts, getUserLikedNotes } from '@/services/api/user';

// 获取用户点赞列表的参数类型
export interface GetLikesParams {
  page: number;
  page_size: number;
  isAppend?: boolean; // 是否追加数据
}

// 点赞项类型（可以是帖子或笔记）
export type LikeItem =
  | (Omit<Post, 'user_id'> & { type?: 'post' })
  | (NoteListItem & { type: 'note' });

// 笔记点赞项类型
export type LikeNoteItem = NoteListItem & {
  type: 'note';
};

// 获取用户点赞列表
export const fetchLikes = createAsyncThunk<
  {
    items: LikeItem[];
    pagination: Pagination;
  },
  GetLikesParams,
  { rejectValue: string }
>('like/fetchLikes', async (params, { rejectWithValue }) => {
  try {
    const { page, page_size } = params;
    const paginationParams = {
      skip: (page - 1) * page_size,
      limit: page_size,
    };

    // 并行获取点赞的帖子和笔记
    const [postsResponse, notesResponse] = await Promise.allSettled([
      getUserLikedPosts(paginationParams),
      getUserLikedNotes(paginationParams),
    ]);

    const allItems: LikeItem[] = [];
    let totalCount = 0;

    // 处理帖子响应
    if (postsResponse.status === 'fulfilled' && postsResponse.value.data) {
      const postsData = postsResponse.value.data;
      if (Array.isArray(postsData.data)) {
        const postsWithType = postsData.data.map((post) => ({
          ...post,
          type: 'post' as const,
        }));
        allItems.push(...postsWithType);
        totalCount += postsData.pagination?.total || 0;
      }
    } else {
      // 处理错误情况
      console.warn('Failed to fetch posts');
    }

    // 处理笔记响应
    if (notesResponse.status === 'fulfilled' && notesResponse.value.data) {
      const notesData = notesResponse.value.data;
      if (Array.isArray(notesData.data)) {
        const notesWithType: LikeNoteItem[] = notesData.data.map((note: unknown) => ({
          ...(note as NoteListItem),
          type: 'note' as const,
        }));
        allItems.push(...notesWithType);
        totalCount += notesData.pagination?.total || 0;
      }
    } else {
      // 处理错误情况
      console.warn('Failed to fetch notes');
    }

    // 按创建时间倒序排列
    allItems.sort((a, b) => {
      const getTime = (item: LikeItem): number => {
        // 对于笔记类型
        if ('type' in item && item.type === 'note') {
          return item.created_at ? new Date(item.created_at).getTime() : 0;
        }
        // 对于帖子类型
        const postItem = item as Omit<Post, 'user_id'> & { type?: 'post' };
        return postItem.created_at
          ? new Date(postItem.created_at).getTime()
          : postItem.create_time
            ? new Date(postItem.create_time).getTime()
            : 0;
      };
      const timeA = getTime(a);
      const timeB = getTime(b);
      return timeB - timeA;
    });

    // 计算分页信息
    const hasMore = allItems.length >= page_size;

    return {
      items: allItems,
      pagination: {
        skip: (page - 1) * page_size,
        limit: page_size,
        total: totalCount,
        has_more: hasMore,
      },
    };
  } catch (error: unknown) {
    const err = error as { msg?: string; message?: string };

    return rejectWithValue(err?.msg || err?.message || 'Failed to fetch likes');
  }
});

export interface LikeState {
  items: LikeItem[];
  pagination: Pagination & { page: number; page_size: number }; // 兼容现有代码
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LikeState = {
  items: [],
  pagination: {
    skip: 0,
    limit: 10,
    total: 0,
    has_more: false,
    page: 1,
    page_size: 10,
  },
  loading: 'idle',
  error: null,
};

const likeSlice = createSlice({
  name: 'like',
  initialState,
  reducers: {
    resetLikes: (state) => {
      state.items = [];
      state.pagination = {
        skip: 0,
        limit: 10,
        total: 0,
        has_more: false,
        page: 1,
        page_size: 10,
      };
      state.loading = 'idle';
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

        const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;

        // 检查是否是追加模式（通过检查meta.arg.isAppend）
        const isAppend = (action.meta.arg as GetLikesParams).isAppend;

        if (isAppend && currentPage > 1) {
          // 追加数据
          state.items = [...state.items, ...items];
        } else {
          // 重置数据（第一页或刷新）
          state.items = items;
        }

        state.pagination = {
          ...pagination,
          page: currentPage,
          page_size: pagination.limit,
        };
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetLikes } = likeSlice.actions;
export default likeSlice.reducer;
