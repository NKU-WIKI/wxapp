import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  ListingRead,
  ListingCreate,
  ListingListParams,
  ListingSearchParams,
  BookingRead,
  BookingCreate,
  BookingListParams,
  CategoryRead,
  ErrandCreate,
  ErrandListParams,
  BookingStatus,
} from '@/types/api/marketplace.d'
import { marketplaceApi, bookingApi, categoryApi, errandApi } from '@/services/api/marketplace'

// 获取商品列表的 Thunk
export const fetchListings = createAsyncThunk(
  'marketplace/fetchListings',
  async (params: ListingListParams, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.listListings(params)
      return {
        data: response.data,
        pagination: {
          skip: params.skip || 0,
          limit: params.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取商品列表失败')
    }
  }
)

// 获取商品详情的 Thunk
export const fetchListingDetail = createAsyncThunk(
  'marketplace/fetchListingDetail',
  async (listingId: string, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.getListingDetail(listingId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取商品详情失败')
    }
  }
)

// 搜索商品的 Thunk
export const searchListings = createAsyncThunk(
  'marketplace/searchListings',
  async (params: ListingSearchParams, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.searchListings(params)
      return {
        data: response.data,
        pagination: {
          skip: params.skip || 0,
          limit: params.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '搜索商品失败')
    }
  }
)

// 发布商品的 Thunk
export const createListing = createAsyncThunk(
  'marketplace/createListing',
  async (data: ListingCreate, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.createListing(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '发布商品失败')
    }
  }
)

// 删除商品的 Thunk
export const deleteListing = createAsyncThunk(
  'marketplace/deleteListing',
  async (listingId: string, { rejectWithValue }) => {
    try {
      await marketplaceApi.deleteListing(listingId)
      return listingId
    } catch (error: any) {
      return rejectWithValue(error.message || '删除商品失败')
    }
  }
)

// 获取我的发布的 Thunk
export const fetchMyListings = createAsyncThunk(
  'marketplace/fetchMyListings',
  async (params: { skip?: number; limit?: number } | undefined, { rejectWithValue }: any) => {
    try {
      const response = await marketplaceApi.getMyListings(params)
      return {
        data: response.data,
        pagination: {
          skip: params?.skip || 0,
          limit: params?.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params?.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取我的发布失败')
    }
  }
)

// 获取相似商品的 Thunk
export const fetchSimilarListings = createAsyncThunk(
  'marketplace/fetchSimilarListings',
  async ({ listingId, limit }: { listingId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.getSimilarListings(listingId, { limit })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取相似商品失败')
    }
  }
)

// 收藏/取消收藏商品的 Thunk（使用通用接口）
export const toggleFavorite = createAsyncThunk(
  'marketplace/toggleFavorite',
  async (listingId: string, { rejectWithValue }) => {
    try {
      const response = await marketplaceApi.toggleFavorite(listingId)
      // 返回包含状态和计数的完整信息
      return {
        listingId,
        isActive: response.data?.is_active ?? false,
        count: response.data?.count ?? 0,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '收藏操作失败')
    }
  }
)

// 获取我的收藏的 Thunk
export const fetchMyFavorites = createAsyncThunk(
  'marketplace/fetchMyFavorites',
  async (params: { skip?: number; limit?: number } | undefined, { rejectWithValue }: any) => {
    try {
      const response = await marketplaceApi.getMyFavorites(params)
      return {
        data: response.data,
        pagination: {
          skip: params?.skip || 0,
          limit: params?.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params?.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取我的收藏失败')
    }
  }
)

// 获取个性化推荐的 Thunk
export const fetchRecommendations = createAsyncThunk(
  'marketplace/fetchRecommendations',
  async (limit: number | undefined, { rejectWithValue }: any) => {
    try {
      const response = await marketplaceApi.getRecommendations({ limit })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取推荐失败')
    }
  }
)

// 创建预约的 Thunk
export const createBooking = createAsyncThunk(
  'marketplace/createBooking',
  async ({ listingId, data }: { listingId: string; data: BookingCreate }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.createBooking(listingId, data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '创建预约失败')
    }
  }
)

// 更新预约状态的 Thunk
export const updateBookingStatus = createAsyncThunk(
  'marketplace/updateBookingStatus',
  async (
    { bookingId, status }: { bookingId: string; status: BookingStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await bookingApi.updateBookingStatus(bookingId, status)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '更新预约状态失败')
    }
  }
)

// 获取我的预约的 Thunk
export const fetchMyBookings = createAsyncThunk(
  'marketplace/fetchMyBookings',
  async (params: BookingListParams | undefined, { rejectWithValue }: any) => {
    try {
      const response = await bookingApi.getMyBookings(params)
      return {
        items: response.data,
        pagination: {
          skip: params?.skip || 0,
          limit: params?.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params?.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取我的预约失败')
    }
  }
)

// 获取商品分类的 Thunk
export const fetchCategories = createAsyncThunk(
  'marketplace/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryApi.listCategories()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取分类失败')
    }
  }
)

// 获取分类详情的 Thunk
export const fetchCategoryDetail = createAsyncThunk(
  'marketplace/fetchCategoryDetail',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await categoryApi.getCategoryDetail(categoryId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取分类详情失败')
    }
  }
)

// 获取跑腿任务列表的 Thunk
export const fetchErrands = createAsyncThunk(
  'marketplace/fetchErrands',
  async (params: ErrandListParams | undefined, { rejectWithValue }: any) => {
    try {
      const response = await errandApi.listErrands(params)
      return {
        data: response.data,
        pagination: {
          skip: params?.skip || 0,
          limit: params?.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params?.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取任务列表失败')
    }
  }
)

// 获取任务详情的 Thunk
export const fetchErrandDetail = createAsyncThunk(
  'marketplace/fetchErrandDetail',
  async (errandId: string, { rejectWithValue }) => {
    try {
      const response = await errandApi.getErrandDetail(errandId)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '获取任务详情失败')
    }
  }
)

// 发布跑腿任务的 Thunk
export const createErrand = createAsyncThunk(
  'marketplace/createErrand',
  async (data: ErrandCreate, { rejectWithValue }) => {
    try {
      const response = await errandApi.createErrand(data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || '发布任务失败')
    }
  }
)

// 接受任务的 Thunk
export const acceptErrand = createAsyncThunk(
  'marketplace/acceptErrand',
  async (errandId: string, { rejectWithValue }) => {
    try {
      await errandApi.acceptErrand(errandId)
      return errandId
    } catch (error: any) {
      return rejectWithValue(error.message || '接受任务失败')
    }
  }
)

// 完成任务的 Thunk
export const completeErrand = createAsyncThunk(
  'marketplace/completeErrand',
  async (errandId: string, { rejectWithValue }) => {
    try {
      await errandApi.completeErrand(errandId)
      return errandId
    } catch (error: any) {
      return rejectWithValue(error.message || '完成任务失败')
    }
  }
)

// 取消任务的 Thunk
export const cancelErrand = createAsyncThunk(
  'marketplace/cancelErrand',
  async (errandId: string, { rejectWithValue }) => {
    try {
      await errandApi.cancelErrand(errandId)
      return errandId
    } catch (error: any) {
      return rejectWithValue(error.message || '取消任务失败')
    }
  }
)

// 获取我的发布任务的 Thunk
export const fetchMyPublishedErrands = createAsyncThunk(
  'marketplace/fetchMyPublishedErrands',
  async (params: { skip?: number; limit?: number } | undefined, { rejectWithValue }: any) => {
    try {
      const response = await errandApi.getMyPublishedErrands(params)
      return {
        data: response.data,
        pagination: {
          skip: params?.skip || 0,
          limit: params?.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params?.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取我的发布失败')
    }
  }
)

// 获取我接受的任务的 Thunk
export const fetchMyAcceptedErrands = createAsyncThunk(
  'marketplace/fetchMyAcceptedErrands',
  async (params: { skip?: number; limit?: number } | undefined, { rejectWithValue }: any) => {
    try {
      const response = await errandApi.getMyAcceptedErrands(params)
      return {
        data: response.data,
        pagination: {
          skip: params?.skip || 0,
          limit: params?.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params?.limit || 20),
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message || '获取我接受的任务失败')
    }
  }
)

export interface MarketplaceState {
  // 商品列表相关
  listings: ListingRead[]
  currentListing: ListingRead | null
  similarListings: ListingRead[]
  recommendations: ListingRead[]

  // 预约相关
  bookings: BookingRead[]
  currentBooking: BookingRead | null

  // 收藏相关
  favorites: ListingRead[]

  // 跑腿任务相关
  errands: ListingRead[] // 暂时用ListingRead，实际应该是ErrandRead
  currentErrand: ListingRead | null
  myPublishedErrands: ListingRead[]
  myAcceptedErrands: ListingRead[]

  // 分类相关
  categories: CategoryRead[]

  // 加载状态
  listingsLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  detailLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  searchLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  createLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  bookingLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  favoritesLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  errandsLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  errandDetailLoading: 'idle' | 'pending' | 'succeeded' | 'failed'
  createErrandLoading: 'idle' | 'pending' | 'succeeded' | 'failed'

  // 分页信息
  listingsPagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  } | null
  bookingsPagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  } | null
  favoritesPagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  } | null
  errandsPagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  } | null
  myPublishedErrandsPagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  } | null
  myAcceptedErrandsPagination: {
    skip: number
    limit: number
    total: number
    has_more: boolean
  } | null

  // 错误信息
  error: string | null
}

const initialState: MarketplaceState = {
  listings: [],
  currentListing: null,
  similarListings: [],
  recommendations: [],
  bookings: [],
  currentBooking: null,
  favorites: [],
  errands: [],
  currentErrand: null,
  myPublishedErrands: [],
  myAcceptedErrands: [],
  categories: [],
  listingsLoading: 'idle',
  detailLoading: 'idle',
  searchLoading: 'idle',
  createLoading: 'idle',
  bookingLoading: 'idle',
  favoritesLoading: 'idle',
  errandsLoading: 'idle',
  errandDetailLoading: 'idle',
  createErrandLoading: 'idle',
  listingsPagination: null,
  bookingsPagination: null,
  favoritesPagination: null,
  errandsPagination: null,
  myPublishedErrandsPagination: null,
  myAcceptedErrandsPagination: null,
  error: null,
}

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentListing: (state) => {
      state.currentListing = null
    },
    clearSimilarListings: (state) => {
      state.similarListings = []
    },
    setListings: (state, action) => {
      state.listings = action.payload
      state.listingsLoading = 'succeeded'
    },
    setPagination: (state, action) => {
      state.listingsPagination = action.payload
    },
    addListings: (state, action) => {
      state.listings = [...state.listings, ...action.payload]
    },
    updateListingDetail: (state, action) => {
      const { id, data } = action.payload
      const index = state.listings.findIndex((listing) => listing.id === id)
      if (index !== -1) {
        // 合并原有数据和新获取的详情数据
        state.listings[index] = { ...state.listings[index], ...data }
      }
    },
    updateListingState: (state, action) => {
      const { id, data } = action.payload

      // 更新列表中的商品状态
      const listingIndex = state.listings.findIndex((listing) => listing.id === id)
      if (listingIndex !== -1) {
        state.listings[listingIndex] = { ...state.listings[listingIndex], ...data }
      }

      // 更新当前详情页的商品状态
      if (state.currentListing?.id === id) {
        state.currentListing = { ...state.currentListing, ...data }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取商品列表
      .addCase(fetchListings.pending, (state) => {
        state.listingsLoading = 'pending'
        state.error = null
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.listingsLoading = 'succeeded'
        if (action.payload.pagination.skip > 0) {
          // 加载更多
          state.listings = [...state.listings, ...action.payload.data]
        } else {
          // 刷新或首次加载
          state.listings = action.payload.data
        }
        state.listingsPagination = action.payload.pagination
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.listingsLoading = 'failed'
        state.error = action.payload as string
      })

      // 获取商品详情
      .addCase(fetchListingDetail.pending, (state) => {
        state.detailLoading = 'pending'
        state.error = null
      })
      .addCase(fetchListingDetail.fulfilled, (state, action) => {
        state.detailLoading = 'succeeded'
        state.currentListing = action.payload
      })
      .addCase(fetchListingDetail.rejected, (state, action) => {
        state.detailLoading = 'failed'
        state.error = action.payload as string
      })

      // 搜索商品
      .addCase(searchListings.pending, (state) => {
        state.searchLoading = 'pending'
        state.error = null
      })
      .addCase(searchListings.fulfilled, (state, action) => {
        state.searchLoading = 'succeeded'
        if (action.payload.pagination.skip > 0) {
          // 加载更多
          state.listings = [...state.listings, ...action.payload.data]
        } else {
          // 刷新或首次加载
          state.listings = action.payload.data
        }
        state.listingsPagination = action.payload.pagination
      })
      .addCase(searchListings.rejected, (state, action) => {
        state.searchLoading = 'failed'
        state.error = action.payload as string
      })

      // 发布商品
      .addCase(createListing.pending, (state) => {
        state.createLoading = 'pending'
        state.error = null
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.createLoading = 'succeeded'
        // 将新发布的商品添加到列表开头
        state.listings.unshift(action.payload)
      })
      .addCase(createListing.rejected, (state, action) => {
        state.createLoading = 'failed'
        state.error = action.payload as string
      })

      // 删除商品
      .addCase(deleteListing.pending, (state) => {
        state.detailLoading = 'pending'
        state.error = null
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.detailLoading = 'succeeded'
        // 从商品列表中移除删除的商品
        state.listings = state.listings.filter((l) => l.id !== action.payload)
        // 清除当前商品详情
        if (state.currentListing?.id === action.payload) {
          state.currentListing = null
        }
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.detailLoading = 'failed'
        state.error = action.payload as string
      })

      // 获取我的发布
      .addCase(fetchMyListings.pending, (state) => {
        state.listingsLoading = 'pending'
        state.error = null
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.listingsLoading = 'succeeded'
        state.listings = action.payload.data
        state.listingsPagination = action.payload.pagination
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.listingsLoading = 'failed'
        state.error = action.payload as string
      })

      // 获取相似商品
      .addCase(fetchSimilarListings.fulfilled, (state, action) => {
        state.similarListings = action.payload
      })

      // 收藏/取消收藏商品（通用接口）
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { listingId, isActive, count } = action.payload

        // 更新列表中的商品状态
        const listing = state.listings.find((l) => l.id === listingId)
        if (listing) {
          listing.favorite_count = count
          listing.is_favorited = isActive
        }

        // 更新当前详情页的商品状态
        if (state.currentListing?.id === listingId) {
          state.currentListing.favorite_count = count
          state.currentListing.is_favorited = isActive
        }
      })

      // 获取我的收藏
      .addCase(fetchMyFavorites.pending, (state) => {
        state.favoritesLoading = 'pending'
        state.error = null
      })
      .addCase(fetchMyFavorites.fulfilled, (state, action) => {
        state.favoritesLoading = 'succeeded'
        state.favorites = action.payload.data
        state.favoritesPagination = action.payload.pagination
      })
      .addCase(fetchMyFavorites.rejected, (state, action) => {
        state.favoritesLoading = 'failed'
        state.error = action.payload as string
      })

      // 获取推荐
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload
      })

      // 创建预约
      .addCase(createBooking.pending, (state) => {
        state.bookingLoading = 'pending'
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookingLoading = 'succeeded'
        state.bookings.unshift(action.payload)
        // 更新商品的预约数量
        if (action.payload.listing_id) {
          const listing = state.listings.find((l) => l.id === action.payload.listing_id)
          if (listing) {
            listing.booking_count = (listing.booking_count || 0) + 1
          }
          if (state.currentListing?.id === action.payload.listing_id) {
            state.currentListing.booking_count = (state.currentListing.booking_count || 0) + 1
          }
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.bookingLoading = 'failed'
        state.error = action.payload as string
      })

      // 更新预约状态
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          state.bookings[index] = action.payload
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload
        }
      })

      // 获取我的预约
      .addCase(fetchMyBookings.pending, (state) => {
        state.bookingLoading = 'pending'
        state.error = null
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.bookingLoading = 'succeeded'
        state.bookings = action.payload.items
        state.bookingsPagination = action.payload.pagination
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.bookingLoading = 'failed'
        state.error = action.payload as string
      })

      // 获取分类
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload as CategoryRead[]
      })

      // 获取跑腿任务列表
      .addCase(fetchErrands.pending, (state) => {
        state.errandsLoading = 'pending'
        state.error = null
      })
      .addCase(fetchErrands.fulfilled, (state, action) => {
        state.errandsLoading = 'succeeded'
        if (action.payload.pagination.skip > 0) {
          // 加载更多
          state.errands = [...state.errands, ...action.payload.data]
        } else {
          // 刷新或首次加载
          state.errands = action.payload.data
        }
        state.errandsPagination = action.payload.pagination
      })
      .addCase(fetchErrands.rejected, (state, action) => {
        state.errandsLoading = 'failed'
        state.error = action.payload as string
      })

      // 获取任务详情
      .addCase(fetchErrandDetail.pending, (state) => {
        state.errandDetailLoading = 'pending'
        state.error = null
      })
      .addCase(fetchErrandDetail.fulfilled, (state, action) => {
        state.errandDetailLoading = 'succeeded'
        state.currentErrand = action.payload
      })
      .addCase(fetchErrandDetail.rejected, (state, action) => {
        state.errandDetailLoading = 'failed'
        state.error = action.payload as string
      })

      // 发布跑腿任务
      .addCase(createErrand.pending, (state) => {
        state.createErrandLoading = 'pending'
        state.error = null
      })
      .addCase(createErrand.fulfilled, (state, action) => {
        state.createErrandLoading = 'succeeded'
        // 将新发布的任务添加到列表开头
        state.errands.unshift(action.payload)
      })
      .addCase(createErrand.rejected, (state, action) => {
        state.createErrandLoading = 'failed'
        state.error = action.payload as string
      })

      // 接受任务
      .addCase(acceptErrand.fulfilled, (state, action) => {
        const errand = state.errands.find((e) => e.id === action.payload)
        if (errand) {
          // 这里应该更新任务状态，但由于API返回的数据结构，我们暂时不处理
        }
      })

      // 完成任务
      .addCase(completeErrand.fulfilled, (state, action) => {
        const errand = state.errands.find((e) => e.id === action.payload)
        if (errand) {
          // 这里应该更新任务状态，但由于API返回的数据结构，我们暂时不处理
        }
      })

      // 取消任务
      .addCase(cancelErrand.fulfilled, (state, action) => {
        const errand = state.errands.find((e) => e.id === action.payload)
        if (errand) {
          // 这里应该更新任务状态，但由于API返回的数据结构，我们暂时不处理
        }
      })

      // 获取我的发布任务
      .addCase(fetchMyPublishedErrands.pending, (state) => {
        state.errandsLoading = 'pending'
        state.error = null
      })
      .addCase(fetchMyPublishedErrands.fulfilled, (state, action) => {
        state.errandsLoading = 'succeeded'
        state.myPublishedErrands = action.payload.data
        state.myPublishedErrandsPagination = action.payload.pagination
      })
      .addCase(fetchMyPublishedErrands.rejected, (state, action) => {
        state.errandsLoading = 'failed'
        state.error = action.payload as string
      })

      // 获取我接受的任务
      .addCase(fetchMyAcceptedErrands.pending, (state) => {
        state.errandsLoading = 'pending'
        state.error = null
      })
      .addCase(fetchMyAcceptedErrands.fulfilled, (state, action) => {
        state.errandsLoading = 'succeeded'
        state.myAcceptedErrands = action.payload.data
        state.myAcceptedErrandsPagination = action.payload.pagination
      })
      .addCase(fetchMyAcceptedErrands.rejected, (state, action) => {
        state.errandsLoading = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentListing, clearSimilarListings, updateListingState } =
  marketplaceSlice.actions
export default marketplaceSlice.reducer
