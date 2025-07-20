import React, { useState } from 'react';
import { View, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from '../index.module.scss';
import SendIcon from '@/assets/sendcomment.svg';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface BottomInputProps {
  postId: number;
}

const BottomInput: React.FC<BottomInputProps> = ({ postId }) => {
  const [comment, setComment] = useState('');
  const { token } = useSelector((state: RootState) => state.user);
  
  const handleSendComment = () => {
    if (!comment.trim()) {
      return;
    }
    
    // 检查是否登录
    if (!token) {
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
    
    // TODO: 发送评论的逻辑，需要在后续实现
    // 目前先显示一个提示
    Taro.showToast({
      title: '评论功能开发中',
      icon: 'none'
    });
    
    // 清空输入框
    setComment('');
  };

  return (
    <View className={styles.bottomInput}>
      <Input
        className={styles.input}
        placeholder="说点什么..."
        value={comment}
        onInput={(e) => setComment(e.detail.value)}
      />
      <View 
        className={styles.sendButton}
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