import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { 
  fetchRatingItems, 
  setCurrentCategory,
  clearItems 
} from '@/store/slices/ratingSlice'
import { getResourceList } from '@/services/api/rating'
import { RatingCategory } from '@/types/api/rating.d'
import CustomHeader from '@/components/custom-header'
import RatingItem from './components/RatingItem'
// import { processTempImages } from '@/services/api/upload' // 已移除
import styles from './index.module.scss'

const RatingPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [currentCategory, setCurrentCategoryState] = useState<RatingCategory>(RatingCategory.Course)
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 从store获取状态
  const userState = useSelector((state: RootState) => state.user)
  
  const isLoggedIn = userState.isLoggedIn

  // 预定义的评分类型（根据API文档）
  const predefinedRatingTypes = [
    { value: RatingCategory.Course, label: '学习', description: '课程、教材、学习资源评分' },
    { value: RatingCategory.Food, label: '美食', description: '餐厅、菜品、美食推荐评分' },
    { value: RatingCategory.Game, label: '游戏', description: '游戏、游戏攻略、游戏设备评分' },
    { value: RatingCategory.Entertainment, label: '娱乐', description: '影视、音乐、娱乐活动评分' },
    { value: RatingCategory.Life, label: '生活', description: '生活服务、日用品、生活技巧评分' },
    { value: RatingCategory.Sport, label: '运动', description: '运动场所、体育用品、健身课程评分' },
    { value: RatingCategory.Other, label: '其他', description: '不属于以上分类的内容评分' }
  ]

  // 加载资源列表
  const loadResources = async (category: RatingCategory) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getResourceList({
        resource_type: category,
        skip: 0,
        limit: 20,
        sort_by: 'average_score',
        sort_order: 'desc'
      })
      
      console.log('📊 API 完整响应:', response)
      console.log('📊 API 响应的 data 字段:', response.data)
      
      // 尝试多种可能的数据路径
      let resourcesData: any[] = [];
      
      if (response.data?.data?.resources && Array.isArray(response.data.data.resources)) {
        // 标准 API 响应格式: { code, message, data: { resources: [] } }
        resourcesData = response.data.data.resources;
        console.log('✅ 标准格式 - 资源列表数据 (数量:', resourcesData.length, '):', resourcesData)
      } else if ((response.data as any)?.resources && Array.isArray((response.data as any).resources)) {
        // 直接格式: { resources: [], total, skip, limit }
        resourcesData = (response.data as any).resources;
        console.log('✅ 直接格式 - 资源列表数据 (数量:', resourcesData.length, '):', resourcesData)
      } else if ((response as any).resources && Array.isArray((response as any).resources)) {
        // 最简格式: { resources: [] }
        resourcesData = (response as any).resources;
        console.log('✅ 最简格式 - 资源列表数据 (数量:', resourcesData.length, '):', resourcesData)
      }
      
      if (resourcesData.length > 0) {
        setResources(resourcesData)
      } else {
        console.warn('⚠️ 未找到资源数据，完整响应结构:', {
          response,
          'response.data': response.data,
          'response.data?.data': response.data?.data
        })
        setResources([])
      }
    } catch (err: any) {
      console.error('加载资源列表失败:', err)
      setError(err.message || '加载失败')
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  // 加载资源列表
  useEffect(() => {
    if (currentCategory) {
      loadResources(currentCategory)
    }
  }, [currentCategory])

  // 切换分类
  const handleCategoryChange = (categoryId: RatingCategory) => {
    setCurrentCategoryState(categoryId)
    dispatch(setCurrentCategory(categoryId))
    // 清空当前资源列表，准备加载新数据
    setResources([])
  }

  // 跳转到资源详情页（显示该资源的所有评价）
  const handleItemClick = (resource: any) => {
    console.log('跳转到资源详情页:', resource.id)
    
    Taro.navigateTo({
      url: `/pages/discover/rating/detail/index?resourceId=${resource.id}&resourceType=${resource.resource_type}&resourceName=${encodeURIComponent(resource.resource_name)}`
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



  // 获取分类显示名称
  const getCategoryDisplayName = (categoryValue: string) => {
    const category = predefinedRatingTypes.find(type => type.value === categoryValue)
    return category ? category.label : categoryValue
  }

  // 构建分类列表
  const buildCategoryList = () => {
    return predefinedRatingTypes.map(type => ({
      value: type.value,
      name: type.label,
      active: currentCategory === type.value
    }))
  }

  const categoryList = buildCategoryList()

  return (
    <View className={styles.ratingPage}>
      <CustomHeader title="评分" />
      
      {/* 分类标签栏 */}
      <View className={styles.categoryContainer}>
        <ScrollView scrollX className={styles.categoryScroll}>
          <View className={styles.categoryList}>
            {categoryList.map(category => (
              <View
                key={category.value}
                className={`${styles.categoryItem} ${category.active ? styles.active : ''}`}
                onClick={() => handleCategoryChange(category.value)}
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
          {/* 加载状态 */}
          {loading && (
            <View className={styles.loadingState}>
              <Text className={styles.loadingText}>加载中...</Text>
            </View>
          )}

          {/* 错误状态 */}
          {error && (
            <View className={styles.errorState}>
              <Text className={styles.errorText}>加载失败: {error}</Text>
              <Text className={styles.errorSubText}>请检查网络连接或稍后重试</Text>
            </View>
          )}

          {/* 资源列表 */}
          <View className={styles.ratingList}>
            {resources.map(resource => (
              <RatingItem
                key={resource.id}
                resource={resource}
                onItemClick={handleItemClick}
              />
            ))}
            
            {/* 空状态 */}
            {!loading && !error && resources.length === 0 && (
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