import { PaginationParams } from "./common";
import { User } from "./user";

/**
 * @description 帖子信息结构
 */
export interface Post {
  id: number;
  title: string;
  content?: string;
  status: "published" | "draft";
  user_id: number;
  user: User; // Renamed from user_info
  view_count?: number;
  like_count?: number;
  favorite_count?: number; // Added
  comment_count?: number;
  create_time?: string;
  // User-specific states
  is_liked?: boolean;
  is_favorited?: boolean;
  is_following_author?: boolean;
}

/**
 * @description 获取论坛帖子列表的查询参数
 */
export interface GetForumPostsParams extends PaginationParams {
  category_id?: number;
}

/**
 * @description 创建论坛帖子的请求体
 */
export interface CreateForumPostRequest {
  title: string;
  content?: string;
  status?: "published" | "draft";
  category_id?: number; // Added based on new docs
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
