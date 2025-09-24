import { View, Text, Image } from '@tarojs/components'

import classnames from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'

import styles from './index.module.scss'

import infoIcon from '@/assets/about.svg'
import defaultAvatar from '@/assets/avatar1.png'
import historyIcon from '@/assets/clock.svg'
import feedbackIcon from '@/assets/feedback.svg'
import draftIcon from '@/assets/file-text.svg'
import heartIcon from '@/assets/heart-outline.svg'
import locationIcon from '@/assets/map-pin.svg'
import userIcon from '@/assets/user.svg'
import { NICKNAME_DISPLAY_MAX_LENGTH } from '@/constants'
import { useAuthorInfo } from '@/hooks/useAuthorInfo'
import { RootState } from '@/store'
import { formatRelativeTime } from '@/utils/time'
import { normalizeImageUrl } from '@/utils/image'
// 导入图标资源
import starIcon from '@/assets/star.svg'
import commentIcon from '@/assets/message-circle.svg'
import campusIcon from '@/assets/school.svg'
import settingsIcon from '@/assets/settings.svg'
import moreIcon from '@/assets/more-horizontal.svg'


const levelIcon = starIcon
const postIcon = draftIcon

// 昵称截断函数
const truncateNickname = (nickname: string): string => {
  if (!nickname) return '匿名用户'
  if (nickname.length <= NICKNAME_DISPLAY_MAX_LENGTH) return nickname
  return nickname.substring(0, NICKNAME_DISPLAY_MAX_LENGTH) + '...'
}

export type AuthorInfoMode = 'compact' | 'expanded' | 'profile'

export interface AuthorInfoProps {
  /** 用户ID */
  userId: string
  /** 显示模式：compact(简洁) | expanded(详细) | profile(个人中心) */
  mode?: AuthorInfoMode
  /** 是否显示个人简介 */
  showBio?: boolean
  /** 是否显示关注按钮 */
  showFollowButton?: boolean
  /** 是否显示统计信息 */
  showStats?: boolean
  /** 是否显示等级信息 */
  showLevel?: boolean
  /** 是否显示位置信息 */
  showLocation?: boolean
  /** 是否显示时间信息 */
  showTime?: boolean
  /** 创建时间（用于显示相对时间） */
  createTime?: string
  /** 自定义右上角操作区域 */
  extraNode?: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 是否禁用昵称截断（在评论区需要完整显示昵称时启用） */
  disableNameTruncate?: boolean
  /** 外部点击回调（可选，用于自定义行为） */
  onClick?: () => void
  /** Profile模式专用：是否显示操作菜单 */
  showMenu?: boolean
  /** Profile模式专用：是否显示编辑按钮 */
  showEditButton?: boolean
  /** Profile模式专用：编辑按钮点击回调 */
  onEdit?: () => void
  /** Profile模式专用：菜单项点击回调 */
  onMenuClick?: (_type: string) => void
  /** Profile模式专用：校园认证状态 */
  isCampusVerified?: boolean
  /** Profile模式专用：积分值 */
  points?: number
  /** 是否显示删除/更多按钮 */
  showMoreButton?: boolean
  /** 删除/更多按钮点击回调 */
  onMoreClick?: () => void
}

/**
 * 作者信息组件
 * 显示用户的详细信息、等级、关注状态等
 *
 * 支持三种显示模式：
 * - compact: 简洁模式（头像+用户名+等级+关注按钮），适合列表中使用
 * - expanded: 详细模式（完整用户信息卡片），适合详情页中使用
 * - profile: 个人中心模式（完整的个人资料展示），适合个人中心页面使用
 */
const AuthorInfo: React.FC<AuthorInfoProps> = ({
  userId,
  mode = 'compact',
  showBio = true,
  showFollowButton = true,
  showStats = true,
  showLevel = true,
  showLocation = true,
  showTime = false,
  createTime,
  extraNode,
  className,
  disableNameTruncate = false,
  onClick,
  showMenu = true,
  showEditButton = true,
  onEdit,
  onMenuClick,
  isCampusVerified = false,
  points = 0,
  showMoreButton = false,
  onMoreClick,
}) => {
  const currentUserId = useSelector((state: RootState) => state.user.user?.id || '')

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
    unfollow,
  } = useAuthorInfo(userId, {
    includeLevel: showLevel,
    includeFollowStatus: showFollowButton,
    includeStats: showStats,
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
    [styles.clickable]: mode === 'compact' && onClick, // compact模式下如果有onClick则显示可点击状态
    [styles.compact]: mode === 'compact',
    [styles.expanded]: mode === 'expanded',
    [styles.profile]: mode === 'profile',
  })

  if (isLoading) {
    return (
      <View className={classnames(containerClasses, styles.loading)}>
        <View className={styles.loadingSkeleton} />
      </View>
    )
  }

  if (error && !user) {
    return (
      <View className={containerClasses}>
        <Text className={styles.errorText}>{error || '用户信息加载失败'}</Text>
      </View>
    )
  }

  // 简洁模式渲染（类似post-card中的作者信息）
  if (mode === 'compact') {
    return (
      <View className={containerClasses} onClick={onClick}>
        <View className={styles.compactUserInfo}>
          <View className={styles.compactUserInfoLeft}>
            <Image
              src={normalizeImageUrl(user?.avatar || undefined) || defaultAvatar}
              className={classnames(styles.compactAvatar, className)}
              mode="aspectFill"
            />
            <View className={styles.compactUserDetails}>
              <View className={styles.compactUserNameRow}>
                <Text
                  className={classnames(styles.compactUserName, {
                    [styles.noTruncate]: disableNameTruncate,
                  })}
                >
                  {disableNameTruncate
                    ? user?.nickname || '匿名用户'
                    : truncateNickname(user?.nickname)}
                </Text>
                {showLevel && levelInfo && (
                  <View className={styles.compactLevelBadge}>
                    <Text className={styles.compactLevelText}>{levelInfo.level_name}</Text>
                  </View>
                )}
              </View>
              {showBio && user?.bio && (
                <Text className={styles.compactBio} numberOfLines={1}>
                  {user?.bio}
                </Text>
              )}
              {showLocation && user?.location && (
                <View className={styles.compactUserLocation}>
                  <Image
                    src={locationIcon}
                    className={styles.compactLocationIcon}
                    style={{ width: '10px', height: '10px' }}
                  />
                  <Text className={styles.compactLocationText}>{user?.location}</Text>
                </View>
              )}
            </View>
          </View>

          <View className={styles.compactActions}>
            {extraNode}

            {/* 时间信息 */}
            {showTime && createTime && (
              <Text className={styles.compactTime}>{formatRelativeTime(createTime)}</Text>
            )}

            <View className={styles.compactFollowContainer}>
              {showFollowButton && !isCurrentUser && (
                <View
                  className={classnames(styles.compactFollowButton, {
                    [styles.following]: isFollowing,
                  })}
                  onClick={(e) => {
                    e.stopPropagation() // 阻止事件冒泡
                    handleFollowToggle()
                  }}
                >
                  <Text>{isFollowing ? '已关注' : '关注'}</Text>
                </View>
              )}
            </View>
            <View className={styles.compactTimeActions}>
              {showMoreButton && onMoreClick && (
                <View
                  className={styles.moreButton}
                  onClick={(e) => {
                    e.stopPropagation() // 阻止事件冒泡
                    onMoreClick()
                  }}
                >
                  <Image src={moreIcon} className={styles.moreIcon} />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    )
  }

  // 详细模式渲染（完整的用户信息卡片）
  if (mode === 'expanded') {
    return (
      <View className={containerClasses}>
        {/* 用户头像和基本信息 */}
        <View className={styles.userHeader}>
          <Image
            src={normalizeImageUrl(user?.avatar || undefined) || defaultAvatar}
            className={styles.avatar}
            mode="aspectFill"
          />

          <View className={styles.userInfo}>
            <View className={styles.userNameRow}>
              <Text className={styles.userName}>{truncateNickname(user?.nickname)}</Text>

              {/* 等级信息 */}
              {showLevel && levelInfo && (
                <View className={styles.levelBadge}>
                  <Image
                    src={levelIcon}
                    className={styles.levelIcon}
                    style={{ width: '14px', height: '14px' }}
                  />
                  <Text className={styles.levelText}>{levelInfo.level_name}</Text>
                </View>
              )}
            </View>

            {/* 学校信息 */}
            {(user?.school || user?.college) && (
              <Text className={styles.userSchool}>
                {user?.school || ''}
                {user?.college ? ` ${user.college}` : ''}
              </Text>
            )}

            {/* 位置信息 */}
            {showLocation && user?.location && (
              <View className={styles.userLocation}>
                <Image
                  src={locationIcon}
                  className={styles.locationIcon}
                  style={{ width: '12px', height: '12px' }}
                />
                <Text className={styles.locationText}>{user?.location}</Text>
              </View>
            )}

            {/* 时间信息 */}
            {showTime && createTime && (
              <Text className={styles.userTime}>{formatRelativeTime(createTime)}</Text>
            )}
          </View>

          {/* 关注按钮 */}
          {showFollowButton && !isCurrentUser && (
            <View
              className={classnames(styles.followButton, {
                [styles.following]: isFollowing,
              })}
              onClick={handleFollowToggle}
            >
              <Text>{isFollowing ? '已关注' : '+关注'}</Text>
            </View>
          )}
        </View>

        {/* 用户简介 */}
        {user?.bio && <Text className={styles.userBio}>{user?.bio}</Text>}

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
                  width: `${Math.min(100, levelInfo.progress * 100)}%`,
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

  // Profile模式渲染（个人中心页面）
  if (mode === 'profile') {
    return (
      <View className={containerClasses}>
        {/* 用户信息行 */}
        <View className={styles.profileUserInfoRow}>
          <View className={styles.profileAvatarContainer}>
            <View className={styles.profileAvatarWrapper}>
              <Image
                src={normalizeImageUrl(user?.avatar || undefined) || defaultAvatar}
                className={styles.profileAvatar}
                mode="aspectFill"
              />
            </View>
          </View>

          <View className={styles.profileUserDetails}>
            <Text className={styles.profileNickname}>{user?.nickname || '未设置昵称'}</Text>
            <Text className={styles.profileBio}>
              {user?.bio || '这个人很懒，还没有设置个性签名~'}
            </Text>
          </View>

          {/* 等级徽章 */}
          {showLevel && levelInfo && (
            <View className={styles.profileLevelBadge}>
              <Image
                src={levelIcon}
                className={styles.profileStarIcon}
                style={{ width: '14px', height: '14px' }}
              />
              <Text className={styles.profileLevelText}>{levelInfo.level_name}</Text>
            </View>
          )}

          {/* 编辑按钮 */}
          {showEditButton && (
            <View className={styles.profileEditButton} onClick={onEdit}>
              <Image
                src={settingsIcon}
                className={styles.profileEditIcon}
                style={{ width: '14px', height: '14px' }}
              />
              <Text>编辑</Text>
            </View>
          )}
        </View>

        {/* 统计信息 */}
        {showStats && (
          <View className={styles.profileStatsContainer}>
            <View className={styles.profileStatsRow}>
              <View className={styles.profileStatItem}>
                <Text className={styles.profileStatValue}>{postsCount}</Text>
                <View className={styles.profileStatLabelRow}>
                  <Image
                    src={postIcon}
                    className={styles.profileStatIcon}
                    style={{ width: '14px', height: '14px' }}
                  />
                  <Text className={styles.profileStatLabel}>帖子</Text>
                </View>
              </View>

              <View className={styles.profileStatItem}>
                <Text className={styles.profileStatValue}>{points}</Text>
                <View className={styles.profileStatLabelRow}>
                  <Image
                    src={levelIcon}
                    className={styles.profileStatIcon}
                    style={{ width: '14px', height: '14px' }}
                  />
                  <Text className={styles.profileStatLabel}>积分</Text>
                </View>
              </View>

              <View className={styles.profileStatItem}>
                <Text className={styles.profileStatValue}>{followingCount}</Text>
                <View className={styles.profileStatLabelRow}>
                  <Image
                    src={userIcon}
                    className={styles.profileStatIcon}
                    style={{ width: '14px', height: '14px' }}
                  />
                  <Text className={styles.profileStatLabel}>关注</Text>
                </View>
              </View>
            </View>

            <View className={styles.profileStatsRow}>
              <View className={styles.profileStatItem}>
                <Text className={styles.profileStatValue}>{followersCount}</Text>
                <View className={styles.profileStatLabelRow}>
                  <Image
                    src={userIcon}
                    className={styles.profileStatIcon}
                    style={{ width: '14px', height: '14px' }}
                  />
                  <Text className={styles.profileStatLabel}>粉丝</Text>
                </View>
              </View>

              {/* 占位符 */}
              <View className={styles.profileStatItem}></View>
              <View className={styles.profileStatItem}></View>
            </View>
          </View>
        )}

        {/* 操作菜单 */}
        {showMenu && (
          <View className={styles.profileMenuCard}>
            <View className={styles.profileMenuList}>
              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('likes')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={heartIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>我的点赞</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('favorites')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={starIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>我的收藏</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('comments')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={commentIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>我的评论</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('drafts')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={draftIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>草稿箱</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('history')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={historyIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>浏览历史</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('feedback')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={feedbackIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>意见反馈</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View
                className={styles.profileMenuItem}
                onClick={() => onMenuClick?.('campus-verification')}
              >
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={campusIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>校园认证</Text>
                  {isCampusVerified && <Text className={styles.profileVerifiedBadge}>已认证</Text>}
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('about')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={infoIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>关于我们</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>

              <View className={styles.profileMenuItem} onClick={() => onMenuClick?.('settings')}>
                <View className={styles.profileMenuLeft}>
                  <Image
                    src={settingsIcon}
                    className={styles.profileMenuIcon}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <Text className={styles.profileMenuText}>设置</Text>
                </View>
                <Text className={styles.profileChevron}>›</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}

export default AuthorInfo
