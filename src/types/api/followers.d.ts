import { User } from './user';

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

// 关注/粉丝列表响应
export interface FollowersResponse {
  items: FollowItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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
