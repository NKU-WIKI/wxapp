import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { User } from '@/types/api/user'
import { LevelInfo } from '@/types/api/level'
import { getUserById, getActionStatus } from '@/services/api/user'
import { RootState } from '@/store'
import { convertLevelToRealm } from '@/utils/levelConverter'
import { useAuthGuard } from './useAuthGuard'

export interface AuthorInfo {
  user: User
  levelInfo?: LevelInfo
  isFollowing: boolean
  followersCount: number
  followingCount: number
  postsCount: number
  isLoading: boolean
  error?: string
}

export interface UseAuthorInfoOptions {
  /** 是否自动获取等级信息 */
  includeLevel?: boolean
  /** 是否自动获取关注状态 */
  includeFollowStatus?: boolean
  /** 是否自动获取统计信息 */
  includeStats?: boolean
}

/**
 * 作者信息hook
 * 用于获取和管理作者的详细信息、等级信息、关注状态等
 */
export const useAuthorInfo = (
  userId: string | undefined,
  options: UseAuthorInfoOptions = {}
): AuthorInfo & {
  refetch: () => Promise<void>
  follow: () => Promise<void>
  unfollow: () => Promise<void>
} => {
  const {
    includeLevel = true,
    includeFollowStatus = true,
    includeStats = true
  } = options

  const { checkAuth } = useAuthGuard()
  const currentUserId = useSelector((state: RootState) => state.user.user?.id)

  const [user, setUser] = useState<User | null>(null)
  const [levelInfo, setLevelInfo] = useState<LevelInfo | undefined>()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [postsCount, setPostsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  // 获取用户信息
  const fetchUserInfo = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(undefined)

      const userResponse = await getUserById(userId)
      if (userResponse.code === 0) {
        setUser(userResponse.data)

        // 在获取用户信息后立即提取等级和统计信息
        const userData = userResponse.data
        if (includeLevel) {
          try {
            const userLevel = userData.level || 1
            const levelInfoData: LevelInfo = {
              level: userLevel,
              exp: 0,
              next_level_exp: undefined,
              prev_level_exp: undefined,
              progress: 0,
              level_name: convertLevelToRealm(userLevel),
              next_level_name: userLevel < 7 ? convertLevelToRealm(userLevel + 1) : undefined,
              rules: []
            }
            setLevelInfo(levelInfoData)
          } catch (_err) {
            // 忽略等级信息提取错误
          }
        }

        if (includeStats) {
          try {
            setPostsCount(userData.post_count || 0)
            setFollowingCount(userData.following_count || 0)
            setFollowersCount(userData.follower_count || 0)
          } catch (_err) {
            // 忽略统计信息提取错误
          }
        } 
      } else {
        throw new Error(userResponse.message || '获取用户信息失败')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败'
      setError(errorMessage)
      // 忽略用户信息获取错误
    } finally {
      setIsLoading(false)
    }
  }, [userId, includeLevel, includeStats])

  // 获取关注状态
  const fetchFollowStatus = useCallback(async () => {
    if (!userId || !currentUserId || !includeFollowStatus || userId === currentUserId) return

    try {
      const followResponse = await getActionStatus(userId, 'user', 'follow')
      if (followResponse.code === 0) {
        setIsFollowing(followResponse.data.is_active)
        setFollowersCount(followResponse.data.count)
      }
    } catch (_err) {
      // 忽略关注状态获取错误
    }
  }, [userId, currentUserId, includeFollowStatus])

  // 关注用户
  const follow = useCallback(async () => {
    if (!checkAuth() || !userId) return

    try {
      // 这里应该调用关注API
      // 暂时模拟关注成功
      setIsFollowing(true)
      setFollowersCount(prev => prev + 1)
    } catch (_err) {
      // 忽略关注操作错误
    }
  }, [checkAuth, userId])

  // 取消关注
  const unfollow = useCallback(async () => {
    if (!checkAuth() || !userId) return

    try {
      // 这里应该调用取消关注API
      // 暂时模拟取消关注成功
      setIsFollowing(false)
      setFollowersCount(prev => Math.max(0, prev - 1))
    } catch (_err) {
      // 忽略取消关注操作错误
    }
  }, [checkAuth, userId])

  // 重新获取数据
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchUserInfo(),
      fetchFollowStatus()
    ])
  }, [fetchUserInfo, fetchFollowStatus])

  // 初始化数据
  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    user: user!,
    levelInfo,
    isFollowing,
    followersCount,
    followingCount,
    postsCount,
    isLoading,
    error,
    refetch,
    follow,
    unfollow
  }
}



