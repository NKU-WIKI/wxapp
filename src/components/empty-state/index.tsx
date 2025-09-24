import { ReactNode } from 'react'

import { View, Image, Text } from '@tarojs/components'


import styles from './index.module.scss'

interface EmptyStateProps {
  icon: string
  text: string | ReactNode
}

export default function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <View className={styles.emptyState}>
      <Image src={icon} className={styles.emptyIcon} />
      <Text className={styles.emptyText}>{text}</Text>
    </View>
  )
}
