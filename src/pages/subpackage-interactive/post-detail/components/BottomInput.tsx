import React, { useState } from 'react';
import { View, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from '../index.module.scss';
import SendIcon from '@/assets/sendcomment.svg';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createComment } from '@/store/slices/commentSlice';

interface BottomInputProps {
  postId: number;
}

const BottomInput: React.FC<BottomInputProps> = ({ postId }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, isLoggedIn } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  
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
      
      // 发送评论 - createComment 内部会自动刷新评论列表
      await dispatch(createComment({
        resource_id: postId,
        resource_type: 'post',
        content: comment.trim()
      })).unwrap();
      
      // 发送成功，清空输入框
      setComment('');
      
      Taro.showToast({
        title: '评论发布成功',
        icon: 'success'
      });
    } catch (error) {
    Taro.showToast({
        title: '评论发布失败，请重试',
        icon: 'error'
    });
      console.error('发布评论失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className={styles.bottomInput}>
      <Input
        className={styles.input}
        placeholder="说点什么..."
        value={comment}
        onInput={(e) => setComment(e.detail.value)}
        disabled={isSubmitting}
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
  );
};

export default BottomInput; 