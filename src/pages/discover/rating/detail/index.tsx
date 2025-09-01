import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
// import { createUserRating } from '@/store/slices/ratingSlice' // 未使用
import { getResourceRatingsList, getResourceStatistics, createRating } from '@/services/api/rating'
import CustomHeader from '@/components/custom-header'

// 引入星星图标
import starFilledIcon from '@/assets/star-filled.svg'
import starOutlineIcon from '@/assets/star-outline.svg'
import styles from './index.module.scss'

interface ResourceInfo {
  id: string
  resource_name: string
  title: string
  resource_type: string
  image_url?: string
  description?: string
  average_score: number
  rating_count: number
}

interface RatingStatistics {
  total_ratings: number
  average_score: number
  score_distribution: {
    "1": number
    "2": number
    "3": number
    "4": number
    "5": number
  }
}

const RatingDetailPage = () => {
  const router = useRouter()
  // const dispatch = useDispatch<AppDispatch>() // 未使用
  
  // 状态管理
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resourceInfo, setResourceInfo] = useState<ResourceInfo | null>(null)
  const [ratings, setRatings] = useState<any[]>([])
  const [statistics, setStatistics] = useState<RatingStatistics | null>(null)
  
  // 用户评分表单状态
  const [newComment, setNewComment] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // 获取用户状态
  const userState = useSelector((state: RootState) => state.user)
  const isLoggedIn = userState.isLoggedIn

  // 页面初始化
  useEffect(() => {
    const { resourceId, resourceType, resourceName } = router.params
    
    
    
    
    if (!resourceId || !resourceType) {
      setError('缺少必要的参数')
      setLoading(false)
      return
    }

    loadData(resourceType, resourceId, resourceName)
  }, [router.params])

  // 加载页面数据
  const loadData = async (resourceType: string, resourceId: string, resourceName?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // 并行加载资源评分列表和统计信息
      const [ratingsResponse, statisticsResponse] = await Promise.all([
        getResourceRatingsList(resourceType, resourceId, {
          skip: 0,
          limit: 50,
          sort_by: 'created_at',
          sort_order: 'desc'
        }),
        getResourceStatistics(resourceType, resourceId)
      ])
      
      
      
      
      // 处理评分列表数据
      if (ratingsResponse.data?.data?.items) {
        setRatings(ratingsResponse.data.data.items)
        
        // 从评分数据中构建资源信息（如果没有专门的资源详情接口）
        const firstRating = ratingsResponse.data.data.items[0]
        if (firstRating) {
          setResourceInfo({
            id: resourceId,
            resource_name: firstRating.resource_name || resourceName || '未知资源',
            title: firstRating.resource_title || firstRating.resource_name || resourceName || '未知资源',
            resource_type: resourceType,
            image_url: firstRating.resource_image,
            description: firstRating.resource_description,
            average_score: statisticsResponse.data?.data?.average_score || 0,
            rating_count: statisticsResponse.data?.data?.total_ratings || 0
          })
        } else {
          // 如果没有评分数据，创建基础资源信息
          setResourceInfo({
            id: resourceId,
            resource_name: decodeURIComponent(resourceName || '未知资源'),
            title: decodeURIComponent(resourceName || '未知资源'),
            resource_type: resourceType,
            average_score: 0,
            rating_count: 0
          })
        }
      }
      
      // 处理统计数据
      if (statisticsResponse.data?.data) {
        setStatistics(statisticsResponse.data.data)
      }
      
    } catch (err: any) {
      
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  // 渲染星级评分
  const renderStars = (score: number, size: 'large' | 'small' = 'small') => {
    const stars: JSX.Element[] = []
    const fullStars = Math.floor(score)
    const decimalPart = score % 1
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // 完整的星星
        stars.push(
          <Image
            key={i}
            src={starFilledIcon}
            className={`${styles.starIcon} ${size === 'large' ? styles.starLarge : ''}`}
            style={{ opacity: 1 }}
          />
        )
      } else if (i === fullStars && decimalPart > 0) {
        // 渐变星星（部分填充）
        stars.push(
          <View key={i} className={styles.starContainer}>
            <Image
              src={starOutlineIcon}
              className={`${styles.starIcon} ${size === 'large' ? styles.starLarge : ''}`}
            />
            <Image
              src={starFilledIcon}
              className={`${styles.starIcon} ${size === 'large' ? styles.starLarge : ''}`}
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
            className={`${styles.starIcon} ${size === 'large' ? styles.starLarge : ''}`}
            style={{ opacity: 0.3 }}
          />
        )
      }
    }
    
    return stars
  }

  // 渲染用户可点击的评分星级
  const renderRatingStars = () => {
    const stars: JSX.Element[] = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Image
          key={i}
          src={i <= userRating ? starFilledIcon : starOutlineIcon}
          className={styles.clickableStarIcon}
          onClick={() => setUserRating(i)}
        />
      )
    }
    return stars
  }

  // 提交评分
  const handleSubmitRating = async () => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后发布评分',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' })
          }
        }
      })
      return
    }

    if (userRating === 0) {
      Taro.showToast({
        title: '请选择评分',
        icon: 'none'
      })
      return
    }

    if (!newComment.trim()) {
      Taro.showToast({
        title: '请填写评价内容',
        icon: 'none'
      })
      return
    }

    const { resourceId, resourceType } = router.params
    if (!resourceId || !resourceType || !resourceInfo) return

    try {
      setSubmitting(true)
      
      const ratingData = {
        resource_type: resourceType,
        resource_name: resourceInfo.resource_name,
        resource_title: resourceInfo.title,
        resource_description: resourceInfo.description,
        resource_image: resourceInfo.image_url,
        score: userRating,
        comment: newComment.trim(),
        is_anonymous: isAnonymous,
        tags: [], // 可以后续添加标签选择功能
        evidence_urls: []
      }

      
      
      const response = await createRating(ratingData)
      
      if (response.data?.code === 0) {
        Taro.showToast({
          title: '评分提交成功',
          icon: 'success',
          duration: 2000
        })
        
        // 重置表单
        setUserRating(0)
        setNewComment('')
        setIsAnonymous(false)
        
        // 重新加载数据
        loadData(resourceType, resourceId, resourceInfo.resource_name)
      } else {
        throw new Error(response.data?.message || '提交失败')
      }
      
    } catch (err: any) {
      
      Taro.showToast({
        title: err.message || '评分提交失败',
        icon: 'error',
        duration: 2000
      })
    } finally {
      setSubmitting(false)
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}-${date.getDate()}`
  }

  if (loading) {
    return (
      <View className={styles.ratingDetailPage}>
        <CustomHeader title='评分详情' />
        <View className={styles.loadingState}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    )
  }

  if (error || !resourceInfo) {
    return (
      <View className={styles.ratingDetailPage}>
        <CustomHeader title='评分详情' />
        <View className={styles.errorState}>
          <Text className={styles.errorText}>加载失败: {error || '数据不存在'}</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.ratingDetailPage}>
      <CustomHeader title={resourceInfo.title} />
      
      <ScrollView scrollY className={styles.contentScroll}>
        {/* 资源基本信息 */}
        <View className={styles.resourceInfo}>
          <View className={styles.resourceHeader}>
            <Image 
              src={resourceInfo.image_url || '/assets/placeholder.jpg'} 
              className={styles.resourceImage}
              mode='aspectFill'
            />
            <View className={styles.resourceDetails}>
              <Text className={styles.resourceTitle}>{resourceInfo.title}</Text>
              <Text className={styles.resourceType}>{resourceInfo.resource_type}</Text>
              {resourceInfo.description && (
                <Text className={styles.resourceDescription}>{resourceInfo.description}</Text>
              )}
            </View>
          </View>
          
          {/* 总体评分 */}
          <View className={styles.overallRating}>
            <View className={styles.ratingScore}>
              <Text className={styles.scoreNumber}>{resourceInfo.average_score.toFixed(1)}</Text>
              <View className={styles.starsContainer}>
                {renderStars(resourceInfo.average_score, 'large')}
              </View>
            </View>
            <Text className={styles.totalRatings}>{resourceInfo.rating_count}条评价</Text>
          </View>
        </View>

        {/* 评分分布 */}
        {statistics && statistics.total_ratings > 0 && (
          <View className={styles.ratingDistribution}>
            <Text className={styles.sectionTitle}>评分分布</Text>
            <View className={styles.distributionList}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = statistics.score_distribution[star.toString()] || 0
                const percentage = statistics.total_ratings > 0 ? (count / statistics.total_ratings * 100) : 0
                return (
                  <View key={star} className={styles.distributionItem}>
                    <Text className={styles.starLabel}>{star}星</Text>
                    <View className={styles.progressBar}>
                      <View 
                        className={styles.progressFill} 
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                    <Text className={styles.percentageText}>{percentage.toFixed(1)}%</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* 用户评分表单 */}
        {isLoggedIn && (
          <View className={styles.userRatingForm}>
            <Text className={styles.sectionTitle}>写评价</Text>
            
            <View className={styles.ratingInput}>
              <Text className={styles.ratingLabel}>评分:</Text>
              <View className={styles.ratingStars}>
                {renderRatingStars()}
              </View>
            </View>

            <View className={styles.commentInput}>
              <Text className={styles.commentLabel}>评价:</Text>
              <Input
                className={styles.commentTextarea}
                placeholder='分享你的使用体验...'
                value={newComment}
                onInput={(e) => setNewComment(e.detail.value)}
                maxlength={500}
              />
            </View>

            <View className={styles.anonymousOption}>
              <Text 
                className={`${styles.checkbox} ${isAnonymous ? styles.checked : ''}`}
                onClick={() => setIsAnonymous(!isAnonymous)}
              >
                {isAnonymous ? '✓' : ''}
              </Text>
              <Text className={styles.anonymousText}>匿名发布</Text>
            </View>

            <View 
              className={`${styles.submitButton} ${submitting ? styles.disabled : ''}`}
              onClick={handleSubmitRating}
            >
              <Text className={styles.submitText}>
                {submitting ? '提交中...' : '发布评价'}
              </Text>
            </View>
          </View>
        )}

        {/* 评价列表 */}
        <View className={styles.reviewsSection}>
          <Text className={styles.sectionTitle}>用户评价 {ratings.length}</Text>
          
          {ratings.length > 0 ? (
            <View className={styles.reviewsList}>
              {ratings.map(rating => (
                <View key={rating.id} className={styles.reviewItem}>
                  <View className={styles.reviewHeader}>
                    <Image 
                      src={rating.rater_avatar || '/assets/user.svg'} 
                      className={styles.userAvatar}
                      mode='aspectFill'
                    />
                    <View className={styles.userInfo}>
                      <Text className={styles.username}>
                        {rating.is_anonymous ? '匿名用户' : rating.rater_nickname}
                      </Text>
                      <View className={styles.reviewStars}>
                        {renderStars(rating.score)}
                      </View>
                    </View>
                    <Text className={styles.reviewDate}>
                      {formatDate(rating.created_at)}
                    </Text>
                  </View>
                  
                  <Text className={styles.reviewContent}>{rating.comment}</Text>
                  
                  {rating.tags && rating.tags.length > 0 && (
                    <View className={styles.reviewTags}>
                      {rating.tags.map((tag: string) => (
                        <Text key={tag} className={styles.reviewTag}>{tag}</Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.emptyReviews}>
              <Text className={styles.emptyText}>暂无评价，来写第一条评价吧！</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default RatingDetailPage
