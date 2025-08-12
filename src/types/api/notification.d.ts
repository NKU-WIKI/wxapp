import { Pagination } from './common';

export type NotificationType = 'like' | 'comment' | 'follow' | 'system';

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  is_read: boolean;
  target_id?: string | null;
  target_type?: string | null;
  create_time: string;
  sender_nickname?: string | null;
  sender_avatar?: string | null;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  pagination: Pagination;
}

export interface NotificationSummary {
  total_unread: number;
  unread_by_type: Partial<Record<NotificationType, number>>;
}


