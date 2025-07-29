import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import styles from "../index.module.scss";
import ChevronDownIcon from "@/assets/chevron-down.svg";
import ChevronRightIcon from "@/assets/chevron-right.svg";
import HeartIcon from "@/assets/heart-outline.svg";
import HeartActiveIcon from "@/assets/heart-bold.svg";
import { CommentDetail } from "@/types/api/comment";
import { formatRelativeTime } from "@/utils/time";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import actionApi from "@/services/api/action";
import Taro from "@tarojs/taro";

interface SubCommentItemProps {
  comment: CommentDetail;
  postId: number;
  onReply?: (commentId: number, nickname: string) => void;
  onLikeUpdate?: (commentId: number, isLiked: boolean, likeCount: number) => void;
}

const SubCommentItem: React.FC<SubCommentItemProps> = ({ comment, postId, onReply, onLikeUpdate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;
  const [isLiking, setIsLiking] = useState(false);
  
  const handleLike = async () => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }
    
    if (isLiking) {
      console.log('⚠️ 子评论点赞操作正在进行中，忽略重复点击');
      return;
    }
    
    console.log('🔥 开始子评论点赞操作:', {
      commentId: comment.id,
      commentContent: comment.content?.substring(0, 20) + '...',
      currentLikeCount: comment.like_count,
      currentIsLiked: comment.is_liked
    });
    
    try {
      setIsLiking(true);
      const response = await actionApi.toggleAction({
        target_type: 'comment',
        target_id: comment.id,
        action_type: 'like'
      });
      
      console.log('❤️ 子评论点赞API响应:', response.data, '本地is_liked:', comment.is_liked);
      
      // 更新本地状态
      if (onLikeUpdate) {
        onLikeUpdate(comment.id, response.data.is_active, response.data.count);
      }
      
      // 显示操作结果
      Taro.showToast({
        title: response.data.is_active ? '点赞成功' : '已取消点赞',
        icon: 'none',
        duration: 1500
      });
    } catch (error: any) {
      console.error('❌ 子评论点赞失败:', error);
      
      // 根据错误类型显示不同的提示
      if (error.statusCode === 401) {
        Taro.showModal({
          title: '登录已过期',
          content: '请重新登录后重试',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
            }
          }
        });
      } else {
        Taro.showToast({
          title: error.message || '操作失败，请重试',
          icon: 'error'
        });
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = () => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }
    
    if (onReply) {
      onReply(comment.id, comment.nickname);
    }
  };
  
  return (
    <View className={styles.subCommentItem}>
      <Image src={comment.avatar || ''} className={styles.subAvatar} />
      <View className={styles.subContent}>
        <View className={styles.subHeader}>
          <Text className={styles.subName}>{comment?.nickname || '匿名用户'}</Text>
          <Text className={styles.subTime}>{formatRelativeTime(comment.create_time)}</Text>
        </View>
        <Text className={styles.subText}>
          {comment.parent_author_nickname ? (
            <>
              <Text className={styles.replyPrefix}>回复{comment.parent_nickname}：</Text>
              {comment.content}
            </>
          ) : comment.content}
        </Text>
        <View className={styles.subActions}>
          <View className={styles.subLikeButton} onClick={handleLike}>
            <Image 
              src={comment.is_liked ? HeartActiveIcon : HeartIcon} 
              className={styles.subIcon} 
            />
            <Text>{comment?.like_count || 0}</Text>
          </View>
          <View className={styles.subReplyButton} onClick={handleReply}>
            <Text>回复</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface CommentItemProps {
  comment: CommentDetail;
  postId: number;
  onReply?: (commentId: number, nickname: string) => void;
  onLikeUpdate?: (commentId: number, isLiked: boolean, likeCount: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, onReply, onLikeUpdate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;
  const [showReplies, setShowReplies] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  const handleLike = async () => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }
    
    if (isLiking) return;
    
    try {
      setIsLiking(true);
      const response = await actionApi.toggleAction({
        target_type: 'comment',
        target_id: comment.id,
        action_type: 'like'
      });
      
      // 更新本地状态
      if (onLikeUpdate) {
        onLikeUpdate(comment.id, response.data.is_active, response.data.count);
      }
    } catch (error) {
      console.error('评论点赞失败:', error);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'error'
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = () => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }
    
    if (onReply) {
      onReply(comment.id, comment.nickname);
    }
  };
  
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const hasReplies = comment.children && comment.children.length > 0;
  
  return (
    <View className={styles.commentItem}>
      <Image src={comment.avatar || ''} className={styles.avatar} />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{comment?.nickname || '匿名用户'}</Text>
          <Text className={styles.time}>{formatRelativeTime(comment.create_time)}</Text>
        </View>
        <Text className={styles.text}>{comment?.content}</Text>
        <View className={styles.actions}>
          <View className={styles.likeButton} onClick={handleLike}>
            <Image 
              src={comment.is_liked ? HeartActiveIcon : HeartIcon} 
              className={styles.icon} 
            />
            <Text>{comment?.like_count || 0}</Text>
          </View>
          <View className={styles.replyButton} onClick={handleReply}>
            <Text>回复</Text>
          </View>
          {hasReplies && (
            <View className={styles.toggleRepliesButton} onClick={toggleReplies}>
              <Image 
                src={showReplies ? ChevronDownIcon : ChevronRightIcon} 
                className={styles.toggleIcon} 
              />
              <Text>{showReplies ? '收起' : `${comment.reply_count}条回复`}</Text>
            </View>
          )}
        </View>
        
        {/* 子评论区域 */}
        {hasReplies && showReplies && (
          <View className={styles.repliesContainer}>
            {comment.children!.map((reply) => (
              <SubCommentItem 
                key={reply.id} 
                comment={reply} 
                postId={postId} 
                onReply={onReply}
                onLikeUpdate={onLikeUpdate}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

interface CommentSectionProps {
  comments: CommentDetail[];
  postId: number;
  loading?: boolean;
  onReply?: (commentId: number, nickname: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId, loading = false, onReply }) => {
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time');
  const [localComments, setLocalComments] = useState<CommentDetail[]>([]);
  
  // 同步外部评论数据到本地状态
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);
  
  // 添加调试日志
  useEffect(() => {
    console.log('评论数据:', localComments);
  }, [localComments]);
  
  // 处理点赞状态更新
  const handleLikeUpdate = (commentId: number, isLiked: boolean, likeCount: number) => {
    console.log('🔥 处理点赞状态更新:', { commentId, isLiked, likeCount });
    
    setLocalComments(prevComments => {
      return prevComments.map(comment => {
        // 检查是否是主评论
        if (comment.id === commentId) {
          console.log('✅ 更新主评论点赞状态:', comment.nickname);
          return { ...comment, is_liked: isLiked, like_count: likeCount };
        }
        
        // 检查子评论
        if (comment.children && comment.children.length > 0) {
          const updatedChildren = comment.children.map(child => {
            if (child.id === commentId) {
              console.log('✅ 更新子评论点赞状态:', child.nickname);
              return { ...child, is_liked: isLiked, like_count: likeCount };
            }
            return child;
          });
          
          // 只有当子评论确实被更新时才返回新对象
          if (updatedChildren.some((child, index) => child !== comment.children![index])) {
            return { ...comment, children: updatedChildren };
          }
        }
        
        return comment;
      });
    });
  };
  
  // 根据排序方式对评论进行排序
  const sortedComments = [...localComments].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
    } else {
      return b.like_count - a.like_count;
    }
  });
  
  // 切换排序方式
  const toggleSort = () => {
    setSortBy(sortBy === 'time' ? 'likes' : 'time');
  };

  return (
    <View className={styles.commentsSection}>
      <View className={styles.header}>
        <Text className={styles.title}>评论 ({localComments.length})</Text>
        <View className={styles.sort} onClick={toggleSort}>
          <Text>{sortBy === 'time' ? '时间' : '热度'}</Text>
          <Image src={ChevronDownIcon} className={styles.icon} />
        </View>
      </View>
      
      {loading ? (
        <View className={styles.loading}>加载评论中...</View>
      ) : sortedComments.length > 0 ? (
        sortedComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            postId={postId} 
            onReply={onReply}
            onLikeUpdate={handleLikeUpdate}
          />
        ))
      ) : (
        <View className={styles.emptyComments}>
          <Text>暂无评论，快来发表第一条评论吧</Text>
        </View>
      )}
    </View>
  );
};

export default CommentSection;
