import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import styles from "../index.module.scss";
import ChevronDownIcon from "@/assets/chevron-down.svg";
import ChevronRightIcon from "@/assets/chevron-right.svg";
import HeartIcon from "@/assets/heart-outline.svg";
import HeartActiveIcon from "@/assets/heart-bold.svg";
import { CommentDetail } from "@/types/api/comment";
import { formatRelativeTime } from "@/utils/time";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import actionApi from "@/services/api/action";
import Taro from "@tarojs/taro";
import commentApi from "@/services/api/comment";

interface SubCommentItemProps {
  comment: CommentDetail;
  onReply: (comment: CommentDetail) => void;
  onLikeUpdate: (commentId: number, isLiked: boolean, likeCount: number) => void;
}

const SubCommentItem: React.FC<SubCommentItemProps> = ({ comment, onReply, onLikeUpdate }) => {
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await actionApi.toggleAction({
        target_type: 'comment',
        target_id: comment.id,
        action_type: 'like'
      });
      
      console.log('❤️ 子评论点赞API响应:', response.data, '本地is_liked:', comment.is_liked);
      
      if (response.data) {
        const newIsLiked = response.data.is_active;
        // 根据新状态计算点赞数量
        const currentLikeCount = comment.like_count || 0;
        const newLikeCount = newIsLiked ? (currentLikeCount + 1) : Math.max(0, currentLikeCount - 1);
        onLikeUpdate(comment.id, newIsLiked, newLikeCount);
        
        Taro.showToast({
          title: newIsLiked ? '已点赞' : '已取消点赞',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('❌ 子评论点赞失败:', error);
      Taro.showToast({
        title: '操作失败',
        icon: 'error'
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <View className={styles.subCommentItem}>
      <Image className={styles.subAvatar} src={comment.avatar} />
      <View className={styles.subContent}>
        <View className={styles.subHeader}>
          <Text className={styles.subName}>{comment.nickname}</Text>
          <Text className={styles.subTime}>{formatRelativeTime(comment.create_time)}</Text>
        </View>
        <Text className={styles.subText}>
          {comment.parent_author_nickname ? (
            <>
              <Text className={styles.replyPrefix}>回复{comment.parent_author_nickname}：</Text>
              {comment.content}
            </>
          ) : comment.content}
        </Text>
        <View className={styles.subActions}>
          <View className={styles.subLikeButton} onClick={handleLike}>
            <Image 
              className={styles.subIcon} 
              src={comment.is_liked ? HeartActiveIcon : HeartIcon} 
            />
            <Text>{comment.like_count || 0}</Text>
          </View>
          <View className={styles.subReplyButton} onClick={() => onReply(comment)}>
            <Text>回复</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

interface CommentItemProps {
  comment: CommentDetail;
  onReply: (comment: CommentDetail) => void;
  onLikeUpdate: (commentId: number, isLiked: boolean, likeCount: number) => void;
  onUpdateComment: (commentId: number, updatedComment: CommentDetail) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onLikeUpdate, onUpdateComment }) => {
  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;
  const [isLiking, setIsLiking] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  
  const hasReplies = comment.children && comment.children.length > 0;
  const replyCount = comment.children?.length || 0;
  
  // 如果回复数量<=2，直接显示所有回复，不需要展开按钮
  const shouldShowToggleButton = replyCount > 2;
  const shouldAutoShow = replyCount > 0 && replyCount <= 2;
  
  // 决定显示哪些回复：<=2条全部显示，>2条根据showReplies状态决定
  const repliesToShow = shouldAutoShow 
    ? comment.children || [] 
    : (showReplies 
        ? comment.children || [] 
        : (comment.children || []).slice(0, 2)); // 默认显示前2条

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
      console.log('⚠️ 评论点赞操作正在进行中，忽略重复点击');
      return;
    }
    
    console.log('🔥 开始评论点赞操作:', {
      commentId: comment.id,
      commentContent: comment.content?.substring(0, 20) + '...',
      currentLikeCount: comment.like_count || 0,
      currentIsLiked: comment.is_liked
    });
    
    try {
      setIsLiking(true);
      const response = await actionApi.toggleAction({
        target_type: 'comment',
        target_id: comment.id,
        action_type: 'like'
      });
      
      console.log('❤️ 评论点赞API响应:', response.data, '本地is_liked:', comment.is_liked);
      
      // 更新本地状态
      if (onLikeUpdate) {
        const newIsLiked = response.data.is_active;
        // 根据新状态计算点赞数量
        const currentLikeCount = comment.like_count || 0;
        const newLikeCount = newIsLiked ? (currentLikeCount + 1) : Math.max(0, currentLikeCount - 1);
        onLikeUpdate(comment.id, newIsLiked, newLikeCount);
      }
      
      // 显示操作结果
      Taro.showToast({
        title: response.data.is_active ? '点赞成功' : '已取消点赞',
        icon: 'none',
        duration: 1500
      });
    } catch (error: any) {
      console.error('❌ 评论点赞失败:', error);
      
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
    
    onReply(comment);
  };

  const toggleReplies = async () => {
    // 对于已经有完整children数据的情况，直接切换显示状态
    if (comment.children && comment.children.length === replyCount) {
      setShowReplies(!showReplies);
      return;
    }
    
    // 如果children数据不完整，才需要获取更多数据
    if (!showReplies && hasReplies && shouldShowToggleButton) {
      await fetchAllNestedReplies(comment);
    }
    setShowReplies(!showReplies);
  };

  // 递归获取所有层级的子评论
  const fetchAllNestedReplies = async (parentComment: CommentDetail) => {
    try {
      // 获取第一层子评论
      const response = await commentApi.getCommentReplies({
        comment_id: parentComment.id,
        page: 1,
        page_size: 50
      });
      
      // 修复数据结构处理，判断response是否为数组
      const repliesData = Array.isArray(response) ? response : (response?.data || []);
      
      // 递归获取所有层级的子评论，传入主评论的昵称作为第一层子评论的父昵称
      const allReplies = await fetchAllNestedRepliesRecursive(repliesData, parentComment.nickname);
      
      // 更新本地状态，将获取到的所有回复添加到当前评论的children中
      const updatedComment = {
        ...parentComment,
        children: allReplies
      };
      
      // 通知父组件更新评论数据
      onUpdateComment(parentComment.id, updatedComment);
      
      console.log('🔍 获取到的所有层级回复:', allReplies);
    } catch (error) {
      console.error('❌ 获取子评论回复失败:', error);
      Taro.showToast({
        title: '获取回复失败',
        icon: 'error'
      });
    }
  };

  // 递归获取所有层级的子评论
  const fetchAllNestedRepliesRecursive = async (replies: any[], parentNickname?: string): Promise<any[]> => {
    const allReplies = [...replies];
    
    for (const reply of replies) {
      // 如果当前回复没有parent_author_nickname，使用传入的parentNickname
      if (!reply.parent_author_nickname && parentNickname) {
        reply.parent_author_nickname = parentNickname;
      }
      
      if (reply.reply_count > 0) {
        try {
          // 获取当前回复的子回复
          const nestedResponse = await commentApi.getCommentReplies({
            comment_id: reply.id,
            page: 1,
            page_size: 50
          });
          
          // 修复数据结构处理，判断nestedResponse是否为数组
          const nestedReplies = Array.isArray(nestedResponse) 
            ? nestedResponse 
            : (nestedResponse?.data || []);
          
          // 递归获取更深层级的回复，传入当前回复的昵称作为父昵称
          const deeperReplies = await fetchAllNestedRepliesRecursive(nestedReplies, reply.nickname);
          allReplies.push(...deeperReplies);
        } catch (error) {
          console.error(`❌ 获取评论 ${reply.id} 的子回复失败:`, error);
        }
      }
    }
    
    return allReplies;
  };
  
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
          {shouldShowToggleButton && (
            <View className={styles.toggleRepliesButton} onClick={toggleReplies}>
              <Image 
                src={showReplies ? ChevronDownIcon : ChevronRightIcon} 
                className={styles.toggleIcon} 
              />
              <Text>{showReplies ? '收起' : `查看剩余${replyCount - 2}条回复`}</Text>
            </View>
          )}
        </View>
        
        {/* 子评论区域 */}
        {hasReplies && (shouldAutoShow || shouldShowToggleButton) && (
          <View className={styles.repliesContainer}>
            {repliesToShow.map((reply) => (
              <SubCommentItem 
                key={reply.id} 
                comment={reply} 
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
  onReply: (comment: CommentDetail) => void;
  onLikeUpdate: (commentId: number, isLiked: boolean, likeCount: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onReply, onLikeUpdate }) => {
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
    
    // 先更新本地状态以提供即时反馈
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
    
    // 然后通知父组件重新获取数据以确保状态同步
    if (onLikeUpdate) {
      onLikeUpdate(commentId, isLiked, likeCount);
    }
  };

  // 处理评论更新
  const handleUpdateComment = (commentId: number, updatedComment: CommentDetail) => {
    console.log('🔄 更新评论:', { commentId, updatedComment });
    
    setLocalComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === commentId) {
          return updatedComment;
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
      return (b.like_count || 0) - (a.like_count || 0);
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
      
      {sortedComments.length > 0 ? (
        sortedComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onReply={onReply}
            onLikeUpdate={handleLikeUpdate}
            onUpdateComment={handleUpdateComment}
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
