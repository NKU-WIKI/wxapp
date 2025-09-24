import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

import {
  getRatingItems,
  getRatingItemDetail,
  createRating,
  getRatingDetail,
  submitRating,
  getUserRatings,
  getRatingStatistics,
  getPopularRatingItems,
  searchRatingItems,
  getResourceRatings,
  getRatingTags,
  createRatingItem as createRatingItemApi,
} from '@/services/api/rating'
import {
  RatingCategory,
  RatingItem,
  UserRating,
  RatingStatistics,
  GetRatingItemsRequest,
  CreateRatingRequest,
  CreateRatingItemRequest,
  RatingItemDetailResponse,
  RatingTagsInfo,
  GetResourceRatingsRequest,
  ResourceRatingsResponse,
} from '@/types/api/rating.d'

// 注释：已移除 fetchRatingTypes，改为使用预定义的评分类型

// 异步action：获取资源评分列表
export const fetchResourceRatings = createAsyncThunk(
  'rating/fetchResourceRatings',
  async (
    params: { resourceType: string; resourceId: string } & GetResourceRatingsRequest,
    { rejectWithValue }
  ) => {
    try {
      const { resourceType, resourceId, ...queryParams } = params
      const response = await getResourceRatings(resourceType, resourceId, queryParams)
      return { resourceType, resourceId, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取资源评分列表失败')
    }
  }
)

// 异步action：获取评分标签
export const fetchRatingTags = createAsyncThunk(
  'rating/fetchTags',
  async (resourceType: string, { rejectWithValue }) => {
    try {
      const response = await getRatingTags(resourceType)
      return { resourceType, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评分标签失败')
    }
  }
)

// 异步action：获取评分项目列表
export const fetchRatingItems = createAsyncThunk(
  'rating/fetchItems',
  async (params: GetRatingItemsRequest = {}, { rejectWithValue }) => {
    try {
      const response = await getRatingItems(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评分项目列表失败')
    }
  }
)

// 异步action：获取评分项目详情
export const fetchRatingItemDetail = createAsyncThunk(
  'rating/fetchItemDetail',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await getRatingItemDetail(itemId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评分项目详情失败')
    }
  }
)

// 异步action：创建评分
export const createUserRating = createAsyncThunk(
  'rating/createRating',
  async (data: CreateRatingRequest, { rejectWithValue }) => {
    try {
      const response = await createRating(data)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '创建评分失败')
    }
  }
)

// 异步action：获取评分详情
export const fetchRatingDetail = createAsyncThunk(
  'rating/fetchRatingDetail',
  async (ratingId: string, { rejectWithValue }) => {
    try {
      const response = await getRatingDetail(ratingId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评分详情失败')
    }
  }
)

// 异步action：提交评分（兼容旧版本）
export const submitUserRating = createAsyncThunk(
  'rating/submitRating',
  async (data: { itemId: string; rating: number; review?: string }, { rejectWithValue }) => {
    try {
      const response = await submitRating(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '提交评分失败')
    }
  }
)

// 异步action：获取用户评分记录
export const fetchUserRatings = createAsyncThunk(
  'rating/fetchUserRatings',
  async (
    params: { userId?: string; itemId?: string; page?: number; pageSize?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await getUserRatings(params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取用户评分记录失败')
    }
  }
)

// 异步action：获取评分统计
export const fetchRatingStatistics = createAsyncThunk(
  'rating/fetchStatistics',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await getRatingStatistics(itemId)
      return { itemId, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评分统计失败')
    }
  }
)

// 异步action：获取热门评分项目
export const fetchPopularRatingItems = createAsyncThunk(
  'rating/fetchPopularItems',
  async (params: { category?: RatingCategory; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await getPopularRatingItems(params.category, params.limit)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取热门评分项目失败')
    }
  }
)

// 异步action：搜索评分项目
export const searchRatingItemsAction = createAsyncThunk(
  'rating/searchItems',
  async (
    params: { keyword: string } & Omit<GetRatingItemsRequest, 'keyword'>,
    { rejectWithValue }
  ) => {
    try {
      const response = await searchRatingItems(params.keyword, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '搜索评分项目失败')
    }
  }
)

// 异步action：创建评分项目
export const createRatingItem = createAsyncThunk(
  'rating/createItem',
  async (data: CreateRatingItemRequest, { rejectWithValue }) => {
    try {
      const response = await createRatingItemApi(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '创建评分项目失败')
    }
  }
)

// 状态接口定义
interface RatingState {
  // 评分类型列表（已移除，改为使用预定义类型）
  // ratingTypes: RatingTypeInfo[]
  // ratingTypesLoading: boolean
  // ratingTypesError: string | null

  // 资源评分列表
  resourceRatings: Record<string, ResourceRatingsResponse>
  resourceRatingsLoading: boolean
  resourceRatingsError: string | null

  // 评分标签
  ratingTags: Record<string, RatingTagsInfo>
  ratingTagsLoading: boolean
  ratingTagsError: string | null

  // 评分项目列表
  items: RatingItem[]
  itemsLoading: boolean
  itemsError: string | null

  // 当前分类
  currentCategory: RatingCategory | null

  // 分页信息
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }

  // 评分项目详情
  currentItem: RatingItemDetailResponse | null
  itemDetailLoading: boolean
  itemDetailError: string | null

  // 用户评分记录
  userRatings: UserRating[]
  userRatingsLoading: boolean
  userRatingsError: string | null

  // 评分统计
  statistics: Record<string, RatingStatistics>
  statisticsLoading: boolean
  statisticsError: string | null

  // 热门项目
  popularItems: RatingItem[]
  popularItemsLoading: boolean
  popularItemsError: string | null

  // 搜索结果
  searchResults: RatingItem[]
  searchLoading: boolean
  searchError: string | null

  // 评分详情
  ratingDetail: UserRating | null
  ratingDetailLoading: boolean
  ratingDetailError: string | null

  // 创建评分状态
  createRatingLoading: boolean
  createRatingError: string | null

  // 创建评分项目状态
  createRatingItemLoading: boolean
  createRatingItemError: string | null
}

// 初始状态
const initialState: RatingState = {
  // 已移除评分类型相关状态
  resourceRatings: {},
  resourceRatingsLoading: false,
  resourceRatingsError: null,
  ratingTags: {},
  ratingTagsLoading: false,
  ratingTagsError: null,
  items: [],
  itemsLoading: false,
  itemsError: null,
  currentCategory: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
  },
  currentItem: null,
  itemDetailLoading: false,
  itemDetailError: null,
  userRatings: [],
  userRatingsLoading: false,
  userRatingsError: null,
  statistics: {},
  statisticsLoading: false,
  statisticsError: null,
  popularItems: [],
  popularItemsLoading: false,
  popularItemsError: null,
  searchResults: [],
  searchLoading: false,
  searchError: null,
  ratingDetail: null,
  ratingDetailLoading: false,
  ratingDetailError: null,
  createRatingLoading: false,
  createRatingError: null,
  createRatingItemLoading: false,
  createRatingItemError: null,
}

// 创建slice
const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    // 设置当前分类
    setCurrentCategory: (state, action: PayloadAction<RatingCategory>) => {
      state.currentCategory = action.payload
    },

    // 清空列表
    clearItems: (state) => {
      state.items = []
      state.pagination = {
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: true,
      }
    },

    // 清空搜索结果
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchError = null
    },

    // 清空错误信息
    clearErrors: (state) => {
      state.itemsError = null
      state.itemDetailError = null
      state.userRatingsError = null
      state.statisticsError = null
      state.popularItemsError = null
      state.searchError = null
      state.ratingDetailError = null
      state.createRatingError = null
      state.resourceRatingsError = null
      state.ratingTagsError = null
    },

    // 重置状态
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    // 已移除评分类型列表相关的reducer

    // 获取资源评分列表
    builder
      .addCase(fetchResourceRatings.pending, (state) => {
        state.resourceRatingsLoading = true
        state.resourceRatingsError = null
      })
      .addCase(fetchResourceRatings.fulfilled, (state, action) => {
        state.resourceRatingsLoading = false
        const { resourceType, resourceId, data } = action.payload
        const key = `${resourceType}_${resourceId}`
        state.resourceRatings[key] = (data.data ? data.data : data) as ResourceRatingsResponse
      })
      .addCase(fetchResourceRatings.rejected, (state, action) => {
        state.resourceRatingsLoading = false
        state.resourceRatingsError = action.payload as string
      })

    // 获取评分标签
    builder
      .addCase(fetchRatingTags.pending, (state) => {
        state.ratingTagsLoading = true
        state.ratingTagsError = null
      })
      .addCase(fetchRatingTags.fulfilled, (state, action) => {
        state.ratingTagsLoading = false
        const { resourceType, data } = action.payload
        state.ratingTags[resourceType] = (data.data ? data.data : data) as RatingTagsInfo
      })
      .addCase(fetchRatingTags.rejected, (state, action) => {
        state.ratingTagsLoading = false
        state.ratingTagsError = action.payload as string
      })

    // 获取评分项目列表
    builder
      .addCase(fetchRatingItems.pending, (state) => {
        state.itemsLoading = true
        state.itemsError = null
      })
      .addCase(fetchRatingItems.fulfilled, (state, action) => {
        state.itemsLoading = false
        const { items, page, page_size, total } = action.payload
        state.items = items
        state.pagination = {
          page: page,
          pageSize: page_size,
          total: total,
          hasMore: page * page_size < total,
        }
      })
      .addCase(fetchRatingItems.rejected, (state, action) => {
        state.itemsLoading = false
        state.itemsError = action.payload as string
      })

    // 获取评分项目详情
    builder
      .addCase(fetchRatingItemDetail.pending, (state) => {
        state.itemDetailLoading = true
        state.itemDetailError = null
      })
      .addCase(fetchRatingItemDetail.fulfilled, (state, action) => {
        state.itemDetailLoading = false
        state.currentItem = (
          action.payload.data ? action.payload.data : action.payload
        ) as RatingItemDetailResponse
      })
      .addCase(fetchRatingItemDetail.rejected, (state, action) => {
        state.itemDetailLoading = false
        state.itemDetailError = action.payload as string
      })

    // 创建评分
    builder
      .addCase(createUserRating.pending, (state) => {
        state.createRatingLoading = true
        state.createRatingError = null
      })
      .addCase(createUserRating.fulfilled, (state, _action) => {
        state.createRatingLoading = false
        // 可以在这里更新相关状态，比如刷新用户评分列表
      })
      .addCase(createUserRating.rejected, (state, _action) => {
        state.createRatingLoading = false
        state.createRatingError = _action.payload as string
      })

    // 创建评分项目
    builder
      .addCase(createRatingItem.pending, (state) => {
        state.createRatingItemLoading = true
        state.createRatingItemError = null
      })
      .addCase(createRatingItem.fulfilled, (state, _action) => {
        state.createRatingItemLoading = false
        // 创建成功后可以刷新评分项目列表
      })
      .addCase(createRatingItem.rejected, (state, _action) => {
        state.createRatingItemLoading = false
        state.createRatingItemError = _action.payload as string
      })

    // 获取评分详情
    builder
      .addCase(fetchRatingDetail.pending, (state) => {
        state.ratingDetailLoading = true
        state.ratingDetailError = null
      })
      .addCase(fetchRatingDetail.fulfilled, (state, action) => {
        state.ratingDetailLoading = false
        state.ratingDetail = (
          action.payload.data ? action.payload.data.rating : action.payload
        ) as UserRating
      })
      .addCase(fetchRatingDetail.rejected, (state, action) => {
        state.ratingDetailLoading = false
        state.ratingDetailError = action.payload as string
      })

    // 获取用户评分记录
    builder
      .addCase(fetchUserRatings.pending, (state) => {
        state.userRatingsLoading = true
        state.userRatingsError = null
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.userRatingsLoading = false
        state.userRatings = (
          action.payload.data ? action.payload.data.items : (action.payload as any).items || []
        ) as UserRating[]
      })
      .addCase(fetchUserRatings.rejected, (state, action) => {
        state.userRatingsLoading = false
        state.userRatingsError = action.payload as string
      })

    // 获取评分统计
    builder
      .addCase(fetchRatingStatistics.pending, (state) => {
        state.statisticsLoading = true
        state.statisticsError = null
      })
      .addCase(fetchRatingStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false
        const { itemId, data } = action.payload
        state.statistics[itemId] = (data.data ? data.data : data) as RatingStatistics
      })
      .addCase(fetchRatingStatistics.rejected, (state, action) => {
        state.statisticsLoading = false
        state.statisticsError = action.payload as string
      })

    // 获取热门评分项目
    builder
      .addCase(fetchPopularRatingItems.pending, (state) => {
        state.popularItemsLoading = true
        state.popularItemsError = null
      })
      .addCase(fetchPopularRatingItems.fulfilled, (state, action) => {
        state.popularItemsLoading = false
        state.popularItems = (
          action.payload.data ? action.payload.data : action.payload
        ) as RatingItem[]
      })
      .addCase(fetchPopularRatingItems.rejected, (state, action) => {
        state.popularItemsLoading = false
        state.popularItemsError = action.payload as string
      })

    // 搜索评分项目
    builder
      .addCase(searchRatingItemsAction.pending, (state) => {
        state.searchLoading = true
        state.searchError = null
      })
      .addCase(searchRatingItemsAction.fulfilled, (state, action) => {
        state.searchLoading = false
        state.searchResults = action.payload.items
      })
      .addCase(searchRatingItemsAction.rejected, (state, action) => {
        state.searchLoading = false
        state.searchError = action.payload as string
      })
  },
})

// 导出actions
export const { setCurrentCategory, clearItems, clearSearchResults, clearErrors, reset } =
  ratingSlice.actions

// 导出reducer
export default ratingSlice.reducer

// 导出selectors
// 已移除评分类型相关的selectors
export const selectResourceRatings = (state: { rating: RatingState }) =>
  state.rating.resourceRatings
export const selectResourceRatingsLoading = (state: { rating: RatingState }) =>
  state.rating.resourceRatingsLoading
export const selectResourceRatingsError = (state: { rating: RatingState }) =>
  state.rating.resourceRatingsError
export const selectRatingTags = (state: { rating: RatingState }) => state.rating.ratingTags
export const selectRatingTagsLoading = (state: { rating: RatingState }) =>
  state.rating.ratingTagsLoading
export const selectRatingTagsError = (state: { rating: RatingState }) =>
  state.rating.ratingTagsError
export const selectRatingItems = (state: { rating: RatingState }) => state.rating.items
export const selectRatingItemsLoading = (state: { rating: RatingState }) =>
  state.rating.itemsLoading
export const selectRatingItemsError = (state: { rating: RatingState }) => state.rating.itemsError
export const selectCurrentCategory = (state: { rating: RatingState }) =>
  state.rating.currentCategory
export const selectPagination = (state: { rating: RatingState }) => state.rating.pagination
export const selectCurrentItem = (state: { rating: RatingState }) => state.rating.currentItem
export const selectItemDetailLoading = (state: { rating: RatingState }) =>
  state.rating.itemDetailLoading
export const selectUserRatings = (state: { rating: RatingState }) => state.rating.userRatings
export const selectCreateRatingLoading = (state: { rating: RatingState }) =>
  state.rating.createRatingLoading
export const selectRatingDetail = (state: { rating: RatingState }) => state.rating.ratingDetail
