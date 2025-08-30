import http from "../request";
import {
  RatingCategory,
  RatingItem,
  UserRating,
  RatingStatistics,
  GetRatingItemsRequest,
  RatingItemsResponse,
  CreateRatingItemRequest,
  SubmitRatingRequest,
  RatingApiResponse,
  RatingItemDetailResponse
} from "@/types/api/rating.d";

/**
 * 获取评分项目列表
 * @param params 请求参数
 * @returns 评分项目列表
 */
export const getRatingItems = (params: GetRatingItemsRequest = {}) => {
  // 过滤掉 null 和 undefined 的参数
  const filteredParams = Object.entries({
    page: 1,
    pageSize: 20,
    ...params
  }).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  return http.get<RatingApiResponse<RatingItemsResponse>>("/ratings/items", filteredParams);
};

/**
 * 获取评分项目详情
 * @param itemId 项目ID
 * @returns 项目详情
 */
export const getRatingItemDetail = (itemId: string) => {
  return http.get<RatingApiResponse<RatingItemDetailResponse>>(`/ratings/items/${itemId}`);
};

/**
 * 创建评分项目
 * @param data 创建参数
 * @returns 创建结果
 */
export const createRatingItem = (data: CreateRatingItemRequest) => {
  console.log('🚀 [API] 开始创建评分项目，请求数据:', data);
  
  return http.post<RatingApiResponse<RatingItem>>(
    "/ratings/items", 
    data
  ).then(response => {
    console.log('✅ [API] 评分项目创建成功，响应数据:', response);
    return response;
  }).catch(error => {
    console.error('❌ [API] 评分项目创建失败:', error);
    throw error;
  });
};

/**
 * 提交评分
 * @param data 评分数据
 * @returns 提交结果
 */
export const submitRating = (data: SubmitRatingRequest) => {
  console.log('⭐ [API] 开始提交评分，请求数据:', data);
  
  return http.post<RatingApiResponse<UserRating>>(
    "/ratings/submit", 
    data
  ).then(response => {
    console.log('✅ [API] 评分提交成功，响应数据:', response);
    return response;
  }).catch(error => {
    console.error('❌ [API] 评分提交失败:', error);
    throw error;
  });
};

/**
 * 获取用户的评分记录
 * @param params 查询参数
 * @returns 用户评分列表
 */
export const getUserRatings = (params: {
  userId?: string;
  itemId?: string;
  page?: number;
  pageSize?: number;
} = {}) => {
  const filteredParams = Object.entries({
    page: 1,
    pageSize: 20,
    ...params
  }).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  return http.get<RatingApiResponse<{
    items: UserRating[];
    pagination: any;
  }>>("/ratings/user-ratings", filteredParams);
};

/**
 * 获取评分统计信息
 * @param itemId 项目ID
 * @returns 统计信息
 */
export const getRatingStatistics = (itemId: string) => {
  return http.get<RatingApiResponse<RatingStatistics>>(`/ratings/items/${itemId}/statistics`);
};

/**
 * 更新评分项目
 * @param itemId 项目ID
 * @param data 更新数据
 * @returns 更新结果
 */
export const updateRatingItem = (itemId: string, data: Partial<CreateRatingItemRequest>) => {
  console.log('🔄 [API] 开始更新评分项目:', itemId, data);
  
  return http.put<RatingApiResponse<RatingItem>>(
    `/ratings/items/${itemId}`, 
    data
  ).then(response => {
    console.log('✅ [API] 评分项目更新成功，响应数据:', response);
    return response;
  }).catch(error => {
    console.error('❌ [API] 评分项目更新失败:', error);
    throw error;
  });
};

/**
 * 删除评分项目
 * @param itemId 项目ID
 * @returns 删除结果
 */
export const deleteRatingItem = (itemId: string) => {
  console.log('🗑️ [API] 开始删除评分项目:', itemId);
  
  return http.delete<RatingApiResponse<{}>>(
    `/ratings/items/${itemId}`
  ).then(response => {
    console.log('✅ [API] 评分项目删除成功');
    return response;
  }).catch(error => {
    console.error('❌ [API] 评分项目删除失败:', error);
    throw error;
  });
};

/**
 * 获取热门评分项目
 * @param category 分类过滤
 * @param limit 数量限制
 * @returns 热门项目列表
 */
export const getPopularRatingItems = (category?: RatingCategory, limit: number = 10) => {
  const params: any = { limit };
  if (category) {
    params.category = category;
  }
  
  return http.get<RatingApiResponse<RatingItem[]>>("/ratings/popular", params);
};

/**
 * 搜索评分项目
 * @param keyword 搜索关键词
 * @param params 其他参数
 * @returns 搜索结果
 */
export const searchRatingItems = (keyword: string, params: Omit<GetRatingItemsRequest, 'keyword'> = {}) => {
  return getRatingItems({
    keyword,
    ...params
  });
};
