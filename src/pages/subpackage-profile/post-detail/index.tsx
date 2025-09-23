import React, { useEffect } from 'react';
import { View, ScrollView, Text } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';

import CustomHeader from '@/components/custom-header';

// Store imports
import { fetchPostDetail , PostsState } from '@/store/slices/postSlice';
import { fetchComments , CommentState } from '@/store/slices/commentSlice';
import { AppDispatch, RootState } from '@/store';

// Components imports
import EmptyState from '@/components/empty-state';
import Post from '@/components/post';

// Utils imports
import { addHistoryWithServerSync } from '@/utils/history';

// Assets imports
import emptyIcon from '@/assets/empty.svg';

// Relative imports
import styles from './index.module.scss';

const PostDetailPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPost, detailLoading, error } = useSelector((state: RootState) => state.post as PostsState);
  const { comments, fetchStatus: commentsLoading, error: commentsError } = useSelector((state: RootState) => state.comment as CommentState);
  
  // 从路由参数中获取帖子ID
  const postId = router.params.id;
  
  useEffect(() => {
    if (postId) {
      // 获取帖子详情
      dispatch(fetchPostDetail(postId));
      // 获取帖子评论 - 使用树形接口
      dispatch(fetchComments({
        resource_id: postId,
        resource_type: 'post',
        max_depth: 5,
        limit_per_level: 10,
        limit: 20
      }));
    }
  }, [dispatch, postId]);

  // 监听 currentPost 变化，写入历史（�?avatar 字段�?  useEffect(() => {
    if (currentPost) {
      // 记录到本地和服务�?      // 注意：post.id是string类型（UUID），但服务器API需要number类型
      const numericId = parseInt(String(currentPost.id)) || 0;
      
      // 获取头像：优先使�?user.avatar，兼�?author_info.avatar
      const author = currentPost.user || currentPost.author_info;
      const avatarUrl = author?.avatar || '';
      
      // 获取时间：优先使�?created_at，兼�?create_time，如果没有则使用当前时间
      const createTime = currentPost.created_at || currentPost.create_time || new Date().toISOString();
      const viewTime = new Date().toISOString();
      
      // 调试日志
      //   postId: currentPost.id,
      //   title: currentPost.title,
      //   avatarUrl: avatarUrl,
      //   createTime: createTime,
      //   viewTime: viewTime,
      //   postCreatedAt: currentPost.created_at,
      //   postCreateTime: currentPost.create_time,
      //   postData: currentPost
      // });
      
      addHistoryWithServerSync(
        {
          id: String(currentPost.id),
          title: currentPost.title || '',
          cover: currentPost.image_urls?.[0] || '',
          avatar: avatarUrl,
          createdAt: createTime,
          viewedAt: viewTime
        },
        'post',
        numericId
      );
    }
  }, [currentPost]);

  const renderContent = () => {
    if (detailLoading === 'pending') {
      return <View className={styles.loading}>加载�?..</View>;
    }
    
    if (detailLoading === 'failed' || !currentPost) {
      return (
        <EmptyState
          icon={emptyIcon}
          text={error || '加载失败，请稍后再试'}
        />
      );
    }
    
    return (
      <>
        <Post post={currentPost} mode='detail' />
        
        {commentsError ? (
          <View className={styles.errorContainer}>
            <Text className={styles.errorText}>评论加载失败: {commentsError}</Text>
          </View>
        ) : (
          <View className={styles.commentsContainer}>
            <Text className={styles.commentsTitle}>评论 ({comments?.length || 0})</Text>
            {commentsLoading === 'pending' ? (
              <Text>加载评论�?..</Text>
            ) : (
              comments?.map((comment, index) => (
                <View key={comment.id || index} className={styles.commentItem}>
                  <Text className={styles.commentContent}>{comment.content}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </>
    );
  };

  return (
    <View className={styles.postDetailPage}>
      <CustomHeader title='帖子详情' hideBack={false} background='#FFFFFF' />
      <ScrollView scrollY className={styles.scrollView}>
        <View style={{ height: 81 }} />
        <View className={styles.mainContent}>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetailPage;
