import { PaginationParams } from "./common";
import { User } from "./user";

/**
 * @description 帖子信息结构
 */
export interface Post {
  id: string; // 改为string以支持UUID
  title: string;
  content?: string;
  status: "published" | "draft";
  user_id: string;
  user: User; // Renamed from user_info
  author_info?: User; // 兼容旧版API返回的作者信息
  view_count?: number;
  like_count?: number;
  favorite_count?: number; // Added
  comment_count?: number;
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
  status?: "published" | "draft";
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
  status?: "published" | "draft" | "archived";
}

/**
 * @description 获取社区动态信息流的查询参数
 */
export interface GetFeedParams extends PaginationParams {}
