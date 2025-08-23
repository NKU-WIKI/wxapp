import { User } from "./user";

/**
 * @description 评论信息结构 - 匹配CommentRead API
 */
export interface Comment {
  id: string; // 改为string UUID
  tenant_id?: string;
  created_at: string; // 正确的字段名
  updated_at?: string;
  content: string;
  resource_id: string;
  resource_type: string;
  parent_id?: string; // 改为string UUID
  root_id?: string;
  path?: string;
  depth?: number;
  user_id: string;
  likes_count?: number;
  replies_count_immediate?: number;
  has_liked?: boolean;
  attachments?: Record<string, any>;
  // 🎯 新增：API返回的用户信息字段
  author_nickname?: string; // 作者昵称
  author_avatar?: string; // 作者头像
  // 保留兼容字段
  user?: User; // 可能从其他接口获取
}

/**
 * @description 评论详情信息结构，包含额外字段
 */
export interface CommentDetail extends Comment {
  parent_author_nickname?: string; // 父评论作者昵称
  reply_count?: number;
  like_count?: number;
  is_liked?: boolean;
  children?: CommentDetail[];
  avatar?: string; // 兼容字段，建议使用 author_avatar
  create_at?: string; // 兼容字段，用于UI展示
}

/**
 * @description 创建新评论的请求体
 */
export interface CreateCommentRequest {
  content: string;
  resource_id: string; // 帖子ID，UUID字符串格式
  resource_type: string; // 资源类型，如'post'
  parent_id?: string | number; // 父评论ID，可选，支持string或number类型
  attachments?: Record<string, any>; // 附件信息，可选
}

/**
 * @description 更新评论的请求体
 */
export interface CommentUpdate {
  content: string;
}