import http from '../request';
import { NotificationListResponse, NotificationSummary } from '@/types/api/notification.d';

export const notificationApi = {
  getList: (params: { page?: number; page_size?: number } = {}) => {
    return http.get<NotificationListResponse>('/wxapp/notification/list', params);
  },
  getUnreadCount: () => {
    return http.get<{ unread_count: number }>('/wxapp/notification/unread-count');
  },
  markRead: (notificationIds: number[]) => {
    return http.post('/wxapp/notification/read', { notification_ids: notificationIds });
  },
  markAllRead: () => {
    return http.post('/wxapp/notification/read-all', {});
  },
  getSummary: () => {
    return http.get<NotificationSummary>('/wxapp/notification/summary');
  }
};

export default notificationApi;


