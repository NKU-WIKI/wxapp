
import { useState, useEffect } from 'react'

import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'


import ActionButton from '@/components/action-button'
import actionApi from '@/services/api/action'
import { NoteListItem } from '@/types/api/note'
import { checkLoginWithModal } from '@/utils/auth'
import { normalizeImageUrl } from '@/utils/image'

import styles from './index.module.scss'
// 图片资源使用字符串路径引用

// 扩展的笔记类型，包含交互状态
interface NoteWithStatus extends NoteListItem {
  is_liked?: boolean
  is_favorited?: boolean
  interaction_loading?: boolean
  like_count?: number
}

interface NoteCardProps {
  note: NoteWithStatus
  style?: React.CSSProperties
  onClick?: () => void
}

const NoteCard = ({ note, style, onClick }: NoteCardProps) => {
  const [avatarImageError, setAvatarImageError] = useState(false)
  const [coverImageError, setCoverImageError] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isLiked, setIsLiked] = useState(!!note.is_liked)
  const [likeCount, setLikeCount] = useState<number>(note.like_count || 0)

  // 同步外部交互状态到本地，确保加载后根据接口状态着色
  useEffect(() => {
    setIsLiked(!!note.is_liked)
    if (typeof note.like_count === 'number') {
      setLikeCount(note.like_count)
    }
  }, [note.id, note.is_liked, note.like_count])

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // 构建导航URL，如果有用户信息则传递userId
      let url = `/pages/subpackage-interactive/note-detail/index?id=${note.id}`

      // 如果有用户信息，添加userId参数
      if (note.user?.id) {
        url += `&userId=${note.user.id}`
      } else if ((note as any).user_id) {
        url += `&userId=${(note as any).user_id}`
      }

      Taro.navigateTo({ url })
    }
  }

  const getAuthorAvatar = () => {
    const avatar = note.author_avatar || note.user?.avatar
    if (avatar && avatar.includes('127.0.0.1:32968/__tmp__/')) {
      return '/assets/avatar1.png'
    }
    return normalizeImageUrl(avatar || undefined) || '/assets/avatar1.png'
  }

  const authorAvatar = getAuthorAvatar()

  // 获取封面图片：优先使用笔记的第一张图片，如果没有则使用默认图片

  const getCoverImage = () => {
    // 如果笔记有图片数组且不为空，使用第一张图片
    const noteWithImages = note as any
    if (noteWithImages.images && noteWithImages.images.length > 0) {
      const firstImage = noteWithImages.images[0]

      // 检查是否是本地开发服务器路径，如果是则使用占位图
      if (firstImage && firstImage.includes('127.0.0.1:32968/__tmp__/')) {
        return '/assets/placeholder-note.svg'
      }

      return normalizeImageUrl(firstImage)
    }

    // 如果没有图片，使用本地占位图片
    return '/assets/placeholder-note.svg'
  }

  const coverImage = getCoverImage()

  const handleCoverImageError = () => {
    setCoverImageError(true)
  }

  // 如果图片加载失败或是占位图，使用默认样式
  const isPlaceholderImage = coverImageError || coverImage.includes('placeholder.com')

  return (
    <View className={styles.noteCard} style={style} onClick={handleClick}>
      <View
        className={`${styles.imageContainer} ${isPlaceholderImage ? styles.placeholderContainer : ''}`}
      >
        <Image
          src={coverImage}
          className={`${styles.coverImage} ${isPlaceholderImage ? styles.placeholderImage : ''}`}
          mode={isPlaceholderImage ? 'aspectFit' : 'widthFix'}
          onError={handleCoverImageError}
        />
      </View>

      <View className={styles.content}>
        <Text className={styles.title}>{note.title}</Text>
      </View>

      <View className={styles.footer}>
        {/* 使用AuthorInfo组件获取完整的用户信息 */}
        {note.user ? (
          <View className={styles.authorInfoWrapper}>
            <Image
              src={
                avatarImageError
                  ? '/assets/avatar1.png'
                  : normalizeImageUrl(note.user.avatar) || '/assets/avatar1.png'
              }
              className={styles.exploreAvatarSmall} // 使用note-card自己的小头像样式
              mode="aspectFill"
              onError={() => setAvatarImageError(true)}
            />
            <View className={styles.authorDetails}>
              <Text className={styles.authorName}>{note.user.nickname || '匿名用户'}</Text>
            </View>
          </View>
        ) : (
          <View className={styles.author}>
            <Image
              src={avatarImageError ? '/assets/avatar1.png' : authorAvatar}
              className={styles.avatar}
              mode="aspectFill"
              onError={() => setAvatarImageError(true)}
            />
            <Text className={styles.authorName}>{note.author_name || '匿名用户'}</Text>
          </View>
        )}
        <View className={styles.likeInfo}>
          <ActionButton
            icon="/assets/heart-outline.svg"
            activeIcon="/assets/heart-bold.svg"
            text={likeCount.toString()}
            isActive={isLiked}
            disabled={isLiking || note.interaction_loading}
            className={styles.likeButton}
            onClick={async () => {
              const hasLogin = await checkLoginWithModal()
              if (!hasLogin) {
                return
              }
              if (isLiking) return
              try {
                setIsLiking(true)
                const resp = await actionApi.toggleAction({
                  target_id: String(note.id),
                  target_type: 'note',
                  action_type: 'like',
                })
                const nextActive = resp.data?.is_active ?? !isLiked
                const nextCount =
                  typeof resp.data?.count === 'number'
                    ? resp.data.count
                    : nextActive
                      ? likeCount + 1
                      : Math.max(0, likeCount - 1)
                setIsLiked(nextActive)
                setLikeCount(nextCount)
              } catch (_e) {
                Taro.showToast({ title: '操作失败，请稍后重试', icon: 'none' })
              } finally {
                setIsLiking(false)
              }
            }}
          />
        </View>
      </View>
    </View>
  )
}

export default NoteCard
