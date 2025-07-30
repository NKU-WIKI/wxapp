import { useEffect, useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchComments } from '@/store/slices/commentSlice';
import { fetchPostDetail } from '@/store/slices/postSlice';
import { useRouter } from '@tarojs/taro';
import CustomHeader from '@/components/custom-header';
import CommentSection from './components/CommentSection';
import PostDetailContent from './components/PostDetailContent';
import BottomInput from './components/BottomInput';
import styles from './index.module.scss';
import { CommentDetail } from '@/types/api/comment';

const PostDetailPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const postState = useSelector((state: RootState) => state.post);
  const commentState = useSelector((state: RootState) => state.comment);

  // 从路由参数中获取帖子ID
  const postId = Number(router.params.id);

  // 回复状态管理
  const [replyTo, setReplyTo] = useState<{
    commentId: number;
    nickname: string;
  } | null>(null);

  // 获取帖子详情
  useEffect(() => {
    if (postId) {
      dispatch(fetchPostDetail(postId));
    }
  }, [postId, dispatch]);

  // 获取评论列表
  useEffect(() => {
    if (postId) {
      dispatch(fetchComments({ resource_id: postId, resource_type: 'post' }));
    }
  }, [postId, dispatch]);

  // 处理回复评论
  const handleReply = (comment: CommentDetail) => {
    console.log('💬 回复评论:', comment);
    setReplyTo({
      commentId: comment.id,
      nickname: comment.nickname
    });
  };

  // 处理点赞状态更新
  const handleLikeUpdate = (commentId: number, isLiked: boolean, likeCount: number) => {
    console.log('🔥 处理点赞状态更新:', { commentId, isLiked, likeCount });
    
    // 重新获取评论列表以同步状态
    if (postId) {
      console.log('🔄 重新获取评论列表以同步点赞状态');
      dispatch(fetchComments({ resource_id: postId, resource_type: 'post' }));
    }
  };

  // 渲染内容
  const renderContent = () => {
    console.log('🔍 渲染内容状态:', {
      postState,
      commentState,
      postId,
      detailLoading: postState?.detailLoading,
      currentPost: postState?.currentPost,
      comments: commentState?.comments
    });

    if (postState?.detailLoading === 'pending') {
      return <View className={styles.loading}>加载中...</View>;
    }

    if (postState?.detailLoading === 'failed' || postState?.error) {
      return <View className={styles.error}>加载失败: {postState.error}</View>;
    }

    if (!postState?.currentPost) {
      return <View className={styles.error}>帖子不存在</View>;
    }

    return (
      <>
        <PostDetailContent post={postState.currentPost} />
        
        <CommentSection 
          comments={commentState?.comments || []} 
          onReply={handleReply}
          onLikeUpdate={handleLikeUpdate}
        />
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
      
      {/* 固定在底部的输入框 */}
      <View className={styles.fixedBottomInput}>
        <BottomInput 
          postId={postId}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </View>
    </View>
  );
};

export default PostDetailPage; 