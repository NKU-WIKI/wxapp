import { User } from "./user";
import { PaginationParams } from "./common";

// Author 接口不再需要，用户信息直接使用 User 类型
// export interface Author {
//   name: string;
//   avatar: string;
//   school?: string;
//   level?: number;
// }

export interface Comment {
  id: number;
  author: User; // 使用 User 类型
  content: string;
  time: string;
  likes: number;
  isAIAssistant?: boolean;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  image_urls: string[] | null; // API 返回的是 image_urls
  tag: string | null;
  location: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  favorite_count: number;
  create_time: string;
  author_info: User; // 使用 author_info 和 User 类型
  is_liked: boolean;
  is_favorited: boolean;
  is_following_author: boolean;
  comments?: Comment[];
}

export interface CreatePostParams {
  title: string;
  content: string;
  image_urls?: string[];
  is_public?: boolean;
  allow_comment?: boolean;
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
