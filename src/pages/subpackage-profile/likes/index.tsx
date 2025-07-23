import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import CustomHeader from '@/components/custom-header';
import PostItem from '@/components/post-item';
import PostItemSkeleton from '@/components/post-item-skeleton';
import EmptyState from '@/components/empty-state';
import heartOutlineIcon from '@/assets/heart-outline.svg';
import styles from './index.module.scss';
import { fetchLikes, resetLikes } from '@/store/slices/likeSlice';

const LikesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const likeState = useSelector((state: RootState) => state.like);
  const userState = useSelector((state: RootState) => state.user);
  
  // 解构状态，处理可能的undefined
  const likes = likeState?.items || [];
  const pagination = likeState?.pagination || { page: 1, page_size: 10, total: 0, has_more: false };
  const loading = likeState?.loading || 'idle';
  const error = likeState?.error || null;
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后查看点赞',
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
      // 已登录，加载点赞列表
      loadLikes();
    }
  }, [isLoggedIn, token]);

  // 加载点赞列表
  const loadLikes = () => {
    dispatch(fetchLikes({ page: 1, page_size: 10 }));
    setPage(1);
  };

  // 加载更多点赞
  const loadMoreLikes = () => {
    if (pagination && pagination.has_more && loading !== 'pending') {
      const nextPage = page + 1;
      dispatch(fetchLikes({ 
        page: nextPage, 
        page_size: 10,
        isAppend: true 
      }));
      setPage(nextPage);
    }
  };

  // 下拉刷新
  usePullDownRefresh(() => {
    loadLikes();
    Taro.stopPullDownRefresh();
  });

  // 上拉加载更多
  useReachBottom(() => {
    loadMoreLikes();
  });

  // 处理重试
  const handleRetry = () => {
    loadLikes();
  };

  // 渲染内容
  const renderContent = () => {
    if (loading === 'pending' && page === 1) {
      return Array.from({ length: 3 }).map((_, index) => (
        <PostItemSkeleton key={index} className={styles.postItem} />
      ));
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

    if (likes.length === 0) {
      return (
        <EmptyState
          icon={heartOutlineIcon}
          text="暂无点赞内容"
        />
      );
    }

    const content = likes
      .filter(post => post && post.id && post.author_info)
      .map(post => (
        <PostItem key={post.id} post={post} className={styles.postItem} />
      ));

    // 添加加载更多的骨架屏
    if (loading === 'pending' && page > 1) {
      content.push(
        ...Array.from({ length: 2 }).map((_, index) => (
          <PostItemSkeleton key={`loading-more-${index}`} className={styles.postItem} />
        ))
      );
    }

    // 添加没有更多数据的提示
    if (!pagination.has_more && likes.length > 0) {
      content.push(
        <View key="no-more" className={styles.noMore}>
          <Text>没有更多内容了</Text>
        </View>
      );
    }

    return content;
  };

  return (
    <View className={styles.likesPage}>
      {/* 自定义导航栏 */}
      <CustomHeader title="我的点赞" />
      
      {/* 内容区域 */}
      <View className={styles.content}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
          refresherEnabled
          refresherTriggered={loading === 'pending' && page === 1}
          onRefresherRefresh={loadLikes}
          onScrollToLower={loadMoreLikes}
          lowerThreshold={50}
        >
          <View className={styles.postList}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default LikesPage; 