import { Pagination } from './common';

/**
 * 评分分类枚举
 */
export enum RatingCategory {
  Course = "course",           // 课程
  Food = "food",              // 美食
  Game = "game",              // 游戏
  Entertainment = "entertainment", // 娱乐
  Life = "life",              // 生活
  Study = "study",            // 学习
  Sports = "sports",          // 运动
  Other = "other"             // 其他
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
 * 用户评分记录
 */
export interface UserRating {
  /**
   * 评分记录ID
   */
  id: string;
  /**
   * 评分项目ID
   */
  itemId: string;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 评分值（1-5星）
   */
  rating: number;
  /**
   * 评价内容
   */
  review?: string;
  /**
   * 评分时间
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
 * 提交评分请求
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
