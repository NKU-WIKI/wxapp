import React, { useState, useEffect } from "react";
import { View, Text, Image, Input } from "@tarojs/components";
import { useSelector, useDispatch } from "react-redux";
import Taro from "@tarojs/taro";

import { CommentDetail } from "@/types/api/comment";
import { AppDispatch, RootState } from "@/store";
import { createComment } from '@/store/slices/commentSlice';
import actionApi from "@/services/api/action";
import commentApi from "@/services/api/comment";
import AuthorInfo from "@/components/author-info";
import { ActionButtonProps } from '@/components/action-button';
import ActionBar from '@/components/action-bar';

import ChevronDownIcon from "@/assets/chevron-down.svg";
import ChevronRightIcon from "@/assets/chevron-right.svg";
import HeartIcon from "@/assets/heart-outline.svg";
import HeartActiveIcon from "@/assets/heart-bold.svg";
import CloseIcon from '@/assets/x.svg';
import SendIcon from '@/assets/sendcomment.svg';


import styles from "./index.module.scss";

// 渲染带有@用户名高亮的评论内容
const renderCommentContent = (content: string): React.ReactNode => {
  // 正则表达式匹配 @用户名 格式（用户名可以包含中文、英文、数字、下划线）
  const mentionRegex = /@([\u4e00-\u9fa5\w]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // 添加@之前的普通文本
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`text-${lastIndex}`}>
          {content.slice(lastIndex, match.index)}
        </Text>
      );
    }
    
    // 添加高亮的@用户名
    parts.push(
      <Text key={`mention-${match.index}`} className={styles.mentionText}>
        {match[0]}
      </Text>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余的普通文本
  if (lastIndex < content.length) {
    parts.push(
      <Text key={`text-${lastIndex}`}>
        {content.slice(lastIndex)}
      </Text>
    );
  }
  
  return parts.length > 0 ? parts : <Text>{content}</Text>;
};

// ## SubCommentItem Component ##
interface SubCommentItemProps {
  comment: CommentDetail;
  onReply: (_comment: CommentDetail) => void;
  onLikeUpdate: (_commentId: string, _isLiked: boolean, _likeCount: number) => void;
  onDeleteComment?: (_commentId: string) => Promise<void> | void;
}

const SubCommentItem: React.FC<SubCommentItemProps> = ({ comment: _comment, onReply, onLikeUpdate, onDeleteComment: _onDeleteComment }) => {
  const [isLiking, setIsLiking] = useState(false);
  const userState = useSelector((state: RootState) => state.user);
  const isCommentAuthor = userState?.user?.id === _comment.user_id;

  const handleMoreClick = async () => {
    if (_onDeleteComment) {
      await _onDeleteComment(_comment.id);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await actionApi.toggleAction({
        target_type: 'comment',
        target_id: _comment.id,
        action_type: 'like'
      });
      
      if (response.data) {
        const newIsLiked = response.data.is_active;
        const currentLikeCount = _comment.like_count || 0;
        const newLikeCount = newIsLiked ? (currentLikeCount + 1) : Math.max(0, currentLikeCount - 1);
        onLikeUpdate(_comment.id, newIsLiked, newLikeCount);
      }
    } catch (error) {
      // 静默处理错误
    } finally {
      setIsLiking(false);
    }
  };

  const actionBarButtons: ActionButtonProps[] = [
    {
      icon: HeartIcon,
      activeIcon: HeartActiveIcon,
      text: _comment.like_count || 0,
      isActive: _comment.has_liked,
      onClick: handleLike,
      iconClassName: styles.subIcon,
      textClassName: _comment.has_liked ? styles.activeText : '',
    },
    {
      icon: '/assets/message-circle.svg',
      text: _comment.reply_count || 0,
      onClick: () => onReply(_comment),
      iconClassName: styles.subIcon,
    }
  ];

  return (
    <View className={styles.subCommentItem}>
      <AuthorInfo
        userId={_comment.user_id}
        mode='compact'
        showFollowButton={false}
        showStats={false}
        showLevel
        showTime
        createTime={_comment.create_at || (_comment as any).created_at || ''}
        showMoreButton={isCommentAuthor && !!_onDeleteComment}
        onMoreClick={handleMoreClick}
      />
      <View className={styles.subContent}>
        <Text className={styles.subText}>{renderCommentContent(_comment.content)}</Text>
        <ActionBar buttons={actionBarButtons} className={styles.subActions} />
      </View>
    </View>
  );
};

// ## CommentItem Component ##
interface CommentItemProps {
  comment: CommentDetail;
  onReply: (_comment: CommentDetail) => void;
  onLikeUpdate: (_commentId: string, _isLiked: boolean, _likeCount: number) => void;
  onUpdateComment: (_commentId: string, _updatedComment: CommentDetail) => void;
  onDeleteComment: (_commentId: string) => Promise<void> | void;
  onSubReply?: (_comment: CommentDetail) => void;
  onSubLikeUpdate?: (_commentId: string, _isLiked: boolean, _likeCount: number) => void;
  onSubDeleteComment?: (_commentId: string) => Promise<void> | void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment: _comment,
  onReply,
  onLikeUpdate,
  onUpdateComment: _onUpdateComment,
  onDeleteComment: _onDeleteComment,
  onSubReply,
  onSubLikeUpdate,
  onSubDeleteComment
}) => {
  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;
  const [isLiking, setIsLiking] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const handleMoreClick = async () => {
    if (_onDeleteComment) {
      await _onDeleteComment(_comment.id);
    }
  };

  const hasReplies = _comment.children && _comment.children.length > 0;
  const replyCount = _comment.children?.length || 0;
  
  const shouldShowToggleButton = replyCount > 2;
  const shouldAutoShow = replyCount > 0 && replyCount <= 2;
  
  const repliesToShow = shouldAutoShow 
    ? _comment.children || [] 
    : (showReplies 
        ? _comment.children || [] 
        : (_comment.children || []).slice(0, 2));

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
        target_id: _comment.id,
        action_type: 'like'
      });
      
      if (onLikeUpdate) {
        const newIsLiked = response.data.is_active;
        const currentLikeCount = _comment.like_count || 0;
        const newLikeCount = newIsLiked ? (currentLikeCount + 1) : Math.max(0, currentLikeCount - 1);
        onLikeUpdate(_comment.id, newIsLiked, newLikeCount);
      }
    } catch (error: any) {
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
    onReply(_comment);
  };

  const actionBarButtons: ActionButtonProps[] = [
    {
      icon: HeartIcon,
      activeIcon: HeartActiveIcon,
      text: _comment?.like_count || 0,
      isActive: _comment.has_liked,
      onClick: handleLike,
      iconClassName: styles.icon,
      textClassName: _comment.has_liked ? styles.activeText : '',
    },
    {
      icon: '/assets/message-circle.svg',
      text: _comment.children?.length || 0,
      onClick: handleReply,
      iconClassName: styles.icon,
    }
  ];

  const toggleReplies = async () => {
    if (_comment.children && _comment.children.length === replyCount) {
      setShowReplies(!showReplies);
      return;
    }
    
    if (!showReplies && hasReplies && shouldShowToggleButton) {
      await fetchAllNestedReplies(_comment);
    }
    setShowReplies(!showReplies);
  };

  const fetchAllNestedReplies = async (parentComment: CommentDetail) => {
    try {
      const response = { data: [] }; // Mock response
      const repliesData = Array.isArray(response) ? response : (response?.data || []);
      const normalizedReplies = (repliesData || []).map((r: any) => ({
        ...r,
        author_nickname: r?.author_nickname ?? r?.user?.nickname ?? r?.user?.name ?? '',
        author_avatar: r?.author_avatar ?? r?.avatar ?? r?.user?.avatar ?? '',
        create_at: r?.create_at || r?.created_at || r?.create_time || r?.update_time || ''
      }));
      const allReplies = await fetchAllNestedRepliesRecursive(normalizedReplies, parentComment.author_nickname);
      const updatedComment = { ...parentComment, children: allReplies };
      _onUpdateComment(parentComment.id, updatedComment);
    } catch (error) {
        //静默处理
    }
  };

  const fetchAllNestedRepliesRecursive = async (replies: any[], parentauthor_nickname?: string): Promise<any[]> => {
    const allReplies = [...replies];
    for (const reply of replies) {
      if (!reply.parent_author_author_nickname && parentauthor_nickname) {
        reply.parent_author_author_nickname = parentauthor_nickname;
      }
      if (reply.reply_count > 0) {
        try {
          const nestedResponse = { data: [] }; // Mock response
          const rawNested = Array.isArray(nestedResponse) ? nestedResponse : (nestedResponse?.data || []);
          const nestedReplies = (rawNested || []).map((r: any) => ({
            ...r,
            author_nickname: r?.author_nickname ?? r?.user?.nickname ?? r?.user?.name ?? '',
            author_avatar: r?.author_avatar ?? r?.avatar ?? r?.user?.avatar ?? '',
            create_at: r?.create_at || r?.created_at || r?.create_time || r?.update_time || ''
          }));
          const deeperReplies = await fetchAllNestedRepliesRecursive(nestedReplies, reply.author_nickname);
          allReplies.push(...deeperReplies);
        } catch (error) {
            //静默处理
        }
      }
    }
    return allReplies;
  };
  
  const isCommentAuthor = userState?.user?.id === _comment.user_id;

  return (
    <View className={styles.commentItem}>
      <AuthorInfo
        userId={_comment.user_id}
        mode='compact'
        showFollowButton={false}
        showStats={false}
        showLevel
        showTime
        createTime={_comment.create_at || (_comment as any).created_at || ''}
        showMoreButton={isCommentAuthor && !!_onDeleteComment}
        onMoreClick={handleMoreClick}
      />
      <View className={styles.content}>
        <Text className={styles.text}>{renderCommentContent(_comment?.content || '')}</Text>
        <View className={styles.actions}>
          <ActionBar buttons={actionBarButtons} />
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
        
        {hasReplies && (shouldAutoShow || shouldShowToggleButton) && (
          <View className={styles.repliesContainer}>
            {repliesToShow.map((reply) => (
              <SubCommentItem
                key={reply.id}
                comment={reply}
                onReply={onSubReply || onReply}
                onLikeUpdate={onSubLikeUpdate || onLikeUpdate}
                onDeleteComment={onSubDeleteComment || _onDeleteComment}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};


// ## CommentInput Component ##
interface CommentInputProps {
  postId: string;
  postTitle?: string;
  postAuthorId?: string;
  replyTo?: {
    commentId: string;
    nickname: string;
    replyToNickname?: string;
  } | null;
  onCancelReply?: () => void;
  allowComments?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({ postId, postTitle, postAuthorId, replyTo, onCancelReply, allowComments = true }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userState = useSelector((state: RootState) => state.user);
  const token = userState?.token || null;
  const isLoggedIn = userState?.isLoggedIn || false;
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    if (replyTo) {
      setTimeout(() => {
        // 小程序中自动聚焦
      }, 100);
    }
  }, [replyTo]);
  
  const handleSendComment = async () => {
    if (!comment.trim() || isSubmitting) return;

    if (!allowComments) {
      Taro.showToast({ title: '作者已关闭评论', icon: 'none', duration: 2000 });
      return;
    }

    if (!token || !isLoggedIn) {
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
    
    try {
      setIsSubmitting(true);
      let finalContent = comment.trim();
      
      if (replyTo && replyTo.nickname) {
        finalContent = `@${replyTo.nickname} ${finalContent}`;
      }
      
      const commentParams = {
        resource_id: postId,
        resource_type: 'post' as const,
        content: finalContent,
        post_title: postTitle,
        post_author_id: postAuthorId,
        ...(replyTo ? { 
          parent_id: replyTo.commentId,
          parent_author_nickname: replyTo.nickname
        } : {})
      };
      
      await dispatch(createComment(commentParams)).unwrap();
      
      setComment('');
      if (onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      //静默处理
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReply = () => {
    if (onCancelReply) {
      onCancelReply();
    }
  };

  const placeholder = !allowComments
    ? '作者已关闭评论'
    : replyTo
      ? `回复 @${replyTo.nickname}...`
      : '说点什么...';

  return (
    <View className={styles.commentInputWrapper}>
      {replyTo && (
        <View className={styles.replyIndicator}>
          <Text className={styles.replyText}>回复 @{replyTo.nickname}</Text>
          <Image 
            src={CloseIcon} 
            className={styles.cancelReplyIcon}
            onClick={handleCancelReply}
          />
        </View>
      )}
      
      <View className={styles.commentInput}>
        <Input
          className={styles.input}
          placeholder={placeholder}
          value={comment}
          onInput={(e) => setComment(e.detail.value)}
          disabled={isSubmitting || !allowComments}
          focus={!!replyTo}
        />
        <View
          className={`${styles.sendButton} ${(isSubmitting || !allowComments) ? styles.disabled : ''}`}
          onClick={handleSendComment}
        >
          <Image 
            src={SendIcon} 
            className={styles.sendIcon}
          />
        </View>
      </View>
    </View>
  );
};


// ## Main CommentSection Component ##
interface CommentSectionProps {
  postId: string;
  postTitle?: string;
  postAuthorId?: string;
  comments: CommentDetail[];
  allowComments?: boolean;
  // 自动处理模式（当启用时，组件内部处理所有评论相关操作）
  autoHandle?: boolean;
  // 手动处理模式（当 autoHandle 为 false 时，需要外部提供回调）
  onReply?: (_comment: CommentDetail) => void;
  onLikeUpdate?: (_commentId: string, _isLiked: boolean, _likeCount: number) => void;
  onDeleteComment?: (_commentId: string) => void;
  replyTo?: {
    commentId: string;
    nickname: string;
    replyToNickname?: string;
  } | null;
  onCancelReply?: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  postTitle,
  postAuthorId,
  comments: _comments,
  allowComments,
  autoHandle = false,
  onReply,
  onLikeUpdate,
  onDeleteComment: _onDeleteComment,
  replyTo: externalReplyTo,
  onCancelReply
}) => {
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time');
  const [localComments, setLocalComments] = useState<CommentDetail[]>([]);

  // 内部状态管理（当 autoHandle 为 true 时使用）
  const [internalReplyTo, setInternalReplyTo] = useState<{
    commentId: string;
    nickname: string;
    replyToNickname?: string;
  } | null>(null);

  // 根据 autoHandle 决定使用哪个 replyTo
  const replyTo = autoHandle ? internalReplyTo : externalReplyTo;
  const handleCancelReply = autoHandle ? () => setInternalReplyTo(null) : onCancelReply;
  
  useEffect(() => {
    setLocalComments(_comments);
  }, [_comments]);

  // 内部处理回复
  const handleInternalReply = (comment: CommentDetail) => {
    if (autoHandle) {
      setInternalReplyTo({
        commentId: comment.root_id || comment.id,
        nickname: comment.author_nickname || '',
        replyToNickname: comment.author_nickname || ''
      });
    } else if (onReply) {
      onReply(comment);
    }
  };

  // 内部处理删除评论
  const handleInternalDeleteComment = async (commentId: string) => {
    if (!autoHandle) {
      if (_onDeleteComment) {
        _onDeleteComment(commentId);
      }
      return;
    }

    // 自动处理模式下的删除逻辑
    try {
      const res = await Taro.showModal({
        title: '确认删除',
        content: '确定要删除这条评论吗？'
      });

      if (res.confirm) {
        await commentApi.deleteComment(commentId);

        // 从本地状态中移除评论
        setLocalComments(prevComments => {
          const removeFromComments = (comments: CommentDetail[]): CommentDetail[] => {
            return comments
              .filter(comment => comment.id !== commentId)
              .map(comment => ({
                ...comment,
                children: comment.children ? removeFromComments(comment.children) : undefined
              }));
          };

          return removeFromComments(prevComments);
        });

        Taro.showToast({ title: '删除成功', icon: 'success' });
      }
    } catch (error) {
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  const handleLikeUpdate = (commentId: string, isLiked: boolean, likeCount: number) => {
    setLocalComments(prevComments => {
      return prevComments.map(comment => {
        if (String(comment.id) === String(commentId)) {
          return { ...comment, has_liked: isLiked, like_count: likeCount };
        }
        if (comment.children && comment.children.length > 0) {
          const updatedChildren = comment.children.map(child => {
            if (String(child.id) === String(commentId)) {
              return { ...child, has_liked: isLiked, like_count: likeCount };
            }
            return child;
          });
          if (updatedChildren.some((child, index) => child !== comment.children![index])) {
            return { ...comment, children: updatedChildren };
          }
        }
        return comment;
      });
    });
    
    if (onLikeUpdate) {
      onLikeUpdate(commentId, isLiked, likeCount);
    }
  };

  const handleUpdateComment = (commentId: string, updatedComment: CommentDetail) => {
    setLocalComments(prevComments => {
      return prevComments.map(comment => {
        if (String(comment.id) === String(commentId)) {
          return updatedComment;
        }
        return comment;
      });
    });
  };
  
  const sortedComments = [...localComments].sort((a, b) => {
    if (sortBy === 'time') {
      const bTime = (b.create_at || (b as any).created_at) ? new Date((b.create_at || (b as any).created_at) as string).getTime() : 0;
      const aTime = (a.create_at || (a as any).created_at) ? new Date((a.create_at || (a as any).created_at) as string).getTime() : 0;
      return bTime - aTime;
    } else {
      return (b.like_count || 0) - (a.like_count || 0);
    }
  });
  
  const toggleSort = () => {
    setSortBy(sortBy === 'time' ? 'likes' : 'time');
  };

  return (
    <View className={styles.commentsSection}>
      <CommentInput
        postId={postId}
        postTitle={postTitle}
        postAuthorId={postAuthorId}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        allowComments={allowComments}
      />
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
            onReply={handleInternalReply}
            onLikeUpdate={handleLikeUpdate}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleInternalDeleteComment}
            onSubReply={handleInternalReply}
            onSubLikeUpdate={handleLikeUpdate}
            onSubDeleteComment={handleInternalDeleteComment}
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
