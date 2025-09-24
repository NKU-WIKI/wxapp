import Taro from '@tarojs/taro'

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


import {
  getForumPosts,
  createForumPost,
  getFeed,
  updatePost as updatePostApi,
  deletePost as deletePostApi,
  getMyDrafts,
  getPostDetail,
} from '@/services/api/post'
import { PaginatedData } from '@/types/api/common'
import {
  Post,
  GetForumPostsParams,
  CreateForumPostRequest,
  GetFeedParams,
  PostUpdate,
} from '@/types/api/post'

import { toggleAction } from './actionSlice' // 从 actionSlice 导入
import { fetchAboutInfo } from './userSlice' // 从 userSlice 导入


// 获取论坛帖子的 Thunk
export const fetchForumPosts = createAsyncThunk(
  'posts/fetchForumPosts',
  async (params: GetForumPostsParams, { rejectWithValue, dispatch, getState }) => {
    try {
      // 确保在调用帖子接口前先获取about信息（包含租户信息）
      const state = getState() as any
      if (!state.user.aboutInfo) {
        try {
          await dispatch(fetchAboutInfo())
        } catch (error) {}
      }

      const response = await getForumPosts(params)
      const rawItems = Array.isArray(response.data) ? response.data : []
      const items = rawItems
        .filter((p: any) => p?.status === 'published')
        .map((p: any) => {
          if ((!Array.isArray(p?.tags) || p.tags.length === 0) && p?.id) {
            try {
              const map = Taro.getStorageSync('post_tags_map') || {}
              if (Array.isArray(map[p.id]) && map[p.id].length > 0) {
                p.tags = map[p.id]
              }
            } catch {}
          }
          return p
        })
      return {
        items, // keep only published items in feed/list
        pagination: {
          skip: params.skip || 0,
          limit: params.limit || 20,
          total: items.length, // Approximate total from current response
          has_more: items.length === (params.limit || 20), // Has more if returned count equals limit
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch forum posts')
    }
  }
)

// 获取社区动态信息流的 Thunk
export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async (params: GetFeedParams, { rejectWithValue, dispatch, getState }) => {
    try {
      // 确保在调用帖子接口前先获取about信息（包含租户信息）
      const state = getState() as any
      if (!state.user.aboutInfo) {
        try {
          await dispatch(fetchAboutInfo())
        } catch (error) {}
      }

      const response = await getFeed(params)
      const rawItems = Array.isArray(response.data) ? response.data : []
      const items = rawItems
        .filter((p: any) => p?.status === 'published')
        .map((p: any) => {
          if ((!Array.isArray(p?.tags) || p.tags.length === 0) && p?.id) {
            try {
              const map = Taro.getStorageSync('post_tags_map') || {}
              if (Array.isArray(map[p.id]) && map[p.id].length > 0) {
                p.tags = map[p.id]
              }
            } catch {}
          }
          return p
        })
      return {
        items,
        pagination: {
          skip: params.skip || 0,
          limit: params.limit || 20,
          total: items.length,
          has_more: items.length === (params.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch feed')
    }
  }
)

// 创建论坛帖子的 Thunk
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: CreateForumPostRequest, { rejectWithValue }) => {
    try {
      const response = await createForumPost(postData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create post')
    }
  }
)

// 更新帖子的 Thunk
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, data }: { postId: string; data: PostUpdate }, { rejectWithValue }) => {
    try {
      const response = await updatePostApi(postId, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update post')
    }
  }
)

// 删除帖子的 Thunk
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await deletePostApi(postId)
      return postId // Return the id to remove from the list
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete post')
    }
  }
)

// 获取帖子详情的 Thunk
export const fetchPostDetail = createAsyncThunk(
  'posts/fetchPostDetail',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await getPostDetail(postId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch post detail')
    }
  }
)

// 获取草稿箱的 Thunk
export const fetchDrafts = createAsyncThunk('posts/fetchDrafts', async (_, { rejectWithValue }) => {
  try {
    const response = await getMyDrafts()
    const list = Array.isArray(response.data)
      ? response.data.filter((p: any) => p?.status === 'draft')
      : []
    return list
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch drafts')
  }
})

export interface PostsState {
  list: Post[]
  currentPost: Post | null
  pagination: PaginatedData<Post>['pagination'] | null
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  detailLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  draftsLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: any
}

const initialState: PostsState = {
  list: [],
  currentPost: null,
  pagination: null,
  loading: 'idle',
  detailLoading: 'idle',
  draftsLoading: 'idle',
  error: null,
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Forum Posts
      .addCase(fetchForumPosts.pending, (state) => {
        state.loading = 'pending'
      })
      .addCase(fetchForumPosts.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        if (action.payload && action.payload.items) {
          // 使用API返回的最新状态，直接替换旧数据
          // 用户交互状态应通过toggleAction异步更新，而不是在fetch时保留
          if (action.payload.pagination && action.payload.pagination.skip > 0) {
            // 如果是加载更多，追加到现有列表
            state.list = [...state.list, ...action.payload.items]
          } else {
            // 如果是刷新或首次加载，直接替换
            state.list = action.payload.items
          }
        }
        if (action.payload && action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchForumPosts.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = 'pending'
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        if (action.payload && action.payload.items) {
          // 使用API返回的最新状态
          if (action.payload.pagination && action.payload.pagination.skip > 0) {
            // 如果是加载更多，追加到现有列表
            state.list = [...state.list, ...action.payload.items]
          } else {
            // 如果是刷新或首次加载，直接使用API返回的数据
            // 用户交互状态应通过toggleAction异步更新，而不是在fetch时保留
            state.list = action.payload.items
          }
        }
        if (action.payload && action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      // Fetch Post Detail
      .addCase(fetchPostDetail.pending, (state) => {
        state.detailLoading = 'pending'
      })
      .addCase(fetchPostDetail.fulfilled, (state, action) => {
        state.detailLoading = 'succeeded'
        const payload: any = action.payload || {}
        const inList = state.list.find((p) => p.id === payload.id) as any
        if (
          (!Array.isArray(payload.tags) || payload.tags.length === 0) &&
          Array.isArray(inList?.tags) &&
          inList.tags.length > 0
        ) {
          payload.tags = inList.tags
        }
        if (
          (!Array.isArray(payload.images) || payload.images.length === 0) &&
          Array.isArray(inList?.images) &&
          inList.images.length > 0
        ) {
          payload.images = inList.images
        }
        // 本地映射兜底
        try {
          if ((!Array.isArray(payload.tags) || payload.tags.length === 0) && payload?.id) {
            const map = Taro.getStorageSync('post_tags_map') || {}
            if (Array.isArray(map[payload.id]) && map[payload.id].length > 0) {
              payload.tags = map[payload.id]
            }
          }
        } catch {}
        state.currentPost = payload
      })
      .addCase(fetchPostDetail.rejected, (state, action) => {
        state.detailLoading = 'failed'
        state.error = action.payload as string
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        const req = action.meta?.arg as CreateForumPostRequest | undefined
        const payload: any = action.payload || {}
        // 将发布时选择的 tags/images 回填到新帖子（后端当前未回传）
        if (
          (!Array.isArray(payload?.tags) || payload.tags.length === 0) &&
          Array.isArray(req?.tags)
        ) {
          payload.tags = req?.tags
        }
        if (
          (!Array.isArray(payload?.images) || payload.images.length === 0) &&
          Array.isArray(req?.images)
        ) {
          payload.images = req?.images
        }
        // 记录标签映射，供后续拉取时兜底
        try {
          if (payload?.id && Array.isArray(payload?.tags)) {
            const map = Taro.getStorageSync('post_tags_map') || {}
            map[payload.id] = payload.tags
            Taro.setStorageSync('post_tags_map', map)
          }
        } catch {}
        // 仅当为已发布帖子时才插入到当前列表，避免草稿短暂出现在首页
        if ((payload as any)?.status === 'published') {
          state.list.unshift(payload)
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
        if (state.currentPost && state.currentPost.id === action.payload.id) {
          state.currentPost = action.payload
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload)
        if (state.currentPost && state.currentPost.id === action.payload) {
          state.currentPost = null
        }
      })
      // Fetch Drafts
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.draftsLoading = 'succeeded'
        state.list = action.payload
      })
      .addCase(fetchDrafts.pending, (state) => {
        state.draftsLoading = 'pending'
      })
      .addCase(fetchDrafts.rejected, (state, action) => {
        state.draftsLoading = 'failed'
        state.error = action.payload as string
      })
      // Listen for the toggleAction from actionSlice
      .addCase(toggleAction.fulfilled, (state, action) => {
        const { request, is_active, count } = action.payload
        const { target_id, action_type, target_type } = request

        const updatePostState = (post: Post) => {
          if (target_type === 'post') {
            if (action_type === 'like') {
              post.is_liked = is_active
              // 使用API返回的count字段更新点赞数量，如果没有则手动计算
              if (count !== undefined) {
                post.like_count = count
              } else {
                // 手动计算点赞数量
                post.like_count = (post.like_count || 0) + (is_active ? 1 : -1)
              }
            } else if (action_type === 'favorite') {
              post.is_favorited = is_active
              // 使用API返回的count字段更新收藏数量，如果没有则手动计算
              if (count !== undefined) {
                post.favorite_count = count
              } else {
                // 手动计算收藏数量
                post.favorite_count = (post.favorite_count || 0) + (is_active ? 1 : -1)
              }
            }
          }
          if (target_type === 'user' && action_type === 'follow') {
            if (post.user.id === target_id) {
              post.is_following_author = is_active
            }
          }
        }

        // 根据不同 target_type 精准更新
        if (target_type === 'post') {
          const postInList = state.list.find((p) => p.id === target_id)
          if (postInList) updatePostState(postInList)
          if (state.currentPost && state.currentPost.id === target_id) {
            updatePostState(state.currentPost)
          }
        }

        if (target_type === 'user' && action_type === 'follow') {
          // 更新列表中所有由该作者发布的帖子
          state.list.forEach((p) => {
            if (p.user && p.user.id === target_id) {
              updatePostState(p)
            }
          })
          // 更新详情
          if (
            state.currentPost &&
            state.currentPost.user &&
            state.currentPost.user.id === target_id
          ) {
            updatePostState(state.currentPost)
          }
        }
      })
  },
})

export default postsSlice.reducer
