import React, { useState, useEffect } from 'react';
import { View, Input, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

// Absolute imports (alphabetical order)
import { AppDispatch, RootState } from '@/store';
import { createComment } from '@/store/slices/commentSlice';
import CloseIcon from '@/assets/x.svg';
import SendIcon from '@/assets/sendcomment.svg';
import { useDispatch, useSelector } from 'react-redux';

// Relative imports
import styles from '../index.module.scss';

interface BottomInputProps {
  postId: string;
  postTitle?: string;
  postAuthorId?: string;
  replyTo?: {
    commentId: string;
    nickname: string;
    replyToNickname?: string;
  } | null;
  onCancelReply?: () => void;
  allowComments?: boolean;
}

const BottomInput: React.FC<BottomInputProps> = ({ postId, postTitle, postAuthorId, replyTo, onCancelReply, allowComments = true }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userState = useSelector((state: RootState) => state.user);
  const token = userState?.token || null;
  const isLoggedIn = userState?.isLoggedIn || false;
  const dispatch = useDispatch<AppDispatch>();
  
  // 当回复目标改变时，自动聚焦输入框
  useEffect(() => {
    if (replyTo) {
      // 小程序中需要延迟聚焦
      setTimeout(() => {
        // 可以通过设置placeholder来提示回复对象
      }, 100);
    }
  }, [replyTo]);
  
  const handleSendComment = async () => {
    if (!comment.trim() || isSubmitting) {
      return;
    }

    // 检查是否允许评论
    if (!allowComments) {
      Taro.showToast({
        title: '作者已关闭评论',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 检查是否登录
    if (!token || !isLoggedIn) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 构建评论参数
      let finalContent = comment.trim();
      
      // 如果是回复评论，在内容前添加 @ 用户名格式
      if (replyTo && replyTo.nickname) {
        finalContent = `@${replyTo.nickname} ${finalContent}`;
      }
      
      const commentParams = {
        resource_id: postId, // 保持原始postId（string UUID）
        resource_type: 'post' as const,
        content: finalContent,
        // 新增两个字段用于通知创建
        post_title: postTitle,
        post_author_id: postAuthorId,
        ...(replyTo ? { 
          parent_id: replyTo.commentId,
          parent_author_nickname: replyTo.nickname
        } : {})
      };
      
      // 发送评论 - createComment 内部会自动刷新评论列表
      await dispatch(createComment(commentParams)).unwrap();
      
      // 发送成功，清空输入框和回复状态
      setComment('');
      if (onCancelReply) {
        onCancelReply();
      }
      
      Taro.showToast({
        title: replyTo ? '回复发布成功' : '评论发布成功',
        icon: 'success'
      });
    } catch (error) {
      Taro.showToast({
        title: replyTo ? '回复发布失败，请重试' : '评论发布失败，请重试',
        icon: 'error'
      });
      console.error('发布评论失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReply = () => {
    if (onCancelReply) {
      onCancelReply();
    }
  };

  const placeholder = !allowComments
    ? '作者已关闭评论'
    : replyTo
      ? `回复 @${replyTo.nickname}...`
      : '说点什么...';

  return (
    <View className={styles.bottomInputWrapper}>
      {/* 回复提示条 */}
      {replyTo && (
        <View className={styles.replyIndicator}>
          <Text className={styles.replyText}>回复 @{replyTo.nickname}</Text>
          <Image 
            src={CloseIcon} 
            className={styles.cancelReplyIcon}
            onClick={handleCancelReply}
          />
        </View>
      )}
      
      {/* 输入区域 */}
      <View className={styles.bottomInput}>
        <Input
          className={styles.input}
          placeholder={placeholder}
          value={comment}
          onInput={(e) => setComment(e.detail.value)}
          disabled={isSubmitting || !allowComments}
          focus={!!replyTo}
        />
        <View
          className={`${styles.sendButton} ${(isSubmitting || !allowComments) ? styles.disabled : ''}`}
          onClick={handleSendComment}
        >
          <Image 
            src={SendIcon} 
            className={styles.sendIcon}
          />
        </View>
      </View>
    </View>
  );
};

export default BottomInput;