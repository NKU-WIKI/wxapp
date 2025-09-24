import { View } from '@tarojs/components'

import styles from './index.module.scss'

interface PostItemSkeletonProps {
  className?: string
}

export default function PostItemSkeleton({ className }: PostItemSkeletonProps) {
  return (
    <View className={`${styles.skeletonContainer} ${className || ''}`}>
      <View className={styles.header}>
        <View className={styles.avatar} />
        <View className={styles.authorInfo}>
          <View className={styles.line} style={{ width: '40%' }} />
          <View className={styles.line} style={{ width: '30%', height: '10px' }} />
        </View>
      </View>
      <View className={styles.content}>
        <View className={styles.line} style={{ width: '100%' }} />
        <View className={styles.line} style={{ width: '90%' }} />
        <View className={styles.line} style={{ width: '70%' }} />
      </View>
    </View>
  )
}
