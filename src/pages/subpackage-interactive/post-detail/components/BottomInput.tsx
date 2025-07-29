import React, { useState, useEffect } from 'react';
import { View, Input, Image, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from '../index.module.scss';
import SendIcon from '@/assets/sendcomment.svg';
import CloseIcon from '@/assets/x.svg';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createComment } from '@/store/slices/commentSlice';

interface BottomInputProps {
  postId: number;
  replyTo?: {
    commentId: number;
    nickname: string;
  } | null;
  onCancelReply?: () => void;
}

const BottomInput: React.FC<BottomInputProps> = ({ postId, replyTo, onCancelReply }) => {
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
      const commentParams = {
        resource_id: postId,
        resource_type: 'post' as const,
        content: comment.trim(),
        ...(replyTo ? { parent_id: replyTo.commentId } : {})
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

  const placeholder = replyTo 
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
          disabled={isSubmitting}
          focus={!!replyTo}
        />
        <View 
          className={`${styles.sendButton} ${isSubmitting ? styles.disabled : ''}`}
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