import { User } from './user';
import { Pagination, BaseResponse } from './common';

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
  target_user_id: string;
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
  target_user_id: string; // 根据OpenAPI文档，用户ID是UUID字符串
  action?: 'follow' | 'unfollow'; // 保留兼容性，但实际API使用toggle
}

// 关注操作结果 (基于 ActionToggleResult)
export interface ActionToggleResult {
  is_active: boolean;
}

// 关注/取关响应 (使用BaseResponse包装ActionToggleResult)
export interface FollowActionResponse extends BaseResponse<ActionToggleResult> {}
