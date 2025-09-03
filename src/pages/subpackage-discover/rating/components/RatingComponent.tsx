import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import styles from './RatingComponent.module.scss'

interface RatingComponentProps {
  /**
   * 评分项目的标题
   */
  title: string
  /**
   * 评分项目的描述
   */
  description?: string
  /**
   * 最大评分值，默认为5
   */
  maxRating?: number
  /**
   * 当前评分值
   */
  value?: number
  /**
   * 是否只读模式
   */
  readonly?: boolean
  /**
   * 评分变化回调
   */
  onChange?: (_rating: number) => void
  /**
   * 自定义样式类名
   */
  className?: string
}

/**
 * 评分组件
 * 支持星级评分、数字评分等多种形式
 */
const RatingComponent = ({
  title,
  description,
  maxRating = 5,
  value = 0,
  readonly = false,
  onChange,
  className = ''
}: RatingComponentProps) => {
  const [currentRating, setCurrentRating] = useState(value)
  const [hoverRating, setHoverRating] = useState(0)

  // 同步外部传入的 value 值
  useEffect(() => {
    setCurrentRating(value)
  }, [value])

  // 处理评分点击
  const handleRatingClick = (rating: number) => {
    if (readonly) return

    setCurrentRating(rating)
    if (onChange) {
      onChange(rating)
    }
  }

  // 处理鼠标悬停（小程序中用 touch 事件模拟）
  const handleRatingHover = (rating: number) => {
    if (readonly) return
    setHoverRating(rating)
  }

  // 处理鼠标离开
  const handleRatingLeave = () => {
    if (readonly) return
    setHoverRating(0)
  }

  // 渲染星星
  const renderStars = () => {
    const stars: JSX.Element[] = []
    const displayRating = hoverRating || currentRating

    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= displayRating
      stars.push(
        <View
          key={i}
          className={`${styles.star} ${isFilled ? styles.filled : ''} ${readonly ? styles.readonly : ''}`}
          onClick={() => handleRatingClick(i)}
          onTouchStart={() => handleRatingHover(i)}
          onTouchEnd={handleRatingLeave}
        >
          <Text className={styles.starIcon}>
            {isFilled ? '★' : '☆'}
          </Text>
        </View>
      )
    }

    return stars
  }

  return (
    <View className={`${styles.ratingComponent} ${className}`}>
      {/* 标题和描述 */}
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        {description && (
          <Text className={styles.description}>{description}</Text>
        )}
      </View>

      {/* 评分区域 */}
      <View className={styles.ratingContainer}>
        <View className={styles.starsContainer}>
          {renderStars()}
        </View>
        
        {/* 评分数值显示 */}
        <View className={styles.ratingValue}>
          <Text className={styles.ratingText}>
            {currentRating || hoverRating || 0} / {maxRating}
          </Text>
        </View>
      </View>

      {/* 评分说明 */}
      {!readonly && (
        <View className={styles.ratingHint}>
          <Text className={styles.hintText}>
            点击星星进行评分
          </Text>
        </View>
      )}
    </View>
  )
}

export default RatingComponent
