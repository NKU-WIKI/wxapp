import React from 'react'

import { View } from '@tarojs/components'

import classnames from 'classnames'

import styles from './index.module.scss'

export interface BadgeProps extends React.ComponentProps<typeof View> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const badgeClasses = classnames(styles.badge, styles[variant], className)

  return <View className={badgeClasses} {...props} />
}

export default Badge
