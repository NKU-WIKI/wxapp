import { User } from './user';
import { Pagination } from './common';

// 关注/粉丝关系类型
export type FollowRelation = 'mutual' | 'following' | 'follow_back' | 'none';

// 关注/粉丝项接口
export interface FollowItem {
  id: number;
  user: User;
  relation: FollowRelation;
  followed_at: string;
}

// 获取关注/粉丝列表参数
export interface GetFollowersParams {
  page?: number;
  page_size?: number;
  type: 'following' | 'followers';
  search?: string;
}

// 关注/粉丝列表响应 - 修正为实际API响应格式
export interface FollowersResponse {
  code: number;
  msg?: string;
  message?: string;
  data: User[]; // 直接是用户数组
  pagination?: Pagination; // 可选的分页信息
}

// 关注/取关参数
export interface FollowActionParams {
  target_user_id: number;
  action: 'follow' | 'unfollow';
}

// 关注/取关响应
export interface FollowActionResponse {
  is_following: boolean;
  relation: FollowRelation;
}
