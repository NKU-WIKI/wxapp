import { PaginationParams } from "./common";

export interface Author {
  name: string;
  avatar: string;
  school?: string;
  level?: number; // 新增：用户等级
}

export interface Comment {
  id: number;
  author: Author;
  content: string;
  time: string;
  likes: number;
  isAIAssistant?: boolean;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  time: string;
  content: string;
  image?: string; // 用于帖子列表的单张预览图
  images?: string[]; // 用于详情页的图片画廊
  tags: string[];
  location?: string;
  likes: number | string;
  commentsCount: number;
  favorites?: number;
  comments?: Comment[];
  is_favorited: boolean;
  is_following_author: boolean;
}

export interface CreatePostParams {
  title: string;
  content: string;
  is_public: boolean;
  allow_comment: boolean;
}

export interface CreatePostResponse {
  id: number;
}

/**
 * 获取帖子列表的请求参数
 */
export interface GetPostsParams extends PaginationParams {
  tab?: 'recommend' | 'hot' | 'new';
}
