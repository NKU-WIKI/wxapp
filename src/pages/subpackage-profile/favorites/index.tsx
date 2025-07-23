import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import CustomHeader from '@/components/custom-header';
import PostItem from '@/components/post-item';
import PostItemSkeleton from '@/components/post-item-skeleton';
import EmptyState from '@/components/empty-state';
import starOutlineIcon from '@/assets/star-outline.svg';
import styles from './index.module.scss';
import { fetchFavorites, resetFavorites } from '@/store/slices/favoriteSlice';

const FavoritesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [page, setPage] = useState(1);
  const favoriteState = useSelector((state: RootState) => state.favorite);
  const userState = useSelector((state: RootState) => state.user);
  
  // 解构状态，处理可能的undefined
  const favorites = favoriteState?.items || [];
  const pagination = favoriteState?.pagination || { page: 1, page_size: 10, total: 0, has_more: false };
  const loading = favoriteState?.loading || 'idle';
  const error = favoriteState?.error || null;
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后查看收藏',
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
      // 已登录，加载收藏列表
      loadFavorites();
    }
  }, [isLoggedIn, token]);

  // 加载收藏列表
  const loadFavorites = () => {
    dispatch(fetchFavorites({ page: 1, page_size: 10 }));
    setPage(1);
  };

  // 加载更多收藏
  const loadMoreFavorites = () => {
    if (pagination && pagination.has_more && loading !== 'pending') {
      const nextPage = page + 1;
      dispatch(fetchFavorites({ 
        page: nextPage, 
        page_size: 10,
        isAppend: true 
      }));
      setPage(nextPage);
    }
  };

  // 下拉刷新
  usePullDownRefresh(() => {
    loadFavorites();
    Taro.stopPullDownRefresh();
  });

  // 上拉加载更多
  useReachBottom(() => {
    loadMoreFavorites();
  });

  // 处理重试
  const handleRetry = () => {
    loadFavorites();
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

    if (favorites.length === 0) {
      return (
        <EmptyState
          icon={starOutlineIcon}
          text="暂无收藏内容"
        />
      );
    }

    const content = favorites
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
    if (!pagination.has_more && favorites.length > 0) {
      content.push(
        <View key="no-more" className={styles.noMore}>
          <Text>没有更多内容了</Text>
        </View>
      );
    }

    return content;
  };

  return (
    <View className={styles.favoritesPage}>
      {/* 自定义导航栏 */}
      <CustomHeader title="我的收藏" />
      
      {/* 内容区域 */}
      <View className={styles.content}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
          refresherEnabled
          refresherTriggered={loading === 'pending' && page === 1}
          onRefresherRefresh={loadFavorites}
          onScrollToLower={loadMoreFavorites}
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

export default FavoritesPage; 