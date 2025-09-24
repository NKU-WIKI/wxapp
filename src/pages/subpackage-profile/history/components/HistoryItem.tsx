import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

// Type imports

import { ViewHistoryRead } from '@/types/history'

// Utils imports
import { formatRelativeTime } from '@/utils/time'

import styles from './HistoryItem.module.scss'

// Relative imports

interface HistoryItemProps {
  item: ViewHistoryRead
  onDelete: () => void
}

const HistoryItem = ({ item, onDelete }: HistoryItemProps) => {
  const handleClick = () => {
    // 根据目标类型跳转到不同的详情页
    if (item.target_type === 'post') {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${item.target_id}`,
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' })
      })
    } else if (item.target_type === 'product') {
      // 跳转到商品详情页
      Taro.navigateTo({
        url: `/pages/subpackage-commerce/pages/product-detail/index?id=${item.target_id}`,
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' })
      })
    } else if (item.target_type === 'user') {
      // 跳转到用户详情页
      Taro.navigateTo({
        url: `/pages/subpackage-profile/user-detail/index?id=${item.target_id}`,
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' })
      })
    }
  }

  const handleDelete = (e: any) => {
    e.stopPropagation()
    onDelete()
  }

  // 获取目标类型的显示文本
  const getTargetTypeText = (type: string) => {
    switch (type) {
      case 'post':
        return '帖子'
      case 'product':
        return '商品'
      case 'user':
        return '用户'
      default:
        return '内容'
    }
  }

  return (
    <View className={styles.item} onClick={handleClick}>
      {/* 默认头像 */}
      <Image src="/assets/avatar1.png" className={styles.avatar} />

      {/* 内容区域 */}
      <View className={styles.content}>
        <Text className={styles.title}>
          {getTargetTypeText(item.target_type)} - {item.target_id.slice(0, 8)}...
        </Text>
        <Text className={styles.publishTime}>{formatRelativeTime(item.created_at)}浏览</Text>
      </View>

      {/* 右侧操作区域 */}
      <View className={styles.right}>
        <Text className={styles.viewTime}>{formatRelativeTime(item.updated_at)}</Text>
        <View className={styles.deleteIcon} onClick={handleDelete} />
      </View>
    </View>
  )
}

export default HistoryItem
