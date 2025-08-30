import { Pagination } from './common';

/**
 * 通知渠道枚举
 */
export enum NotificationChannel {
  Email = "EMAIL",
  InApp = "IN_APP", 
  Push = "PUSH",
  Sms = "SMS",
  WechatMp = "WECHAT_MINI_PROGRAM",
}

/**
 * 通知优先级枚举
 */
export enum NotificationPriority {
  High = "high",
  Low = "low",
  Normal = "normal",
  Urgent = "urgent",
}

/**
 * 通知状态枚举
 */
export enum NotificationStatus {
  Delivered = "delivered",
  Expired = "expired", 
  Failed = "failed",
  Pending = "pending",
  Read = "read",
  Sent = "sent",
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  Activity = "activity",      // 活动通知
  Announcement = "announcement", // 公告通知
  Mention = "mention",         // 提及通知
  Message = "message",         // 消息通知（点赞、评论、关注等）
  Promotion = "promotion",     // 推广通知
  Security = "security",       // 安全通知
  System = "system",           // 系统通知
}

/**
 * 通知读取schema
 */
export interface NotificationRead {
  /**
   * Business Id
   */
  business_id?: string | null;
  /**
   * Business Type
   */
  business_type?: string | null;
  /**
   * Channels
   */
  channels?: NotificationChannel[] | null;
  /**
   * Content
   */
  content: string;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Data
   */
  data?: { [key: string]: any } | null;
  /**
   * Error Message
   */
  error_message?: string | null;
  /**
   * Expires At
   */
  expires_at?: Date | null;
  /**
   * Group Key
   */
  group_key?: string | null;
  /**
   * Id
   */
  id: string;
  /**
   * Is Aggregated
   */
  is_aggregated: boolean;
  /**
   * Max Retries
   */
  max_retries: number;
  /**
   * Metadata
   */
  metadata?: { [key: string]: any } | null;
  preferred_channel?: NotificationChannel;
  priority?: NotificationPriority;
  /**
   * Recipient
   */
  recipient?: { [key: string]: any } | null;
  /**
   * Recipient Id
   */
  recipient_id: string;
  /**
   * Related Resource
   */
  related_resource?: string | null;
  /**
   * Retry Count
   */
  retry_count: number;
  /**
   * Scheduled At
   */
  scheduled_at?: Date | null;
  /**
   * Sender
   */
  sender?: { [key: string]: any } | null;
  /**
   * Sender Id
   */
  sender_id?: string | null;
  /**
   * Sent At
   */
  sent_at?: Date | null;
  status: NotificationStatus;
  /**
   * Summary
   */
  summary?: string | null;
  /**
   * Template Id
   */
  template_id?: string | null;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Title
   */
  title: string;
  type: NotificationType;
  /**
   * Updated At
   */
  updated_at: Date;
  [property: string]: any;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  /**
   * Page，当前页码，从 1 开始
   */
  page: number;
  /**
   * Page Size，每页条数
   */
  page_size: number;
  /**
   * Total，结果总数
   */
  total: number;
  [property: string]: any;
}

/**
 * 通知列表响应schema
 */
export interface NotificationListResponse {
  /**
   * Items
   */
  items: NotificationRead[];
  pagination: PaginationInfo;
  [property: string]: any;
}

/**
 * 获取通知列表请求参数
 */
export interface NotificationListRequest {
  /**
   * End Date，结束日期
   */
  end_date?: Date | null;
  /**
   * Is Read，已读状态过滤
   */
  is_read?: boolean | null;
  /**
   * Page，页码（从1开始）
   */
  page?: number;
  /**
   * Page Size，每页数量（最大100）
   */
  page_size?: number;
  /**
   * Priority，优先级过滤
   */
  priority?: string | null;
  /**
   * Start Date，开始日期
   */
  start_date?: Date | null;
  /**
   * Status，状态过滤
   */
  status?: string | null;
  /**
   * Type，通知类型过滤
   */
  type?: string | null;
  [property: string]: any;
}

/**
 * API响应格式
 */
export interface NotificationApiResponse {
  /**
   * Code，业务码，成功为 0
   */
  code?: number;
  /**
   * 负载数据
   */
  data?: NotificationListResponse | null;
  /**
   * Message，简明中文信息
   */
  message?: string;
  [property: string]: any;
}

/**
 * 未读数量统计
 */
export interface UnreadCountResponse {
  [NotificationType.Activity]: number;
  [NotificationType.Announcement]: number;
  [NotificationType.Mention]: number;
  [NotificationType.Message]: number;
  [NotificationType.Promotion]: number;
  [NotificationType.Security]: number;
  [NotificationType.System]: number;
  total: number;
}

/**
 * 创建通知请求参数
 */
export interface NotificationCreateRequest {
  /**
   * Business Id
   */
  business_id?: string | null;
  /**
   * Business Type
   */
  business_type?: string | null;
  /**
   * Channels
   */
  channels?: NotificationChannel[] | null;
  /**
   * Content
   */
  content: string;
  /**
   * Data
   */
  data?: { [key: string]: any } | null;
  /**
   * Expires At
   */
  expires_at?: Date | null;
  /**
   * Metadata
   */
  metadata?: { [key: string]: any } | null;
  preferred_channel?: NotificationChannel;
  priority?: NotificationPriority;
  /**
   * Recipient Id
   */
  recipient_id: string;
  /**
   * Related Resource
   */
  related_resource?: string | null;
  /**
   * Scheduled At
   */
  scheduled_at?: Date | null;
  /**
   * Sender Id
   */
  sender_id?: string | null;
  /**
   * Summary
   */
  summary?: string | null;
  /**
   * Template Id
   */
  template_id?: string | null;
  /**
   * Title
   */
  title: string;
  type: NotificationType;
  [property: string]: any;
}

/**
 * 创建通知响应格式
 */
export interface NotificationCreateResponse {
  /**
   * Code，业务码，成功为 0
   */
  code?: number;
  /**
   * 负载数据
   */
  data?: NotificationRead | null;
  /**
   * Message，简明中文信息
   */
  message?: string;
  [property: string]: any;
}

/**
 * 标记已读请求参数
 */
export interface MarkReadRequest {
  notification_ids?: string[];
  type?: NotificationType;
  mark_all?: boolean;
}


