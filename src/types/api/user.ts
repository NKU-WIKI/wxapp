import { PaginatedData, Attachment } from './common';

/**
 * @description API 返回的用户基础信息结构
 */
export interface User {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  nickname: string;
  avatar?: string | null;
  bio?: string | null;
  birthday?: string | null;
  school?: string | null;
  college?: string | null;
  location?: string | null;
  wechat_id?: string | null;
  qq_id?: string | null;
  tel?: string | null;
  status: string; // "active" | "inactive" | "banned" 或其他状态
  // 扩展字段（可能在某些接口中返回）
  is_following?: boolean;
  level?: number;
  post_count?: number;
  total_likes?: number;
  following_count?: number;
  follower_count?: number;
  total_favorites?: number;
  points?: number;
}

/**
 * @description API 返回的用户详细资料结构 (基于 UserProfileDetail)
 */
export interface UserProfile {
  assets: Record<string, Attachment>;
  interest_tags: string[];
  tokens: number;
  user_id: string;
  nickname: string;
  avatar?: string | null;
  bio?: string | null;
  birthday?: string | null;
  school?: string | null;
  college?: string | null;
  location?: string | null;
  wechat_id?: string | null;
  qq_id?: string | null;
  phone?: string | null;
  post_count: number;
  follower_count: number;
  following_count: number;
  total_likes: number;
  total_favorites: number;
  role?: string | null;
  level?: number | null;
  points?: number | null;
  gender?: number | null;
  create_time?: string | null;
}

/**
 * @description 更新用户资料的请求结构
 */
export interface UpdateUserProfileRequest {
  assets?: Record<string, Attachment> | null;
  interest_tags?: string[] | null;
  nickname?: string | null;
  avatar?: string | null;
  bio?: string | null;
  wechat_id?: string | null;
  qq_id?: string | null;
  phone?: string | null;
  gender?: number | null;
}

/**
 * @description 粉丝/关注列表中的用户项
 */
export type Follower = User;

/**
 * @description 粉丝/关注列表的分页数据结构
 */
export type FollowerList = PaginatedData<Follower>;

/**
 * @description 创建浏览历史的请求体
 */
export interface CreateViewHistoryRequest {
  target_type: 'post' | 'product' | 'user';
  target_id: number;
}

/**
 * @description 浏览历史记录项 (基于 ViewHistoryRead)
 */
export interface HistoryItem {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  target_type: 'post' | 'product' | 'user';
  target_id: string;
  user_id: string;
  // 可能会有关联的目标详情
  target_detail?: Record<string, unknown>;
}

/**
 * @description 浏览历史的分页数据结构
 */
export type HistoryList = PaginatedData<HistoryItem>;

/**
 * @description 用户标签项 (基于 UserTagRead)
 */
export interface UserTag {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  tag: string;
  weight: number;
  source?: string | null; // 标签来源：manual/behavior/import
  user_id: string;
}

/**
 * @description 用户标签列表
 */
export type UserTagList = UserTag[];

/**
 * @description 用户统计画像 (基于 UserStatsRead)
 */
export interface UserStats {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_count: number;
  comment_count: number;
  like_count: number;
  favorite_count: number;
  order_count: number;
  message_count: number;
  exp: number;
  last_active_at?: string | null;
}

/**
 * @description 等级规则 (基于 LevelRule)
 */
export interface LevelRule {
  level: number;
  name: string;
  min_exp: number;
  max_exp?: number | null;
}

/**
 * @description 等级信息 (基于 LevelInfo)
 */
export interface LevelInfo {
  level: number;
  exp: number;
  next_level_exp?: number | null;
  prev_level_exp?: number | null;
  progress: number;
  level_name: string;
  next_level_name?: string | null;
  rules: LevelRule[];
}

/**
 * @description 经验记录 (基于 ExperienceRecordRead)
 */
export interface ExperienceRecord {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  event_type: string;
  description?: string | null;
  delta: number;
}

/**
 * @description 经验记录分页数据 (基于 Page_ExperienceRecordRead_)
 */
export interface ExperienceRecordPage {
  items: ExperienceRecord[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * @description 标签更新请求 (基于 TagUpsertRequest)
 */
export interface TagUpsertRequest {
  tag: string;
  weight?: number;
}
