import { View, Text, ScrollView } from '@tarojs/components'

import { useState } from 'react'

import RatingComponent from './RatingComponent'
import styles from './RatingList.module.scss'

// 评分项目类型定义
interface RatingItem {
  id: string
  title: string
  description?: string
  maxRating?: number
  currentRating?: number
  readonly?: boolean
}

interface RatingListProps {
  /**
   * 评分项目列表
   */
  items: RatingItem[]
  /**
   * 列表标题
   */
  title?: string
  /**
   * 是否显示总分
   */
  showTotal?: boolean
  /**
   * 评分变化回调
   */
  onRatingChange?: (_itemId: string, _rating: number) => void
  /**
   * 自定义样式类名
   */
  className?: string
}

/**
 * 评分列表组件
 * 用于展示和管理多个评分项目
 */
const RatingList = ({
  items = [],
  title,
  showTotal = false,
  onRatingChange: _onRatingChange,
  className = '',
}: RatingListProps) => {
  const [ratings] = useState<Record<string, number>>(() => {
    const initialRatings: Record<string, number> = {}
    items.forEach((item) => {
      if (item.currentRating !== undefined) {
        initialRatings[item.id] = item.currentRating
      }
    })
    return initialRatings
  })

  // 处理单个评分变化
  const handleRatingChange = (_itemId: string, _rating: number) => {
    // 暂时不处理评分变化
  }

  // 计算总分
  const calculateTotal = () => {
    const totalRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0)
    const maxTotal = items.reduce((sum, item) => sum + (item.maxRating || 5), 0)
    return { totalRating, maxTotal }
  }

  const { totalRating, maxTotal } = calculateTotal()

  return (
    <View className={`${styles.ratingList} ${className}`}>
      {/* 列表标题 */}
      {title && (
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>{title}</Text>
        </View>
      )}

      {/* 评分项目列表 */}
      <ScrollView className={styles.listContent} scrollY enhanced>
        {items.length > 0 ? (
          items.map((item) => (
            <RatingComponent
              key={item.id}
              title={item.title}
              description={item.description}
              maxRating={item.maxRating}
              value={ratings[item.id] || item.currentRating || 0}
              readonly={item.readonly}
              onChange={(rating) => handleRatingChange(item.id, rating)}
              className={styles.ratingItem}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <View className={styles.emptyIcon}>📝</View>
            <Text className={styles.emptyTitle}>暂无评分项目</Text>
            <Text className={styles.emptyDescription}>当前没有可评分的内容</Text>
          </View>
        )}
      </ScrollView>

      {/* 总分显示 */}
      {showTotal && items.length > 0 && (
        <View className={styles.totalSection}>
          <View className={styles.totalContainer}>
            <Text className={styles.totalLabel}>总分</Text>
            <View className={styles.totalScore}>
              <Text className={styles.totalValue}>{totalRating}</Text>
              <Text className={styles.totalMax}>/ {maxTotal}</Text>
            </View>
            <View className={styles.totalPercentage}>
              <Text className={styles.percentageText}>
                {maxTotal > 0 ? Math.round((totalRating / maxTotal) * 100) : 0}%
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default RatingList
