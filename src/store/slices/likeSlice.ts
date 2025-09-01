import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Post } from "@/types/api/post.d";
import { Pagination } from "@/types/api/common.d";
import { getUserLikedPosts, getUserLikedNotes } from "@/services/api/user";

// 获取用户点赞列表的参数类型
export interface GetLikesParams {
  page: number;
  page_size: number;
  isAppend?: boolean; // 是否追加数据
}

// 点赞项类型（可以是帖子或笔记）
export interface LikeItem extends Omit<Post, 'user_id'> {
  type?: 'post' | 'note'; // 添加类型标识
  author_name?: string; // 作者名称（用于笔记）
  author_avatar?: string; // 作者头像（用于笔记）
  user_id?: string; // 用户ID（用于笔记）
}

// 获取用户点赞列表
export const fetchLikes = createAsyncThunk<
  {
    items: LikeItem[];
    pagination: Pagination;
  },
  GetLikesParams,
  { rejectValue: string }
>("like/fetchLikes", async (params, { rejectWithValue }) => {
  try {
    
    
    const { page, page_size } = params;
    const paginationParams = {
      skip: (page - 1) * page_size,
      limit: page_size
    };

    // 并行获取点赞的帖子和笔记
    const [postsResponse, notesResponse] = await Promise.allSettled([
      getUserLikedPosts(paginationParams),
      getUserLikedNotes(paginationParams)
    ]);

    let allItems: LikeItem[] = [];
    let totalCount = 0;

    // 处理帖子响应
    if (postsResponse.status === 'fulfilled' && postsResponse.value.data) {
      const postsData = postsResponse.value.data;
      if (Array.isArray(postsData.data)) {
        const postsWithType = postsData.data.map(post => ({
          ...post,
          type: 'post' as const
        }));
        allItems.push(...postsWithType);
        totalCount += postsData.pagination?.total || 0;
      }
    } else {
      
    }

    // 处理笔记响应
    if (notesResponse.status === 'fulfilled' && notesResponse.value.data) {
      const notesData = notesResponse.value.data;
      if (Array.isArray(notesData.data)) {
        const notesWithType = notesData.data.map(note => ({
          ...note,
          type: 'note' as const
        }));
        allItems.push(...notesWithType);
        totalCount += notesData.pagination?.total || 0;
      }
    } else {
      
    }

    // 按创建时间倒序排列
    allItems.sort((a, b) => {
      const timeA = new Date(a.created_at || a.create_time || 0).getTime();
      const timeB = new Date(b.created_at || b.create_time || 0).getTime();
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
        has_more: hasMore
      }
    };
  } catch (error: any) {
    
    return rejectWithValue(error.message || "Failed to fetch likes");
  }
});

export interface LikeState {
  items: LikeItem[];
  pagination: Pagination & { page: number; page_size: number }; // 兼容现有代码
  loading: "idle" | "pending" | "succeeded" | "failed";
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
    page_size: 10
  },
  loading: "idle",
  error: null,
};

const likeSlice = createSlice({
  name: "like",
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
        page_size: 10
      };
      state.loading = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikes.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.loading = "succeeded";
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
          page_size: pagination.limit
        };
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetLikes } = likeSlice.actions;
export default likeSlice.reducer;
