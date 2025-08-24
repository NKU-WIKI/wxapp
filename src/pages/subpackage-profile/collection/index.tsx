import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchFavorites, FavoriteItem, setFavorites } from '@/store/slices/favoriteSlice';
import { formatRelativeTime } from '@/utils/time';
import CustomHeader from '@/components/custom-header';
import EmptyState from '@/components/empty-state';
import Post from '@/components/post';
import starOutlineIcon from '@/assets/star-outline.svg';
import styles from './index.module.scss';

interface FavoriteItemProps {
  favorite: FavoriteItem;
}

const FavoriteItemComponent: React.FC<FavoriteItemProps> = ({ favorite }) => {
  const handleNavigateToContent = () => {
    if (favorite.target_type === 'post' && favorite.content) {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${favorite.target_id}`
      });
    }
    // TODO: 添加对其他类型（knowledge等）的导航支持
  };

  // 如果是帖子类型且有内容信息，使用Post组件渲染
  if (favorite.target_type === 'post' && favorite.content) {
    // 获取作者信息
    const authorInfo = favorite.content.author_info;
    console.log('Collection favorite author info:', authorInfo);
    
    const postData = {
      id: favorite.content.id,
      title: favorite.content.title || '',
      content: favorite.content.content || '',
      status: 'published' as const,
      user_id: authorInfo?.id || '',
      user: authorInfo ? {
        id: authorInfo.id,
        tenant_id: favorite.tenant_id,
        created_at: favorite.created_at,
        updated_at: favorite.updated_at,
        nickname: authorInfo.nickname,
        avatar: authorInfo.avatar || null,
        bio: null,
        birthday: null,
        school: null,
        college: null,
        location: null,
        wechat_id: null,
        qq_id: null,
        tel: null,
        status: 'active' as const
      } : {
        id: '',
        tenant_id: favorite.tenant_id,
        created_at: favorite.created_at,
        updated_at: favorite.updated_at,
        nickname: '未知用户',
        avatar: null,
        bio: null,
        birthday: null,
        school: null,
        college: null,
        location: null,
        wechat_id: null,
        qq_id: null,
        tel: null,
        status: 'active' as const
      },
      author_info: favorite.content.author_info ? {
        id: favorite.content.author_info.id,
        tenant_id: favorite.tenant_id,
        created_at: favorite.created_at,
        updated_at: favorite.updated_at,
        nickname: favorite.content.author_info.nickname,
        avatar: favorite.content.author_info.avatar || null,
        bio: null,
        birthday: null,
        school: null,
        college: null,
        location: null,
        wechat_id: null,
        qq_id: null,
        tel: null,
        status: 'active' as const
      } : undefined,
      created_at: favorite.content.created_at || favorite.created_at,
      view_count: favorite.content.view_count || 0,
      like_count: favorite.content.like_count || 0,
      comment_count: favorite.content.comment_count || 0,
      tenant_id: favorite.tenant_id,
      updated_at: favorite.updated_at
    };

    return (
      <Post 
        post={postData} 
        className={styles.favoriteItem} 
        mode='list' 
      />
    );
  }

  // 对于其他类型或没有详细内容的项目，显示基本信息
  return (
    <View className={styles.favoriteCard} onClick={handleNavigateToContent}>
      <View className={styles.favoriteHeader}>
        <Text className={styles.favoriteType}>
          {favorite.target_type === 'post' ? '帖子' : 
           favorite.target_type === 'knowledge' ? '知识' :
           favorite.target_type === 'comment' ? '评论' : '收藏项'}
        </Text>
        <Text className={styles.favoriteTime}>
          {formatRelativeTime(favorite.created_at)}
        </Text>
      </View>
      
      {favorite.content ? (
        <View className={styles.favoriteContent}>
          {favorite.content.title && (
            <Text className={styles.favoriteTitle}>{favorite.content.title}</Text>
          )}
          {favorite.content.content && (
            <Text className={styles.favoriteText}>{favorite.content.content}</Text>
          )}
          {favorite.content.author_info && (
            <Text className={styles.favoriteAuthor}>
              作者: {favorite.content.author_info.nickname}
            </Text>
          )}
        </View>
      ) : (
        <View className={styles.favoriteContent}>
          <Text className={styles.favoriteTitle}>收藏项 #{favorite.target_id}</Text>
          <Text className={styles.favoriteText}>详细信息暂不可用</Text>
        </View>
      )}
    </View>
  );
};

const CollectionPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // 兼容持久化或热更新导致的初始状态缺失，做运行时兜底
  const favoriteState = useSelector((state: RootState) => (state as any).favorite);
  const favorites = favoriteState?.items ?? [];
  const loading: 'idle' | 'pending' | 'succeeded' | 'failed' = favoriteState?.loading ?? 'idle';
  const error: string | null = favoriteState?.error ?? null;
  const pagination = favoriteState?.pagination ?? { skip: 0, limit: 20, total: 0, has_more: false };
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  // 加载收藏列表
  const loadFavorites = useCallback((refresh = false) => {
    const skip = refresh ? 0 : favorites.length;
    const limit = 20;

    // 优先使用 thunk；若构建缓存导致 thunk 未就绪，使用 API+同步 action 兜底
    const maybeThunk: any = fetchFavorites as any;
    if (typeof maybeThunk === 'function') {
      dispatch(maybeThunk({ skip, limit, isAppend: !refresh }));
    } else {
      // API兜底方案
      console.warn('fetchFavorites thunk not available, using API fallback');
      
      // 简化的API兜底：直接返回空数据
      const nextPagination = { skip, limit, total: 0, has_more: false };
      dispatch(setFavorites({ items: [], pagination: nextPagination, append: !refresh }));
      
      // TODO: 实现完整的API兜底逻辑
      /*
      getMe().then(userResponse => {
        if (userResponse.code === 0 && userResponse.data?.user_id) {
          const userId = userResponse.data.user_id;
          return http.get(`/users/${userId}/favorites`, { skip, limit });
        }
        throw new Error('Cannot get user info');
      }).then(res => {
        if (res.code === 0) {
          const items = res.data || [];
          const nextPagination = { skip, limit, total: items.length, has_more: items.length >= limit };
          dispatch(setFavorites({ items, pagination: nextPagination, append: !refresh }));
        }
      }).catch(error => {
        console.error('API fallback failed:', error);
      });
      */
    }
  }, [dispatch, favorites.length]);

  // 检查登录状态并初始化数据
  useEffect(() => {
    if (!isLoggedIn) {
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
      return;
    }

    loadFavorites(true);
  }, [isLoggedIn, loadFavorites]);

  // 下拉刷新
  usePullDownRefresh(() => {
    loadFavorites(true);
    Taro.stopPullDownRefresh();
  });

  // 上拉加载更多
  useReachBottom(() => {
    if (pagination.has_more && loading !== 'pending') {
      loadFavorites(false);
    }
  });

  // 处理重试
  const handleRetry = () => {
    loadFavorites(true);
  };

  // 渲染内容
  const renderContent = () => {
    if (loading === 'pending' && favorites.length === 0) {
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

    if (favorites.length === 0) {
      return (
        <EmptyState
          icon={starOutlineIcon}
          text='暂无收藏内容'
        />
      );
    }

    return (
      <View className={styles.favoritesList}>
        {favorites.map(favorite => (
          <FavoriteItemComponent key={favorite.id} favorite={favorite} />
        ))}
        
        {loading === 'pending' && favorites.length > 0 && (
          <View className={styles.loadingMore}>
            <Text>加载更多...</Text>
          </View>
        )}
        
        {!pagination.has_more && favorites.length > 0 && (
          <View className={styles.noMore}>
            <Text>没有更多内容了</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className={styles.collectionPage}>
      <CustomHeader title='我的收藏' />
      <View className={styles.content}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
          refresherEnabled
          refresherTriggered={loading === 'pending' && favorites.length === 0}
          onRefresherRefresh={() => loadFavorites(true)}
          onScrollToLower={() => {
            if (pagination.has_more && loading !== 'pending') {
              loadFavorites(false);
            }
          }}
          lowerThreshold={50}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
};

export default CollectionPage;
