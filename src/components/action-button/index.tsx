import React from 'react'
import { View, Text, Image, ITouchEvent, Button } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

export interface ActionButtonProps {
  icon: string
  activeIcon?: string
  text?: string | number
  onClick?: (_e: ITouchEvent) => void
  isActive?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
  /**
   * 开放能力类型，同小程序 Button 组件的 open-type
   */
  openType?: 'share' | 'getPhoneNumber' | 'getUserInfo' | 'launchApp' | 'openSetting' | 'feedback'
  /**
   * 是否禁用
   */
  disabled?: boolean
}

/**
 * 通用操作按钮组件 (如图标+文字)
 * @param {ActionButtonProps} props
 * @returns {React.ReactNode}
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  activeIcon,
  text,
  onClick,
  isActive = false,
  className = '',
  iconClassName = '',
  textClassName = '',
  openType,
  disabled = false
}) => {
  const iconSrc = isActive && activeIcon ? activeIcon : icon

  const handleClick = (e: ITouchEvent) => {
    if (disabled || !onClick) return
    e.stopPropagation() // 防止事件冒泡
    onClick(e)
  }

  return (
    <Button
      className={classnames(
        styles.actionButton,
        className,
        { [styles.disabled]: disabled }
      )}
      onClick={handleClick}
      openType={openType}
      disabled={disabled}
      // 重置小程序按钮的默认样式
      plain
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
        lineHeight: 'initial',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        outline: 'none',
      }}
    >
      <Image src={iconSrc} className={classnames(styles.icon, iconClassName)} />
      {/* 只有在 text prop 被提供时才渲染 Text 组件 */}
      {text !== undefined && text !== null && (
        <Text className={classnames(styles.text, textClassName)}>{text}</Text>
      )}
    </Button>
  )
}

export default ActionButton
