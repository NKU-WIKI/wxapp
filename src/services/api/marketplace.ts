/**
 * 市场相关API服务
 */
import type {
  ListingCreate,
  ListingListParams,
  ListingSearchParams,
  BookingCreate,
  BookingListParams,
  ProductCreate,
  ProductUpdate,
  ProductListParams,
  ErrandCreate,
  ErrandListParams,
  ErrandRead,
  ApiResponse_List_ListingRead__,
  ApiResponse_ListingRead_,
  ApiResponse_BookingRead_,
  ApiResponse_List_BookingRead__,
  ApiResponse_ProductRead_,
  ApiResponse_List_ProductRead__,
  ApiResponse_dict_,
  ApiResponse_List_dict__,
  BookingStatus,
  ApiResponse,
} from '@/types/api/marketplace';

// Relative imports
import http from '../request';

/**
 * 过滤对象中的undefined值
 */
function filterUndefined<T extends Record<string, unknown>>(obj?: T): Partial<T> | undefined {
  if (!obj) return undefined;

  const filtered = Object.keys(obj).reduce(
    (acc, key) => {
      if (obj[key] !== undefined) {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return Object.keys(filtered).length > 0 ? (filtered as Partial<T>) : undefined;
}

/**
 * 二手商品相关API
 */
export const marketplaceApi = {
  /**
   * 获取二手商品列表
   */
  async listListings(params?: ListingListParams): Promise<ApiResponse_List_ListingRead__> {
    return http.get('/marketplace/listings', filterUndefined(params));
  },

  /**
   * 获取商品详情
   */
  async getListingDetail(listingId: string): Promise<ApiResponse_ListingRead_> {
    return http.get(`/marketplace/listings/${listingId}`);
  },

  /**
   * 搜索二手商品
   */
  async searchListings(params: ListingSearchParams): Promise<ApiResponse_List_ListingRead__> {
    return http.get('/marketplace/search', filterUndefined(params));
  },

  /**
   * 发布二手商品
   */
  async createListing(data: ListingCreate): Promise<ApiResponse_ListingRead_> {
    return http.post('/marketplace/listings', data);
  },

  /**
   * 删除商品
   */
  async deleteListing(listingId: string): Promise<ApiResponse_dict_> {
    return http.delete(`/marketplace/listings/${listingId}`);
  },

  /**
   * 获取我的发布
   */
  async getMyListings(params?: {
    skip?: number;
    limit?: number;
  }): Promise<ApiResponse_List_ListingRead__> {
    return http.get('/marketplace/my/listings', filterUndefined(params));
  },

  /**
   * 获取相似商品
   */
  async getSimilarListings(
    listingId: string,
    params?: { limit?: number },
  ): Promise<ApiResponse_List_ListingRead__> {
    return http.get(`/marketplace/listings/${listingId}/similar`, params);
  },

  /**
   * 收藏商品（使用通用收藏接口）
   */
  async toggleFavorite(listingId: string): Promise<ApiResponse_dict_> {
    return http.post('/actions/toggle', {
      target_id: listingId,
      target_type: 'listing',
      action_type: 'favorite',
    });
  },

  /**
   * 获取我的收藏
   */
  async getMyFavorites(params?: {
    skip?: number;
    limit?: number;
  }): Promise<ApiResponse_List_ListingRead__> {
    return http.get('/marketplace/favorites', params);
  },

  /**
   * 获取个性化推荐
   */
  async getRecommendations(params?: { limit?: number }): Promise<ApiResponse_List_ListingRead__> {
    return http.get('/marketplace/recommendations', params);
  },
};

/**
 * 预约相关API
 */
export const bookingApi = {
  /**
   * 预约商品
   */
  async createBooking(listingId: string, data: BookingCreate): Promise<ApiResponse_BookingRead_> {
    return http.post(`/marketplace/listings/${listingId}/bookings`, data);
  },

  /**
   * 更新预约状态
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
  ): Promise<ApiResponse_BookingRead_> {
    return http.put(`/marketplace/bookings/${bookingId}/status?status=${status}`, undefined);
  },

  /**
   * 获取我的预约
   */
  async getMyBookings(params?: BookingListParams): Promise<ApiResponse_List_BookingRead__> {
    return http.get('/marketplace/my/bookings', params);
  },
};

/**
 * 电商商品相关API
 */
export const productApi = {
  /**
   * 创建电商商品
   */
  async createProduct(data: ProductCreate): Promise<ApiResponse_ProductRead_> {
    return http.post('/marketplace/products', data);
  },

  /**
   * 获取电商商品列表
   */
  async listProducts(params?: ProductListParams): Promise<ApiResponse_List_ProductRead__> {
    return http.get('/marketplace/products', params);
  },

  /**
   * 获取电商商品详情
   */
  async getProductDetail(productId: string): Promise<ApiResponse_ProductRead_> {
    return http.get(`/marketplace/products/${productId}`);
  },

  /**
   * 更新电商商品
   */
  async updateProduct(productId: string, data: ProductUpdate): Promise<ApiResponse_ProductRead_> {
    return http.put(`/marketplace/products/${productId}`, data);
  },

  /**
   * 删除电商商品
   */
  async deleteProduct(productId: string): Promise<ApiResponse_dict_> {
    return http.delete(`/marketplace/products/${productId}`);
  },
};

/**
 * 分类相关API
 */
export const categoryApi = {
  /**
   * 获取商品分类列表
   */
  async listCategories(): Promise<ApiResponse_List_dict__> {
    return http.get('/marketplace/categories');
  },

  /**
   * 获取分类详情
   */
  async getCategoryDetail(categoryId: string): Promise<ApiResponse_dict_> {
    return http.get(`/marketplace/categories/${categoryId}`);
  },
};

/**
 * 统计相关API
 */
export const statsApi = {
  /**
   * 获取市场统计信息
   */
  async getMarketplaceStats(): Promise<ApiResponse_dict_> {
    return http.get('/marketplace/stats');
  },

  /**
   * 获取热门趋势分析
   */
  async getTrendingData(params?: { limit?: number }): Promise<ApiResponse_dict_> {
    return http.get('/marketplace/trending', params);
  },
};

/**
 * 跑腿任务相关API
 */
export const errandApi = {
  /**
   * 获取跑腿任务列表
   */
  async listErrands(params?: ErrandListParams): Promise<ApiResponse<ErrandRead[]>> {
    return http.get('/marketplace/errands', filterUndefined(params));
  },

  /**
   * 获取任务详情
   */
  async getErrandDetail(errandId: string): Promise<ApiResponse<ErrandRead>> {
    return http.get(`/marketplace/errands/${errandId}`);
  },

  /**
   * 发布跑腿任务
   */
  async createErrand(data: ErrandCreate): Promise<ApiResponse<ErrandRead>> {
    return http.post('/marketplace/errands', data);
  },

  /**
   * 接受任务
   */
  async acceptErrand(errandId: string): Promise<ApiResponse_dict_> {
    return http.post(`/marketplace/errands/${errandId}/accept`);
  },

  /**
   * 完成任务
   */
  async completeErrand(errandId: string): Promise<ApiResponse_dict_> {
    return http.post(`/marketplace/errands/${errandId}/complete`);
  },

  /**
   * 取消任务
   */
  async cancelErrand(errandId: string): Promise<ApiResponse_dict_> {
    return http.post(`/marketplace/errands/${errandId}/cancel`);
  },

  /**
   * 获取我的发布任务
   */
  async getMyPublishedErrands(params?: {
    skip?: number;
    limit?: number;
  }): Promise<ApiResponse<ErrandRead[]>> {
    return http.get('/marketplace/my/errands/published', params);
  },

  /**
   * 获取我接受的任务
   */
  async getMyAcceptedErrands(params?: {
    skip?: number;
    limit?: number;
  }): Promise<ApiResponse<ErrandRead[]>> {
    return http.get('/marketplace/my/errands/accepted', params);
  },
};
