/**
 * 通知创建辅助工具
 */

import { createBBSNotification, createActivityNotification } from '@/services/api/notification';
import { ActivityRead } from '@/types/api/activity.d';

/**
 * BBS 操作通知创建 */
export class BBSNotificationHelper {
  /**
   * 处理点赞操作的通知
   */
  static async handleLikeNotification(params: {
    postId: string;
    postTitle: string;
    postAuthorId: string;
    currentUserId: string;
    isLiked: boolean; // true: 点赞, false: 取消点赞
  }) {
    try {
      // 检查必要参数
      if (!params.currentUserId || params.currentUserId.trim() === '') {
        return;
      }

      if (!params.postAuthorId || params.postAuthorId.trim() === '') {
        return;
      }

      // 只在点赞时创建通知，取消点赞不创建
      if (params.isLiked && params.postAuthorId !== params.currentUserId) {
        const result = await createBBSNotification.like({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle,
        });

        return result;
      }
    } catch {
      // 不影响主要的点赞操作
    }
  }

  /**
   * 处理评论操作的通知
   */
  static async handleCommentNotification(params: {
    postId: string;
    postTitle: string;
    postAuthorId: string;
    currentUserId: string;
    commentContent: string;
  }) {
    try {
      // 检查必要参数
      if (!params.currentUserId || params.currentUserId.trim() === '') {
        return;
      }

      if (!params.postAuthorId || params.postAuthorId.trim() === '') {
        return;
      }

      // 不给自己发通知
      if (params.postAuthorId !== params.currentUserId) {
        const result = await createBBSNotification.comment({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle,
          comment_content: params.commentContent,
        });

        return result;
      }
    } catch {
      // 不影响主要的评论操作
    }
  }

  /**
   * 处理关注操作的通知
   */
  static async handleFollowNotification(params: {
    targetUserId: string;
    currentUserId: string;
    currentUserNickname: string;
    isFollowing: boolean; // true: 关注, false: 取消关注
  }) {
    try {
      // 检查必要参数
      if (!params.currentUserId || params.currentUserId.trim() === '') {
        return;
      }

      if (!params.targetUserId || params.targetUserId.trim() === '') {
        return;
      }

      // 只在关注时创建通知，取消关注不创建
      if (params.isFollowing && params.targetUserId !== params.currentUserId) {
        const result = await createBBSNotification.follow({
          recipient_id: params.targetUserId,
          sender_id: params.currentUserId,
          sender_nickname: params.currentUserNickname,
        });

        return result;
      }
    } catch {
      // 不影响主要的关注操作
    }
  }

  /**
   * 处理收藏操作的通知
   */
  static async handleCollectNotification(params: {
    postId: string;
    postTitle: string;
    postAuthorId: string;
    currentUserId: string;
    isCollected: boolean; // true: 收藏, false: 取消收藏
  }) {
    try {
      // 检查必要参数
      if (!params.currentUserId || params.currentUserId.trim() === '') {
        return;
      }

      if (!params.postAuthorId || params.postAuthorId.trim() === '') {
        return;
      }

      // 只在收藏时创建通知，取消收藏不创建
      if (params.isCollected && params.postAuthorId !== params.currentUserId) {
        const result = await createBBSNotification.collect({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle,
        });

        return result;
      }
    } catch {
      // console error removed to satisfy no-console; non-blocking failure
    }
  }
}

/**
 * 活动操作通知创建
 */
/**
 * 调试工具函数
 */
export const debugNotification = {
  /**
   * 检查当前环境
   */
  checkEnv: () => {
    // console.log('Debug Notification Env:', {
    //   NODE_ENV: process.env.NODE_ENV,
    //   TARO_ENV: process.env.TARO_ENV,
    //   isDev: process.env.NODE_ENV !== 'production',
    //   isProd: process.env.NODE_ENV === 'production'
    // });
  },

  /**
   * 强制发送报名通知（测试用）
   */
  forceSendJoinNotification: async (
    activityId: string,
    activityTitle: string,
    organizerId: string,
    participantId: string,
    participantNickname: string,
  ) => {
    const { createActivityNotification: activityNotificationAPI } = await import(
      '@/services/api/notification'
    );

    const result = await activityNotificationAPI.joined({
      activity_id: activityId,
      activity_title: activityTitle,
      organizer_id: organizerId,
      participant_id: participantId,
      participant_nickname: participantNickname,
    });
    return result;
  },

  /**
   * 测试活动报名通知（绕过所有检查）
   */
  testJoinNotificationDirect: async (
    activityId: string,
    activityTitle: string,
    organizerId: string,
  ) => {
    const { store } = await import('@/store');
    const { createActivityNotification: activityNotificationAPI } = await import(
      '@/services/api/notification'
    );
    const { incrementUnreadCount } = await import('@/store/slices/notificationSlice');
    const { NotificationType } = await import('@/types/api/notification.d');

    const state = store.getState();
    const currentUser = state.user.user;

    if (!currentUser?.id) {
      return;
    }

    const result = await activityNotificationAPI.joined({
      activity_id: activityId,
      activity_title: activityTitle,
      organizer_id: organizerId,
      participant_id: currentUser.id,
      participant_nickname: currentUser.nickname || '测试用户',
    });

    // 更新未读数量
    store.dispatch(incrementUnreadCount({ type: NotificationType._Activity, count: 1 }));

    return result;
  },

  /**
   * 测试通知创建
   */
  testNotification: async (type: 'join' | 'cancel' | 'publish') => {
    const { createActivityNotification: activityNotificationAPI } = await import(
      '@/services/api/notification'
    );

    const testData = {
      activity_id: 'test-' + Date.now(),
      activity_title: '测试活动 ' + new Date().toLocaleTimeString(),
      organizer_id: 'test-organizer',
      participant_id: 'test-participant',
      participant_nickname: '测试用户',
    };

    let result;
    switch (type) {
      case 'join':
        result = await activityNotificationAPI.joined(testData);
        break;
      case 'cancel':
        result = await activityNotificationAPI.cancelRegistration(testData);
        break;
      case 'publish':
        result = await activityNotificationAPI.published({
          ...testData,
          activity_category: '测试分类',
          organizer_nickname: '测试组织者',
          recipient_id: testData.organizer_id,
        });
        break;
    }
    return result;
  },
};

// 挂载到全局对象，方便控制台调试
if (typeof window !== 'undefined') {
  window.debugNotification = debugNotification;
}

export class ActivityNotificationHelper {
  /**
   * 处理活动发布通知
   */
  static async handleActivityPublishedNotification(params: {
    activity: ActivityRead;
    organizerId: string;
    organizerNickname: string;
  }) {
    try {
      // 检查必要参数
      if (!params.activity?.id || !params.organizerId || !params.organizerNickname) {
        return;
      }

      // 获取需要通知的用户列表（这里可以根据业务逻辑获取关注者、感兴趣用户等）
      const recipientIds = await ActivityNotificationHelper.getActivityPublishRecipients(
        params.activity,
        params.organizerId,
      );

      if (recipientIds.length === 0) {
        return;
      }

      // 发送通知给每个接收者
      for (const recipientId of recipientIds) {
        await createActivityNotification.published({
          activity_id: params.activity.id,
          activity_title: params.activity.title,
          activity_category: params.activity.category,
          organizer_id: params.organizerId,
          organizer_nickname: params.organizerNickname,
          recipient_id: recipientId,
        });
      }
    } catch {
      // 不影响主要的活动发布操作
    }
  }

  /**
   * 处理活动取消通知
   */
  static async handleActivityCancelledNotification(params: {
    activity: ActivityRead;
    organizerId: string;
    organizerNickname: string;
    cancelReason?: string;
  }) {
    try {
      // 检查必要参数
      if (!params.activity?.id || !params.organizerId || !params.organizerNickname) {
        return;
      }

      // 获取需要通知的用户列表（已报名的用户）
      const recipientIds = await ActivityNotificationHelper.getActivityParticipants(
        params.activity.id,
      );

      if (recipientIds.length === 0) {
        return;
      }

      // 发送活动取消通知
      await createActivityNotification.cancelled({
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        organizer_id: params.organizerId,
        organizer_nickname: params.organizerNickname,
        recipient_ids: recipientIds,
        cancel_reason: params.cancelReason,
      });
    } catch {
      // console removed; non-blocking
      // 不影响主要的活动取消操作
    }
  }

  /**
   * 处理活动更新通知
   */
  static async handleActivityUpdatedNotification(params: {
    activity: ActivityRead;
    organizerId: string;
    organizerNickname: string;
    updateSummary: string;
  }) {
    try {
      // 检查必要参数
      if (
        !params.activity?.id ||
        !params.organizerId ||
        !params.organizerNickname ||
        !params.updateSummary
      ) {
        return;
      }

      // 获取需要通知的用户列表（已报名的用户）
      const recipientIds = await ActivityNotificationHelper.getActivityParticipants(
        params.activity.id,
      );

      if (recipientIds.length === 0) {
        return;
      }

      // 发送活动更新通知
      await createActivityNotification.updated({
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        organizer_id: params.organizerId,
        organizer_nickname: params.organizerNickname,
        recipient_ids: recipientIds,
        update_summary: params.updateSummary,
      });
    } catch {
      // 不影响主要的活动更新操作
    }
  }

  /**
   * 处理活动参与通知（通知组织者有人报名）
   */
  static async handleActivityJoinedNotification(params: {
    activity: ActivityRead;
    participantId: string;
    participantNickname: string;
  }) {
    try {
      // 检查必要参数
      const organizerId = params.activity?.organizer?.id;
      if (
        !params.activity?.id ||
        !params.participantId ||
        !params.participantNickname ||
        !organizerId
      ) {
        return;
      }

      // 不给自己发通知（测试环境允许）
      if (params.participantId === organizerId) {
        // 在测试环境中允许自己给自己发通知，方便调试
        if (process.env.NODE_ENV === 'production') {
          return;
        }
      }

      const result = await createActivityNotification.joined({
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        organizer_id: organizerId,
        participant_id: params.participantId,
        participant_nickname: params.participantNickname,
      });

      return result;
    } catch {
      // 不影响主要的活动参与操作
    }
  }

  /**
   * 处理活动取消报名通知（通知组织者有人取消报名）
   */
  static async handleActivityCancelRegistrationNotification(params: {
    activity: ActivityRead;
    participantId: string;
    participantNickname: string;
  }) {
    try {
      // 检查必要参数
      const organizerId = params.activity?.organizer?.id;
      if (
        !params.activity?.id ||
        !params.participantId ||
        !params.participantNickname ||
        !organizerId
      ) {
        return;
      }

      // 不给自己发通知（测试环境允许）
      if (params.participantId === organizerId) {
        // 在测试环境中允许自己给自己发通知，方便调试
        if (process.env.NODE_ENV === 'production') {
          return;
        }
      }

      const result = await createActivityNotification.cancelRegistration({
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        organizer_id: organizerId,
        participant_id: params.participantId,
        participant_nickname: params.participantNickname,
      });

      return result;
    } catch {
      // 不影响主要的活动取消报名操作
    }
  }

  /**
   * 处理参与者报名成功通知
   */
  static async handleParticipantJoinSuccessNotification(params: {
    activity: ActivityRead;
    participantId: string;
    participantNickname: string;
  }) {
    try {
      await createActivityNotification.participantJoinSuccess({
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        participant_id: params.participantId,
        participant_nickname: params.participantNickname,
      });
    } catch {
      // 不影响主要的报名操作
    }
  }

  /**
   * 处理参与者取消报名成功通知
   */
  static async handleParticipantCancelSuccessNotification(params: {
    activity: ActivityRead;
    participantId: string;
    participantNickname: string;
  }) {
    try {
      await createActivityNotification.participantCancelSuccess({
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        participant_id: params.participantId,
        participant_nickname: params.participantNickname,
      });
    } catch {
      // 不影响主要的取消报名操作
    }
  }

  /**
   * 获取活动发布时需要通知的用户列表
   * 活动发布通知通常只发送给组织者自己，确认发布成功
   */
  private static async getActivityPublishRecipients(
    _activity: ActivityRead,
    organizerId: string,
  ): Promise<string[]> {
    try {
      // 活动发布通知只发送给组织者自己，确认发布成功
      return [organizerId];
    } catch {
      return [];
    }
  }

  /**
   * 获取活动参与者列表
   */
  private static async getActivityParticipants(_activityId: string): Promise<string[]> {
    try {
      // TODO: 这里应该调用后端API获取活动的参与者列表
      // 例如: GET /api/v1/activities/{activityId}/participants

      // 目前先返回空数组，后续需要实现获取参与者的API
      return [];
    } catch {
      return [];
    }
  }
}
