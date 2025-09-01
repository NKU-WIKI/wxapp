/**
 * 通知创建辅助工具
 * 用于在 BBS 相关操作中自动创建通知
 */

import { createBBSNotification } from '@/services/api/notification';

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
        await createBBSNotification.like({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle
        });
      } else {
        if (!params.isLiked) {
          
        } else if (params.postAuthorId === params.currentUserId) {
          
        }
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
        await createBBSNotification.comment({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle,
          comment_content: params.commentContent
        });
        
      }
    } catch (error) {
      
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
        await createBBSNotification.follow({
          recipient_id: params.targetUserId,
          sender_id: params.currentUserId,
          sender_nickname: params.currentUserNickname
        });
        
      }
    } catch (error) {
      
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
        await createBBSNotification.collect({
          recipient_id: params.postAuthorId,
          sender_id: params.currentUserId,
          post_id: params.postId,
          post_title: params.postTitle
        });
        
      }
    } catch (error) {
      
    }
  }
}
