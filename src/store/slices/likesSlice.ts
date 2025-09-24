import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getMyLikes } from '@/services/api/user'
import { getPostByIdSilent } from '@/services/api/post'
import { PaginationParams } from '@/types/api/common'

// 点赞项的动作类型 (复用收藏的类型定义)
export interface ActionRead {
  id: string
  tenant_id: string
  created_at: string
  updated_at: string
  target_id: string
  target_type: 'post' | 'comment' | 'user' | 'knowledge'
  action_type: 'like' | 'favorite' | 'follow'
  is_active: boolean
}

// 点赞项类型，包含具体内容信息
export interface LikeItem extends ActionRead {
  content?: {
    id: string
    title?: string
    content?: string
    author_info?: {
      id: string
      nickname: string
      avatar?: string
    }
    created_at?: string
    view_count?: number
    like_count?: number
    comment_count?: number
    type?: 'post' | 'note' | 'knowledge' | 'comment'
  }
}

// 获取用户点赞的参数类型
export interface GetLikesParams {
  skip?: number
  limit?: number
  isAppend?: boolean
}

// 获取用户点赞列表
export const fetchLikes = createAsyncThunk<
  {
    items: LikeItem[]
    pagination: {
      skip: number
      limit: number
      total: number
      has_more: boolean
    }
    filteredCount?: number // 可选字段，用于统计被过滤的删除内容数量
  },
  GetLikesParams,
  { rejectValue: string }
>('likes/fetchLikes', async (params, { rejectWithValue }) => {
  try {
    const { skip = 0, limit = 20 } = params
    const paginationParams: PaginationParams = { skip, limit }

    // 直接获取我的点赞列表
    const likesResponse = await getMyLikes(paginationParams)

    if (likesResponse.code !== 0) {
      throw new Error(likesResponse.message || 'Failed to fetch likes')
    }

    const likeActions = likesResponse.data || []

    // 检查数据结构，如果有 action_type 字段就过滤，否则直接使用所有数据
    let activeLikes = likeActions
    if (likeActions.length > 0 && likeActions[0].action_type !== undefined) {
      // 只过滤 action_type 为 'like' 的项目，不检查 is_active 字段
      activeLikes = likeActions.filter((action) => action.action_type === 'like')
    }

    // 获取点赞内容的详细信息
    const likeItems: LikeItem[] = []
    let filteredCount = 0 // 记录被过滤掉的删除内容数量

    for (const action of activeLikes) {
      // 设置默认的 target_type，如果没有的话假设是 post
      const targetType = action.target_type || 'post'

      const likeItem: LikeItem = {
        ...action,
        target_type: targetType,
      }

      try {
        // 根据目标类型获取具体内容
        if (targetType === 'post') {
          const postResponse = await getPostByIdSilent(action.target_id)

          if (postResponse.code === 0 && postResponse.data) {
            const post = postResponse.data

            // 获取作者信息，优先使用 author_info，其次使用 user
            const authorInfo = post.author_info || post.user

            likeItem.content = {
              id: post.id,
              title: post.title,
              content: post.content,
              author_info: authorInfo
                ? {
                    id: authorInfo.id,
                    nickname: authorInfo.nickname,
                    avatar: authorInfo.avatar || undefined,
                  }
                : undefined,
              created_at: post.created_at,
              view_count: post.view_count,
              like_count: post.like_count,
              comment_count: post.comment_count,
              type: 'post',
            }

            // 只有成功获取到内容的点赞项才添加到列表中
            likeItems.push(likeItem)
          } else if (postResponse.code === 404) {
            // 帖子已被删除，静默处理，不在控制台输出任何信息
            filteredCount++
            continue // 跳过这个点赞项
          } else {
            // 其他错误也静默处理
            filteredCount++
          }
        } else {
          // TODO: 添加对 comment、knowledge 等其他类型的支持
          // 对于其他类型，暂时保留但没有详细内容
          likeItems.push(likeItem)
        }
      } catch (error: any) {
        // 静默处理其他意外错误
        filteredCount++
      }
    }

    // 计算分页信息
    const hasMore = likeItems.length >= limit

    // 如果有被过滤的项目，输出提示信息
    if (filteredCount > 0) {
    }

    return {
      items: likeItems,
      pagination: {
        skip,
        limit,
        total: likeItems.length,
        has_more: hasMore,
      },
      filteredCount,
    }
  } catch (error: any) {
    // 根据错误类型返回不同的提示
    if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
      return rejectWithValue('网络连接异常，请检查网络设置')
    }

    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return rejectWithValue('登录已过期，请重新登录')
    }

    return rejectWithValue(error.message || '获取点赞列表失败，请稍后重试')
  }
})

export interface LikesState {
  items: LikeItem[]
  pagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  }
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
  filteredCount: number // 被过滤掉的删除内容数量
}

const initialState: LikesState = {
  items: [],
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
    has_more: false,
  },
  loading: 'idle',
  error: null,
  filteredCount: 0,
}

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    resetLikes: (state) => {
      state.items = []
      state.pagination = {
        skip: 0,
        limit: 20,
        total: 0,
        has_more: false,
      }
      state.loading = 'idle'
      state.error = null
      state.filteredCount = 0
    },
    // 同步设置点赞列表的后备action
    setLikes: (
      state,
      action: PayloadAction<{
        items: LikeItem[]
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
      .addCase(fetchLikes.pending, (state) => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const { items, pagination, filteredCount } = action.payload

        // 检查是否是追加模式
        const isAppend = (action.meta.arg as GetLikesParams).isAppend

        if (isAppend && pagination.skip > 0) {
          // 追加数据
          state.items = [...state.items, ...items]
        } else {
          // 重置数据（第一页或刷新）
          state.items = items
        }

        state.pagination = pagination

        // 更新被过滤的内容数量
        if (filteredCount !== undefined) {
          state.filteredCount = filteredCount
        }
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { resetLikes, setLikes } = likesSlice.actions
export default likesSlice.reducer
