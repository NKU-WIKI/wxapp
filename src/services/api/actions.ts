import type { BaseResponse } from '@/types/api/common.d';
import request from '../request';

/**
 * 操作类型枚举
 */
export type ActionType = 'like' | 'favorite' | 'share' | 'follow' | 'pin';

/**
 * 目标对象类型枚举
 */
export type TargetType = 'post' | 'comment' | 'user' | 'note' | 'listing' | 'activity' | 'errand' | 'announcement' | 'link';

/**
 * 切换操作请求参数
 */
export interface ActionToggleRequest {
  target_id: string;
  target_type: TargetType;
  action_type: ActionType;
}

/**
 * 切换操作响应结果
 */
export interface ActionToggleResult {
  is_active: boolean;
  count: number;
}

/**
 * 切换用户交互状态
 * @param targetId 目标对象的UUID
 * @param targetType 目标对象类型
 * @param actionType 操作类型
 * @returns Promise<BaseResponse<ActionToggleResult>>
 */
export const toggleAction = async (
  targetId: string,
  targetType: TargetType,
  actionType: ActionType
): Promise<BaseResponse<ActionToggleResult>> => {
  const data: ActionToggleRequest = {
    target_id: targetId,
    target_type: targetType,
    action_type: actionType
  };

  return request.post<ActionToggleResult>('/actions/toggle', data);
};

/**
 * 置顶/取消置顶帖子
 * @param postId 帖子ID
 * @returns Promise<BaseResponse<ActionToggleResult>>
 */
export const togglePostPin = async (postId: string): Promise<BaseResponse<ActionToggleResult>> => {
  return toggleAction(postId, 'post', 'pin');
};

/**
 * 点赞/取消点赞帖子
 * @param postId 帖子ID
 * @returns Promise<BaseResponse<ActionToggleResult>>
 */
export const togglePostLike = async (postId: string): Promise<BaseResponse<ActionToggleResult>> => {
  return toggleAction(postId, 'post', 'like');
};

/**
 * 收藏/取消收藏帖子
 * @param postId 帖子ID
 * @returns Promise<BaseResponse<ActionToggleResult>>
 */
export const togglePostFavorite = async (postId: string): Promise<BaseResponse<ActionToggleResult>> => {
  return toggleAction(postId, 'post', 'favorite');
};

/**
 * 分享/取消分享帖子
 * @param postId 帖子ID
 * @returns Promise<BaseResponse<ActionToggleResult>>
 */
export const togglePostShare = async (postId: string): Promise<BaseResponse<ActionToggleResult>> => {
  return toggleAction(postId, 'post', 'share');
};

/**
 * 关注/取消关注用户
 * @param userId 用户ID
 * @returns Promise<BaseResponse<ActionToggleResult>>
 */
export const toggleUserFollow = async (userId: string): Promise<BaseResponse<ActionToggleResult>> => {
  return toggleAction(userId, 'user', 'follow');
};