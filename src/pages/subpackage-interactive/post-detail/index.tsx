import { useEffect, useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPostDetail } from '@/store/slices/postSlice';
import { fetchComments, CommentState } from '@/store/slices/commentSlice';
import { CommentDetail } from '@/types/api/comment';
import CustomHeader from '@/components/custom-header';
import CommentSection from './components/CommentSection';
import BottomInput from './components/BottomInput';
import Post from '@/components/post';
import { addHistoryWithServerSync } from '@/utils/history';
import commentApi from '@/services/api/comment';
import styles from './index.module.scss';

const PostDetailPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const postState = useSelector((state: RootState) => state.post);
  const commentState = useSelector((state: RootState) => state.comment);

  // 从路由参数中获取帖子ID（UUID格式）
  const postId = router.params.id as string;

  // 回复状态管理
  const [replyTo, setReplyTo] = useState<{
    commentId: string; // 修复：改为string以匹配comment.id类型
    nickname: string;
  } | null>(null);

  // 下拉刷新状态
  const [refreshing, setRefreshing] = useState(false);

  // 获取帖子详情
  useEffect(() => {
    if (postId) {
      dispatch(fetchPostDetail(postId));
    }
  }, [postId, dispatch]);

  // 获取评论列表 - 使用树形接口
  useEffect(() => {
    if (postId) {
      dispatch(fetchComments({
        resource_id: postId,
        resource_type: 'post',
        max_depth: 5, // 限制评论树深度
        limit_per_level: 10, // 每层最多10个评论
        limit: 20 // 每次获取20个顶级评论
      }));
    }
  }, [postId, dispatch]);

  // 监听帖子详情变化，添加到浏览历史
  useEffect(() => {
    if (postState?.currentPost) {
      const post = postState.currentPost;
      
      // 记录到本地和服务器
      // 注意：post.id是string类型（UUID），但服务器API需要number类型
      // 这里我们尝试将UUID转换为数字，如果失败则使用一个默认值
      const numericId = parseInt(post.id) || 0;
      
      // 获取头像：优先使用 user.avatar，兼容 author_info.avatar
      const author = post.user || post.author_info;
      const avatarUrl = author?.avatar || '';
      
      // 获取时间：优先使用 created_at，兼容 create_time，如果没有则使用当前时间
      const createTime = post.created_at || post.create_time || new Date().toISOString();
      const viewTime = new Date().toISOString();
      
      // 调试日志
      console.log('📝 记录浏览历史:', {
        postId: post.id,
        title: post.title,
        avatarUrl: avatarUrl,
        createTime: createTime,
        viewTime: viewTime,
        postCreatedAt: post.created_at,
        postCreateTime: post.create_time,
        postData: post
      });
      
      addHistoryWithServerSync(
        {
          id: post.id, // post.id已经是string类型（UUID）
          title: post.title,
          cover: post.image_urls?.[0] || '',
          avatar: avatarUrl,
          createdAt: createTime,
          viewedAt: viewTime
        },
        'post',
        numericId
      );
    }
  }, [postState?.currentPost]);

  // 处理回复评论
  const handleReply = (comment: CommentDetail) => {
    console.log('💬 回复评论:', comment);
    setReplyTo({
      commentId: comment.id,
      nickname: comment.author_nickname || ''
    });
  };

  // 处理点赞状态更新
  const handleLikeUpdate = (commentId: string, isLiked: boolean, likeCount: number) => {
    console.log('🔥 处理点赞状态更新:', { commentId, isLiked, likeCount });
    
    // 重新获取评论列表以同步状态
    if (postId) {
      console.log('🔄 重新获取评论列表以同步点赞状态');
      dispatch(fetchComments({
        resource_id: postId,
        resource_type: 'post',
        max_depth: 5,
        limit_per_level: 10,
        limit: 20
      }));
    }
  };

  // 处理删除评论
  const handleDeleteComment = async (commentId: string) => {
    console.log('🗑️ 处理删除评论:', commentId);

    try {
      // 显示确认对话框
      const res = await new Promise<boolean>((resolve) => {
        Taro.showModal({
          title: '确认删除',
          content: '确定要删除这条评论吗？',
          success: (result) => {
            resolve(result.confirm);
          },
          fail: () => {
            resolve(false);
          }
        });
      });

      if (!res) {
        console.log('用户取消删除');
        return;
      }

      // 显示加载提示
      Taro.showLoading({
        title: '删除中...'
      });

      // 调用删除API
      await commentApi.deleteComment(commentId);

      // 隐藏加载提示
      Taro.hideLoading();

      // 显示成功提示
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      });

      // 重新获取评论列表
      if (postId) {
        console.log('🔄 重新获取评论列表');
        dispatch(fetchComments({
          resource_id: postId,
          resource_type: 'post',
          max_depth: 5,
          limit_per_level: 10,
          limit: 20
        }));
      }

    } catch (error: any) {
      console.error('❌ 删除评论失败:', error);

      // 隐藏加载提示
      Taro.hideLoading();

      // 显示错误提示
      Taro.showToast({
        title: error.message || '删除失败，请重试',
        icon: 'error'
      });
    }
  };

  // 处理下拉刷新
  const handleRefresh = async () => {
    if (!postId || refreshing) return;
    
    console.log('🔄 开始下拉刷新帖子详情');
    setRefreshing(true);
    
    try {
      // 同时刷新帖子详情和评论列表
      await Promise.all([
        dispatch(fetchPostDetail(postId)),
        dispatch(fetchComments({
          resource_id: postId,
          resource_type: 'post',
          max_depth: 5,
          limit_per_level: 10,
          limit: 20
        }))
      ]);
      console.log('✅ 下拉刷新完成');
    } catch (error) {
      console.error('❌ 下拉刷新失败:', error);
    } finally {
      setRefreshing(false);
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
        <Post post={postState.currentPost} mode="detail" />
        
        <CommentSection
          comments={commentState?.comments || []}
          onReply={handleReply}
          onLikeUpdate={handleLikeUpdate}
          onDeleteComment={handleDeleteComment}
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
          refresherEnabled
          refresherTriggered={refreshing}
          onRefresherRefresh={handleRefresh}
        >
          <View className={styles.mainContent}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
      
      {/* 固定在底部的输入框 */}
      <View className={styles.fixedBottomInput}>
        <BottomInput
          postId={postId || ''}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          allowComments={postState?.currentPost?.allow_comments !== false}
        />
      </View>
    </View>
  );
};

export default PostDetailPage;