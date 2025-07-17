import { View, Text } from '@tarojs/components'
import styles from './Section.module.scss'

interface SectionProps {
  title: string;
  extraText?: string;
  isLink?: boolean; // Make isLink optional
  children: React.ReactNode;
}

export default function Section({ title, extraText, isLink, children }: SectionProps) {
  return (
    <View className={styles.section}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        {extraText && (
          <View className={isLink ? styles.link : styles.extra}>
             <Text>{extraText}</Text>
          </View>
        )}
      </View>
      <View className={styles.content}>
        {children}
      </View>
    </View>
  )
} 