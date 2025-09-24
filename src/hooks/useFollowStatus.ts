import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { getActionStatus } from '@/services/api/user'
import { RootState } from '@/store'

/**
 * 获取用户关注状态的hook
 * @param userId 要检查的用户ID
 * @returns 关注状态和加载状态
 */
export const useFollowStatus = (userId: string | undefined) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn)

  const refreshFollowStatus = useCallback(async () => {
    if (!userId || !isLoggedIn) {
      setIsFollowing(false)
      return
    }

    try {
      setLoading(true)
      const response = await getActionStatus(userId, 'user', 'follow')
      setIsFollowing(response.data.is_active)
    } catch {
      setIsFollowing(false)
    } finally {
      setLoading(false)
    }
  }, [userId, isLoggedIn])

  useEffect(() => {
    refreshFollowStatus()
  }, [refreshFollowStatus])

  const updateFollowStatus = useCallback((newStatus: boolean) => {
    setIsFollowing(newStatus)
  }, [])

  return { isFollowing, loading, refreshFollowStatus, updateFollowStatus }
}

/**
 * 批量获取用户关注状态
 * @param userIds 用户ID数组
 * @returns 关注状态映射表和更新函数
 */
export const useMultipleFollowStatus = (userIds: string[]) => {
  const [followStatusMap, setFollowStatusMap] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn)

  const refreshFollowStatus = useCallback(async () => {
    if (!userIds.length || !isLoggedIn) {
      setFollowStatusMap({})
      return
    }

    try {
      setLoading(true)
      const statusMap: Record<string, boolean> = {}

      // 并发请求所有用户的关注状态
      const promises = userIds.map(async (userId) => {
        try {
          const response = await getActionStatus(userId, 'user', 'follow')
          statusMap[userId] = response.data.is_active
        } catch (error) {
          statusMap[userId] = false
        }
      })

      await Promise.all(promises)
      setFollowStatusMap(statusMap)
    } catch (error) {
      setFollowStatusMap({})
    } finally {
      setLoading(false)
    }
  }, [userIds, isLoggedIn])

  useEffect(() => {
    refreshFollowStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIds.length > 0 ? userIds.join(',') : '', isLoggedIn]) // 添加isLoggedIn依赖

  const updateFollowStatus = useCallback((userId: string, newStatus: boolean) => {
    setFollowStatusMap((prev) => ({
      ...prev,
      [userId]: newStatus,
    }))
  }, [])

  return { followStatusMap, loading, refreshFollowStatus, updateFollowStatus }
}
