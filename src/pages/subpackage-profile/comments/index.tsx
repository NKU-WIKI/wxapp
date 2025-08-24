import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getMyComments } from '@/services/api/user';
import { getPostById } from '@/services/api/post';
import { formatRelativeTime } from '@/utils/time';
import { CommentRead } from '@/types/api/comment.d';
import { Post } from '@/types/api/post.d';
import EmptyState from '@/components/empty-state';
import messageSquareIcon from '@/assets/message-square.svg';
import arrowLeftIcon from '@/assets/arrow-left.svg';
import styles from './index.module.scss';

interface CommentItemProps {
  comment: CommentRead;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [postInfo, setPostInfo] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取帖子信息
  useEffect(() => {
    if (comment.resource_type === 'post' && comment.resource_id) {
      setLoading(true);
      getPostById(comment.resource_id)
        .then(response => {
          if (response.code === 0) {
            setPostInfo(response.data);
          }
        })
        .catch(error => {
          console.error('获取帖子信息失败:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [comment.resource_id, comment.resource_type]);

  const handleNavigateToContent = () => {
    // 根据资源类型导航到对应页面
    if (comment.resource_type === 'post') {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${comment.resource_id}`
      });
    } else if (comment.resource_type === 'note') {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/note-detail/index?id=${comment.resource_id}`
      });
    }
  };

  // 显示帖子作者名字或加载状态
  const getResourceAuthor = () => {
    if (comment.resource_type === 'post') {
      if (loading) return '加载中...';
      return postInfo?.user?.nickname || postInfo?.author_info?.nickname || '未知作者';
    }
    return comment.user?.nickname || '未知作者';
  };

  // 显示帖子标题或ID
  const getResourceTitle = () => {
    if (comment.resource_type === 'post') {
      if (loading) return `#${comment.resource_id}`;
      return postInfo?.title || `#${comment.resource_id}`;
    }
    return `#${comment.resource_id}`;
  };

  return (
    <View className={styles.commentItem} onClick={handleNavigateToContent}>
      <View className={styles.commentContent}>
        <Text className={styles.contentText}>{comment.content}</Text>
      </View>
      
      <View className={styles.commentMeta}>
        <Text className={styles.metaTime}>{formatRelativeTime(comment.created_at)}</Text>
        <Text className={styles.metaLikes}>{comment.likes_count || 0} 赞</Text>
        {comment.replies_count_immediate > 0 && (
          <Text className={styles.metaReplies}>{comment.replies_count_immediate} 回复</Text>
        )}
      </View>

      <View className={styles.resourceInfo}>
        <View className={styles.resourceHeader}>
          <Text className={styles.resourceType}>
            {comment.resource_type === 'post' ? '帖子' : '笔记'}
          </Text>
          <Text className={styles.resourceAuthor}>
            {getResourceAuthor()}
          </Text>
        </View>
        
        <Text className={styles.resourceTitle}>
          评论于 {comment.resource_type === 'post' ? '帖子' : '笔记'}: {getResourceTitle()}
        </Text>
      </View>

      {comment.parent_id && (
        <View className={styles.replyInfo}>
          <Text className={styles.replyLabel}>这是一条回复</Text>
          <Text className={styles.replyTarget}>回复 #{comment.parent_id}</Text>
        </View>
      )}
    </View>
  );
};

const CommentsPage: React.FC = () => {
  const [comments, setComments] = useState<CommentRead[]>([]);
  const [loading, setLoading] = useState<'idle' | 'pending' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [statusBarHeight, setStatusBarHeight] = useState(20); // 默认状态栏高度
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 10,
    total: 0,
    has_more: false
  });
  
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  // 获取状态栏高度
  useEffect(() => {
    Taro.getSystemInfo().then(res => {
      setStatusBarHeight(res.statusBarHeight || 20);
    });
  }, []);

  // 加载评论列表
  const loadComments = useCallback(async (refresh = false) => {
    try {
      setLoading('pending');
      setError(null);
      
      const skip = refresh ? 0 : comments.length;
      const limit = 10;

      const response = await getMyComments({ skip, limit });
      
      if (response.code !== 0) {
        throw new Error(response.message || 'Failed to fetch comments');
      }

      const raw = response.data as any;
      const items: CommentRead[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      const totalFromApi = Array.isArray(raw) ? undefined : raw?.total;
      const hasMoreFromApi = Array.isArray(raw) ? undefined : raw?.has_more;

      const hasMore = typeof hasMoreFromApi === 'boolean' ? hasMoreFromApi : items.length >= limit;
      const total = typeof totalFromApi === 'number' ? totalFromApi : items.length;

      if (refresh) {
        setComments(items);
      } else {
        setComments(prev => [...prev, ...items]);
      }
      
      setPagination({
        skip,
        limit,
        total,
        has_more: hasMore
      });
      
      setLoading('succeeded');
    } catch (err: any) {
      console.error("Error fetching user comments:", err);
      setError(err.message || "Failed to fetch user comments");
      setLoading('failed');
    }
  }, [comments.length]);

  // 检查登录状态并初始化数据
  useEffect(() => {
    if (!isLoggedIn) {
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
      return;
    }

    loadComments(true);
  }, [isLoggedIn, loadComments]);

  // 下拉刷新
  usePullDownRefresh(() => {
    loadComments(true);
    Taro.stopPullDownRefresh();
  });

  // 上拉加载更多
  useReachBottom(() => {
    if (pagination.has_more && loading !== 'pending') {
      loadComments(false);
    }
  });

  // 处理重试
  const handleRetry = () => {
    loadComments(true);
  };

  // 渲染内容
  const renderContent = () => {
    if (loading === 'pending' && comments.length === 0) {
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
          text='暂无评论内容'
        />
      );
    }

    return (
      <View className={styles.commentsList}>
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        
        {loading === 'pending' && comments.length > 0 && (
          <View className={styles.loadingMore}>
            <Text>加载更多...</Text>
          </View>
        )}
        
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
      <View 
        className={styles.navbar}
        style={{ paddingTop: `${statusBarHeight}px` }}
      >
        <View className={styles.navLeft} onClick={() => Taro.navigateBack()}>
          <Image src={arrowLeftIcon} className={styles.backIcon} />
        </View>
        <View className={styles.navCenter}>
          <Text className={styles.navTitle}>我的评论</Text>
        </View>
        <View className={styles.navRight}>
          {/* 占位元素，保持布局平衡 */}
        </View>
      </View>
      
      <View className={styles.content}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
          refresherEnabled
          refresherTriggered={loading === 'pending' && comments.length === 0}
          onRefresherRefresh={() => loadComments(true)}
          onScrollToLower={() => {
            if (pagination.has_more && loading !== 'pending') {
              loadComments(false);
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

export default CommentsPage; 