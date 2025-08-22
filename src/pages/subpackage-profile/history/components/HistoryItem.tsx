import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './HistoryItem.module.scss'
import { normalizeImageUrl } from '@/utils/image'
import { HistoryItem as HistoryItemType } from '@/types/history'
import { formatRelativeTime } from '@/utils/time'

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

  // 调试时间字段
  console.log('🔍 历史项时间调试:', {
    id: item.id,
    title: item.title,
    createdAt: item.createdAt,
    viewedAt: item.viewedAt,
    createdAtFormatted: formatRelativeTime(item.createdAt),
    viewedAtFormatted: formatRelativeTime(item.viewedAt)
  });

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