import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/store';
import { fetchUserPosts, resetUserPosts } from '@/store/slices/userPostsSlice';
import EmptyState from '@/components/empty-state';
import Post from '@/components/post';

// Assets imports
import penToolIcon from '@/assets/pen-tool.svg';

// Relative imports
import styles from './index.module.scss';

const MyPostsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: posts, loading, error: userPostsError, pagination } = useSelector((state: RootState) => state.userPosts);
  const userState = useSelector((state: RootState) => state.user);
  const [isInitialized, setIsInitialized] = useState(false);

  // 使用 ref 保存 pagination 的最新值，避免依赖循环
  const paginationRef = React.useRef(pagination);
  paginationRef.current = pagination;

  // 加载我的帖子
  const loadMyPosts = useCallback(async (isRefresh = false) => {
    try {
      // 从 ref 获取最新的 pagination 状态
      const currentPagination = paginationRef.current;
      const params = {
        skip: isRefresh ? 0 : currentPagination.skip + currentPagination.limit,
        limit: 20,
        isAppend: !isRefresh
      };
      
      if (isRefresh) {
        dispatch(resetUserPosts());
      }
      
      await dispatch(fetchUserPosts(params)).unwrap();
    } catch (err) {
      
      Taro.showToast({
        title: String(err) || '加载失败',
        icon: 'none'
      });
    }
  }, [dispatch]); // 只依赖 dispatch

  // 初始加载 - 避免循环依赖
  useEffect(() => {
    if (!userState.isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    if (!isInitialized) {
      setIsInitialized(true);
      loadMyPosts(true);
    }
  }, [userState.isLoggedIn, isInitialized, loadMyPosts]);

  // 下拉刷新
  usePullDownRefresh(async () => {
    await loadMyPosts(true);
    Taro.stopPullDownRefresh();
  });

  // 上拉加载更多
  useReachBottom(async () => {
    if (pagination.has_more && loading !== 'pending') {
      await loadMyPosts(false);
    }
  });

  // 渲染加载状态
  if (loading === 'pending' && posts.length === 0) {
    return (
      <View className={styles.container}>
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  // 渲染错误状态
  if (loading === 'failed' && posts.length === 0) {
    return (
      <View className={styles.container}>
        <View className={styles.errorContainer}>
          <Text className={styles.errorText}>{userPostsError || '加载失败，请重试'}</Text>
          <View 
            className={styles.retryButton}
            onClick={() => loadMyPosts(true)}
          >
            <Text className={styles.retryText}>重新加载</Text>
          </View>
        </View>
      </View>
    );
  }

  // 渲染空状态
  if (posts.length === 0) {
    return (
      <View className={styles.container}>
        <EmptyState
          icon={penToolIcon}
          text={
            <View>
              <Text>还没有发布帖子</Text>
              <Text>快去发布你的第一篇帖子吧</Text>
            </View>
          }
        />
        <View className={styles.actionContainer}>
          <View 
            className={styles.createButton}
            onClick={() => {
              Taro.navigateTo({
                url: '/pages/subpackage-post/create/index'
              });
            }}
          >
            <Text className={styles.createButtonText}>去发帖</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      
      <ScrollView
        className={styles.scrollView}
        scrollY
        enhanced
        showScrollbar={false}
      >
        <View className={styles.postsContainer}>
          {posts.map((post) => (
            <View key={post.id} className={styles.postWrapper}>
              <Post 
                post={post}
                mode='list'
                enableNavigation
              />
            </View>
          ))}
          
          {/* 加载更多指示器 */}
          {loading === 'pending' && posts.length > 0 && (
            <View className={styles.loadMore}>
              <Text className={styles.loadMoreText}>加载中...</Text>
            </View>
          )}
          
          {/* 没有更多数据提示 */}
          {!pagination.has_more && posts.length > 0 && (
            <View className={styles.noMore}>
              <Text className={styles.noMoreText}>没有更多帖子了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MyPostsPage;
