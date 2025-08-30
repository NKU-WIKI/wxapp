import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchFavorites, FavoriteItem, setFavorites } from '@/store/slices/favoriteSlice';
import { useMultipleFollowStatus } from '@/hooks/useFollowStatus';
import { formatRelativeTime } from '@/utils/time';
import CustomHeader from '@/components/custom-header';
import EmptyState from '@/components/empty-state';
import Post from '@/components/post';
import starOutlineIcon from '@/assets/star-outline.svg';
import styles from './index.module.scss';

// 定义收藏类型
type CollectionType = 'post' | 'note';

interface FavoriteItemProps {
  favorite: FavoriteItem;
  isFollowingAuthor?: boolean; // 新增：是否关注作者
}

// 模拟笔记数据
const mockNotes = [
  {
    id: 'note-1',
    title: '学习笔记：React Hooks 最佳实践',
    content: '今天学习了 React Hooks 的使用方法，包括 useState、useEffect、useCallback 等。这些 Hooks 让函数组件也能拥有状态和生命周期...',
    author_info: {
      id: 'user-1',
      nickname: '学习达人',
      avatar: null
    },
    created_at: '2024-01-15T10:30:00Z',
    view_count: 156,
    like_count: 23,
    comment_count: 8,
    tenant_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    id: 'note-2',
    title: '项目总结：Taro 小程序开发经验',
    content: '经过一个月的 Taro 小程序开发，总结了一些经验和教训。Taro 的跨端能力很强，但在某些复杂场景下还是需要平台特定的代码...',
    author_info: {
      id: 'user-2',
      nickname: '技术探索者',
      avatar: null
    },
    created_at: '2024-01-14T15:20:00Z',
    view_count: 89,
    like_count: 15,
    comment_count: 5,
    tenant_id: '00000000-0000-0000-0000-000000000000'
  },
  {
    id: 'note-3',
    title: '读书笔记：《深入理解计算机系统》',
    content: '这本书从程序员的角度介绍了计算机系统的实现细节，包括程序的表示和执行、处理器结构、编译系统等。对于理解底层原理很有帮助...',
    author_info: {
      id: 'user-3',
      nickname: '知识分享者',
      avatar: null
    },
    created_at: '2024-01-13T09:15:00Z',
    view_count: 234,
    like_count: 42,
    comment_count: 12,
    tenant_id: '00000000-0000-0000-0000-000000000000'
  }
];

const FavoriteItemComponent: React.FC<FavoriteItemProps> = ({ favorite, isFollowingAuthor = false }) => {
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
      is_favorited: true, // 因为这是收藏列表，所以肯定是已收藏的
      is_following_author: isFollowingAuthor, // 设置关注状态
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

// 笔记组件，使用与帖子相同的Post组件
const NoteItemComponent: React.FC<{ note: any }> = ({ note }) => {
  const postData = {
    id: note.id,
    title: note.title,
    content: note.content,
    status: 'published' as const,
    user_id: note.author_info.id,
    user: {
      id: note.author_info.id,
      tenant_id: note.tenant_id,
      created_at: note.created_at,
      updated_at: note.created_at,
      nickname: note.author_info.nickname,
      avatar: note.author_info.avatar || null,
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
    author_info: {
      id: note.author_info.id,
      tenant_id: note.tenant_id,
      created_at: note.created_at,
      updated_at: note.created_at,
      nickname: note.author_info.nickname,
      avatar: note.author_info.avatar || null,
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
    created_at: note.created_at,
    view_count: note.view_count,
    like_count: note.like_count,
    comment_count: note.comment_count,
    is_favorited: true,
    is_following_author: false,
    tenant_id: note.tenant_id,
    updated_at: note.created_at
  };

  return (
    <Post 
      post={postData} 
      className={styles.favoriteItem} 
      mode='list' 
    />
  );
};

const CollectionPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // 兼容持久化或热更新导致的初始状态缺失，做运行时兜底
  const favoriteState = useSelector((state: RootState) => (state as any).favorite);
  const loading: 'idle' | 'pending' | 'succeeded' | 'failed' = favoriteState?.loading ?? 'idle';
  const error: string | null = favoriteState?.error ?? null;
  const pagination = favoriteState?.pagination ?? { skip: 0, limit: 20, total: 0, has_more: false };
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  // 添加切换状态
  const [activeType, setActiveType] = useState<CollectionType>('post');

  // 提取所有帖子作者的ID用于批量获取关注状态
  const { favorites, authorIds } = useMemo(() => {
    const favs = favoriteState?.items ?? [];
    const ids: string[] = [];
    favs.forEach(favorite => {
      if (favorite.target_type === 'post' && favorite.content) {
        const authorInfo = favorite.content.author_info;
        if (authorInfo?.id && !ids.includes(authorInfo.id)) {
          ids.push(authorInfo.id);
        }
      }
    });
    return { favorites: favs, authorIds: ids };
  }, [favoriteState?.items]);

  // 获取所有作者的关注状态
  const { followStatusMap } = useMultipleFollowStatus(authorIds);

  // 根据当前选中的类型过滤收藏内容
  const filteredFavorites = useMemo(() => {
    if (activeType === 'post') {
      // 显示帖子：target_type为post且content.type不是note，或者没有content.type
      return favorites.filter(favorite => 
        favorite.target_type === 'post' && 
        (!favorite.content?.type || favorite.content.type === 'post')
      );
    } else {
      // 显示笔记：target_type为post但content.type为note
      return favorites.filter(favorite => 
        favorite.target_type === 'post' && 
        favorite.content?.type === 'note'
      );
    }
  }, [favorites, activeType]);

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

  // 处理类型切换
  const handleTypeChange = (type: CollectionType) => {
    setActiveType(type);
  };

  // 渲染内容
  const renderContent = () => {
    if (loading === 'pending' && filteredFavorites.length === 0) {
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

    if (activeType === 'post') {
      if (filteredFavorites.length === 0) {
        return (
          <EmptyState
            icon={starOutlineIcon}
            text='暂无收藏帖子'
          />
        );
      }

      return (
        <View className={styles.favoritesList}>
          {filteredFavorites.map(favorite => {
            // 获取当前帖子作者的关注状态
            const authorInfo = favorite.content?.author_info;
            const isFollowingAuthor = authorInfo?.id ? followStatusMap[authorInfo.id] || false : false;
            
            return (
              <FavoriteItemComponent 
                key={favorite.id} 
                favorite={favorite} 
                isFollowingAuthor={isFollowingAuthor}
              />
            );
          })}
          
          {loading === 'pending' && filteredFavorites.length > 0 && (
            <View className={styles.loadingMore}>
              <Text>加载更多...</Text>
            </View>
          )}
          
          {!pagination.has_more && filteredFavorites.length > 0 && (
            <View className={styles.noMore}>
              <Text>没有更多内容了</Text>
            </View>
          )}
        </View>
      );
    } else {
      // 笔记类型 - 使用与帖子相同的展示方式
      return (
        <View className={styles.favoritesList}>
          {mockNotes.map(note => (
            <NoteItemComponent key={note.id} note={note} />
          ))}
        </View>
      );
    }
  };

  return (
    <View className={styles.collectionPage}>
      <CustomHeader title='我的收藏' />
      
      {/* 切换按钮 */}
      <View className={styles.typeSwitch}>
        <View 
          className={`${styles.switchButton} ${activeType === 'post' ? styles.active : ''}`}
          onClick={() => handleTypeChange('post')}
        >
          <Text className={styles.switchText}>帖子</Text>
        </View>
        <View 
          className={`${styles.switchButton} ${activeType === 'note' ? styles.active : ''}`}
          onClick={() => handleTypeChange('note')}
        >
          <Text className={styles.switchText}>笔记</Text>
        </View>
      </View>

      <View className={styles.content}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
          refresherEnabled
          refresherTriggered={loading === 'pending' && filteredFavorites.length === 0}
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
