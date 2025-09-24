
import React, { useState, useEffect } from 'react'

import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { useSelector } from 'react-redux'


import ChevronDownIcon from '@/assets/chevron-down.svg'
import ChevronRightIcon from '@/assets/chevron-right.svg'
import HeartActiveIcon from '@/assets/heart-bold.svg'
import HeartIcon from '@/assets/heart-outline.svg'
import ActionBar, { ActionButtonConfig } from '@/components/action-bar'
import AuthorInfo from '@/components/author-info'
import { RootState } from '@/store'
import { CommentDetail } from '@/types/api/comment'
import { formatRelativeTime } from '@/utils/time'

import styles from '../index.module.scss'


// 渲染带有@用户名高亮的评论内容
const renderCommentContent = (content: string): React.ReactNode => {
  // 正则表达式匹配 @用户名 格式（用户名可以包含中文、英文、数字、下划线）
  const mentionRegex = /@([\u4e00-\u9fa5\w]+)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    // 添加@之前的普通文本
    if (match.index > lastIndex) {
      parts.push(<Text key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</Text>)
    }

    // 添加高亮的@用户名
    parts.push(
      <Text key={`mention-${match.index}`} className={styles.mentionText}>
        {match[0]}
      </Text>
    )

    lastIndex = match.index + match[0].length
  }

  // 添加剩余的普通文本
  if (lastIndex < content.length) {
    parts.push(<Text key={`text-${lastIndex}`}>{content.slice(lastIndex)}</Text>)
  }

  return parts.length > 0 ? parts : <Text>{content}</Text>
}

interface SubCommentItemProps {
  comment: CommentDetail
  onReply: (_comment: CommentDetail) => void
  onLikeUpdate: (_commentId: string, _isLiked: boolean, _likeCount: number) => void
  onDeleteComment?: (_commentId: string) => void
  /** 是否显示关注按钮 */
  showFollowButton?: boolean
}

const SubCommentItem: React.FC<SubCommentItemProps> = ({
  comment: _comment,
  onReply,
  onLikeUpdate,
  onDeleteComment: _onDeleteComment,
  showFollowButton = true,
}) => {
  const userState = useSelector((state: RootState) => state.user)
  const isCommentAuthor = userState?.user?.id === _comment.user_id

  const actionBarButtons: ActionButtonConfig[] = [
    {
      type: 'like',
      icon: HeartIcon,
      activeIcon: HeartActiveIcon,
    },
    {
      type: 'comment',
      icon: '/assets/message-circle.svg',
    },
  ]

  const handleMoreClick = () => {
    if (isCommentAuthor && _onDeleteComment) {
      Taro.showModal({
        title: '删除评论',
        content: '确定要删除这条评论吗？删除后无法恢复。',
        success: (res) => {
          if (res.confirm) {
            _onDeleteComment(_comment.id)
          }
        },
      })
    }
  }

  return (
    <View className={styles.subCommentItem}>
      <AuthorInfo
        userId={_comment.user_id}
        mode="compact"
        showFollowButton={showFollowButton}
        showStats={false}
        showLevel
        showTime
        createTime={_comment.create_at || (_comment as any).created_at || ''}
        showMoreButton={isCommentAuthor && _onDeleteComment ? true : false}
        onMoreClick={handleMoreClick}
        disableNameTruncate
      />
      <View className={styles.subContent}>
        <Text className={styles.subText}>{renderCommentContent(_comment.content)}</Text>
        <View className={styles.subActions}>
          <ActionBar
            targetId={_comment.id}
            targetType="comment"
            buttons={actionBarButtons}
            initialStates={{
              'like-0': { isActive: _comment.has_liked || false, count: _comment.like_count || 0 },
              'comment-1': { isActive: false, count: _comment.reply_count || 0 },
            }}
            onStateChange={(type, isActive, count) => {
              if (type === 'like') {
                onLikeUpdate(_comment.id, isActive, count)
              } else if (type === 'comment') {
                onReply(_comment)
              }
            }}
          />
          <Text className={styles.subCommentTime}>
            {formatRelativeTime(_comment.create_at || (_comment as any).created_at || '')}
          </Text>
        </View>
      </View>
    </View>
  )
}

interface CommentItemProps {
  comment: CommentDetail
  onReply: (_comment: CommentDetail) => void
  onLikeUpdate: (_commentId: string, _isLiked: boolean, _likeCount: number) => void
  onUpdateComment: (_commentId: string, _updatedComment: CommentDetail) => void
  onDeleteComment?: (_commentId: string) => void
  /** 是否显示关注按钮 */
  showFollowButton?: boolean
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment: _comment,
  onReply,
  onLikeUpdate,
  onUpdateComment: _onUpdateComment,
  onDeleteComment: _onDeleteComment,
  showFollowButton = true,
}) => {
  const userState = useSelector((state: RootState) => state.user)
  const [showReplies, setShowReplies] = useState(false)

  const hasReplies = _comment.children && _comment.children.length > 0
  const replyCount = _comment.children?.length || 0

  // 如果回复数量<=2，直接显示所有回复，不需要展开按钮
  const shouldShowToggleButton = replyCount > 2
  const shouldAutoShow = replyCount > 0 && replyCount <= 2

  // 决定显示哪些回复：<=2条全部显示，>2条根据showReplies状态决定
  const repliesToShow = shouldAutoShow
    ? _comment.children || []
    : showReplies
      ? _comment.children || []
      : (_comment.children || []).slice(0, 2) // 默认显示前2条

  const actionBarButtons: ActionButtonConfig[] = [
    {
      type: 'like',
      icon: HeartIcon,
      activeIcon: HeartActiveIcon,
    },
    {
      type: 'comment',
      icon: '/assets/message-circle.svg',
    },
  ]

  const toggleReplies = async () => {
    // 对于已经有完整children数据的情况，直接切换显示状态
    if (_comment.children && _comment.children.length === replyCount) {
      setShowReplies(!showReplies)
      return
    }

    // 如果children数据不完整，才需要获取更多数据
    if (!showReplies && hasReplies && shouldShowToggleButton) {
      await fetchAllNestedReplies(_comment)
    }
    setShowReplies(!showReplies)
  }

  // 递归获取所有层级的子评论
  const fetchAllNestedReplies = async (parentComment: CommentDetail) => {
    try {
      // 获取第一层子评论 - 暂时返回空数组，因为API尚未实现
      const response = { data: [] }

      // 修复数据结构处理，判断response是否为数组
      const repliesData = Array.isArray(response) ? response : response?.data || []

      // 标准化字段：author_nickname / author_avatar / create_at
      const normalizedReplies = (repliesData || []).map((r: any) => ({
        ...r,
        author_nickname: r?.author_nickname ?? r?.user?.nickname ?? r?.user?.name ?? '',
        author_avatar: r?.author_avatar ?? r?.avatar ?? r?.user?.avatar ?? '',
        create_at: r?.create_at || r?.created_at || r?.create_time || r?.update_time || '',
      }))

      // 递归获取所有层级的子评论，传入主评论的昵称作为第一层子评论的父昵称
      const allReplies = await fetchAllNestedRepliesRecursive(
        normalizedReplies,
        parentComment.author_nickname
      )

      // 更新本地状态，将获取到的所有回复添加到当前评论的children中
      const updatedComment = {
        ...parentComment,
        children: allReplies,
      }

      // 通知父组件更新评论数据
      _onUpdateComment(parentComment.id, updatedComment)
    } catch (error) {
      // 移除弹窗提示，静默处理错误
    }
  }

  // 递归获取所有层级的子评论
  const fetchAllNestedRepliesRecursive = async (
    replies: any[],
    parentauthor_nickname?: string
  ): Promise<any[]> => {
    const allReplies = [...replies]

    for (const reply of replies) {
      // 如果当前回复没有parent_author_author_nickname，使用传入的parentauthor_nickname
      if (!reply.parent_author_author_nickname && parentauthor_nickname) {
        reply.parent_author_author_nickname = parentauthor_nickname
      }

      if (reply.reply_count > 0) {
        try {
          // 获取当前回复的子回复 - 暂时返回空数组，因为API尚未实现
          const nestedResponse = { data: [] }

          // 修复数据结构处理，判断nestedResponse是否为数组
          const rawNested = Array.isArray(nestedResponse)
            ? nestedResponse
            : nestedResponse?.data || []

          // 标准化子层回复的关键字段
          const nestedReplies = (rawNested || []).map((r: any) => ({
            ...r,
            author_nickname: r?.author_nickname ?? r?.user?.nickname ?? r?.user?.name ?? '',
            author_avatar: r?.author_avatar ?? r?.avatar ?? r?.user?.avatar ?? '',
            create_at: r?.create_at || r?.created_at || r?.create_time || r?.update_time || '',
          }))

          // 递归获取更深层级的回复，传入当前回复的昵称作为父昵称
          const deeperReplies = await fetchAllNestedRepliesRecursive(
            nestedReplies,
            reply.author_nickname
          )
          allReplies.push(...deeperReplies)
        } catch (error) {}
      }
    }

    return allReplies
  }

  // 检查当前用户是否为评论作者
  const isCommentAuthor = userState?.user?.id === _comment.user_id

  const handleMoreClick = () => {
    if (isCommentAuthor && _onDeleteComment) {
      Taro.showModal({
        title: '删除评论',
        content: '确定要删除这条评论吗？删除后无法恢复。',
        success: (res) => {
          if (res.confirm) {
            _onDeleteComment(_comment.id)
          }
        },
      })
    }
  }

  return (
    <View className={styles.commentItem}>
      <AuthorInfo
        userId={_comment.user_id}
        mode="compact"
        showFollowButton={showFollowButton}
        showStats={false}
        showLevel
        showTime
        createTime={_comment.create_at || (_comment as any).created_at || ''}
        showMoreButton={isCommentAuthor && _onDeleteComment ? true : false}
        onMoreClick={handleMoreClick}
        disableNameTruncate
      />
      <View className={styles.content}>
        <Text className={styles.text}>{renderCommentContent(_comment?.content || '')}</Text>
        <View className={styles.actions}>
          <ActionBar
            targetId={_comment.id}
            targetType="comment"
            buttons={actionBarButtons}
            initialStates={{
              'like-0': { isActive: _comment.has_liked || false, count: _comment.like_count || 0 },
              'comment-1': { isActive: false, count: _comment.children?.length || 0 },
            }}
            onStateChange={(type, isActive, count) => {
              if (type === 'like') {
                onLikeUpdate(_comment.id, isActive, count)
              } else if (type === 'comment') {
                onReply(_comment)
              }
            }}
          />
          <View className={styles.commentRightSection}>
            <Text className={styles.commentTime}>
              {formatRelativeTime(_comment.create_at || (_comment as any).created_at || '')}
            </Text>
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
                onDeleteComment={_onDeleteComment}
                showFollowButton={showFollowButton}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

interface CommentSectionProps {
  comments: CommentDetail[]
  onReply: (_comment: CommentDetail) => void
  onLikeUpdate: (_commentId: string, _isLiked: boolean, _likeCount: number) => void
  onDeleteComment?: (_commentId: string) => void
  /** 是否在评论区显示关注按钮 */
  showFollowButton?: boolean
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments: _comments,
  onReply,
  onLikeUpdate,
  onDeleteComment: _onDeleteComment,
  showFollowButton = true,
}) => {
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time')
  const [localComments, setLocalComments] = useState<CommentDetail[]>([])

  // 同步外部评论数据到本地状态
  useEffect(() => {
    setLocalComments(_comments)
  }, [_comments])

  // 添加调试日志
  useEffect(() => {}, [localComments])

  // 处理点赞状态更新
  const handleLikeUpdate = (commentId: string, isLiked: boolean, likeCount: number) => {
    // 先更新本地状态以提供即时反馈
    setLocalComments((prevComments) => {
      return prevComments.map((comment) => {
        // 检查是否是主评论
        if (String(comment.id) === String(commentId)) {
          return { ...comment, has_liked: isLiked, like_count: likeCount }
        }

        // 检查子评论
        if (comment.children && comment.children.length > 0) {
          const updatedChildren = comment.children.map((child) => {
            if (String(child.id) === String(commentId)) {
              return { ...child, has_liked: isLiked, like_count: likeCount }
            }
            return child
          })

          // 只有当子评论确实被更新时才返回新对象
          if (updatedChildren.some((child, index) => child !== comment.children![index])) {
            return { ...comment, children: updatedChildren }
          }
        }

        return comment
      })
    })

    // 然后通知父组件重新获取数据以确保状态同步
    if (onLikeUpdate) {
      onLikeUpdate(commentId, isLiked, likeCount)
    }
  }

  // 处理评论更新
  const handleUpdateComment = (commentId: string, updatedComment: CommentDetail) => {
    setLocalComments((prevComments) => {
      return prevComments.map((comment) => {
        if (String(comment.id) === String(commentId)) {
          return updatedComment
        }
        return comment
      })
    })
  }

  // 根据排序方式对评论进行排序
  const sortedComments = [...localComments].sort((a, b) => {
    if (sortBy === 'time') {
      const bTime =
        b.create_at || (b as any).created_at
          ? new Date((b.create_at || (b as any).created_at) as string).getTime()
          : 0
      const aTime =
        a.create_at || (a as any).created_at
          ? new Date((a.create_at || (a as any).created_at) as string).getTime()
          : 0
      return bTime - aTime
    } else {
      return (b.like_count || 0) - (a.like_count || 0)
    }
  })

  // 切换排序方式
  const toggleSort = () => {
    setSortBy(sortBy === 'time' ? 'likes' : 'time')
  }

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
            onDeleteComment={_onDeleteComment}
            showFollowButton={showFollowButton}
          />
        ))
      ) : (
        <View className={styles.emptyComments}>
          <Text>暂无评论，快来发表第一条评论吧</Text>
        </View>
      )}
    </View>
  )
}

export default CommentSection
