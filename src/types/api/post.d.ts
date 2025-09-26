/* eslint-disable no-unused-vars */
import { PaginationParams } from './common';
import { User } from './user';

/**
 * @description 帖子信息结构
 */
export interface Post {
  id: string; // 改为string以支持UUID
  title: string;
  content?: string;
  status: 'published' | 'draft' | 'archived';
  user_id: string;
  user: User; // Renamed from user_info
  author_info?: User; // 兼容旧版API返回的作者信息
  view_count?: number;
  like_count?: number;
  favorite_count?: number; // Added
  comment_count?: number;
  share_count?: number;
  create_time?: string;
  created_at?: string; // 后端返回的创建时间字段
  image?: string | string[]; // 图片数据，可能是字符串或数组
  image_urls?: string[]; // 图片URL数组
  images?: string[]; // 兼容后端字段
  tag?: string | string[]; // 标签数据，可能是字符串或数组
  tags?: string[]; // 兼容后端字段
  location?: string; // 位置信息，可能是JSON字符串
  // User-specific states
  is_liked?: boolean;
  is_favorited?: boolean;
  is_following_author?: boolean;
  // Privacy settings
  is_public?: boolean;
  allow_comments?: boolean;
}

/**
 * @description 获取论坛帖子列表的查询参数
 */
export interface GetForumPostsParams extends PaginationParams {
  category_id?: string;
}

/**
 * @description 创建论坛帖子的请求体
 */
export interface CreateForumPostRequest {
  title: string;
  content?: string;
  status?: 'published' | 'draft';
  category_id?: string; // UUID string as per API docs
  images?: string[]; // Changed from image_urls to images
  tags?: string[]; // Changed from tag to tags, and from union to array
  is_public?: boolean;
  allow_comments?: boolean; // Changed from allow_comment to allow_comments
}

/**
 * @description 更新帖子的请求体
 */
export interface PostUpdate {
  title?: string;
  content?: string;
  status?: 'published' | 'draft' | 'archived';
}

export interface GetHotPostsParams {
  /**
   * Limit，排行榜长度（1-50）
   */
  limit?: number;
  [property: string]: any;
}

/**
 * ApiResponse[List[PostHotRanking]]
 */
export interface HotPostsList {
  /**
   * Code，业务码，成功为 0
   */
  code?: number;
  /**
   * Data，负载数据
   */
  data?: PostHotRanking[] | null;
  /**
   * Message，简明中文信息
   */
  message?: string;
  [property: string]: any;
}

/**
 * PostHotRanking，帖子热度排行
 */
export interface PostHotRanking {
  /**
   * Comment Count
   */
  comment_count: number;
  /**
   * Favorite Count
   */
  favorite_count: number;
  /**
   * Hot Score
   */
  hot_score: number;
  /**
   * Like Count
   */
  like_count: number;
  /**
   * Post Id
   */
  post_id: string;
  /**
   * Title
   */
  title: string;
  user: UserRead;
  /**
   * View Count
   */
  view_count: number;
  [property: string]: any;
}

/**
 * UserRead
 */
export interface UserRead {
  /**
   * Avatar
   */
  avatar?: null | string;
  /**
   * Bio
   */
  bio?: null | string;
  /**
   * Birthday
   */
  birthday?: Date | null;
  /**
   * College
   */
  college?: null | string;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Id
   */
  id: string;
  /**
   * Location
   */
  location?: null | string;
  /**
   * Nickname
   */
  nickname: string;
  /**
   * Qq Id
   */
  qq_id?: null | string;
  /**
   * School
   */
  school?: null | string;
  status: UserStatus;
  /**
   * Tel
   */
  tel?: null | string;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Updated At
   */
  updated_at: Date;
  /**
   * Wechat Id
   */
  wechat_id?: null | string;
  [property: string]: any;
}

/**
 * UserStatus，用户状态枚举。
 *
 * ACTIVE: 正常用户，可以登录和使用所有功能
 * INACTIVE: 未激活用户，可能是注册后未验证邮箱
 * BANNED: 被禁用户，无法登录和使用功能
 */
export enum UserStatus {
  Active = 'active',
  Banned = 'banned',
  Inactive = 'inactive',
}
