import React, { useState, useCallback, useEffect } from 'react'

import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'

import classnames from 'classnames'
import { useSelector } from 'react-redux'


import ActionButton, { ActionButtonProps } from '@/components/action-button'
import { toggleAction } from '@/services/api/action'
import { marketplaceApi } from '@/services/api/marketplace'
import { RootState } from '@/store'
import { checkLoginWithModal } from '@/utils/auth'
import { BBSNotificationHelper } from '@/utils/notificationHelper'

import styles from './index.module.scss'

export interface ActionButtonConfig {
  /**
   * 按钮类型
   * - like: 点赞按钮（默认需要登录）
   * - favorite: 收藏按钮（默认需要登录）
   * - follow: 关注按钮（默认需要登录）
   * - comment: 评论按钮（默认不需要登录）
   * - share: 分享按钮（默认不需要登录）
   * - custom: 自定义按钮（权限由 requireAuth 决定）
   */
  type: 'like' | 'favorite' | 'follow' | 'share' | 'comment' | 'custom'
  /**
   * 按钮图标（未激活状态）
   */
  icon: string
  /**
   * 按钮图标（激活状态）
   */
  activeIcon?: string
  /**
   * 自定义文本（仅type='custom'时有效）
   */
  text?: string
  /**
   * 自定义点击处理（仅type='custom'时有效）
   */
  onClick?: () => void
  /**
   * 是否需要登录权限
   * - undefined: 自动判断（like/favorite/follow 需要登录）
   * - true: 需要登录
   * - false: 不需要登录
   */
  requireAuth?: boolean
  /**
   * 未登录时是否禁用按钮
   * - undefined: 使用全局配置
   * - true: 禁用按钮
   * - false: 不禁用按钮，点击时提示登录
   */
  disabledWhenNotLoggedIn?: boolean
}

export interface ActionBarProps {
  /**
   * 按钮配置数组
   */
  buttons: ActionButtonConfig[]
  /**
   * 自定义容器样式类名
   */
  className?: string
  /**
   * 目标对象ID（用于action/toggle操作）
   */
  targetId: string
  /**
   * 目标对象类型（用于action/toggle操作）
   */
  targetType: 'post' | 'comment' | 'user' | 'listing' | 'note' | 'activity' | 'errand'
  /**
   * 初始状态配置（可选，用于初始化按钮状态）
   */
  initialStates?: Record<string, { isActive: boolean; count: number }>
  /**
   * 状态变化回调
   */
  onStateChange?: (_type: string, _isActive: boolean, _count: number) => void
  /**
   * 帖子信息（用于创建通知，仅targetType为'post'时需要）
   */
  postInfo?: {
    title: string
    authorId: string
  }
  /**
   * 鉴权配置
   */
  authConfig?: {
    /**
     * 未登录时是否禁用需要权限的按钮（默认为true）
     */
    disabledWhenNotLoggedIn?: boolean
    /**
     * 自定义登录提示消息
     */
    loginPrompt?: string
  }
}

/**
 * 通用操作栏组件，用于水平排列一组操作按钮
 *
 * 增强版特性：
 * - 自动登录鉴权：点赞、收藏等操作自动检查登录状态
 * - 可配置禁用：未登录时可选择禁用按钮或点击时提示
 * - 自定义提示：支持自定义登录提示消息
 * - 灵活配置：支持按按钮级别或全局级别的鉴权配置
 *
 * @example
 * ```tsx
 * // 基础用法（自动鉴权）
 * const buttons = [
 *   { type: 'like', icon: '/assets/heart-outline.svg', activeIcon: '/assets/heart-bold.svg' },
 *   { type: 'comment', icon: '/assets/message-circle.svg' }
 * ];
 *
 * <ActionBar
 *   buttons={buttons}
 *   targetId="post-123"
 *   targetType="post"
 * />
 *
 * // 自定义鉴权配置
 * <ActionBar
 *   buttons={buttons}
 *   targetId="post-123"
 *   targetType="post"
 *   authConfig={{
 *     disabledWhenNotLoggedIn: true,
 *     loginPrompt: '需要登录才能点赞哦'
 *   }}
 * />
 * ```
 *
 * @param {ActionBarProps} props
 * @returns {React.ReactNode}
 */
const ActionBar: React.FC<ActionBarProps> = ({
  buttons,
  className,
  targetId,
  targetType,
  initialStates = {},
  onStateChange,
  postInfo,
  authConfig = {},
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [localStates, setLocalStates] =
    useState<Record<string, { isActive: boolean; count: number }>>(initialStates)
  const isLoggedIn = useSelector((state: RootState) => !!(state.user.user && state.user.token))
  const currentUser = useSelector((state: RootState) => state.user.user)

  // 初始化本地状态（如果还没有初始化）
  useEffect(() => {
    setLocalStates((prev) => {
      const newStates = { ...prev }
      buttons.forEach((button, index) => {
        const key = `${button.type}-${index}`
        if (!newStates[key]) {
          // 使用初始状态，如果没有则默认为未激活状态
          newStates[key] = initialStates[key] || { isActive: false, count: 0 }
        }
      })
      return newStates
    })
  }, [buttons, initialStates])

  // 登录检查函数
  const checkLogin = useCallback(async (): Promise<boolean> => {
    return await checkLoginWithModal()
  }, [])

  // 处理评论功能
  const handleComment = useCallback(
    (buttonIndex: number) => {
      const key = `comment-${buttonIndex}`

      // 如果是帖子类型，直接跳转到帖子详情页
      if (targetType === 'post') {
        Taro.navigateTo({
          url: `/pages/subpackage-interactive/post-detail/index?id=${targetId}`,
        })
        return
      }

      // 其他类型的评论处理（例如活动等）
      // 切换评论状态（表示用户正在评论或已评论）
      setLocalStates((prev) => {
        const currentState = prev[key] || { isActive: false, count: 0 }
        return {
          ...prev,
          [key]: {
            ...currentState,
            isActive: !currentState.isActive, // 切换激活状态
          },
        }
      })

      // 调用外部回调，通知需要聚焦到评论区
      onStateChange?.('comment', true, 0)
    },
    [onStateChange, targetType, targetId]
  )

  // 判断按钮是否需要登录权限
  const requiresAuth = useCallback((button: ActionButtonConfig): boolean => {
    // 如果明确配置了 requireAuth，使用配置值
    if (button.requireAuth !== undefined) {
      return button.requireAuth
    }

    // 默认规则：点赞、收藏、关注需要登录
    return ['like', 'favorite', 'follow'].includes(button.type)
  }, [])

  // 判断按钮是否应该被禁用
  const isButtonDisabled = useCallback(
    (button: ActionButtonConfig): boolean => {
      const needsAuth = requiresAuth(button)
      const globalDisabled = authConfig.disabledWhenNotLoggedIn ?? false // 默认改为false，不禁用
      const buttonDisabled = button.disabledWhenNotLoggedIn ?? globalDisabled

      // 未登录且需要权限且配置了禁用时，禁用按钮
      return !isLoggedIn && needsAuth && buttonDisabled
    },
    [isLoggedIn, requiresAuth, authConfig.disabledWhenNotLoggedIn]
  )

  // 处理按钮点击
  const handleButtonClick = useCallback(
    async (button: ActionButtonConfig, index: number) => {
      const key = `${button.type}-${index}`

      // 如果正在加载，忽略点击
      if (loadingStates[key]) {
        return
      }

      // 如果按钮被禁用，显示提示信息
      if (isButtonDisabled(button)) {
        Taro.showToast({
          title: authConfig.loginPrompt || '请先登录',
          icon: 'none',
          duration: 2000,
        })
        return
      }

      if (button.type === 'custom' || button.type === 'share') {
        // 自定义按钮和分享按钮，直接调用外部处理函数（分享按钮通过 openType 实现，此处可用于附加逻辑）
        button.onClick?.()
        return
      }

      if (button.type === 'comment') {
        // 评论按钮，聚焦到评论区
        handleComment(index)
        return
      }

      // 检查登录状态（如果需要的话）
      if (requiresAuth(button)) {
        if (!isLoggedIn) {
          const isLogged = await checkLogin()
          if (!isLogged) {
            return // 用户拒绝登录，不继续执行
          }
          return // 跳转到登录页面，操作中断
        }
      }

      // 开始加载状态
      setLoadingStates((prev) => ({ ...prev, [key]: true }))

      try {
        let response

        // 根据操作类型调用相应的API
        if (targetType === 'listing' && button.type === 'favorite') {
          response = await marketplaceApi.toggleFavorite(targetId)
        } else {
          response = await toggleAction({
            target_id: targetId,
            target_type: targetType as any,
            action_type: button.type as any,
          })
        }

        const isActive = response?.data?.is_active ?? !localStates[key]?.isActive
        const count = response?.data?.count ?? localStates[key]?.count ?? 0

        setLocalStates((prev) => ({
          ...prev,
          [key]: { isActive, count },
        }))

        // 创建通知（仅针对帖子的点赞和收藏操作）
        if (
          targetType === 'post' &&
          postInfo &&
          (button.type === 'like' || button.type === 'favorite')
        ) {
          try {
            if (currentUser?.id) {
              if (button.type === 'like') {
                // 创建点赞通知
                BBSNotificationHelper.handleLikeNotification({
                  postId: targetId,
                  postTitle: postInfo.title,
                  postAuthorId: postInfo.authorId,
                  currentUserId: currentUser.id,
                  isLiked: isActive,
                })
              } else if (button.type === 'favorite') {
                // 创建收藏通知
                BBSNotificationHelper.handleCollectNotification({
                  postId: targetId,
                  postTitle: postInfo.title,
                  postAuthorId: postInfo.authorId,
                  currentUserId: currentUser.id,
                  isCollected: isActive,
                })
              }
            }
          } catch (notificationError) {
            // 静默处理通知创建错误，不影响主要功能
          }
        }

        // 调用外部回调
        onStateChange?.(button.type, isActive, count)
      } catch (error) {
        Taro.showToast({
          title: '操作失败，请稍后重试',
          icon: 'none',
          duration: 2000,
        })
      } finally {
        setLoadingStates((prev) => ({ ...prev, [key]: false }))
      }
    },
    [
      targetId,
      targetType,
      localStates,
      loadingStates,
      onStateChange,
      handleComment,
      checkLogin,
      isButtonDisabled,
      requiresAuth,
      authConfig.loginPrompt,
      currentUser?.id,
      isLoggedIn,
      postInfo,
    ]
  )

  if (!buttons || buttons.length === 0) {
    return null
  }

  return (
    <View className={classnames(styles.actionBar, className)}>
      {buttons.map((button, index) => {
        const key = `${button.type}-${index}`
        const isLoading = loadingStates[key]
        const localState = localStates[key]

        // 使用本地状态或按钮配置中的文本
        const currentIsActive =
          button.type === 'custom' || button.type === 'share'
            ? false
            : button.type === 'comment'
              ? (localState?.isActive ?? false)
              : (localState?.isActive ?? false)

        const currentText =
          button.type === 'custom' ? button.text || '' : (localState?.count?.toString() ?? '0')

        const actionButtonProps: ActionButtonProps = {
          icon: button.icon,
          activeIcon: button.activeIcon || button.icon,
          text: currentText,
          isActive: currentIsActive,
          onClick: () => handleButtonClick(button, index),
          disabled: isButtonDisabled(button),
          className: isLoading ? 'loading' : undefined,
          openType: button.type === 'share' ? 'share' : undefined,
        }

        return <ActionButton key={key} {...actionButtonProps} />
      })}
    </View>
  )
}

export default ActionBar
