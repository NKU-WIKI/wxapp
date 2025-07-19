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

export interface LoginResponse {
  token: string;
  token_type: string;
  user_info: User;
} 