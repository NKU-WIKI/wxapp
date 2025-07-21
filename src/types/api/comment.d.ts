import { User } from './user';
import { Pagination } from './common';

// 评论创建参数
export interface CreateCommentParams {
  resource_id: number;
  resource_type: 'post' | 'article';
  content: string;
  parent_id?: number;
  image?: string[];
}

// 评论创建响应
export interface CreateCommentResponse {
  id: number;
}

// 评论详情
export interface CommentDetail {
  id: number;
  resource_id: number;
  resource_type: string;
  parent_id: number | null;
  user_id: number;
  nickname: string;
  avatar: string;
  bio?: string;
  content: string;
  image: string[] | null;
  like_count: number;
  reply_count: number;
  create_time: string;
  is_liked: boolean;
  children?: CommentDetail[];
}

// 获取评论列表参数
export interface GetCommentsParams {
  resource_id: number;
  resource_type?: string;
  page?: number;
  page_size?: number;
}

// 获取评论回复参数
export interface GetRepliesParams {
  comment_id: number;
  page?: number;
  page_size?: number;
}

// 更新评论参数
export interface UpdateCommentParams {
  id: number;
  content: string;
}

// 删除评论参数
export interface DeleteCommentParams {
  id: number;
}

// 评论状态响应
export interface CommentStatusResponse {
  [commentId: string]: boolean;
} 