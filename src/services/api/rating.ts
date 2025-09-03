import {
  RatingCategory,
  RatingItem,
  UserRating,
  RatingStatistics,
  GetRatingItemsRequest,
  CreateRatingItemRequest,
  SubmitRatingRequest,
  RatingApiResponse,
  RatingItemDetailResponse,
  CreateRatingRequest,
  RatingDetailResponse,
  RatingTagsInfo,
  GetResourceRatingsRequest,
  ResourceRatingsResponse,
  RatableResource,
  ResourceListResponse,
  GetResourceListRequest,
  SearchResourcesRequest,
  GetTopRatedResourcesRequest
} from "@/types/api/rating.d";

// Relative imports
import http from "../request";

// 已移除 getRatingTypes 函数，改为使用预定义的评分类型

/**
 * 获取资源评分列表
 * @param resourceType 资源类型
 * @param resourceId 资源ID
 * @param params 查询参数
 * @returns 资源评分列表
 */
export const getResourceRatings = (
  resourceType: string, 
  resourceId: string, 
  params: GetResourceRatingsRequest = {}
) => {
  
  
  // 过滤掉 null 和 undefined 的参数
  const filteredParams = Object.entries({
    limit: 20,
    skip: 0,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...params
  }).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  return http.get<RatingApiResponse<ResourceRatingsResponse>>(
    `/ratings/resources/${resourceType}/${resourceId}`,
    filteredParams
  ).then(response => {
    // 调试日志：查看原始响应数据
    console.log('🔍 [getResourceRatings] 原始响应:', JSON.stringify(response, null, 2));
    
    // 处理分页参数格式转换
    if (response.data?.data) {
      const data = response.data.data;
      console.log('🔍 [getResourceRatings] 响应中的data字段:', JSON.stringify(data, null, 2));
      
      // 将 skip/limit 格式转换为 page/page_size 格式
      if (data.skip !== undefined && data.limit !== undefined) {
        data.page = Math.floor(data.skip / data.limit) + 1;
        data.page_size = data.limit;
        console.log('🔍 [getResourceRatings] 转换后的分页信息:', { page: data.page, page_size: data.page_size });
      }
    }
    return response;
  }).catch(error => {
    console.log('❌ [getResourceRatings] 请求失败:', error);
    throw error;
  });
};

/**
 * 获取评分标签
 * @param resourceType 资源类型
 * @returns 评分标签信息
 */
export const getRatingTags = (resourceType: string) => {
  
  
  return http.get<RatingApiResponse<RatingTagsInfo>>(
    `/ratings/tags?resource_type=${resourceType}`
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 获取评分列表 - 使用新的通用评分端点
 * @param params 请求参数
 * @returns 评分列表
 */
export const getRatingItems = (params: GetRatingItemsRequest = {}) => {
  
  
  // 构建查询参数，符合后端API规范
  const queryParams: any = {
    skip: 0,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  };
  
  // 添加分类过滤 - 根据API文档，应该使用resource_type
  if (params.category) {
    queryParams.resource_type = params.category;
  }
  
  // 添加最小评分过滤
  if (params.minRating) {
    queryParams.min_score = params.minRating;
  }
  
  // 添加位置过滤（如果支持）
  if (params.location) {
    queryParams.location = params.location;
  }
  
  // 添加关键词搜索（作为评论内容搜索）
  if (params.keyword) {
    queryParams.keyword = params.keyword;
  }
  
  // 处理分页参数
  if (params.page && params.pageSize) {
    queryParams.skip = (params.page - 1) * params.pageSize;
    queryParams.limit = params.pageSize;
  } else if (params.pageSize) {
    queryParams.limit = params.pageSize;
  }
  
  // 处理排序参数
  if (params.sortBy) {
    const sortMapping: Record<string, string> = {
      'rating': 'score',
      'popularity': 'helpful_count', 
      'newest': 'created_at'
    };
    queryParams.sort_by = sortMapping[params.sortBy] || 'created_at';
  }
  
  
  
  return http.get<RatingApiResponse<ResourceRatingsResponse>>("/ratings", queryParams)
    .then(response => {
      
      
      // 直接使用API返回的原始数据结构，不进行转换
      const apiData = response.data?.data || response.data || {};
      const items = apiData.items || [];
      const total = apiData.total || 0;
      const currentPage = Math.floor(queryParams.skip / queryParams.limit) + 1;
      
      // 为了兼容前端组件，我们保留原始数据并添加必要的字段
      const processedItems = items.map((item: any) => ({
        // 保留原始API数据结构
        ...item,
        // 添加一些兼容字段（如果前端其他地方需要）
        _originalData: item,
        // 添加一些计算字段
        averageRating: item.score || 0,
        totalRatings: 1 // 这是单个评分，不是聚合数据
      }));
      
      return {
        code: 0,
        message: 'success',
        data: {
          items: processedItems,
          page: currentPage,
          page_size: queryParams.limit,
          total: total
        }
      };
    })
    .catch(error => {
      
      
      
      if (error.statusCode) {
        
      }
      if (error.data) {
        
      }
      throw error;
    });
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
  
  
  return http.post<RatingApiResponse<RatingItem>>(
    "/ratings/items",
    data
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 创建评分 - 根据新版后端API文档
 * @param data 评分数据
 * @returns 创建结果
 */
export const createRating = (data: CreateRatingRequest) => {
  
  
  // 数据已经是下划线命名格式，直接使用
  const requestData = {
    resource_type: data.resource_type,
    resource_name: data.resource_name,
    resource_title: data.resource_title,
    resource_description: data.resource_description,
    resource_image: data.resource_image,
    resource_url: data.resource_url,
    score: data.score,
    comment: data.comment || '',
    is_anonymous: data.is_anonymous || false,
    tags: data.tags || [],
    evidence_urls: data.evidence_urls || []
  };
  
  
  
  return http.post<RatingApiResponse<UserRating>>(
    "/ratings", 
    requestData
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 获取评分详情
 * @param ratingId 评分ID
 * @returns 评分详情
 */
export const getRatingDetail = (ratingId: string) => {
  
  
  return http.get<RatingApiResponse<RatingDetailResponse>>(
    `/ratings/${ratingId}`
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 提交评分（兼容旧版本）
 * @param data 评分数据
 * @returns 提交结果
 */
export const submitRating = (data: SubmitRatingRequest) => {
  
  
  return http.post<RatingApiResponse<UserRating>>(
    "/ratings",
    data
  ).then(response => {
    
    return response;
  }).catch(error => {
    
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
  
  
  return http.put<RatingApiResponse<RatingItem>>(
    `/ratings/items/${itemId}`,
    data
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 删除评分项目
 * @param itemId 项目ID
 * @returns 删除结果
 */
export const deleteRatingItem = (itemId: string) => {
  
  
  return http.delete<RatingApiResponse<{}>>(
    `/ratings/items/${itemId}`
  ).then(response => {
    
    return response;
  }).catch(error => {
    
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

/**
 * 获取资源列表
 * @param params 查询参数
 * @returns 资源列表
 */
export const getResourceList = (params: GetResourceListRequest) => {
  
  
  // 构建查询参数
  const queryParams = {
    resource_type: params.resource_type,
    skip: params.skip || 0,
    limit: params.limit || 20,
    sort_by: params.sort_by || 'average_score',
    sort_order: params.sort_order || 'desc'
  };
  
  return http.get<RatingApiResponse<ResourceListResponse>>(
    '/ratings/resources/list',
    queryParams
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 搜索资源
 * @param params 搜索参数
 * @returns 搜索结果
 */
export const searchResources = (params: SearchResourcesRequest) => {
  
  
  // 构建查询参数
  const queryParams = {
    keyword: params.keyword,
    resource_type: params.resource_type,
    skip: params.skip || 0,
    limit: params.limit || 20
  };
  
  return http.get<RatingApiResponse<ResourceListResponse>>(
    '/ratings/resources/search',
    queryParams
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 获取指定资源的评分列表
 * @param resourceType 资源类型
 * @param resourceId 资源ID
 * @param params 查询参数
 * @returns 资源评分列表
 */
export const getResourceRatingsList = (
  resourceType: string,
  resourceId: string,
  params: {
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  } = {}
) => {
  
  
  const queryParams = {
    skip: params.skip || 0,
    limit: params.limit || 20,
    sort_by: params.sort_by || 'created_at',
    sort_order: params.sort_order || 'desc'
  };
  
  return http.get<RatingApiResponse<ResourceRatingsResponse>>(
    `/ratings/resources/${resourceType}/${resourceId}`,
    queryParams
  ).then(response => {
    // 调试日志：查看原始响应数据
    console.log('🔍 [getResourceRatingsList] 原始响应:', JSON.stringify(response, null, 2));
    console.log('🔍 [getResourceRatingsList] 请求参数:', JSON.stringify(queryParams, null, 2));
    
    // 处理分页参数格式转换
    if (response.data?.data) {
      const data = response.data.data;
      console.log('🔍 [getResourceRatingsList] 响应中的data字段:', JSON.stringify(data, null, 2));
      
      // 将 skip/limit 格式转换为 page/page_size 格式
      if (data.skip !== undefined && data.limit !== undefined) {
        data.page = Math.floor(data.skip / data.limit) + 1;
        data.page_size = data.limit;
        console.log('🔍 [getResourceRatingsList] 转换后的分页信息:', { page: data.page, page_size: data.page_size });
      }
    }
    return response;
  }).catch(error => {
    console.log('❌ [getResourceRatingsList] 请求失败:', error);
    throw error;
  });
};

/**
 * 获取资源评分统计
 * @param resourceType 资源类型
 * @param resourceId 资源ID
 * @returns 资源评分统计
 */
export const getResourceStatistics = (
  resourceType: string,
  resourceId: string
) => {
  
  
  return http.get<RatingApiResponse<any>>(
    `/ratings/resources/${resourceType}/${resourceId}/statistics`
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 获取热门资源
 * @param params 查询参数
 * @returns 热门资源列表
 */
export const getTopRatedResources = (params: GetTopRatedResourcesRequest = {}) => {
  
  
  // 构建查询参数
  const queryParams = {
    resource_type: params.resource_type,
    min_rating_count: params.min_rating_count || 1,
    limit: params.limit || 10
  };
  
  return http.get<RatingApiResponse<RatableResource[]>>(
    '/ratings/resources/top-rated',
    queryParams
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};

/**
 * 获取我的评分列表
 * @param params 查询参数
 * @returns 我的评分列表
 */
export const getMyRatings = (params: { resource_type?: string; skip?: number; limit?: number } = {}) => {
  
  
  const queryParams = {
    resource_type: params.resource_type,
    skip: params.skip || 0,
    limit: params.limit || 20
  };
  
  return http.get<RatingApiResponse<ResourceRatingsResponse>>(
    '/ratings/me',
    queryParams
  ).then(response => {
    
    return response;
  }).catch(error => {
    
    throw error;
  });
};
