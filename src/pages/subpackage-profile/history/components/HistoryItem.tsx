import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

// Type imports
import { HistoryItem as HistoryItemType } from '@/types/history'

// Utils imports
import { normalizeImageUrl } from '@/utils/image'
import { formatRelativeTime } from '@/utils/time'

// Relative imports
import styles from './HistoryItem.module.scss'

interface HistoryItemProps {
  item: HistoryItemType
  onDelete: () => void
}

const HistoryItem = ({ item, onDelete }: HistoryItemProps) => {
  const handleClick = () => {
    // 跳转到帖子详情页
    Taro.navigateTo({
      url: `/pages/subpackage-interactive/post-detail/index?id=${item.id}`
    })
  }

  const handleDelete = (e: any) => {
    e.stopPropagation()
    onDelete()
  }



  return (
    <View className={styles.item} onClick={handleClick}>
      {/* 头像 */}
      <Image 
        src={normalizeImageUrl(item.avatar) || '/assets/avatar1.png'} 
        className={styles.avatar} 
      />
      
      {/* 内容区域 */}
      <View className={styles.content}>
        <Text className={styles.title}>{item.title}</Text>
        <Text className={styles.publishTime}>
          {formatRelativeTime(item.createdAt)}发布
        </Text>
      </View>
      
      {/* 右侧操作区域 */}
      <View className={styles.right}>
        <Text className={styles.viewTime}>
          {formatRelativeTime(item.viewedAt)}浏览
        </Text>
        <View 
          className={styles.deleteIcon}
          onClick={handleDelete}
        />
      </View>
    </View>
  )
}

export default HistoryItem
