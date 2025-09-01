/* eslint-disable no-unused-vars */
import { Pagination } from './common';

/**
 * 评分分类枚举 - 根据新版后端API文档更新
 */
export enum RatingCategory {
  Course = "学习",           // 学习 - 课程、教材、学习资源
  Food = "美食",              // 美食 - 餐厅、菜品、美食推荐
  Game = "游戏",              // 游戏 - 游戏、游戏攻略、游戏设备
  Entertainment = "娱乐", // 娱乐 - 影视、音乐、娱乐活动
  Life = "生活",              // 生活 - 生活服务、日用品、生活技巧
  Sport = "运动",            // 运动 - 运动场所、体育用品、健身课程
  Other = "其他"             // 其他 - 不属于以上分类的内容
}

/**
 * 评分状态枚举
 */
export enum RatingStatus {
  Active = "active",     // 活跃
  Inactive = "inactive", // 不活跃
  Deleted = "deleted"    // 已删除
}

/**
 * 评分资源类型枚举 - 与RatingCategory保持一致
 */
export enum ResourceType {
  Course = "学习",           // 学习 - 课程、教材、学习资源
  Food = "美食",               // 美食 - 餐厅、菜品、美食推荐
  Game = "游戏",               // 游戏 - 游戏、游戏攻略、游戏设备
  Entertainment = "娱乐", // 娱乐 - 影视、音乐、娱乐活动
  Life = "生活",               // 生活 - 生活服务、日用品、生活技巧
  Sport = "运动",             // 运动 - 运动场所、体育用品、健身课程
  Other = "其他"              // 其他 - 不属于以上分类的内容
}

/**
 * 评分类型信息
 */
export interface RatingTypeInfo {
  value: string;
  label: string;
  description: string;
}

/**
 * 评分标签信息
 */
export interface RatingTagsInfo {
  resourceType: string;
  presetTags: string[];
  popularTags: string[];
}

/**
 * 评分项目基础信息
 */
export interface RatingItem {
  /**
   * 评分项目ID
   */
  id: string;
  /**
   * 项目标题
   */
  title: string;
  /**
   * 项目描述
   */
  description?: string;
  /**
   * 项目分类
   */
  category: RatingCategory;
  /**
   * 项目图片
   */
  image?: string;
  /**
   * 位置信息
   */
  location?: string;
  /**
   * 平均评分
   */
  averageRating: number;
  /**
   * 评分总数
   */
  totalRatings: number;
  /**
   * 项目状态
   */
  status: RatingStatus;
  /**
   * 创建者ID
   */
  createdBy: string;
  /**
   * 创建时间
   */
  createdAt: Date;
  /**
   * 更新时间
   */
  updatedAt: Date;
  /**
   * 租户ID
   */
  tenantId: string;
  /**
   * 额外数据
   */
  metadata?: { [key: string]: any };
}

/**
 * 用户评分记录 - 根据后端API文档更新
 */
export interface UserRating {
  /**
   * 评分记录ID
   */
  id: string;
  /**
   * 租户ID
   */
  tenantId: string;
  /**
   * 创建时间
   */
  createdAt: Date;
  /**
   * 更新时间
   */
  updatedAt: Date;
  /**
   * 资源类型
   */
  resourceType: string;
  /**
   * 资源ID
   */
  resourceId: string;
  /**
   * 资源名称（用于显示）
   */
  resource_name?: string;
  /**
   * 资源标题（可选，用于显示）
   */
  resource_title?: string;
  /**
   * 资源图片URL
   */
  resource_image?: string;
  /**
   * 资源描述
   */
  resource_description?: string;
  /**
   * 评分值（1-5星）
   */
  score: number;
  /**
   * 评价内容
   */
  comment: string;
  /**
   * 是否匿名
   */
  isAnonymous: boolean;
  /**
   * 标签列表
   */
  tags: string[];
  /**
   * 证据图片URL列表
   */
  evidenceUrls: string[];
  /**
   * 评分者ID
   */
  raterId: string;
  /**
   * 是否已验证
   */
  isVerified: boolean;
  /**
   * 是否精选
   */
  isFeatured: boolean;
  /**
   * 是否隐藏
   */
  isHidden: boolean;
  /**
   * 有用数量
   */
  helpfulCount: number;
  /**
   * 无用数量
   */
  unhelpfulCount: number;
  /**
   * 额外数据
   */
  extraData?: { [key: string]: any };
  /**
   * 评分者昵称
   */
  raterNickname: string;
  /**
   * 评分者头像
   */
  raterAvatar: string;
}

/**
 * 评分统计信息
 */
export interface RatingStatistics {
  /**
   * 总评分数
   */
  totalRatings: number;
  /**
   * 平均评分
   */
  averageRating: number;
  /**
   * 各星级分布
   */
  ratingDistribution: {
    [key: number]: number; // 星级 -> 数量
  };
  /**
   * 最新评价
   */
  recentReviews: UserRating[];
}

/**
 * 获取评分项目列表请求参数
 */
export interface GetRatingItemsRequest {
  /**
   * 分类过滤
   */
  category?: RatingCategory;
  /**
   * 关键词搜索
   */
  keyword?: string;
  /**
   * 位置过滤
   */
  location?: string;
  /**
   * 最小评分过滤
   */
  minRating?: number;
  /**
   * 排序方式
   */
  sortBy?: 'rating' | 'popularity' | 'newest';
  /**
   * 页码
   */
  page?: number;
  /**
   * 每页数量
   */
  pageSize?: number;
}

/**
 * 获取资源评分列表请求参数
 */
export interface GetResourceRatingsRequest {
  /**
   * 评分维度筛选
   */
  dimension?: string;
  /**
   * 最低评分筛选 (1-5)
   */
  minScore?: number;
  /**
   * 最高评分筛选 (1-5)
   */
  maxScore?: number;
  /**
   * 是否验证评分筛选
   */
  isVerified?: boolean;
  /**
   * 是否精选评分筛选
   */
  isFeatured?: boolean;
  /**
   * 是否有评论筛选
   */
  hasComment?: boolean;
  /**
   * 排序字段
   */
  sortBy?: 'created_at' | 'score' | 'helpful_count' | 'updated_at';
  /**
   * 排序方向
   */
  sortOrder?: 'asc' | 'desc';
  /**
   * 跳过数量
   */
  skip?: number;
  /**
   * 返回数量 (1-100)
   */
  limit?: number;
}

/**
 * 评分项目列表响应
 */
export interface RatingItemsResponse {
  /**
   * 评分项目列表
   */
  items: RatingItem[];
  /**
   * 分页信息
   */
  pagination: Pagination;
}

/**
 * 资源评分列表响应
 */
export interface ResourceRatingsResponse {
  /**
   * 评分列表
   */
  items: UserRating[];
  /**
   * 总数
   */
  total: number;
  /**
   * 跳过数量
   */
  skip: number;
  /**
   * 返回数量
   */
  limit: number;
}

/**
 * 创建评分项目请求
 */
export interface CreateRatingItemRequest {
  /**
   * 项目标题
   */
  title: string;
  /**
   * 项目描述
   */
  description?: string;
  /**
   * 项目分类
   */
  category: RatingCategory;
  /**
   * 项目图片
   */
  image?: string;
  /**
   * 位置信息
   */
  location?: string;
  /**
   * 额外数据
   */
  metadata?: { [key: string]: any };
}

/**
 * 创建评分请求 - 根据新版后端API文档
 */
export interface CreateRatingRequest {
  /**
   * 资源类型
   */
  resource_type: string;
  /**
   * 资源名称（用于唯一标识资源）
   */
  resource_name: string;
  /**
   * 资源标题（可选，用于显示）
   */
  resource_title?: string;
  /**
   * 资源描述
   */
  resource_description?: string;
  /**
   * 资源图片URL
   */
  resource_image?: string;
  /**
   * 资源链接URL
   */
  resource_url?: string;
  /**
   * 评分值（1-5星）
   */
  score: number;
  /**
   * 评价内容
   */
  comment?: string;
  /**
   * 是否匿名
   */
  is_anonymous?: boolean;
  /**
   * 标签列表
   */
  tags?: string[];
  /**
   * 证据图片URL列表
   */
  evidence_urls?: string[];
}

/**
 * 提交评分请求（兼容旧版本）
 */
export interface SubmitRatingRequest {
  /**
   * 评分项目ID
   */
  itemId: string;
  /**
   * 评分值（1-5星）
   */
  rating: number;
  /**
   * 评价内容
   */
  review?: string;
}

/**
 * API响应格式
 */
export interface RatingApiResponse<T = any> {
  /**
   * 状态码
   */
  code: number;
  /**
   * 响应消息
   */
  message: string;
  /**
   * 响应数据
   */
  data?: T;
}

/**
 * 评分项目详情响应
 */
export interface RatingItemDetailResponse {
  /**
   * 评分项目信息
   */
  item: RatingItem;
  /**
   * 评分统计
   */
  statistics: RatingStatistics;
  /**
   * 当前用户的评分
   */
  userRating?: UserRating;
}

/**
 * 评分详情响应
 */
export interface RatingDetailResponse {
  /**
   * 评分详情
   */
  rating: UserRating;
}

/**
 * 可评分资源 - 根据新版API文档
 */
export interface RatableResource {
  /**
   * 资源唯一标识
   */
  id: string;
  /**
   * 租户ID
   */
  tenant_id: string;
  /**
   * 资源类型
   */
  resource_type: string;
  /**
   * 资源名称（唯一标识）
   */
  resource_name: string;
  /**
   * 资源标题
   */
  title?: string;
  /**
   * 资源描述
   */
  description?: string;
  /**
   * 资源图片URL
   */
  image_url?: string;
  /**
   * 资源链接URL
   */
  resource_url?: string;
  /**
   * 创建者ID（首个评分者）
   */
  creator_id: string;
  /**
   * 创建者昵称
   */
  creator_nickname?: string;
  /**
   * 评分数量
   */
  rating_count: number;
  /**
   * 平均评分
   */
  average_score: number;
  /**
   * 最新评分时间
   */
  latest_rating_at?: string;
  /**
   * 是否激活
   */
  is_active: boolean;
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 更新时间
   */
  updated_at: string;
}

/**
 * 资源列表响应
 */
export interface ResourceListResponse {
  /**
   * 资源列表
   */
  resources: RatableResource[];
  /**
   * 总数
   */
  total: number;
  /**
   * 跳过数量
   */
  skip: number;
  /**
   * 返回数量
   */
  limit: number;
}

/**
 * 获取资源列表请求参数
 */
export interface GetResourceListRequest {
  /**
   * 资源类型（必填）
   */
  resource_type: string;
  /**
   * 跳过数量，默认0
   */
  skip?: number;
  /**
   * 返回数量，默认20，最大100
   */
  limit?: number;
  /**
   * 排序字段，默认average_score
   */
  sort_by?: string;
  /**
   * 排序方向，默认desc
   */
  sort_order?: 'asc' | 'desc';
}

/**
 * 搜索资源请求参数
 */
export interface SearchResourcesRequest {
  /**
   * 搜索关键词（必填）
   */
  keyword: string;
  /**
   * 资源类型筛选（可选）
   */
  resource_type?: string;
  /**
   * 跳过数量，默认0
   */
  skip?: number;
  /**
   * 返回数量，默认20，最大100
   */
  limit?: number;
}

/**
 * 热门资源请求参数
 */
export interface GetTopRatedResourcesRequest {
  /**
   * 资源类型筛选（可选）
   */
  resource_type?: string;
  /**
   * 最少评分数量，默认1
   */
  min_rating_count?: number;
  /**
   * 返回数量，默认10，最大50
   */
  limit?: number;
}

/**
 * 图片上传响应
 */
export interface UploadImageResponse {
  /**
   * 上传成功的图片URL
   */
  url: string;
  /**
   * 文件名
   */
  filename?: string;
  /**
   * 文件大小
   */
  size?: number;
}
