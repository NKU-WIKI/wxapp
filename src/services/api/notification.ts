import { store } from '@/store';
import { incrementUnreadCount } from '@/store/slices/notificationSlice';
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
  // 过滤 null 或 undefined 的参数
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
      page_size: 1 // 只需要总数，不需要具体数据
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


  return http.post<{ code: number; message: string }>(url, {})
    .then(response => {
      return response;
    })
    .catch(error => {
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
  // console.log('🔧 [API调试] markNotificationAsRead 调用', { notificationId, payload });

  return http.post<{ code: number; message: string }>(
    "/notifications/mark-read",
    payload
  ).then(response => {
    return response;
  }).catch(error => {
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
    //   输入参数: params,
    //   recipient_id: params.recipient_id,
    //   sender_id: params.sender_id,
    //   post_id: params.post_id,
    //   post_title: params.post_title,
    //   comment_content_length: params.comment_content?.length
    // });

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

    //   完整请求�? notificationData,
    //   类型: notificationData.type,
    //   业务类型: notificationData.business_type,
    //   接收�? notificationData.recipient_id,
    //   发送�? notificationData.sender_id
    // });

    return createNotification(notificationData).then(response => {
      //   response,
      //   成功: response?.code === 0,
      //   消息: response?.message
      // });
      return response;
    }).catch(error => {
      //   error,
      //   errorMessage: error?.message,
      //   请求�? notificationData
      // });
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

/**
 * 活动通知创建�? */
export const createActivityNotification = {
  /**
   * 创建活动发布通知
   */
  published: (params: {
    activity_id: string;
    activity_title: string;
    activity_category: string;
    organizer_id: string;
    organizer_nickname: string;
    recipient_id: string;
  }) => {
    const notificationData = {
      type: NotificationType._Activity,
      business_type: 'activity_published',
      business_id: params.activity_id,
      title: '活动发布通知',
      content: `您发布的活动「${params.activity_title}」已成功发布`,
      recipient_id: params.recipient_id,
      sender_id: params.organizer_id,
      data: {
        activity_id: params.activity_id,
        activity_title: params.activity_title,
        activity_category: params.activity_category,
        organizer_id: params.organizer_id,
        organizer_nickname: params.organizer_nickname,
        action_type: 'published'
      },
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    };

    return createNotification(notificationData).then(response => {
      // 更新 Redux 未读数量
      store.dispatch(incrementUnreadCount({
        type: NotificationType._Activity,
        count: 1
      }));
      return response;
    }).catch(error => {
      throw error;
    });
  },

  /**
   * 创建活动参与通知
   */
  joined: (params: {
    activity_id: string;
    activity_title: string;
    organizer_id: string;
    participant_id: string;
    participant_nickname: string;
  }) => {
    const notificationData = {
      type: NotificationType._Activity,
      business_type: 'activity_registration',
      business_id: params.activity_id,
      title: '活动报名状态通知',
      content: `您的活动「${params.activity_title}」报名状态已更新`,
      recipient_id: params.organizer_id,
      sender_id: params.participant_id, // 使用参与者ID作为发送者
      data: {
        activity_id: params.activity_id,
        activity_title: params.activity_title,
        organizer_id: params.organizer_id,
        participant_id: params.participant_id,
        participant_nickname: params.participant_nickname,
        action_type: 'joined'
      },
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    };

    //   notificationData,
    //   recipient: params.organizer_id,
    //   participant: params.participant_id,
    //   activityTitle: params.activity_title
    // });

    return createNotification(notificationData).then(response => {
      // 更新 Redux 未读数量
      store.dispatch(incrementUnreadCount({
        type: NotificationType._Activity,
        count: 1
      }));
      return response;
    }).catch(error => {
      throw error;
    });
  },

  /**
   * 创建活动取消报名通知
   */
  cancelRegistration: (params: {
    activity_id: string;
    activity_title: string;
    organizer_id: string;
    participant_id: string;
    participant_nickname: string;
  }) => {
    const notificationData = {
      type: NotificationType._Activity,
      business_type: 'activity_cancel_registration',
      business_id: params.activity_id,
      title: '活动报名状态通知',
      content: `您的活动「${params.activity_title}」报名状态已更新`,
      recipient_id: params.organizer_id,
      sender_id: params.participant_id, // 使用参与者ID作为发送者
      data: {
        activity_id: params.activity_id,
        activity_title: params.activity_title,
        organizer_id: params.organizer_id,
        participant_id: params.participant_id,
        participant_nickname: params.participant_nickname,
        action_type: 'cancel_registration'
      },
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    };

    //   notificationData,
    //   recipient: params.organizer_id,
    //   participant: params.participant_id,
    //   activityTitle: params.activity_title
    // });

    return createNotification(notificationData).then(response => {
      // 更新 Redux 未读数量
      store.dispatch(incrementUnreadCount({
        type: NotificationType._Activity,
        count: 1
      }));
      return response;
    }).catch(error => {
      throw error;
    });
  },

  /**
   * 创建参与者报名成功通知
   */
  participantJoinSuccess: (params: {
    activity_id: string;
    activity_title: string;
    participant_id: string;
    participant_nickname: string;
  }) => {
    const notificationData = {
      type: NotificationType._Activity,
      business_type: 'participant_join_success',
      business_id: params.activity_id,
      title: '活动报名成功',
      content: `您已成功报名活动「${params.activity_title}」`,
      recipient_id: params.participant_id,
      sender_id: null, // 系统通知
      data: {
        activity_id: params.activity_id,
        activity_title: params.activity_title,
        participant_id: params.participant_id,
        participant_nickname: params.participant_nickname,
        action_type: 'participant_join_success'
      },
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    };

    //   notificationData,
    //   participant: params.participant_id,
    //   activityTitle: params.activity_title
    // });

    return createNotification(notificationData).then(response => {
      // 更新 Redux 未读数量
      store.dispatch(incrementUnreadCount({
        type: NotificationType._Activity,
        count: 1
      }));
      return response;
    }).catch(error => {
      throw error;
    });
  },

  /**
   * 创建参与者取消报名成功通知
   */
  participantCancelSuccess: (params: {
    activity_id: string;
    activity_title: string;
    participant_id: string;
    participant_nickname: string;
  }) => {
    const notificationData = {
      type: NotificationType._Activity,
      business_type: 'participant_cancel_success',
      business_id: params.activity_id,
      title: '取消报名成功',
      content: `您已成功取消报名活动「${params.activity_title}」`,
      recipient_id: params.participant_id,
      sender_id: null, // 系统通知
      data: {
        activity_id: params.activity_id,
        activity_title: params.activity_title,
        participant_id: params.participant_id,
        participant_nickname: params.participant_nickname,
        action_type: 'participant_cancel_success'
      },
      channels: [NotificationChannel._InApp],
      priority: NotificationPriority._Normal
    };

    //   notificationData,
    //   participant: params.participant_id,
    //   activityTitle: params.activity_title
    // });

    return createNotification(notificationData).then(response => {
      // 更新 Redux 未读数量
      store.dispatch(incrementUnreadCount({
        type: NotificationType._Activity,
        count: 1
      }));
      return response;
    }).catch(error => {
      throw error;
    });
  },

    /**
     * 创建活动取消通知
     */
    cancelled: (params: {
      activity_id: string;
      activity_title: string;
      organizer_id: string;
      organizer_nickname: string;
      recipient_ids: string[];
      cancel_reason?: string;
    }) => {
      // 发送通知给每个接收者
      const promises = params.recipient_ids.map(recipientId => {
        const notificationData = {
          type: NotificationType._Activity,
          business_type: 'activity_cancelled',
          business_id: params.activity_id,
          title: '活动取消通知',
          content: `活动「${params.activity_title}」已被取消${params.cancel_reason ? `，原因：${params.cancel_reason}` : ''}`,
          recipient_id: recipientId,
          sender_id: params.organizer_id,
          data: {
            activity_id: params.activity_id,
            activity_title: params.activity_title,
            organizer_id: params.organizer_id,
            organizer_nickname: params.organizer_nickname,
            cancel_reason: params.cancel_reason,
            action_type: 'cancelled'
          },
          channels: [NotificationChannel._InApp],
          priority: NotificationPriority._High
        };

        return createNotification(notificationData).then(response => {
          // 更新 Redux 未读数量
          store.dispatch(incrementUnreadCount({
            type: NotificationType._Activity,
            count: 1
          }));
          return response;
        });
      });

      return Promise.all(promises);
    },

    /**
     * 创建活动更新通知
     */
    updated: (params: {
      activity_id: string;
      activity_title: string;
      organizer_id: string;
      organizer_nickname: string;
      recipient_ids: string[];
      update_summary: string;
    }) => {
      // 发送通知给每个接收者
      const promises = params.recipient_ids.map(recipientId => {
        const notificationData = {
          type: NotificationType._Activity,
          business_type: 'activity_updated',
          business_id: params.activity_id,
          title: '活动更新通知',
          content: `活动「${params.activity_title}」信息已更新：${params.update_summary}`,
          recipient_id: recipientId,
          sender_id: params.organizer_id,
          data: {
            activity_id: params.activity_id,
            activity_title: params.activity_title,
            organizer_id: params.organizer_id,
            organizer_nickname: params.organizer_nickname,
            update_summary: params.update_summary,
            action_type: 'updated'
          },
          channels: [NotificationChannel._InApp],
          priority: NotificationPriority._Normal
        };

        return createNotification(notificationData).then(response => {
          // 更新 Redux 未读数量
          store.dispatch(incrementUnreadCount({
            type: NotificationType._Activity,
            count: 1
          }));
          return response;
        });
      });

      return Promise.all(promises);
    }
};
