import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

import React from 'react'
import { useSelector } from 'react-redux'

import styles from './index.module.scss'

import { RootState } from '@/store'

interface AuthFloatingButtonProps {
  /** 按钮图标路径 */
  iconSrc?: string
  /** 按钮类型（预设图标） */
  variant?: 'plus' | 'custom'
  /** 点击时的回调函数（已登录状态下执行） */
  onClick: () => void
  /** 按钮位置样式类名 */
  positionClass?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 未登录时的提示消息 */
  loginPrompt?: string
  /** 登录成功后重定向的页面路径 */
  redirectUrl?: string
}

const AuthFloatingButton: React.FC<AuthFloatingButtonProps> = ({
  iconSrc,
  variant = 'custom',
  onClick,
  positionClass = styles.floatingButton,
  style,
  loginPrompt = '您需要登录才能执行此操作，是否立即前往登录页面？',
  redirectUrl,
}) => {
  const { isLoggedIn, token } = useSelector((state: RootState) => state.user)

  const handleClick = () => {
    // 先检查鉴权
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '提示',
        content: loginPrompt,
        showCancel: true,
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 如果有重定向URL，传递给登录页面
            const loginUrl = redirectUrl
              ? `/pages/subpackage-profile/login/index?redirect=${encodeURIComponent(redirectUrl)}`
              : '/pages/subpackage-profile/login/index'
            Taro.navigateTo({ url: loginUrl })
          }
          // 如果用户点击取消，不执行任何操作
        },
      })
      return
    }

    // 已登录，执行自定义操作
    onClick()
  }

  // 根据 variant 决定显示的图标
  const getIconSrc = () => {
    if (variant === 'plus') {
      return '/assets/plus.svg'
    }
    return iconSrc || '/assets/plus.svg' // 默认使用加号图标
  }

  return (
    <View className={positionClass} style={style} onClick={handleClick}>
      {variant === 'plus' ? (
        <Text className={styles.plusIcon}>+</Text>
      ) : (
        <Image src={getIconSrc()} className={styles.floatingIcon} />
      )}
    </View>
  )
}

export default AuthFloatingButton
