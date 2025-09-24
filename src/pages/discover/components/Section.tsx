import { View, Text } from '@tarojs/components'

import styles from './Section.module.scss'

interface SectionProps {
  title: string
  extraText?: string
  isLink?: boolean
  onExtraClick?: () => void
  children: React.ReactNode
}

export default function Section({
  title,
  extraText,
  isLink,
  onExtraClick,
  children,
}: SectionProps) {
  return (
    <View className={styles.section}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        {extraText && (
          <View className={isLink ? styles.link : styles.extra} onClick={onExtraClick}>
            <Text>{extraText}</Text>
          </View>
        )}
      </View>
      <View className={styles.content}>{children}</View>
    </View>
  )
}
