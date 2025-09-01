import { useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getFeedbackList } from '@/store/slices/feedbackSlice';
import styles from './index.module.scss';

const STATUS_MAP = {
  pending: { text: '待处理', color: '#F59E0B' },
  processing: { text: '处理中', color: '#3B82F6' },
  resolved: { text: '已解决', color: '#22C55E' },
  rejected: { text: '已拒绝', color: '#EF4444' },
};

const TYPE_MAP = {
  bug: '功能异常',
  ux: '体验问题',
  suggest: '产品建议',
  other: '其他',
};

export default function FeedbackListPage() {
  const dispatch = useAppDispatch();
  const { feedbacks, loading } = useAppSelector((state) => state.feedback);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const loadFeedbacks = useCallback(async () => {
    try {
      await dispatch(getFeedbackList({ page: 1, page_size: 20 })).unwrap();
    } catch (error) {

      Taro.showToast({ title: '获取反馈列表失败', icon: 'none' });
    }
  }, [dispatch]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <View className={styles.page}>
      <ScrollView className={styles.scrollView} scrollY>
        {loading ? (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        ) : feedbacks.length === 0 ? (
          <View className={styles.empty}>
            <Text>暂无反馈记录</Text>
          </View>
        ) : (
          <View className={styles.feedbackList}>
            {feedbacks.map((feedback) => (
              <View key={feedback.id} className={styles.feedbackItem}>
                <View className={styles.feedbackHeader}>
                  <View className={styles.feedbackInfo}>
                    <Text className={styles.feedbackType}>{TYPE_MAP[feedback.type]}</Text>
                    <Text className={styles.feedbackTime}>{formatTime(feedback.create_time)}</Text>
                  </View>
                  <View 
                    className={styles.statusBadge}
                    style={{ backgroundColor: STATUS_MAP[feedback.status]?.color || '#9CA3AF' }}
                  >
                    <Text className={styles.statusText}>{STATUS_MAP[feedback.status]?.text || '未知'}</Text>
                  </View>
                </View>
                
                <View className={styles.feedbackContent}>
                  <Text className={styles.contentText}>{feedback.content}</Text>
                </View>
                
                {feedback.image && feedback.image.length > 0 && (
                  <View className={styles.imageList}>
                    {feedback.image.map((url, index) => (
                      <View key={index} className={styles.imageItem}>
                        <Image src={url} className={styles.feedbackImage} mode='aspectFill' />
                      </View>
                    ))}
                  </View>
                )}
                
                {feedback.admin_reply && (
                  <View className={styles.replySection}>
                    <Text className={styles.replyLabel}>管理员回复：</Text>
                    <Text className={styles.replyContent}>{feedback.admin_reply}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
} 
