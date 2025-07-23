import React, { useEffect } from 'react';
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

const PostDetailPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPost, detailLoading, error } = useSelector((state: RootState) => state.post as PostsState);
  const { comments, loading: commentsLoading, error: commentsError } = useSelector((state: RootState) => state.comment as CommentState);
  
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
          />
        )}
      </>
    );
  };

  return (
    <View className={styles.postDetailPage}>
      <CustomHeader title="帖子详情" hideBack={false} background="#FFFFFF" />
      <ScrollView scrollY className={styles.scrollView}>
        <View style={{ height: 81 }} />
        <View className={styles.mainContent}>
          {renderContent()}
        </View>
      </ScrollView>
      <BottomInput postId={postId} />
    </View>
  );
};

export default PostDetailPage; 