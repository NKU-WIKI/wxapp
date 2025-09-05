import {
  NotificationListRequest,
  NotificationApiResponse,
  MarkReadRequest,
  NotificationType,
  NotificationCreateRequest,
  NotificationCreateResponse,
  NotificationChannel,
  NotificationPriority
} from "@/types/api/notification.d";
import http from "../request";

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
  const url = type 
    ? `/notifications/mark-all-read?notification_type=${type}`
    : "/notifications/mark-all-read";
  
  console.log('🔧 [API调试] markAllAsRead 调用', { url, type });
  
  return http.post<{ code: number; message: string }>(url, {})
    .then(response => {
      console.log('🔧 [API调试] markAllAsRead 响应', response);
      return response;
    })
    .catch(error => {
      console.error('🔧 [API调试] markAllAsRead 错误', error);
      throw error;
    });
};

/**
 * 标记单个通知为已读
 * @param notificationId 通知ID
 * @returns 操作结果
 */
export const markNotificationAsRead = (notificationId: string) => {
  const payload = [notificationId];  // 直接发送数组，不包装在对象中
  console.log('🔧 [API调试] markNotificationAsRead 调用', { notificationId, payload });
  
  return http.post<{ code: number; message: string }>(
    "/notifications/mark-read",
    payload
  ).then(response => {
    console.log('🔧 [API调试] markNotificationAsRead 响应', response);
    return response;
  }).catch(error => {
    console.error('🔧 [API调试] markNotificationAsRead 错误', error);
    throw error;
  });
};

/**
 * 创建通知（用于BBS点赞、收藏、关注、评论等操作）
 * @param data 创建通知的参数
 * @returns 创建结果
 */
export const createNotification = (data: NotificationCreateRequest) => {
  
  
  return http.post<NotificationCreateResponse>(
    "/notifications", 
    data
  ).then(response => {
    
    return response;
  }).catch(error => {
    
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
    const notificationData = {
      type: NotificationType._Message,
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
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Low
    };
    
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
    console.log('💬 [API调试] createBBSNotification.comment 被调用', {
      输入参数: params,
      recipient_id: params.recipient_id,
      sender_id: params.sender_id,
      post_id: params.post_id,
      post_title: params.post_title,
      comment_content_length: params.comment_content?.length
    });

    const notificationData = {
      type: NotificationType._Message,
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
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    };

    console.log('💬 [API调试] 评论通知请求体', {
      完整请求体: notificationData,
      类型: notificationData.type,
      业务类型: notificationData.business_type,
      接收者: notificationData.recipient_id,
      发送者: notificationData.sender_id
    });

    return createNotification(notificationData).then(response => {
      console.log('✅ [API调试] 评论通知API响应', {
        response,
        成功: response?.code === 0,
        消息: response?.message
      });
      return response;
    }).catch(error => {
      console.error('❌ [API调试] 评论通知API错误', {
        error,
        errorMessage: error?.message,
        请求体: notificationData
      });
      throw error;
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
    const notificationData = {
      type: NotificationType._Message,
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
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    };

    return createNotification(notificationData);
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
    const notificationData = {
      type: NotificationType._Message,
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
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Low
    };

    return createNotification(notificationData);
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
      type: NotificationType._Mention,
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
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    });
  }
};


