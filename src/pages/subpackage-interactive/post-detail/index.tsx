import React, { useEffect } from 'react';
import { View, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import CustomHeader from '@/components/custom-header';
import styles from './index.module.scss';
import PostDetailContent from './components/PostDetailContent';
import CommentSection from './components/CommentSection';
import BottomInput from './components/BottomInput';
import { fetchPostDetail } from '@/store/slices/postSlice';
import { AppDispatch, RootState } from '@/store';
import EmptyState from '@/components/empty-state';
import emptyIcon from '@/assets/empty.svg';

const PostDetailPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentPost, detailLoading, error } = useSelector((state: RootState) => state.post);
  
  // 从路由参数中获取帖子ID
  const postId = Number(router.params.id);
  
  useEffect(() => {
    if (postId) {
      dispatch(fetchPostDetail(postId));
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
        <CommentSection comments={currentPost.comments || []} />
      </>
    );
  };

  return (
    <View className={styles.postDetailPage}>
      <CustomHeader title="帖子详情" hideBack={false} background="#FFFFFF" />
      <ScrollView scrollY className={styles.scrollView}>
        <View className={styles.mainContent}>
          {renderContent()}
        </View>
      </ScrollView>
      <BottomInput postId={postId} />
    </View>
  );
};

export default PostDetailPage; 