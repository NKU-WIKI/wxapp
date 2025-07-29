import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';
import PostDetailContent from './components/PostDetailContent';
import CommentSection from './components/CommentSection';
import BottomInput from './components/BottomInput';
import { fetchPostDetail } from '@/store/slices/postSlice';
import { fetchComments } from '@/store/slices/commentSlice';
import { AppDispatch, RootState } from '@/store';
import EmptyState from '@/components/empty-state';
import emptyIcon from '@/assets/empty.svg';
import { PostsState } from '@/store/slices/postSlice';
import { CommentState } from '@/store/slices/commentSlice';
import { addHistory } from '@/utils/history';

const PostDetailPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPost, detailLoading, error } = useSelector((state: RootState) => state.post as PostsState);
  const { comments, loading: commentsLoading, error: commentsError } = useSelector((state: RootState) => state.comment as CommentState);
  
  // 回复状态管理
  const [replyTo, setReplyTo] = useState<{
    commentId: number;
    nickname: string;
  } | null>(null);
  
  // 从路由参数中获取帖子ID
  const postId = Number(router.params.id);
  
  useEffect(() => {
    if (postId) {
      // 获取帖子详情
      dispatch(fetchPostDetail(postId));
      
      // 获取帖子评论
      dispatch(fetchComments({
        resource_id: postId,
        resource_type: 'post'
      }));
    }
  }, [dispatch, postId]);
  
  // 自动存储浏览历史（currentPost 加载后执行）
  useEffect(() => {
    if (currentPost && currentPost.id === postId) {
      addHistory({
        id: String(currentPost.id),
        title: currentPost.title,
        cover: currentPost.image_urls && currentPost.image_urls.length > 0 ? currentPost.image_urls[0] : '',
        avatar: currentPost.author_info?.avatar || '',
        createdAt: currentPost.create_time,
        viewedAt: new Date().toISOString(),
        link: `/pages/subpackage-interactive/post-detail/index?id=${currentPost.id}`
      });
    }
  }, [currentPost, postId]);
  
  // 处理回复操作
  const handleReply = (commentId: number, nickname: string) => {
    setReplyTo({
      commentId,
      nickname
    });
  };
  
  // 取消回复
  const handleCancelReply = () => {
    setReplyTo(null);
  };
  
  const renderContent = () => {
    if (detailLoading === 'pending') {
      return <View className={styles.loading}>加载中...</View>;
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
        <PostDetailContent post={currentPost} />
        
        {commentsError ? (
          <View className={styles.errorContainer}>
            <Text className={styles.errorText}>评论加载失败: {commentsError}</Text>
          </View>
        ) : (
          <CommentSection 
            comments={comments || []} 
            postId={currentPost.id} 
            loading={commentsLoading === 'pending'}
            onReply={handleReply}
          />
        )}
      </>
    );
  };

  return (
    <View className={styles.postDetailPage}>
      <CustomHeader title="帖子详情" hideBack={false} background="#FFFFFF" />
      <View className={styles.contentWrapper}>
        <ScrollView 
          scrollY 
          className={styles.scrollView}
        >
          <View className={styles.mainContent}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
      <BottomInput 
        postId={postId} 
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
      />
    </View>
  );
};

export default PostDetailPage; 