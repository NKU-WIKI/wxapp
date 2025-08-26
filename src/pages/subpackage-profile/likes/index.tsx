import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchLikes, resetLikes } from '@/store/slices/likesSlice';
import { useMultipleFollowStatus } from '@/hooks/useFollowStatus';
import CustomHeader from '@/components/custom-header';
import EmptyState from '@/components/empty-state';
import Post from '@/components/post';
import heartOutlineIcon from '@/assets/heart-outline.svg';
import styles from './index.module.scss';

// 点赞项组件
interface LikeItemProps {
  like: any; // 使用any暂时，待类型完善
  isFollowingAuthor?: boolean; // 新增：是否关注作者
}

const LikeItemComponent: React.FC<LikeItemProps> = ({ like, isFollowingAuthor = false }) => {
  console.log('Rendering like item:', like);
  
  // 如果是帖子类型但没有内容，不渲染任何内容（被删除的帖子）
  if (like.target_type === 'post' && !like.content) {
    console.log('Post like without content, skipping render:', like.target_id);
    return null;
  }
  
  // 如果有具体内容，渲染具体内容；否则显示基本信息
  if (like.content && like.target_type === 'post') {
    // 获取作者信息，优先使用 author_info，其次使用 user
    const authorInfo = like.content.author_info || like.content.user;
    console.log('Author info:', authorInfo);
    
    // 转换为Post组件需要的格式
    const postData = {
      id: like.content.id,
      title: like.content.title,
      content: like.content.content,
      status: 'published' as const,
      user_id: authorInfo?.id || '',
      user: authorInfo || {
        id: '',
        nickname: '未知用户',
        created_at: '',
        updated_at: '',
        tenant_id: '',
        status: 'active' as const
      },
      author_info: authorInfo,
      created_at: like.content.created_at,
      view_count: like.content.view_count,
      like_count: like.content.like_count,
      comment_count: like.content.comment_count,
      is_liked: true, // 因为这是点赞列表，所以肯定是已点赞的
      is_following_author: isFollowingAuthor, // 设置关注状态
    };

    return (
      <Post 
        post={postData}
        mode='list'
        enableNavigation
      />
    );
  }

  // 如果没有具体内容或其他类型，显示基本信息
  return (
    <View className={styles.basicItem}>
      <Text className={styles.itemType}>
        {like.target_type === 'post' ? '帖子' : 
         like.target_type === 'comment' ? '评论' : 
         like.target_type === 'knowledge' ? '知识' : '内容'}
      </Text>
      <Text className={styles.itemId}>ID: {like.target_id}</Text>
      <Text className={styles.itemTime}>点赞时间: {like.created_at}</Text>
      {!like.content && (
        <Text className={styles.itemStatus}>内容加载失败或已删除</Text>
      )}
    </View>
  );
};

const LikesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: likes, loading, error, pagination } = useSelector((state: RootState) => state.likes);
  const userState = useSelector((state: RootState) => state.user);
  const [isInitialized, setIsInitialized] = useState(false);

  // 提取所有帖子作者的ID用于批量获取关注状态
  const authorIds = useMemo(() => {
    const ids: string[] = [];
    likes.forEach(like => {
      if (like.target_type === 'post' && like.content) {
        const authorInfo = like.content.author_info;
        if (authorInfo?.id && !ids.includes(authorInfo.id)) {
          ids.push(authorInfo.id);
        }
      }
    });
    return ids;
  }, [likes]);

  // 获取所有作者的关注状态
  const { followStatusMap } = useMultipleFollowStatus(authorIds);

  // 加载我的点赞 - 使用 ref 来获取最新的 pagination 状态
  const paginationRef = React.useRef(pagination);
  paginationRef.current = pagination;

  const loadMyLikes = useCallback(async (isRefresh = false) => {
    try {
      // 从 ref 获取最新的 pagination 状态
      const currentPagination = paginationRef.current;
      const params = {
        skip: isRefresh ? 0 : currentPagination.skip + currentPagination.limit,
        limit: 20,
        isAppend: !isRefresh
      };
      
      if (isRefresh) {
        dispatch(resetLikes());
      }
      
      await dispatch(fetchLikes(params)).unwrap();
    } catch (err) {
      console.error('Failed to load likes:', err);
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
      loadMyLikes(true);
    }
  }, [userState.isLoggedIn, isInitialized, loadMyLikes]);

  // 下拉刷新
  usePullDownRefresh(async () => {
    await loadMyLikes(true);
    Taro.stopPullDownRefresh();
  });

  // 上拉加载更多
  useReachBottom(async () => {
    if (pagination.has_more && loading !== 'pending') {
      await loadMyLikes(false);
    }
  });

  // 渲染加载状态
  if (loading === 'pending' && likes.length === 0) {
    return (
      <View className={styles.container}>
        <CustomHeader title='我的点赞' />
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  // 渲染错误状态
  if (loading === 'failed' && likes.length === 0) {
    return (
      <View className={styles.container}>
        <CustomHeader title='我的点赞' />
        <View className={styles.errorContainer}>
          <Text className={styles.errorText}>{error || '加载失败，请重试'}</Text>
          <View 
            className={styles.retryButton}
            onClick={() => loadMyLikes(true)}
          >
            <Text className={styles.retryText}>重新加载</Text>
          </View>
        </View>
      </View>
    );
  }

  // 渲染空状态
  if (likes.length === 0) {
    return (
      <View className={styles.container}>
        <CustomHeader title='我的点赞' />
        <EmptyState
          icon={heartOutlineIcon}
          text={
            <View>
              <Text>还没有点赞任何内容</Text>
              <Text>快去点赞感兴趣的内容吧</Text>
            </View>
          }
        />
        <View className={styles.actionContainer}>
          <View 
            className={styles.exploreButton}
            onClick={() => {
              Taro.switchTab({
                url: '/pages/index/index'
              });
            }}
          >
            <Text className={styles.exploreButtonText}>去发现</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <CustomHeader title='我的点赞' />
      
      <ScrollView
        className={styles.scrollView}
        scrollY
        enhanced
        showScrollbar={false}
      >
        <View className={styles.likesContainer}>
          {likes
            .filter(like => {
              // 双重过滤确保只显示有效的点赞项
              if (like.target_type === 'post') {
                return like.content && like.content.id; // 确保帖子有内容且有ID
              }
              return true; // 非帖子类型的点赞直接通过
            })
            .map((like, index) => {
              // 获取当前帖子作者的关注状态
              const authorInfo = like.content?.author_info;
              const isFollowingAuthor = authorInfo?.id ? followStatusMap[authorInfo.id] || false : false;
              
              return (
                <View key={`like-${like.id}-${like.target_id}-${index}`} className={styles.likeWrapper}>
                  <LikeItemComponent like={like} isFollowingAuthor={isFollowingAuthor} />
                </View>
              );
            })}
          
          {/* 加载更多指示器 */}
          {loading === 'pending' && likes.length > 0 && (
            <View className={styles.loadMore}>
              <Text className={styles.loadMoreText}>加载中...</Text>
            </View>
          )}
          
          {/* 没有更多数据提示 */}
          {!pagination.has_more && likes.length > 0 && (
            <View className={styles.noMore}>
              <Text className={styles.noMoreText}>没有更多点赞了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default LikesPage;
