import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getMe, getMyPosts } from '@/services/api/user'
import { Post } from '@/types/api/post.d'
import { PaginationParams } from '@/types/api/common'

// 获取用户帖子数量的参数类型
export interface GetUserPostCountParams {
  userId?: string
}

// 获取用户获赞总数的参数类型
export interface GetUserLikeCountParams {
  userId?: string
}

// 获取用户帖子的参数类型
export interface GetUserPostsParams {
  skip?: number
  limit?: number
  isAppend?: boolean // 是否是追加加载
}

// 获取用户发布的帖子列表
export const fetchUserPosts = createAsyncThunk<
  {
    items: Post[]
    pagination: {
      skip: number
      limit: number
      total: number
      has_more: boolean
    }
  },
  GetUserPostsParams,
  { rejectValue: string }
>('userPosts/fetchUserPosts', async (params, { rejectWithValue }) => {
  try {
    const { skip = 0, limit = 20 } = params
    const paginationParams: PaginationParams = { skip, limit }

    // 先获取当前用户信息
    const userResponse = await getMe()

    if (userResponse.code !== 0) {
      throw new Error(`获取用户信息失败: ${userResponse.message || '未知错误'}`)
    }

    // 兼容处理：API返回的字段可能是 id 或 user_id
    const userId = userResponse.data?.user_id || (userResponse.data as any)?.id

    if (!userId) {
      throw new Error('用户信息中缺少用户ID字段')
    }

    // 获取当前用户的帖子列表
    const postsResponse = await getMyPosts(paginationParams)

    if (postsResponse.code !== 0) {
      throw new Error(postsResponse.message || 'Failed to fetch user posts')
    }

    const userPosts = postsResponse.data || []

    // 计算分页信息
    const hasMore = userPosts.length >= limit

    return {
      items: userPosts,
      pagination: {
        skip,
        limit,
        total: userPosts.length,
        has_more: hasMore,
      },
    }
  } catch (error: any) {
    // 如果是认证相关错误，给出更具体的提示
    if (
      error.message?.includes('用户信息') ||
      error.message?.includes('用户ID') ||
      error.message?.includes('user_id')
    ) {
      return rejectWithValue('用户登录状态异常，请重新登录')
    }

    // 根据错误类型返回不同的提示
    if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
      return rejectWithValue('网络连接异常，请检查网络设置')
    }

    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return rejectWithValue('登录已过期，请重新登录')
    }

    if (error.code === 422) {
      return rejectWithValue('请求参数格式错误，请检查参数设置')
    }

    return rejectWithValue(error.message || '获取我的帖子失败，请稍后重试')
  }
})

// 获取用户帖子数量
export const fetchUserPostCount = createAsyncThunk<
  number,
  GetUserPostCountParams,
  { rejectValue: string }
>('userPosts/fetchUserPostCount', async (params, { rejectWithValue }) => {
  try {
    // 如果没有提供userId，先获取当前用户信息
    let userId = params.userId
    if (!userId) {
      const userResponse = await getMe()

      if (userResponse.code !== 0) {
        throw new Error(`获取用户信息失败: ${userResponse.message || '未知错误'}`)
      }

      userId = userResponse.data?.user_id || (userResponse.data as any)?.id

      if (!userId) {
        throw new Error('用户信息中缺少用户ID字段')
      }
    }

    // 获取当前用户的帖子列表，使用最大允许的limit值
    const postsResponse = await getMyPosts({ skip: 0, limit: 100 })

    if (postsResponse.code !== 0) {
      throw new Error(postsResponse.message || 'Failed to fetch user posts')
    }

    const userPosts = postsResponse.data || []

    return userPosts.length
  } catch (error: any) {
    if (error.message?.includes('用户信息') || error.message?.includes('用户ID')) {
      return rejectWithValue('用户登录状态异常，请重新登录')
    }

    if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
      return rejectWithValue('网络连接异常，请检查网络设置')
    }

    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return rejectWithValue('登录已过期，请重新登录')
    }

    if (error.code === 422) {
      return rejectWithValue('请求参数格式错误，请检查参数设置')
    }

    return rejectWithValue(error.message || '获取用户帖子数量失败，请稍后重试')
  }
})

// 获取用户获赞总数
export const fetchUserLikeCount = createAsyncThunk<
  number,
  GetUserLikeCountParams,
  { rejectValue: string }
>('userPosts/fetchUserLikeCount', async (params, { rejectWithValue }) => {
  try {
    // 如果没有提供userId，先获取当前用户信息
    let userId = params.userId
    if (!userId) {
      const userResponse = await getMe()

      if (userResponse.code !== 0) {
        throw new Error(`获取用户信息失败: ${userResponse.message || '未知错误'}`)
      }

      userId = userResponse.data?.user_id || (userResponse.data as any)?.id

      if (!userId) {
        throw new Error('用户信息中缺少用户ID字段')
      }
    }

    // 获取当前用户的帖子列表，计算总获赞数
    const postsResponse = await getMyPosts({ skip: 0, limit: 100 })

    if (postsResponse.code !== 0) {
      throw new Error(postsResponse.message || 'Failed to fetch user posts')
    }

    const userPosts = postsResponse.data || []

    // 计算所有帖子的获赞总数
    const totalLikes = userPosts.reduce((sum, post) => {
      return sum + (post.like_count || 0)
    }, 0)

    return totalLikes
  } catch (error: any) {
    if (error.message?.includes('用户信息') || error.message?.includes('用户ID')) {
      return rejectWithValue('用户登录状态异常，请重新登录')
    }

    if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
      return rejectWithValue('网络连接异常，请检查网络设置')
    }

    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return rejectWithValue('登录已过期，请重新登录')
    }

    if (error.code === 422) {
      return rejectWithValue('请求参数格式错误，请检查参数设置')
    }

    return rejectWithValue(error.message || '获取用户获赞总数失败，请稍后重试')
  }
})

export interface UserPostsState {
  items: Post[]
  pagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  }
  postCount: number | null
  postCountLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  postCountError: string | null
  likeCount: number | null
  likeCountLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  likeCountError: string | null
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UserPostsState = {
  items: [],
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
    has_more: false,
  },
  postCount: null,
  postCountLoading: 'idle',
  postCountError: null,
  likeCount: null,
  likeCountLoading: 'idle',
  likeCountError: null,
  loading: 'idle',
  error: null,
}

const userPostsSlice = createSlice({
  name: 'userPosts',
  initialState,
  reducers: {
    resetUserPosts: (state) => {
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
    resetUserPostCount: (state) => {
      state.postCount = null
      state.postCountLoading = 'idle'
      state.postCountError = null
    },
    resetUserLikeCount: (state) => {
      state.likeCount = null
      state.likeCountLoading = 'idle'
      state.likeCountError = null
    },
    // 同步设置帖子列表的后备action
    setUserPosts: (
      state,
      action: PayloadAction<{
        items: Post[]
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
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const { items, pagination } = action.payload

        // 检查是否是追加模式
        const isAppend = (action.meta.arg as GetUserPostsParams).isAppend

        if (isAppend && pagination.skip > 0) {
          // 追加数据
          state.items = [...state.items, ...items]
        } else {
          // 重置数据（第一页或刷新）
          state.items = items
        }

        state.pagination = pagination
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      // Fetch User Post Count
      .addCase(fetchUserPostCount.pending, (state) => {
        state.postCountLoading = 'pending'
        state.postCountError = null
      })
      .addCase(fetchUserPostCount.fulfilled, (state, action) => {
        state.postCountLoading = 'succeeded'
        state.postCount = action.payload
      })
      .addCase(fetchUserPostCount.rejected, (state, action) => {
        state.postCountLoading = 'failed'
        state.postCountError = action.payload as string
      })
      // Fetch User Like Count
      .addCase(fetchUserLikeCount.pending, (state) => {
        state.likeCountLoading = 'pending'
        state.likeCountError = null
      })
      .addCase(fetchUserLikeCount.fulfilled, (state, action) => {
        state.likeCountLoading = 'succeeded'
        state.likeCount = action.payload
      })
      .addCase(fetchUserLikeCount.rejected, (state, action) => {
        state.likeCountLoading = 'failed'
        state.likeCountError = action.payload as string
      })
  },
})

export const { resetUserPosts, resetUserPostCount, resetUserLikeCount, setUserPosts } =
  userPostsSlice.actions
export default userPostsSlice.reducer
