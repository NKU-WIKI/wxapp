import { View, Text, Image } from '@tarojs/components'
import { useState } from 'react'
import styles from './RatingItem.module.scss'

// 引入星星图标
import starFilledIcon from '@/assets/star-filled.svg'
import starOutlineIcon from '@/assets/star-outline.svg'

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
  onItemClick?: (resource: any) => void
}

const RatingItem = ({ resource, onItemClick }: RatingItemProps) => {
  const [imageLoadError, setImageLoadError] = useState(false)

  // 数据验证
  if (!resource || !resource.id) {
    console.warn('⚠️ RatingItem: 无效的资源数据', resource)
    return null
  }

  // 渲染星级评分（支持渐变效果）
  const renderStars = (score: number, maxRating: number = 5) => {
    const stars: JSX.Element[] = []
    const fullStars = Math.floor(score)
    const decimalPart = score % 1
    
    for (let i = 0; i < maxRating; i++) {
      if (i < fullStars) {
        // 完整的星星
        stars.push(
          <Image
            key={i}
            src={starFilledIcon}
            className={styles.starIcon}
            style={{ opacity: 1 }}
          />
        )
      } else if (i === fullStars && decimalPart > 0) {
        // 渐变星星（部分填充）
        stars.push(
          <View key={i} className={styles.starContainer}>
            <Image
              src={starOutlineIcon}
              className={styles.starIcon}
            />
            <Image
              src={starFilledIcon}
              className={styles.starIcon}
              style={{ 
                position: 'absolute',
                clipPath: `inset(0 ${(1 - decimalPart) * 100}% 0 0)`,
                opacity: 1
              }}
            />
          </View>
        )
      } else {
        // 空心星星
        stars.push(
          <Image
            key={i}
            src={starOutlineIcon}
            className={styles.starIcon}
            style={{ opacity: 0.3 }}
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
    console.log('🔗 点击资源:', resource.resource_name, resource.id)
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
          mode="aspectFill"
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