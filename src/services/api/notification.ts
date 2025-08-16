import http from "../request";
import {
  Notification,
  NotificationListRequest,
  NotificationSummary,
  UnreadCount,
  MarkReadRequest,
} from "@/types/api/notification.d";
import { PaginatedData, ResponseMessage } from "@/types/api/common";

/**
 * 获取通知列表
 * @param params
 * @returns
 */
export const getNotifications = (params: NotificationListRequest) => {
  return http.get<PaginatedData<Notification>>("/notifications", params);
};

/**
 * 获取未读通知总数
 * @returns
 */
export const getUnreadCount = () => {
  return http.get<UnreadCount>("/notifications/unread-count");
};

/**
 * 将指定ID的通知标记为已读
 * @param data
 * @returns
 */
export const markAsRead = (data: MarkReadRequest) => {
  return http.post<ResponseMessage>("/notifications/mark-as-read", data);
};

/**
 * 将所有通知标记为已读
 * @returns
 */
export const markAllAsRead = () => {
  return http.post<ResponseMessage>("/notifications/mark-all-as-read", {});
};

/**
 * 获取各类通知的摘要信息（最新一条+未读数）
 * @returns
 */
export const getSummary = () => {
  return http.get<NotificationSummary>("/notifications/summary");
};


