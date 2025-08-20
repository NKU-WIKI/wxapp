import { User } from "./user";

/**
 * @description 评论信息结构
 */
export interface Comment {
  id: number;
  content: string;
  resource_id: number;
  resource_type: string;
  parent_id?: number;
  user_id: number;
  user: User; // Renamed from user_info
  create_time: string;
}

/**
 * @description 评论详情信息结构，包含额外字段
 */
export interface CommentDetail extends Comment {
  author_nickname?: string;
  parent_author_nickname?: string;
  reply_count?: number;
  like_count?: number;
  is_liked?: boolean;
  children?: CommentDetail[];
  avatar?: string; // 添加avatar属性
}

/**
 * @description 创建新评论的请求体
 */
export interface CreateCommentRequest {
  content: string;
  resource_id: number;
  resource_type: string;
  parent_id?: number;
}

/**
 * @description 更新评论的请求体
 */
export interface CommentUpdate {
  content: string;
}