import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import CustomHeader from '@/components/custom-header'
import styles from './index.module.scss'

// 模拟详情数据
const MOCK_DETAIL_DATA = {
  id: '11',
  title: '武林群侠传',
  description: '这是一款充满江湖气息的武侠角色扮演游戏。玩家将在广阔的武林世界中历练成长，学习各门各派的绝学武功，结交江湖豪杰，追寻属于自己的武林传说。游戏采用创新的武学系统，让玩家体验最纯粹的武侠乐趣。',
  author: '星河工作室',
  category: '游戏类',
  image: '/assets/placeholder.jpg',
  averageRating: 9.8,
  totalRatings: 238,
  ratingDistribution: {
    5: 95.5,
    4: 1.5,
    3: 0.0,
    2: 0.7,
    1: 2.2
  }
}

// 模拟评论数据
const MOCK_REVIEWS = [
  {
    id: '1',
    username: '游戏玩家',
    avatar: '/assets/placeholder.jpg',
    rating: 5,
    content: '这款游戏真的非常棒！画面精美，剧情丰富，战斗系统也很有趣。特别是武功招式的设计非常有创意，让人欲罢不能。',
    date: '08-25',
    location: '广州',
    likes: 128,
    hasLiked: false
  }
]

const RatingDetailPage = () => {
  const router = useRouter()
  const [detailData, setDetailData] = useState(MOCK_DETAIL_DATA)
  const [reviews, setReviews] = useState(MOCK_REVIEWS)
  const [newComment, setNewComment] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // 获取用户状态
  const userState = useSelector((state: RootState) => state.user)
  const isLoggedIn = userState.isLoggedIn

  // 页面初始化
  useEffect(() => {
    console.log('📊 [RatingDetail] 评分详情页加载...')
    // TODO: 根据路由参数获取详情数据
    const { id } = router.params
    console.log('详情ID:', id)
  }, [])

  // 渲染星级显示
  const renderStars = (rating: number, size: 'large' | 'small' = 'small') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Text key={i} className={`${styles.star} ${styles.starFull} ${size === 'large' ? styles.starLarge : ''}`}>★</Text>
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Text key={i} className={`${styles.star} ${styles.starHalf} ${size === 'large' ? styles.starLarge : ''}`}>★</Text>
        )
      } else {
        stars.push(
          <Text key={i} className={`${styles.star} ${styles.starEmpty} ${size === 'large' ? styles.starLarge : ''}`}>★</Text>
        )
      }
    }
    
    return stars
  }

  // 渲染用户可点击的评分星级
  const renderRatingStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={`${styles.ratingStarClickable} ${i <= userRating ? styles.ratingStarActive : ''}`}
          onClick={() => setUserRating(i)}
        >
          ★
        </Text>
      )
    }
    return stars
  }

  // 提交评分和评论
  const handleSubmitReview = () => {
    if (!isLoggedIn) {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后再进行评价',
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

    // 评分规则：可以评论不评分，但不能评分不评论
    if (userRating > 0 && !newComment.trim()) {
      Taro.showToast({
        title: '评分时必须填写评论',
        icon: 'none'
      })
      return
    }

    if (!newComment.trim() && userRating === 0) {
      Taro.showToast({
        title: '请填写评论或给出评分',
        icon: 'none'
      })
      return
    }

    console.log('提交评价:', { rating: userRating, comment: newComment })
    // TODO: 调用API提交评价
    
    Taro.showToast({
      title: '评价提交成功',
      icon: 'success'
    })
    
    // 清空输入
    setNewComment('')
    setUserRating(0)
  }

  // 点赞评论
  const handleLikeReview = (reviewId: string) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              hasLiked: !review.hasLiked,
              likes: review.hasLiked ? review.likes - 1 : review.likes + 1
            }
          : review
      )
    )
  }

  return (
    <View className={styles.detailPage}>
      <CustomHeader title={detailData.title} />
      
      <ScrollView scrollY className={styles.contentScroll}>
        {/* 项目基本信息 */}
        <View className={styles.headerSection}>
          <View className={styles.projectInfo}>
            <Image src={detailData.image} className={styles.projectImage} mode="aspectFill" />
            <View className={styles.projectDetails}>
              <Text className={styles.projectTitle}>{detailData.title}</Text>
              <Text className={styles.projectAuthor}>由 {detailData.author} 上传</Text>
              <View className={styles.categoryTag}>
                <Text className={styles.categoryText}>{detailData.category}</Text>
              </View>
            </View>
          </View>
          
          <Text className={styles.projectDescription}>{detailData.description}</Text>
        </View>

        {/* 评分统计 */}
        <View className={styles.ratingSection}>
          <View className={styles.ratingOverview}>
            <View className={styles.ratingScore}>
              <Text className={styles.scoreNumber}>{detailData.averageRating}</Text>
              <Text className={styles.totalRatings}>{detailData.totalRatings} 人评分</Text>
            </View>
            
            <View className={styles.ratingDistribution}>
              {[5, 4, 3, 2, 1].map(star => (
                <View key={star} className={styles.distributionRow}>
                  <Text className={styles.starLabel}>{star} 星</Text>
                  <View className={styles.progressBar}>
                    <View 
                      className={styles.progressFill}
                      style={{ width: `${detailData.ratingDistribution[star]}%` }}
                    />
                  </View>
                  <Text className={styles.percentage}>{detailData.ratingDistribution[star]}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 评论列表 */}
        <View className={styles.reviewSection}>
          <Text className={styles.sectionTitle}>评论 {reviews.length}</Text>
          
          {reviews.map(review => (
            <View key={review.id} className={styles.reviewItem}>
              <View className={styles.reviewHeader}>
                <Image src={review.avatar} className={styles.userAvatar} mode="aspectFill" />
                <View className={styles.userInfo}>
                  <Text className={styles.username}>{review.username}</Text>
                  <View className={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                </View>
              </View>
              
              <Text className={styles.reviewContent}>{review.content}</Text>
              
              <View className={styles.reviewFooter}>
                <Text className={styles.reviewDate}>{review.date} {review.location}</Text>
                <View 
                  className={`${styles.likeButton} ${review.hasLiked ? styles.liked : ''}`}
                  onClick={() => handleLikeReview(review.id)}
                >
                  <Text className={styles.likeIcon}>👍</Text>
                  <Text className={styles.likeCount}>{review.likes}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 底部评价输入区 */}
      <View className={styles.bottomSection}>
        <View className={styles.ratingInput}>
          <Text className={styles.ratingLabel}>你的评分：</Text>
          <View className={styles.ratingStars}>
            {renderRatingStars()}
          </View>
        </View>
        
        <View className={styles.commentInput}>
          <Input
            className={styles.commentTextarea}
            placeholder="写下你的评论..."
            value={newComment}
            onInput={(e) => setNewComment(e.detail.value)}
            maxlength={500}
          />
          <View className={styles.submitButton} onClick={handleSubmitReview}>
            <Text className={styles.submitText}>发送</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default RatingDetailPage
