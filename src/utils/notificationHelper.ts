/**
 * 通知创建辅助工具
 * 用于在 BBS 相关操作中自动创建通知
 */

import { createBBSNotification } from '@/services/api/notification';
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
    console.log('🎯 [NotificationHelper] 开始处理点赞通知:', params);
    
    try {
      // 检查必要参数
      if (!params.currentUserId || params.currentUserId.trim() === '') {
        console.warn('⚠️ [NotificationHelper] 用户ID为空，跳过通知创建');
        return;
      }
      
      if (!params.postAuthorId || params.postAuthorId.trim() === '') {
        console.warn('⚠️ [NotificationHelper] 帖子作者ID为空，跳过通知创建');
        return;
      }
      
      // 只在点赞时创建通知，取消点赞不创建
      if (params.isLiked && params.postAuthorId !== params.currentUserId) {
        console.log('✅ [NotificationHelper] 符合创建通知条件，开始创建点赞通知');
        console.log('📤 [NotificationHelper] 发送通知参数:', {
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle
        });
        
        const result = await createBBSNotification.like({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle
        });
        
        console.log('🎉 [NotificationHelper] 点赞通知创建成功:', result);
      } else {
        if (!params.isLiked) {
          console.log('⏭️ [NotificationHelper] 取消点赞，跳过通知创建');
        } else if (params.postAuthorId === params.currentUserId) {
          console.log('⏭️ [NotificationHelper] 给自己点赞，跳过通知创建');
        }
      }
    } catch (error) {
      console.error('❌ [NotificationHelper] 创建点赞通知失败:', error);
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
        console.warn('⚠️ [NotificationHelper] 用户ID为空，跳过评论通知创建');
        return;
      }
      
      if (!params.postAuthorId || params.postAuthorId.trim() === '') {
        console.warn('⚠️ [NotificationHelper] 帖子作者ID为空，跳过评论通知创建');
        return;
      }
      
      // 不给自己发通知
      if (params.postAuthorId !== params.currentUserId) {
        await createBBSNotification.comment({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle,
          comment_content: params.commentContent
        });
        console.log('评论通知创建成功');
      }
    } catch (error) {
      console.warn('创建评论通知失败:', error);
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
        console.warn('⚠️ [NotificationHelper] 用户ID为空，跳过关注通知创建');
        return;
      }
      
      if (!params.targetUserId || params.targetUserId.trim() === '') {
        console.warn('⚠️ [NotificationHelper] 目标用户ID为空，跳过关注通知创建');
        return;
      }
      
      // 只在关注时创建通知，取消关注不创建
      if (params.isFollowing && params.targetUserId !== params.currentUserId) {
        await createBBSNotification.follow({
          recipient_id: params.targetUserId,
          sender_id: params.currentUserId,
          sender_nickname: params.currentUserNickname
        });
        console.log('关注通知创建成功');
      }
    } catch (error) {
      console.warn('创建关注通知失败:', error);
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
        console.warn('⚠️ [NotificationHelper] 用户ID为空，跳过收藏通知创建');
        return;
      }
      
      if (!params.postAuthorId || params.postAuthorId.trim() === '') {
        console.warn('⚠️ [NotificationHelper] 帖子作者ID为空，跳过收藏通知创建');
        return;
      }
      
      // 只在收藏时创建通知，取消收藏不创建
      if (params.isCollected && params.postAuthorId !== params.currentUserId) {
        await createBBSNotification.collect({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle
        });
        console.log('收藏通知创建成功');
      }
    } catch (error) {
      console.warn('创建收藏通知失败:', error);
    }
  }
}