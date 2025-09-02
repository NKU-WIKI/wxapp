import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import classnames from 'classnames'
import { useSelector } from 'react-redux'
import { useAuthorInfo } from '@/hooks/useAuthorInfo'
import { RootState } from '@/store'
// 导入图标资源
import defaultAvatar from '@/assets/avatar1.png'
import levelIcon from '@/assets/star.svg'
import locationIcon from '@/assets/map-pin.svg'
import postIcon from '@/assets/file-text.svg'
import userIcon from '@/assets/user.svg'

import styles from './index.module.scss'

export interface AuthorInfoProps {
  /** 用户ID */
  userId: string
  /** 是否显示关注按钮 */
  showFollowButton?: boolean
  /** 是否显示统计信息 */
  showStats?: boolean
  /** 是否显示等级信息 */
  showLevel?: boolean
  /** 是否显示位置信息 */
  showLocation?: boolean
  /** 自定义类名 */
  className?: string
  /** 点击回调 */
  onClick?: () => void
}

/**
 * 作者信息组件
 * 显示用户的详细信息、等级、关注状态等
 */
const AuthorInfo: React.FC<AuthorInfoProps> = ({
  userId,
  showFollowButton = true,
  showStats = true,
  showLevel = true,
  showLocation = true,
  className,
  onClick
}) => {
  const currentUserId = useSelector((state: RootState) => (
    state.user.currentUser?.user_id || (state.user.userProfile as any)?.id || ''
  ))

  const {
    user,
    levelInfo,
    isFollowing,
    followersCount,
    followingCount,
    postsCount,
    isLoading,
    error,
    follow,
    unfollow
  } = useAuthorInfo(userId, {
    includeLevel: showLevel,
    includeFollowStatus: showFollowButton,
    includeStats: showStats
  })

  const isCurrentUser = !!currentUserId && currentUserId === userId

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollow()
    } else {
      await follow()
    }
  }

  const containerClasses = classnames(styles.container, className, {
    [styles.clickable]: !!onClick
  })

  if (isLoading) {
    return (
      <View className={classnames(containerClasses, styles.loading)}>
        <View className={styles.loadingSkeleton} />
      </View>
    )
  }

  if (error || !user) {
    return (
      <View className={containerClasses}>
        <Text className={styles.errorText}>
          {error || '用户信息加载失败'}
        </Text>
      </View>
    )
  }

  return (
    <View className={containerClasses} onClick={onClick}>
      {/* 用户头像和基本信息 */}
      <View className={styles.userHeader}>
        <Image
          src={user.avatar || defaultAvatar}
          className={styles.avatar}
          mode='aspectFill'
        />

        <View className={styles.userInfo}>
          <View className={styles.userNameRow}>
            <Text className={styles.userName}>
              {user.nickname || '匿名用户'}
            </Text>

            {/* 等级信息 */}
            {showLevel && levelInfo && (
              <View className={styles.levelBadge}>
                <Image
                  src={levelIcon}
                  className={styles.levelIcon}
                  style={{ width: '14px', height: '14px' }}
                />
                <Text className={styles.levelText}>
                  {levelInfo.level_name}
                </Text>
              </View>
            )}
          </View>

          {/* 学校信息 */}
          {(user.school || user.college) && (
            <Text className={styles.userSchool}>
              {user.school || ''}{user.college ? ` ${user.college}` : ''}
            </Text>
          )}

          {/* 位置信息 */}
          {showLocation && user.location && (
            <View className={styles.userLocation}>
              <Image
                src={locationIcon}
                className={styles.locationIcon}
                style={{ width: '12px', height: '12px' }}
              />
              <Text className={styles.locationText}>
                {user.location}
              </Text>
            </View>
          )}
        </View>

        {/* 关注按钮 */}
        {showFollowButton && !isCurrentUser && (
          <View
            className={classnames(styles.followButton, {
              [styles.following]: isFollowing
            })}
            onClick={handleFollowToggle}
          >
            <Text>{isFollowing ? '已关注' : '+关注'}</Text>
          </View>
        )}
      </View>

      {/* 用户简介 */}
      {user.bio && (
        <Text className={styles.userBio}>
          {user.bio}
        </Text>
      )}

      {/* 统计信息 */}
      {showStats && (
        <View className={styles.userStats}>
          <View className={styles.statItem}>
            <Image
              src={postIcon}
              className={styles.statIcon}
              style={{ width: '16px', height: '16px' }}
            />
            <Text className={styles.statValue}>{postsCount}</Text>
            <Text className={styles.statLabel}>帖子</Text>
          </View>

          <View className={styles.statItem}>
            <Image
              src={userIcon}
              className={styles.statIcon}
              style={{ width: '16px', height: '16px' }}
            />
            <Text className={styles.statValue}>{followersCount}</Text>
            <Text className={styles.statLabel}>粉丝</Text>
          </View>

          <View className={styles.statItem}>
            <Image
              src={userIcon}
              className={styles.statIcon}
              style={{ width: '16px', height: '16px' }}
            />
            <Text className={styles.statValue}>{followingCount}</Text>
            <Text className={styles.statLabel}>关注</Text>
          </View>
        </View>
      )}

      {/* 等级进度条 */}
      {showLevel && levelInfo && levelInfo.next_level_exp && (
        <View className={styles.levelProgress}>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{
                width: `${Math.min(100, levelInfo.progress * 100)}%`
              }}
            />
          </View>
          <Text className={styles.progressText}>
            {levelInfo.exp}/{levelInfo.next_level_exp} 经验
          </Text>
        </View>
      )}
    </View>
  )
}

export default AuthorInfo
