import { useEffect, useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchPostDetail } from '@/store/slices/postSlice';
import { fetchComments } from '@/store/slices/commentSlice';
import { CommentDetail } from '@/types/api/comment';
import CustomHeader from '@/components/custom-header';
import Post from '@/components/post';
import { addHistoryWithServerSync } from '@/utils/history';
import commentApi from '@/services/api/comment';
import CommentSection from './components/CommentSection';
import BottomInput from './components/BottomInput';
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
    replyToNickname?: string; // 被回复用户的昵称
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
      // console.log('📝 记录浏览历史:', {
      //   postId: post.id,
      //   title: post.title,
      //   avatarUrl: avatarUrl,
      //   createTime: createTime,
      //   viewTime: viewTime,
      //   postCreatedAt: post.created_at,
      //   postCreateTime: post.create_time,
      //   postData: post
      // });
      
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
    
    
    // 查找顶级父评论ID的辅助函数
    const findRootCommentId = (targetComment: CommentDetail): string => {
      // 如果comment有root_id，说明它是子评论，返回root_id
      if (targetComment.root_id) {
        return targetComment.root_id;
      }
      
      // 如果comment没有root_id，需要在评论树中查找它的顶级父评论
      const findInComments = (comments: CommentDetail[], targetId: string): string | null => {
        for (const c of comments) {
          // 如果在顶级评论中找到，说明它就是顶级评论
          if (c.id === targetId) {
            return c.id;
          }
          // 在子评论中查找
          if (c.children && c.children.length > 0) {
            const found = findInChildren(c.children, targetId, c.id);
            if (found) return found;
          }
        }
        return null;
      };
      
      const findInChildren = (children: CommentDetail[], targetId: string, rootId: string): string | null => {
        for (const child of children) {
          if (child.id === targetId) {
            return rootId; // 返回顶级评论ID
          }
          if (child.children && child.children.length > 0) {
            const found = findInChildren(child.children, targetId, rootId);
            if (found) return found;
          }
        }
        return null;
      };
      
      const rootId = findInComments(commentState?.comments || [], targetComment.id);
      return rootId || targetComment.id; // 如果找不到，默认返回自己的ID
    };
    
    const rootCommentId = findRootCommentId(comment);
    
    setReplyTo({
      commentId: rootCommentId, // 使用顶级父评论ID作为parent_id
      nickname: comment.author_nickname || '',
      replyToNickname: comment.author_nickname || '' // 保存被回复用户的昵称
    });
  };

  // 处理点赞状态更新
  const handleLikeUpdate = (_commentId: string, _isLiked: boolean, _likeCount: number) => {
    
    
    // 重新获取评论列表以同步状态
    if (postId) {
      
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

      // 移除成功提示弹窗

      // 重新获取评论列表
      if (postId) {
        
        dispatch(fetchComments({
          resource_id: postId,
          resource_type: 'post',
          max_depth: 5,
          limit_per_level: 10,
          limit: 20
        }));
      }

    } catch (error: any) {
      

      // 隐藏加载提示
      Taro.hideLoading();

      // 移除错误提示弹窗
    }
  };

  // 处理下拉刷新
  const handleRefresh = async () => {
    if (!postId || refreshing) return;
    
    
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
      
    } catch (error) {
      
    } finally {
      setRefreshing(false);
    }
  };

  // 渲染内容
  const renderContent = () => {
    // console.log('🔍 渲染内容状态:', {
    //   postState,
    //   commentState,
    //   postId,
    //   detailLoading: postState?.detailLoading,
    //   currentPost: postState?.currentPost,
    //   comments: commentState?.comments
    // });

    // 正在加载中，显示加载状态
    if (postState?.detailLoading === 'pending') {
      return <View className={styles.loading}>加载中...</View>;
    }

    // 加载失败，显示错误信息
    if (postState?.detailLoading === 'failed' || postState?.error) {
      return <View className={styles.error}>加载失败: {postState.error}</View>;
    }

    // 加载完成（成功或失败）后，如果 currentPost 为空，则显示帖子不存在
    // 只有在加载完成后才判断帖子是否存在，避免首次加载时的闪烁问题
    if (postState?.detailLoading === 'succeeded' && !postState?.currentPost) {
      return <View className={styles.error}>帖子不存在</View>;
    }

    // 加载成功且帖子存在，显示帖子内容
    if (postState?.detailLoading === 'succeeded' && postState?.currentPost) {
      return (
        <>
          <Post post={postState.currentPost} mode='detail' />

          <CommentSection
            comments={commentState?.comments || []}
            onReply={handleReply}
            onLikeUpdate={handleLikeUpdate}
            onDeleteComment={handleDeleteComment}
          />
        </>
      );
    }

    // 默认情况下显示加载中（处理初始状态）
    return <View className={styles.loading}>加载中...</View>;
  };

  return (
    <View className={styles.postDetailPage}>
      <CustomHeader title='帖子详情' hideBack={false} background='#FFFFFF' />
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
          postTitle={postState?.currentPost?.title}
          postAuthorId={postState?.currentPost?.user?.id || postState?.currentPost?.author_info?.id}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          allowComments={postState?.currentPost?.allow_comments !== false}
        />
      </View>
    </View>
  );
};

export default PostDetailPage;
