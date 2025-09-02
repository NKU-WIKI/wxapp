import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';

// Assets imports
import starFilledIcon from '@/assets/star-filled.svg';
import starOutlineIcon from '@/assets/star-outline.svg';

// Relative imports
import styles from './RatingItem.module.scss';

interface RatingItemProps {
  /**
   * 资源数据 - 显示资源信息而不是具体评价
   */
  resource: {
    id: string
    resource_name: string
    title?: string
    resource_type: string
    image_url?: string | null
    resource_url?: string | null
    average_score: number
    rating_count: number
    creator_id?: string
    description?: string | null
    latest_rating_at?: string
    created_at: string
    updated_at: string
    is_active: boolean
  }
  /**
   * 点击事件
   */
  onItemClick?: () => void
}

const RatingItem = ({ resource, onItemClick }: RatingItemProps) => {
  const [imageLoadError, setImageLoadError] = useState(false)

  // 数据验证
  if (!resource || !resource.id) {
    return null
  }

  // 渲染星级评分（支持精确百分比）
  const renderStars = (score: number, maxRating: number = 5) => {
    const stars: JSX.Element[] = []
    
    for (let i = 0; i < maxRating; i++) {
      const starScore = Math.max(0, Math.min(1, score - i))
      
      if (starScore >= 1) {
        // 完整的星星
        stars.push(
          <Image
            key={i}
            src={starFilledIcon}
            className={styles.starIcon}
            style={{ width: '16px', height: '16px' }}
          />
        )
      } else if (starScore > 0) {
        // 部分填充的星星（使用百分比渐变）
        const percentage = starScore * 100
        stars.push(
          <View key={i} className={styles.starContainer}>
            {/* 底层空心星星 */}
            <Image
              src={starOutlineIcon}
              className={styles.starIcon}
              style={{ width: '16px', height: '16px', opacity: 0.3 }}
            />
            {/* 覆盖的实心星星，使用渐变遮罩 */}
            <View 
              className={styles.starFillContainer}
              style={{
                width: `${percentage}%`
              }}
            >
              <Image
                src={starFilledIcon}
                className={styles.starIcon}
                style={{ width: '16px', height: '16px' }}
              />
            </View>
          </View>
        )
      } else {
        // 空心星星
        stars.push(
          <Image
            key={i}
            src={starOutlineIcon}
            className={styles.starIcon}
            style={{ width: '16px', height: '16px', opacity: 0.3 }}
          />
        )
      }
    }
    
    return stars
  }

  // 格式化评分数量
  const formatRatingCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  // 获取默认图片
  const getDefaultImage = () => {
    // 根据资源类型返回默认图片，使用现有的 SVG 图标
    const typeMap: Record<string, string> = {
      '学习': '/assets/book.svg',
      '美食': '/assets/market.svg',
      '游戏': '/assets/music.svg',
      '娱乐': '/assets/music.svg',
      '生活': '/assets/shopping-bag.svg',
      '运动': '/assets/award.svg',
      '其他': '/assets/lightbulb.svg'
    }
    return typeMap[resource.resource_type] || '/assets/lightbulb.svg'
  }

  const handleClick = () => {
    
    onItemClick?.(resource)
  }

  const handleImageError = () => {
    setImageLoadError(true)
  }

  return (
    <View className={styles.ratingItem} onClick={handleClick}>
      {/* 资源图片 */}
      <View className={styles.imageContainer}>
        <Image
          src={imageLoadError ? getDefaultImage() : (resource.image_url || getDefaultImage())}
          className={styles.resourceImage}
          mode='aspectFill'
          onError={handleImageError}
        />
      </View>

      {/* 资源信息 */}
      <View className={styles.contentContainer}>
        {/* 资源名称 */}
        <Text className={styles.resourceName}>
          {resource.title || resource.resource_name}
        </Text>

        {/* 资源描述/位置信息 */}
        {resource.description && (
          <Text className={styles.resourceDescription}>
            {resource.description}
          </Text>
        )}

        {/* 评分信息 */}
        <View className={styles.ratingInfo}>
          {/* 星级评分 */}
          <View className={styles.starsContainer}>
            {renderStars(resource.average_score)}
          </View>
          
          {/* 评分数值和评价数量 */}
          <View className={styles.ratingDetails}>
            <Text className={styles.scoreText}>
              {resource.average_score.toFixed(1)}
            </Text>
            <Text className={styles.ratingCount}>
              {formatRatingCount(resource.rating_count)}条评价
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default RatingItem
