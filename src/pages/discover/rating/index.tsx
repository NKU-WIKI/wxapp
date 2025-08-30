import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import CustomHeader from '@/components/custom-header'
import styles from './index.module.scss'

// 评分分类配置
const RATING_CATEGORIES = [
  { id: 'course', name: '课程', active: true },
  { id: 'food', name: '美食', active: false },
  { id: 'game', name: '游戏', active: false },
  { id: 'entertainment', name: '娱乐', active: false },
  { id: 'life', name: '生活', active: false },
  { id: 'study', name: '学习', active: false },
  { id: 'sports', name: '运动', active: false },
  { id: 'other', name: '其他', active: false }
]

// 示例评分数据
const SAMPLE_RATING_DATA = {
  course: [
    {
      id: '1',
      title: '高等数学A',
      description: '张教授讲课很清楚，作业适中，考试难度合理...',
      image: '/assets/placeholder.jpg',
      rating: 8.9,
      reviewCount: 142,
      location: '数学系'
    },
    {
      id: '2',
      title: '大学英语',
      description: '李老师人很好，课堂互动多，提升很快',
      image: '/assets/placeholder.jpg',
      rating: 9.2,
      reviewCount: 86,
      location: '外语系'
    }
  ],
  food: [
    {
      id: '3',
      title: '老王饺子馆',
      description: '位于学生食堂3楼，最近新开的，老板人很好，可以喝免费的饺...',
      image: '/assets/placeholder.jpg',
      rating: 9.6,
      reviewCount: 238,
      location: '学生食堂3楼'
    },
    {
      id: '4',
      title: '兰州拉面',
      description: '学生食堂2楼，面条劲道，汤底醇厚',
      image: '/assets/placeholder.jpg',
      rating: 9.2,
      reviewCount: 186,
      location: '学生食堂2楼'
    }
  ],
  game: [
    {
      id: '11',
      title: '武林群侠传',
      description: '这是一款充满江湖气息的武侠角色扮演游戏。玩家将在广阔的武林世界中历练成长...',
      image: '/assets/placeholder.jpg',
      rating: 9.8,
      reviewCount: 238,
      location: '游戏类'
    },
    {
      id: '12',
      title: '原神',
      description: '开放世界冒险游戏，精美画面，丰富剧情，角色收集要素丰富',
      image: '/assets/placeholder.jpg',
      rating: 9.1,
      reviewCount: 456,
      location: '游戏类'
    }
  ],
  entertainment: [
    {
      id: '5',
      title: '万达影城',
      description: '音响效果好，座椅舒适，学生票有优惠',
      image: '/assets/placeholder.jpg',
      rating: 8.8,
      reviewCount: 95,
      location: '校园附近'
    }
  ],
  life: [
    {
      id: '6',
      title: '快递驿站',
      description: '服务态度好，包裹保管安全，营业时间长',
      image: '/assets/placeholder.jpg',
      rating: 9.1,
      reviewCount: 203,
      location: '宿舍楼下'
    }
  ],
  study: [
    {
      id: '7',
      title: '图书馆自习室',
      description: '环境安静，座位舒适，学习氛围浓厚',
      image: '/assets/placeholder.jpg',
      rating: 9.5,
      reviewCount: 167,
      location: '图书馆3层'
    }
  ],
  sports: [
    {
      id: '8',
      title: '校园健身房',
      description: '器材齐全，环境整洁，价格实惠',
      image: '/assets/placeholder.jpg',
      rating: 8.7,
      reviewCount: 124,
      location: '体育馆1层'
    }
  ],
  other: [
    {
      id: '9',
      title: '校园医务室',
      description: '医生专业，服务态度好，常用药品齐全',
      image: '/assets/placeholder.jpg',
      rating: 8.5,
      reviewCount: 67,
      location: '行政楼2层'
    },
    {
      id: '10',
      title: '校园银行ATM',
      description: '位置方便，很少排队，手续费合理',
      image: '/assets/placeholder.jpg',
      rating: 8.9,
      reviewCount: 89,
      location: '学生活动中心'
    }
  ]
}

const RatingPage = () => {
  const [currentCategory, setCurrentCategory] = useState('course')
  const [categories, setCategories] = useState(RATING_CATEGORIES)
  const [ratingData, setRatingData] = useState(SAMPLE_RATING_DATA[currentCategory] || [])
  const [loading, setLoading] = useState(false)
  
  // 获取用户状态
  const userState = useSelector((state: RootState) => state.user)
  const isLoggedIn = userState.isLoggedIn

  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId)
    setCategories(prev => 
      prev.map(cat => ({ ...cat, active: cat.id === categoryId }))
    )
    
    // 加载对应分类的数据
    setRatingData(SAMPLE_RATING_DATA[categoryId] || [])
  }

  // 跳转到详情页
  const handleItemClick = (item: any) => {
    console.log('跳转到评分详情页:', item.id)
    Taro.navigateTo({
      url: `/pages/discover/rating/detail/index?id=${item.id}&title=${encodeURIComponent(item.title)}`
    })
  }

  // 跳转到发布页
  const handlePublishClick = () => {
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
    
    console.log('跳转到发布评分页')
    Taro.navigateTo({
      url: '/pages/discover/rating/publish/index'
    })
  }

  // 渲染星级
  const renderStars = (rating: number, maxRating: number = 5) => {
    const stars: JSX.Element[] = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < maxRating; i++) {
      if (i < fullStars) {
        stars.push(
          <Text key={i} className={styles.starFull}>★</Text>
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Text key={i} className={styles.starHalf}>★</Text>
        )
      } else {
        stars.push(
          <Text key={i} className={styles.starEmpty}>★</Text>
        )
      }
    }
    
    return stars
  }

  return (
    <View className={styles.ratingPage}>
      <CustomHeader title="评分" />
      
      {/* 分类标签栏 */}
      <View className={styles.categoryContainer}>
        <ScrollView scrollX className={styles.categoryScroll}>
          <View className={styles.categoryList}>
            {categories.map(category => (
              <View
                key={category.id}
                className={`${styles.categoryItem} ${category.active ? styles.active : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <Text className={styles.categoryText}>{category.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 主内容区域 */}
      <View className={styles.contentContainer}>
        <ScrollView scrollY className={styles.contentScroll}>
          <View className={styles.ratingList}>
            {ratingData.map(item => (
              <View
                key={item.id}
                className={styles.ratingCard}
                onClick={() => handleItemClick(item)}
              >
                <View className={styles.cardImage}>
                  <Image 
                    src={item.image} 
                    className={styles.itemImage}
                    mode="aspectFill"
                  />
                </View>
                
                <View className={styles.cardContent}>
                  <View className={styles.cardHeader}>
                    <Text className={styles.itemTitle}>{item.title}</Text>
                  </View>
                  
                  <View className={styles.itemLocation}>
                    <Text className={styles.locationText}>{item.location}</Text>
                  </View>
                  
                  <Text className={styles.itemDescription}>{item.description}</Text>
                  
                  <View className={styles.ratingInfo}>
                    <View className={styles.ratingScore}>
                      <Text className={styles.scoreNumber}>{item.rating}</Text>
                      <View className={styles.stars}>
                        {renderStars(item.rating)}
                      </View>
                    </View>
                    <Text className={styles.reviewCount}>{item.reviewCount}条评价</Text>
                  </View>
                </View>
              </View>
            ))}
            
            {/* 空状态 */}
            {ratingData.length === 0 && (
              <View className={styles.emptyState}>
                <View className={styles.emptyIcon}>📝</View>
                <Text className={styles.emptyText}>暂无评分数据</Text>
                <Text className={styles.emptySubText}>成为第一个发布评分的人吧</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* 浮动发布按钮 */}
      <View className={styles.floatingButton} onClick={handlePublishClick}>
        <Text className={styles.plusIcon}>+</Text>
      </View>
    </View>
  )
}

export default RatingPage