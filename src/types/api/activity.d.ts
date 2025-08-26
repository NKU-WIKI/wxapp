/**
 * ActivityCreate，创建活动请求
 */
export interface ActivityCreateRequest {
  /**
   * 活动类型
   */
  activity_type: ActivityType;
  /**
   * Allow Waitlist，是否允许等待队列
   */
  allow_waitlist?: boolean;
  /**
   * Category，活动分类
   */
  category: string;
  /**
   * Description，活动描述
   */
  description: string;
  /**
   * End Time，结束时间
   */
  end_time: Date;
  /**
   * Fee Amount，活动费用
   */
  fee_amount?: number | null;
  /**
   * Fee Currency，费用币种
   */
  fee_currency?: string;
  /**
   * Is Recurrent，是否为定期活动
   */
  is_recurrent?: boolean;
  /**
   * Location，活动地点
   */
  location?: null | string;
  /**
   * Max Participants，最大参与人数
   */
  max_participants?: number | null;
  /**
   * Min Participants，最少参与人数
   */
  min_participants?: number | null;
  /**
   * Online Url，线上活动链接
   */
  online_url?: null | string;
  /**
   * Recurrence Pattern，重复模式
   */
  recurrence_pattern?: { [key: string]: any } | null;
  /**
   * Require Approval，是否需要审核
   */
  require_approval?: boolean;
  /**
   * Requirements，参与要求
   */
  requirements?: { [key: string]: any } | null;
  /**
   * Start Time，开始时间
   */
  start_time: Date;
  /**
   * Tags，活动标签
   */
  tags?: string[] | null;
  /**
   * Target Audience，目标受众
   */
  target_audience?: { [key: string]: any } | null;
  /**
   * Title，活动标题
   */
  title: string;
  /**
   * 可见性
   */
  visibility?: ActivityVisibility;
  [property: string]: any;
}

/**
 * 活动类型
 *
 * ActivityType，活动类型枚举
 */
export enum ActivityType {
  Hybrid = "hybrid",
  Offline = "offline",
  Online = "online",
}

/**
 * 可见性
 *
 * ActivityVisibility，活动可见性枚举
 */
export enum ActivityVisibility {
  Private = "private",
  Public = "public",
  Tenant = "tenant",
}

/**
 * ApiResponse[ActivityRead]
 */
export interface ActivityCreateResponse {
  /**
   * Code，业务码，成功为 0
   */
  code?: number;
  /**
   * 负载数据
   */
  data?: null | ActivityRead;
  /**
   * Message，简明中文信息
   */
  message?: string;
  [property: string]: any;
}

/**
 * ActivityRead，活动读取模型
 */
export interface ActivityRead {
  /**
   * 活动类型
   */
  activity_type: ActivityType;
  /**
   * Ai Recommendation Score
   */
  ai_recommendation_score: number | null;
  /**
   * Ai Tags
   */
  ai_tags: string[] | null;
  /**
   * Allow Guest
   */
  allow_guest: boolean;
  /**
   * Allow Waitlist
   */
  allow_waitlist: boolean;
  /**
   * Category，活动分类
   */
  category: string;
  /**
   * Co Organizers
   */
  co_organizers: UserRead[] | null;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Current Participants
   */
  current_participants: number;
  /**
   * Description，活动描述
   */
  description: string;
  /**
   * Discussion Count
   */
  discussion_count: number;
  /**
   * End Time
   */
  end_time: Date;
  /**
   * Favorite Count
   */
  favorite_count: number;
  /**
   * Fee Amount
   */
  fee_amount: number | null;
  /**
   * Fee Currency
   */
  fee_currency: string;
  /**
   * Id
   */
  id: string;
  /**
   * Is Favorited
   */
  is_favorited?: boolean;
  /**
   * Is Recurrent
   */
  is_recurrent: boolean;
  /**
   * Is Registered
   */
  is_registered?: boolean;
  /**
   * Location
   */
  location: null | string;
  /**
   * Max Participants
   */
  max_participants: number | null;
  /**
   * Meeting Info
   */
  meeting_info: { [key: string]: any } | null;
  /**
   * Min Participants
   */
  min_participants: number | null;
  /**
   * Moderation Reason
   */
  moderation_reason: null | string;
  /**
   * Moderation Status
   */
  moderation_status: string;
  /**
   * Online Url
   */
  online_url: null | string;
  organizer: UserRead;
  /**
   * Recurrence Pattern
   */
  recurrence_pattern: { [key: string]: any } | null;
  /**
   * Registration Deadline
   */
  registration_deadline: Date | null;
  registration_status?: RegistrationStatus | null;
  /**
   * Require Approval
   */
  require_approval: boolean;
  /**
   * Requirements
   */
  requirements: { [key: string]: any } | null;
  /**
   * Safety Score
   */
  safety_score: number | null;
  /**
   * Share Count
   */
  share_count: number;
  /**
   * Start Time
   */
  start_time: Date;
  status: ActivityStatus;
  /**
   * Tags，活动标签
   */
  tags?: string[] | null;
  /**
   * Target Audience
   */
  target_audience: { [key: string]: any } | null;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Title，活动标题
   */
  title: string;
  /**
   * Updated At
   */
  updated_at: Date;
  /**
   * View Count
   */
  view_count: number;
  visibility: ActivityVisibility;
  /**
   * Waitlist Count
   */
  waitlist_count: number;
  [property: string]: any;
}


/**
 * UserRead
 */
export interface UserRead {
  /**
   * Avatar
   */
  avatar?: null | string;
  /**
   * Bio
   */
  bio?: null | string;
  /**
   * Birthday
   */
  birthday?: Date | null;
  /**
   * College
   */
  college?: null | string;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Id
   */
  id: string;
  /**
   * Location
   */
  location?: null | string;
  /**
   * Nickname
   */
  nickname: string;
  /**
   * Qq Id
   */
  qq_id?: null | string;
  /**
   * School
   */
  school?: null | string;
  status: UserStatus;
  /**
   * Tel
   */
  tel?: null | string;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Updated At
   */
  updated_at: Date;
  /**
   * Wechat Id
   */
  wechat_id?: null | string;
  [property: string]: any;
}

/**
 * UserStatus，用户状态枚举。
 *
 * ACTIVE: 正常用户，可以登录和使用所有功能
 * INACTIVE: 未激活用户，可能是注册后未验证邮箱
 * BANNED: 被禁用户，无法登录和使用功能
 */
export enum UserStatus {
  Active = "active",
  Banned = "banned",
  Inactive = "inactive",
}

/**
 * RegistrationStatus，报名状态枚举
 */
export enum RegistrationStatus {
  Cancelled = "cancelled",
  Confirmed = "confirmed",
  Pending = "pending",
  Rejected = "rejected",
  Waitlist = "waitlist",
}

/**
 * ActivityStatus，活动状态枚举
 */
export enum ActivityStatus {
  Cancelled = "cancelled",
  Completed = "completed",
  Draft = "draft",
  Ongoing = "ongoing",
  Published = "published",
}

export interface GetActivityListRequest {
  /**
   * Activity Type，活动类型
   */
  activity_type?: ActivityType | null;
  /**
   * Category，活动分类
   */
  category?: null | string;
  /**
   * Fee Max，费用最大值
   */
  fee_max?: number | null;
  /**
   * Fee Min，费用最小值
   */
  fee_min?: number | null;
  /**
   * Has Slots，是否有空位
   */
  has_slots?: boolean | null;
  /**
   * Is Free，是否免费
   */
  is_free?: boolean | null;
  /**
   * Limit，返回数量
   */
  limit?: number;
  /**
   * Skip，跳过数量
   */
  skip?: number;
  /**
   * Sort By，排序字段
   */
  sort_by?: string;
  /**
   * Sort Order，排序顺序
   */
  sort_order?: string;
  /**
   * Start Date From，开始时间从
   */
  start_date_from?: Date | null;
  /**
   * Start Date To，开始时间到
   */
  start_date_to?: Date | null;
  /**
   * Status，活动状态
   */
  status?: ActivityStatus | null;
  [property: string]: any;
}

/**
 * ApiResponse[Page[ActivityRead]]
 */
export interface GetActivityListResponse {
  /**
   * Code，业务码，成功为 0
   */
  code?: number;
  /**
   * 负载数据
   */
  data?: null | PageActivityRead;
  /**
   * Message，简明中文信息
   */
  message?: string;
  [property: string]: any;
}

/**
 * Page[ActivityRead]
 */
export interface PageActivityRead {
  /**
   * Items
   */
  items: ActivityRead[];
  /**
   * Page
   */
  page: number;
  /**
   * Page Size
   */
  page_size: number;
  /**
   * Total
   */
  total: number;
  [property: string]: any;
}


