// src/types/api/user.ts

/**
 * @description API 返回的原始用户信息结构
 */
export interface User {
  id: number;
  openid?: string; // 用户的微信openid，在某些接口中会返回
  nickname: string;
  avatar: string;
  bio?: string;
  
  // 社交账号信息
  wechatId?: string;
  qqId?: string;
  phone?: string;
  
  // 统计数据
  post_count?: number;
  follower_count?: number;
  following_count?: number;
  total_likes?: number;
  total_favorites?: number;
  
  // 角色和等级
  role?: 'user' | 'admin' | 'super_admin';
  level?: number;
  points?: number;
  
  // 其他信息
  gender?: number; // 0: 未知, 1: 男, 2: 女
  create_time?: string;

  // 关系状态 (仅在特定接口中出现)
  is_following?: boolean;
}

/**
 * @description 用户统计数据接口
 */
export interface UserStats {
  post_count: number;
  follower_count: number;
  following_count: number;
  total_likes: number;
  total_favorites: number;
  points: number;
}

/**
 * @description 登录接口的请求体
 */
export interface LoginParams {
  code: string;
}

/**
 * @description 登录接口的成功响应体
 */
export interface LoginResponse {
  token: string;
  user_info: User;
}
