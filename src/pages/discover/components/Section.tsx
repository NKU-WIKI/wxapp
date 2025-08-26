import { View, Text } from '@tarojs/components'
import styles from './Section.module.scss'

interface SectionProps {
  title: string;
  extraText?: string;
  isLink?: boolean;
  showAiToggle?: boolean;
  aiEnabled?: boolean;
  onAiToggle?: () => void;
  onExtraClick?: () => void; // 新增
  children: React.ReactNode;
}

export default function Section({
  title,
  extraText,
  isLink,
  showAiToggle,
  aiEnabled,
  onAiToggle,
  onExtraClick,
  children
}: SectionProps) {
  return (
    <View className={styles.section}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        {showAiToggle ? (
          <View className={styles.aiToggleContainer}>
            <Text className={styles.aiToggleLabel}>AI推荐</Text>
            <View
              className={`${styles.toggle} ${aiEnabled ? styles.toggleEnabled : styles.toggleDisabled}`}
              onClick={onAiToggle}
            >
              <View className={`${styles.toggleSlider} ${aiEnabled ? styles.sliderEnabled : styles.sliderDisabled}`} />
            </View>
          </View>
        ) : extraText && (
          <View className={isLink ? styles.link : styles.extra} onClick={onExtraClick}>
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
