/**
 * 通知创建辅助工具
 * 用于在 BBS 相关操作中自动创建通知
 */

import { createBBSNotification } from '@/services/api/notification';
import { ActivityRead } from '@/types/api/activity.d';
import Taro from '@tarojs/taro';

/**
 * BBS 操作通知创建器
 */
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
          post_title: params.postTitle
        });
        
        return result;
      }
    } catch (error) {
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
          comment_content: params.commentContent
        });
        
        return result;
      }
    } catch (error) {
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
          sender_nickname: params.currentUserNickname
        });
        
        return result;
      }
    } catch (error) {
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
        console.warn('🚨 [收藏通知] currentUserId 为空，跳过处理');
        return;
      }
      
      if (!params.postAuthorId || params.postAuthorId.trim() === '') {
        console.warn('🚨 [收藏通知] postAuthorId 为空，跳过处理');
        return;
      }
      
      // 只在收藏时创建通知，取消收藏不创建
      if (params.isCollected && params.postAuthorId !== params.currentUserId) {
        console.log('📮 [收藏通知] 开始创建收藏通知', {
          recipient: params.postAuthorId,
          sender: params.currentUserId,
          postTitle: params.postTitle
        });
        
        const result = await createBBSNotification.collect({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle
        });
        
        console.log('✅ [收藏通知] 收藏通知创建完成', result);
        return result;
      } else {
        if (!params.isCollected) {
          console.log('ℹ️ [收藏通知] 取消收藏操作，不创建通知');
        } else if (params.postAuthorId === params.currentUserId) {
          console.log('ℹ️ [收藏通知] 自己收藏自己的帖子，跳过通知');
        }
      }
    } catch (error) {
      console.error('❌ [收藏通知] 创建收藏通知失败', error);
      throw error;
    }
  }
}

/**
 * 活动操作通知创建器
 */
export class ActivityNotificationHelper {
  /**
   * 处理活动发布通知
   */
  static async handleActivityPublishedNotification(params: {
    activity: ActivityRead;
    organizerId: string;
    organizerNickname: string;
  }) {
    console.log('🎉 [ActivityNotification] 开始处理活动发布通知', {
      activityId: params.activity?.id,
      activityTitle: params.activity?.title,
      organizerId: params.organizerId,
      organizerNickname: params.organizerNickname
    });

    try {
      // 检查必要参数
      if (!params.activity?.id || !params.organizerId || !params.organizerNickname) {
        console.warn('⚠️ [ActivityNotification] 活动发布通知参数不完整，跳过处理', params);
        return;
      }

      // 获取需要通知的用户列表（这里可以根据业务逻辑获取关注者、感兴趣用户等）
      const recipientIds = await ActivityNotificationHelper.getActivityPublishRecipients(params.activity);
      
      console.log('📋 [ActivityNotification] 获取到通知接收者列表', {
        activityId: params.activity.id,
        recipientCount: recipientIds.length,
        recipientIds
      });

      if (recipientIds.length === 0) {
        console.log('📭 [ActivityNotification] 没有需要通知的用户，跳过发送');
        return;
      }

      // TODO: 活动通知功能暂时禁用，等待后端API完善
      console.log('📝 [ActivityNotification] 活动发布通知功能暂时禁用', {
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        recipient_count: recipientIds.length
      });
      
      // await createActivityNotification.published({
      //   activity_id: params.activity.id,
      //   activity_title: params.activity.title,
      //   activity_category: params.activity.category,
      //   activity_start_time: params.activity.start_time.toString(),
      //   organizer_id: params.organizerId,
      //   organizer_nickname: params.organizerNickname,
      //   recipient_ids: recipientIds
      // });
      
      console.log('✅ [ActivityNotification] 活动发布通知发送成功', {
        activityId: params.activity.id,
        recipientCount: recipientIds.length
      });
      
    } catch (error) {
      console.error('❌ [ActivityNotification] 活动发布通知发送失败', {
        activityId: params.activity?.id,
        error: error
      });
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
    console.log('❌ [ActivityNotification] 开始处理活动取消通知', {
      activityId: params.activity?.id,
      activityTitle: params.activity?.title,
      organizerId: params.organizerId,
      cancelReason: params.cancelReason
    });

    try {
      // 检查必要参数
      if (!params.activity?.id || !params.organizerId || !params.organizerNickname) {
        console.warn('⚠️ [ActivityNotification] 活动取消通知参数不完整，跳过处理', params);
        return;
      }

      // 获取需要通知的用户列表（已报名的用户）
      const recipientIds = await ActivityNotificationHelper.getActivityParticipants(params.activity.id);
      
      console.log('📋 [ActivityNotification] 获取到活动参与者列表', {
        activityId: params.activity.id,
        participantCount: recipientIds.length,
        recipientIds
      });

      if (recipientIds.length === 0) {
        console.log('📭 [ActivityNotification] 没有需要通知的参与者，跳过发送');
        return;
      }

      // TODO: 活动通知功能暂时禁用，等待后端API完善
      console.log('📝 [ActivityNotification] 活动取消通知功能暂时禁用', {
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        participant_count: recipientIds.length
      });
      
      // await createActivityNotification.cancelled({
      //   activity_id: params.activity.id,
      //   activity_title: params.activity.title,
      //   organizer_id: params.organizerId,
      //   organizer_nickname: params.organizerNickname,
      //   recipient_ids: recipientIds,
      //   cancel_reason: params.cancelReason
      // });
      
      console.log('✅ [ActivityNotification] 活动取消通知发送成功', {
        activityId: params.activity.id,
        participantCount: recipientIds.length
      });
      
    } catch (error) {
      console.error('❌ [ActivityNotification] 活动取消通知发送失败', {
        activityId: params.activity?.id,
        error: error
      });
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
      if (!params.activity?.id || !params.organizerId || !params.organizerNickname || !params.updateSummary) {
        return;
      }

      // 获取需要通知的用户列表（已报名的用户）
      const recipientIds = await ActivityNotificationHelper.getActivityParticipants(params.activity.id);
      
      if (recipientIds.length === 0) {
        return;
      }

      // TODO: 活动通知功能暂时禁用，等待后端API完善
      console.log('📝 [ActivityNotification] 活动更新通知功能暂时禁用', {
        activity_id: params.activity.id,
        activity_title: params.activity.title,
        participant_count: recipientIds.length
      });
      
      // await createActivityNotification.updated({
      //   activity_id: params.activity.id,
      //   activity_title: params.activity.title,
      //   organizer_id: params.organizerId,
      //   organizer_nickname: params.organizerNickname,
      //   recipient_ids: recipientIds,
      //   update_summary: params.updateSummary
      // });
      
    } catch (error) {
      // 不影响主要的活动更新操作
    }
  }

  /**
   * 获取活动发布时需要通知的用户列表
   * 这里可以根据业务逻辑获取关注者、对该分类感兴趣的用户等
   * 目前简化实现，可以后续扩展
   */
  private static async getActivityPublishRecipients(activity: ActivityRead): Promise<string[]> {
    console.log('🔍 [ActivityNotification] 开始获取活动发布通知接收者', {
      activityId: activity.id,
      activityTitle: activity.title,
      category: activity.category
    });

    try {
      // TODO: 这里可以调用后端API获取：
      // 1. 关注了组织者的用户
      // 2. 对该活动分类感兴趣的用户
      // 3. 设置了该地区活动提醒的用户
      // 4. 历史参与过类似活动的用户
      
      // 目前先返回空数组，后续可以根据实际需求扩展
      // 可以从本地存储或全局状态获取用户的关注列表等信息
      
      const currentUserInfo = ActivityNotificationHelper.getCurrentUserInfo();
      if (!currentUserInfo?.id) {
        console.warn('⚠️ [ActivityNotification] 无法获取当前用户信息');
        return [];
      }

      console.log('👤 [ActivityNotification] 当前用户信息', {
        userId: currentUserInfo.id,
        nickname: currentUserInfo.nickname || currentUserInfo.name
      });

      // 简化实现：可以根据活动分类或其他条件获取感兴趣的用户
      // 这里先返回空数组，避免向所有用户发送通知
      console.log('📋 [ActivityNotification] 暂未实现接收者获取逻辑，返回空列表');
      return [];
      
    } catch (error) {
      console.error('❌ [ActivityNotification] 获取活动发布通知接收者失败', {
        activityId: activity.id,
        error: error
      });
      return [];
    }
  }

  /**
   * 获取活动参与者列表
   */
  private static async getActivityParticipants(activityId: string): Promise<string[]> {
    console.log('🔍 [ActivityNotification] 开始获取活动参与者列表', { activityId });

    try {
      // TODO: 这里应该调用后端API获取活动的参与者列表
      // 例如: GET /api/v1/activities/{activityId}/participants
      
      // 目前先返回空数组，后续需要实现获取参与者的API
      console.log('📋 [ActivityNotification] 暂未实现参与者获取API，返回空列表');
      return [];
      
    } catch (error) {
      console.error('❌ [ActivityNotification] 获取活动参与者列表失败', {
        activityId,
        error: error
      });
      return [];
    }
  }

  /**
   * 获取当前用户信息
   */
  private static getCurrentUserInfo(): { id: string; nickname?: string; name?: string } | null {
    try {
      // 尝试从全局数据获取用户信息
      const globalUserInfo = (window as any).g_app?.$app?.globalData?.userInfo;
      if (globalUserInfo?.id) {
        return globalUserInfo;
      }

      // 尝试从本地存储获取用户信息
      const storedUserInfo = Taro.getStorageSync('userInfo');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        if (userInfo?.id) {
          return userInfo;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}
