import { View, Image, Text } from '@tarojs/components'
import styles from './HistoryItem.module.scss'
import { normalizeImageUrl } from '@/utils/image'

interface HistoryItemProps {
  item: {
    id: number
    title: string
    avatar: string
    date: string
  }
}

const HistoryItem = ({ item }: HistoryItemProps) => {
  return (
    <View className={styles.historyItem}>
      <Image src={normalizeImageUrl(item.avatar) || ''} className={styles.avatar} />
      <View className={styles.content}>
        <Text className={styles.title}>{item.title}</Text>
        <Text className={styles.date}>{item.date}</Text>
      </View>
    </View>
  )
}

export default HistoryItem