import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { CommentRead } from '@/types/api/comment.d'
import { getMyComments } from '@/services/api/user' // 使用新的API
import { PaginationParams } from '@/types/api/common'

// 获取用户评论列表的参数类型
export interface GetUserCommentsParams {
  skip?: number
  limit?: number
  isAppend?: boolean // 是否追加数据
}

// 定义状态类型
interface UserCommentState {
  items: CommentRead[]
  pagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  }
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

// 初始状态
const initialState: UserCommentState = {
  items: [],
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
    has_more: false,
  },
  loading: 'idle',
  error: null,
}

// 获取用户评论列表的异步thunk
export const fetchUserComments = createAsyncThunk<
  {
    items: CommentRead[]
    pagination: {
      skip: number
      limit: number
      total: number
      has_more: boolean
    }
  },
  GetUserCommentsParams,
  { rejectValue: string }
>('userComment/fetchUserComments', async (params, { rejectWithValue }) => {
  try {
    const { skip = 0, limit = 20 } = params
    const paginationParams: PaginationParams = { skip, limit }

    const response = await getMyComments(paginationParams)

    if (response.code !== 0) {
      throw new Error(response.message || 'Failed to fetch comments')
    }

    // 兼容两种返回：
    // 1) data 为数组 CommentRead[]
    // 2) data 为对象 { items: CommentRead[], total?, has_more? }
    const raw = response.data as any
    const items: CommentRead[] = Array.isArray(raw) ? raw : (raw?.items ?? [])
    const totalFromApi = Array.isArray(raw) ? undefined : raw?.total
    const hasMoreFromApi = Array.isArray(raw) ? undefined : raw?.has_more

    const hasMore = typeof hasMoreFromApi === 'boolean' ? hasMoreFromApi : items.length >= limit
    const total = typeof totalFromApi === 'number' ? totalFromApi : items.length

    return {
      items,
      pagination: {
        skip,
        limit,
        total,
        has_more: hasMore,
      },
    }
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch user comments')
  }
})

// 创建slice
const userCommentSlice = createSlice({
  name: 'userComment',
  initialState,
  reducers: {
    resetUserComments: (state) => {
      state.items = []
      state.pagination = {
        skip: 0,
        limit: 20,
        total: 0,
        has_more: false,
      }
      state.loading = 'idle'
      state.error = null
    },
    // 同步设置列表的后备 action（用于构建缓存导致 thunk 临时不可用时）
    setUserComments: (
      state,
      action: PayloadAction<{
        items: CommentRead[]
        pagination: { skip: number; limit: number; total: number; has_more: boolean }
        append?: boolean
      }>
    ) => {
      const { items, pagination, append } = action.payload
      if (append) {
        state.items = [...state.items, ...items]
      } else {
        state.items = items
      }
      state.pagination = pagination
      state.loading = 'succeeded'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const { items, pagination } = action.payload

        // 检查是否是追加模式
        const isAppend = (action.meta.arg as GetUserCommentsParams).isAppend

        if (isAppend && pagination.skip > 0) {
          // 追加数据
          state.items = [...state.items, ...items]
        } else {
          // 重置数据（第一页或刷新）
          state.items = items
        }

        state.pagination = pagination
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { resetUserComments, setUserComments } = userCommentSlice.actions
export default userCommentSlice.reducer
