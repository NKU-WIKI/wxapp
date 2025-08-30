import http from "../request";
import {
  NotificationListRequest,
  NotificationApiResponse,
  NotificationRead,
  UnreadCountResponse,
  MarkReadRequest,
  NotificationType,
  NotificationCreateRequest,
  NotificationCreateResponse,
  NotificationChannel,
  NotificationPriority
} from "@/types/api/notification.d";

/**
 * 获取通知列表
 * @param params 请求参数
 * @returns 通知列表
 */
export const getNotifications = (params: NotificationListRequest = {}) => {
  // 过滤掉 null 和 undefined 的参数
  const filteredParams = Object.entries({
    page: 1,
    page_size: 20,
    ...params
  }).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  return http.get<NotificationApiResponse>("/notifications", filteredParams);
};

/**
 * 获取未读通知数量统计
 * @returns 未读数量统计
 * @deprecated 后端API不存在，暂时禁用
 */
export const getUnreadCount = () => {
  // TODO: 后端API不存在，暂时注释
  throw new Error('后端API不存在，请使用其他方式获取未读数量');
  // return http.get<{ code: number; data: UnreadCountResponse; message: string }>(
  //   "/notifications/count/unread"
  // );
};

/**
 * 获取指定类型的未读通知数量（替代方案）
 * @param type 通知类型
 * @returns 未读数量
 */
export const getUnreadCountByType = async (type: NotificationType): Promise<number> => {
  try {
    const res = await getNotifications({
      type,
      is_read: false,
      page: 1,
      page_size: 1  // 只需要总数，不需要具体数据
    });
    
    if (res.code === 0 && res.data?.pagination) {
      return res.data.pagination.total || 0;
    }
    return 0;
  } catch (error) {
    console.warn(`获取 ${type} 类型未读数量失败:`, error);
    return 0;
  }
};

/**
 * 标记通知为已读
 * @param data 标记参数
 * @returns 操作结果
 */
export const markAsRead = (data: MarkReadRequest) => {
  return http.post<{ code: number; message: string }>(
    "/notifications/mark-read", 
    data
  );
};

/**
 * 将所有通知标记为已读
 * @param type 可选的通知类型，不传则标记所有
 * @returns 操作结果
 */
export const markAllAsRead = (type?: NotificationType) => {
  return http.post<{ code: number; message: string }>(
    "/notifications/batch/mark-read", 
    type ? { type } : {}
  );
};

/**
 * 创建通知（用于BBS点赞、收藏、关注、评论等操作）
 * @param data 创建通知的参数
 * @returns 创建结果
 */
export const createNotification = (data: NotificationCreateRequest) => {
  console.log('🚀 [API] 开始创建通知，请求数据:', data);
  
  return http.post<NotificationCreateResponse>(
    "/notifications", 
    data
  ).then(response => {
    console.log('✅ [API] 通知创建成功，响应数据:', response);
    return response;
  }).catch(error => {
    console.error('❌ [API] 通知创建失败:', error);
    throw error;
  });
};

/**
 * BBS 相关通知创建辅助函数
 */
export const createBBSNotification = {
  /**
   * 创建点赞通知
   */
  like: (params: {
    recipient_id: string;
    sender_id: string;
    post_id: string;
    post_title: string;
  }) => {
    console.log('👍 [BBS-Like] 创建点赞通知:', params);
    
    const notificationData = {
      type: NotificationType.Message,
      business_type: 'like',
      business_id: params.post_id,
      title: '点赞通知',
      content: `您的帖子「${params.post_title}」收到了一个赞`,
      recipient_id: params.recipient_id,
      sender_id: params.sender_id,
      data: {
        post_id: params.post_id,
        post_title: params.post_title,
        action_type: 'like'
      },
      channels: [NotificationChannel.InApp],
      priority: NotificationPriority.Low
    };
    
    console.log('📦 [BBS-Like] 准备发送的通知数据:', notificationData);
    
    return createNotification(notificationData);
  },

  /**
   * 创建评论通知
   */
  comment: (params: {
    recipient_id: string;
    sender_id: string;
    post_id: string;
    post_title: string;
    comment_content: string;
  }) => {
    return createNotification({
      type: NotificationType.Message,
      business_type: 'comment',
      business_id: params.post_id,
      title: '评论通知',
      content: `您的帖子「${params.post_title}」收到了新评论`,
      recipient_id: params.recipient_id,
      sender_id: params.sender_id,
      data: {
        post_id: params.post_id,
        post_title: params.post_title,
        comment_content: params.comment_content,
        action_type: 'comment'
      },
      channels: [NotificationChannel.InApp],
      priority: NotificationPriority.Normal
    });
  },

  /**
   * 创建关注通知
   */
  follow: (params: {
    recipient_id: string;
    sender_id: string;
    sender_nickname: string;
  }) => {
    return createNotification({
      type: NotificationType.Message,
      business_type: 'follow',
      business_id: params.sender_id,
      title: '关注通知',
      content: `${params.sender_nickname} 关注了您`,
      recipient_id: params.recipient_id,
      sender_id: params.sender_id,
      data: {
        follower_id: params.sender_id,
        follower_nickname: params.sender_nickname,
        action_type: 'follow'
      },
      channels: [NotificationChannel.InApp],
      priority: NotificationPriority.Normal
    });
  },

  /**
   * 创建收藏通知
   */
  collect: (params: {
    recipient_id: string;
    sender_id: string;
    post_id: string;
    post_title: string;
  }) => {
    return createNotification({
      type: NotificationType.Message,
      business_type: 'collect',
      business_id: params.post_id,
      title: '收藏通知',
      content: `您的帖子「${params.post_title}」被收藏了`,
      recipient_id: params.recipient_id,
      sender_id: params.sender_id,
      data: {
        post_id: params.post_id,
        post_title: params.post_title,
        action_type: 'collect'
      },
      channels: [NotificationChannel.InApp],
      priority: NotificationPriority.Low
    });
  },

  /**
   * 创建提及通知
   */
  mention: (params: {
    recipient_id: string;
    sender_id: string;
    post_id: string;
    post_title: string;
    sender_nickname: string;
  }) => {
    return createNotification({
      type: NotificationType.Mention,
      business_type: 'mention',
      business_id: params.post_id,
      title: '提及通知',
      content: `${params.sender_nickname} 在帖子「${params.post_title}」中提及了您`,
      recipient_id: params.recipient_id,
      sender_id: params.sender_id,
      data: {
        post_id: params.post_id,
        post_title: params.post_title,
        sender_nickname: params.sender_nickname,
        action_type: 'mention'
      },
      channels: [NotificationChannel.InApp],
      priority: NotificationPriority.Normal
    });
  }
};


