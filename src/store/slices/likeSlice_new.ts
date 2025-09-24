import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Post } from '@/types/api/post.d'
import { Pagination } from '@/types/api/common.d'

// 获取用户点赞列表的参数类型
export interface GetLikesParams {
  page: number
  page_size: number
}

// 获取用户点赞列表 - 由于API文档中暂未提供此接口，暂时返回空数据
export const fetchLikes = createAsyncThunk<
  {
    items: Post[]
    pagination: Pagination
  },
  GetLikesParams,
  { rejectValue: string }
>('like/fetchLikes', async (params, { rejectWithValue }) => {
  try {
    // TODO: 当后端提供获取用户点赞列表的API时，调用相应的服务
    // 目前返回空数据，避免报错

    // 模拟API响应结构，转换page/page_size为skip/limit
    return {
      items: [],
      pagination: {
        skip: (params.page - 1) * params.page_size,
        limit: params.page_size,
        total: 0,
        has_more: false,
      },
    }
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch likes')
  }
})

export interface LikeState {
  items: Post[]
  pagination: Pagination & { page: number; page_size: number } // 兼容现有代码
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
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
}

const likeSlice = createSlice({
  name: 'like',
  initialState,
  reducers: {
    resetLikes: (state) => {
      state.items = []
      state.pagination = {
        skip: 0,
        limit: 10,
        total: 0,
        has_more: false,
        page: 1,
        page_size: 10,
      }
      state.loading = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikes.pending, (state) => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const { items, pagination } = action.payload

        const currentPage = Math.floor(pagination.skip / pagination.limit) + 1

        if (currentPage === 1) {
          // 第一页，重置数据
          state.items = items
        } else {
          // 加载更多，追加数据
          state.items = [...state.items, ...items]
        }

        state.pagination = {
          ...pagination,
          page: currentPage,
          page_size: pagination.limit,
        }
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { resetLikes } = likeSlice.actions
export default likeSlice.reducer
