export interface LoginParams {
  code: string;
}

export interface User {
  level: string;
  id: number;
  nickname: string;
  avatar: string;
  gender: number;
  bio?: string;
  wechatId?: string;
  qqId?: string;
  phone?: string;
  post_count?: number;
  follower_count?: number;
  following_count?: number;
  create_time?: string;
  role?: string;
}

// 扩展的用户信息接口，包含额外的统计数据
export interface UserInfo extends User {
  postsCount?: number;
  likesCount?: number;
  followingCount?: number;
  followersCount?: number;
  favoritesCount?: number;
  points?: number;
  signature?: string;
  school?: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user_info: User;
} 