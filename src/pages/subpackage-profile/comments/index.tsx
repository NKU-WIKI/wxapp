import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import CustomHeader from '@/components/custom-header';
import EmptyState from '@/components/empty-state';
import messageSquareIcon from '@/assets/message-square.svg';
import styles from './index.module.scss';
import { fetchUserComments, resetUserComments } from '@/store/slices/userCommentSlice';
import { formatRelativeTime } from '@/utils/time';

const CommentItem = ({ comment }) => {
  const handleNavigateToPost = () => {
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/post-detail/index?id=${comment.post_id}`
    });
  };

  return (
    <View className={styles.commentItem} onClick={handleNavigateToPost}>
      <Text className={styles.commentContent}>{comment.content}</Text>
      <View className={styles.commentMeta}>
        <Text className={styles.commentTime}>{formatRelativeTime(comment.create_time)}</Text>
        <Text>{comment.like_count || 0} 赞</Text>
        {comment.reply_count > 0 && (
          <Text>{comment.reply_count} 回复</Text>
        )}
      </View>
      <View className={styles.postInfo}>
        <Text className={styles.postTitle}>{comment.post_title}</Text>
        {comment.post_content && comment.post_content !== '内容不可用' && (
          <Text className={styles.postContent}>{comment.post_content}</Text>
        )}
      </View>
    </View>
  );
};

const CommentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const userCommentState = useSelector((state: RootState) => state.userComment);
  const userState = useSelector((state: RootState) => state.user);
  
  // 解构状态，处理可能的undefined
  const comments = userCommentState?.items || [];
  const pagination = userCommentState?.pagination || { page: 1, page_size: 10, total: 0, has_more: false };
  const loading = userCommentState?.loading || 'idle';
  const error = userCommentState?.error || null;
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后查看评论',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          } else {
            Taro.navigateBack();
          }
        }
      });
    } else {
      // 已登录，加载评论列表
      loadComments();
    }
  }, [isLoggedIn, token]);

  // 加载评论列表
  const loadComments = () => {
    dispatch(fetchUserComments({ page: 1, page_size: 10 }));
    setPage(1);
  };

  // 加载更多评论
  const loadMoreComments = () => {
    if (pagination && pagination.has_more && loading !== 'pending') {
      const nextPage = page + 1;
      dispatch(fetchUserComments({ 
        page: nextPage, 
        page_size: 10,
        isAppend: true 
      }));
      setPage(nextPage);
    }
  };

  // 下拉刷新
  usePullDownRefresh(() => {
    loadComments();
    Taro.stopPullDownRefresh();
  });

  // 上拉加载更多
  useReachBottom(() => {
    loadMoreComments();
  });

  // 处理重试
  const handleRetry = () => {
    loadComments();
  };

  // 渲染内容
  const renderContent = () => {
    if (loading === 'pending' && page === 1) {
      return (
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className={styles.errorContainer}>
          <Text className={styles.errorText}>加载失败: {error}</Text>
          <View className={styles.retryButton} onClick={handleRetry}>
            <Text>重试</Text>
          </View>
        </View>
      );
    }

    if (comments.length === 0) {
      return (
        <EmptyState
          icon={messageSquareIcon}
          text="暂无评论内容"
        />
      );
    }

    return (
      <View className={styles.commentsList}>
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        
        {/* 加载更多提示 */}
        {loading === 'pending' && page > 1 && (
          <View className={styles.loadingMore}>
            <Text>加载更多...</Text>
          </View>
        )}
        
        {/* 没有更多内容提示 */}
        {!pagination.has_more && comments.length > 0 && (
          <View className={styles.noMore}>
            <Text>没有更多内容了</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className={styles.commentsPage}>
      {/* 自定义导航栏 */}
      <CustomHeader title="我的评论" />
      
      {/* 内容区域 */}
      <View className={styles.content}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
          refresherEnabled
          refresherTriggered={loading === 'pending' && page === 1}
          onRefresherRefresh={loadComments}
          onScrollToLower={loadMoreComments}
          lowerThreshold={50}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
};

export default CommentsPage; 