import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import { useSelector } from "react-redux";
import Taro from "@tarojs/taro";

import { CommentDetail } from "@/types/api/comment.d";
import { formatRelativeTime } from "@/utils/time";
import { normalizeImageUrl } from "@/utils/image";
import { RootState } from "@/store";
import actionApi from "@/services/api/action";
import ChevronDownIcon from "@/assets/chevron-down.svg";
import ChevronRightIcon from "@/assets/chevron-right.svg";
import HeartIcon from "@/assets/heart-outline.svg";
import HeartActiveIcon from "@/assets/heart-bold.svg";
import TrashIcon from "@/assets/trash.svg";

import styles from "../index.module.scss";

interface SubCommentItemProps {
  comment: CommentDetail;
  onReply: (comment: CommentDetail) => void;
  onLikeUpdate: (commentId: string, isLiked: boolean, likeCount: number) => void;
  onDeleteComment?: (commentId: string) => void;
}

const SubCommentItem: React.FC<SubCommentItemProps> = ({ comment, onReply, onLikeUpdate, onDeleteComment }) => {
  const [isLiking, setIsLiking] = useState(false);
  const userState = useSelector((state: RootState) => state.user);
  const isCommentAuthor = userState?.currentUser?.user_id === comment.user_id;

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
        // 根据新状态计算点赞数量，确保不会出现负数
        const currentLikeCount = comment.like_count || 0;
        const newLikeCount = newIsLiked ? (currentLikeCount + 1) : Math.max(0, currentLikeCount - 1);
        onLikeUpdate(comment.id, newIsLiked, newLikeCount);
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
      <Image className={styles.subAvatar} src={normalizeImageUrl(comment.author_avatar) || ''} />
      <View className={styles.subContent}>
        <View className={styles.subHeader}>
          <Text className={styles.subName}>{comment.author_nickname}</Text>
          <Text className={styles.subTime}>{formatRelativeTime(comment.create_at || (comment as any).created_at || '')}</Text>
          {/* 子评论删除按钮 - 仅作者可见 */}
          {isCommentAuthor && onDeleteComment ? (
            <View className={styles.subDeleteButton} onClick={() => onDeleteComment(comment.id)}>
              <Image src={TrashIcon} className={styles.subDeleteIcon} />
            </View>
          ) : null}
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
  onLikeUpdate: (commentId: string, isLiked: boolean, likeCount: number) => void;
  onUpdateComment: (commentId: string, updatedComment: CommentDetail) => void;
  onDeleteComment?: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, onLikeUpdate, onUpdateComment, onDeleteComment }) => {
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
        // 根据新状态计算点赞数量，确保不会出现负数
        const currentLikeCount = comment.like_count || 0;
        const newLikeCount = newIsLiked ? (currentLikeCount + 1) : Math.max(0, currentLikeCount - 1);
        onLikeUpdate(comment.id, newIsLiked, newLikeCount);
      }
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
      // 获取第一层子评论 - 暂时返回空数组，因为API尚未实现
      const response = { data: [] };
      
      // 修复数据结构处理，判断response是否为数组
      const repliesData = Array.isArray(response) ? response : (response?.data || []);
      
      // 标准化字段：author_nickname / author_avatar / create_at
      const normalizedReplies = (repliesData || []).map((r: any) => ({
        ...r,
        author_nickname: r?.author_nickname ?? r?.user?.nickname ?? r?.user?.name ?? '',
        author_avatar: r?.author_avatar ?? r?.avatar ?? r?.user?.avatar ?? '',
        create_at: r?.create_at || r?.created_at || r?.create_time || r?.update_time || ''
      }));
      
      // 递归获取所有层级的子评论，传入主评论的昵称作为第一层子评论的父昵称
      const allReplies = await fetchAllNestedRepliesRecursive(normalizedReplies, parentComment.author_nickname);
      
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
  const fetchAllNestedRepliesRecursive = async (replies: any[], parentauthor_nickname?: string): Promise<any[]> => {
    const allReplies = [...replies];
    
    for (const reply of replies) {
      // 如果当前回复没有parent_author_author_nickname，使用传入的parentauthor_nickname
      if (!reply.parent_author_author_nickname && parentauthor_nickname) {
        reply.parent_author_author_nickname = parentauthor_nickname;
      }
      
      if (reply.reply_count > 0) {
        try {
          // 获取当前回复的子回复 - 暂时返回空数组，因为API尚未实现
          const nestedResponse = { data: [] };
          
          // 修复数据结构处理，判断nestedResponse是否为数组
          const rawNested = Array.isArray(nestedResponse) 
            ? nestedResponse 
            : (nestedResponse?.data || []);
          
          // 标准化子层回复的关键字段
          const nestedReplies = (rawNested || []).map((r: any) => ({
            ...r,
            author_nickname: r?.author_nickname ?? r?.user?.nickname ?? r?.user?.name ?? '',
            author_avatar: r?.author_avatar ?? r?.avatar ?? r?.user?.avatar ?? '',
            create_at: r?.create_at || r?.created_at || r?.create_time || r?.update_time || ''
          }));
          
          // 递归获取更深层级的回复，传入当前回复的昵称作为父昵称
          const deeperReplies = await fetchAllNestedRepliesRecursive(nestedReplies, reply.author_nickname);
          allReplies.push(...deeperReplies);
        } catch (error) {
          console.error(`❌ 获取评论 ${reply.id} 的子回复失败:`, error);
        }
      }
    }
    
    return allReplies;
  };
  
  // 检查当前用户是否为评论作者
  const isCommentAuthor = userState?.currentUser?.user_id === comment.user_id;

  return (
  <View className={styles.commentItem}>
      <Image src={normalizeImageUrl(comment.author_avatar) || ''} className={styles.avatar} />
    <View className={styles.content}>
      <View className={styles.header}>
        <Text className={styles.name}>{comment?.author_nickname || '匿名用户'}</Text>
        <Text className={styles.time}>{formatRelativeTime(comment.create_at || (comment as any).created_at || '')}</Text>
        {/* 删除按钮 - 仅作者可见 */}
        {isCommentAuthor && onDeleteComment && (
          <View className={styles.deleteButton} onClick={() => onDeleteComment(comment.id)}>
            <Image src={TrashIcon} className={styles.deleteIcon} />
          </View>
        )}
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
                onDeleteComment={onDeleteComment}
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
  onLikeUpdate: (commentId: string, isLiked: boolean, likeCount: number) => void;
  onDeleteComment?: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onReply, onLikeUpdate, onDeleteComment }) => {
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
  const handleLikeUpdate = (commentId: string, isLiked: boolean, likeCount: number) => {
    console.log('🔥 处理点赞状态更新:', { commentId, isLiked, likeCount });
    
    // 先更新本地状态以提供即时反馈
    setLocalComments(prevComments => {
      return prevComments.map(comment => {
        // 检查是否是主评论
        if (String(comment.id) === String(commentId)) {
          console.log('✅ 更新主评论点赞状态:', comment.author_nickname);
          return { ...comment, is_liked: isLiked, like_count: likeCount };
        }
        
        // 检查子评论
        if (comment.children && comment.children.length > 0) {
          const updatedChildren = comment.children.map(child => {
            if (String(child.id) === String(commentId)) {
              console.log('✅ 更新子评论点赞状态:', child.author_nickname);
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
  const handleUpdateComment = (commentId: string, updatedComment: CommentDetail) => {
    console.log('🔄 更新评论:', { commentId, updatedComment });
    
    setLocalComments(prevComments => {
      return prevComments.map(comment => {
        if (String(comment.id) === String(commentId)) {
          return updatedComment;
        }
        return comment;
      });
    });
  };
  
  // 根据排序方式对评论进行排序
  const sortedComments = [...localComments].sort((a, b) => {
    if (sortBy === 'time') {
      const bTime = (b.create_at || (b as any).created_at) ? new Date((b.create_at || (b as any).created_at) as string).getTime() : 0;
      const aTime = (a.create_at || (a as any).created_at) ? new Date((a.create_at || (a as any).created_at) as string).getTime() : 0;
      return bTime - aTime;
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
            onDeleteComment={onDeleteComment}
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
