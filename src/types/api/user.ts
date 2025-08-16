import { PaginatedData, PaginationParams } from "./common";

/**
 * @description /api/v1/users/me 接口返回的当前用户信息
 */
export interface CurrentUser {
  user_id: number;
  tenant_id: string;
  nickname: string;
  roles: string[];
}

/**
 * @description API 返回的用户基础信息结构
 */
export interface User extends UserProfile {
  id: number;
  nickname: string;
  avatar: string;
  bio?: string;
  status?: "active" | "inactive" | "banned";
  is_following?: boolean;
}

/**
 * @description API 返回的当前用户详细资料结构
 */
export interface UserProfile {
  assets: Record<string, any>; // 资产信息，结构不确定，使用 Record
  interest_tags: string[];
}

/**
 * @description 更新用户个人资料的请求体
 */
export interface UpdateUserProfileRequest {
  assets?: Record<string, any>;
  interest_tags?: string[];
}

/**
 * @description 粉丝/关注列表中的用户项
 */
export interface Follower extends User {}

/**
 * @description 粉丝/关注列表的分页数据结构
 */
export type FollowerList = PaginatedData<Follower>;

/**
 * @description 创建浏览历史的请求体
 */
export interface CreateViewHistoryRequest {
  target_type: "post" | "product" | "user";
  target_id: number;
}

/**
 * @description 浏览历史记录项
 */
export interface HistoryItem {
  id: number;
  user_id: number;
  target_type: string;
  target_id: number;
  view_time: string; // ISO 8601 format date string
  // 根据 target_type，可能会有关联的目标详情
  target_detail?: any;
}

/**
 * @description 浏览历史的分页数据结构
 */
export type HistoryList = PaginatedData<HistoryItem>;

/**
 * @description 获取浏览历史的查询参数
 */
export interface GetHistoryParams extends PaginationParams {}

