// Third-party imports
import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'

// Absolute imports (alphabetical order)
import { AppDispatch, RootState } from '@/store'
import { setCurrentCategory } from '@/store/slices/ratingSlice'
import { getResourceList } from '@/services/api/rating'
import { RatingCategory } from '@/types/api/rating.d'
import CustomHeader from '@/components/custom-header'
import AuthFloatingButton from '@/components/auth-floating-button'

// Relative imports
import RatingItem from './components/RatingItem'
import styles from './index.module.scss'

const RatingPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoggedIn } = useSelector((state: RootState) => state.user)
  const [currentCategory, setCurrentCategoryState] = useState<RatingCategory>(RatingCategory.Course)
  const [resources, setResources] = useState<any[]>([])
  const [filteredResources, setFilteredResources] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
  const loadResources = useCallback(async (category: RatingCategory) => {
    // 检查登录状态
    if (!isLoggedIn) {
      setError('请先登录后查看评分内容')
      setResources([])
      setFilteredResources([])
      setLoading(false)
      return
    }

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
      
      // 尝试多种可能的数据路径
      let resourcesData: any[] = [];
      
      if (response.data?.data?.resources && Array.isArray(response.data.data.resources)) {
        // 标准 API 响应格式: { code, message, data: { resources: [] } }
        resourcesData = response.data.data.resources;
        
      } else if ((response.data as any)?.resources && Array.isArray((response.data as any).resources)) {
        // 直接格式: { resources: [], total, skip, limit }
        resourcesData = (response.data as any).resources;
        
      } else if ((response as any).resources && Array.isArray((response as any).resources)) {
        // 最简格式: { resources: [] }
        resourcesData = (response as any).resources;
        
      }
      
      if (resourcesData.length > 0) {
        setResources(resourcesData)
        setFilteredResources(resourcesData) // 初始化过滤结果
      } else {
        // console.warn('未找到资源数据')
        setResources([])
        setFilteredResources([])
      }
    } catch (err: any) {
      
      setError(err.message || '加载失败')
      setResources([])
      setFilteredResources([])
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  // 搜索功能
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)
    if (!keyword.trim()) {
      setFilteredResources(resources)
    } else {
      const filtered = resources.filter(resource => 
        resource.resource_name?.toLowerCase().includes(keyword.toLowerCase().trim()) ||
        resource.title?.toLowerCase().includes(keyword.toLowerCase().trim()) ||
        resource.name?.toLowerCase().includes(keyword.toLowerCase().trim())
      )
      setFilteredResources(filtered)
    }
  }

  // 监听resources变化，同时更新filteredResources
  useEffect(() => {
    if (searchKeyword.trim()) {
      const filtered = resources.filter(resource => 
        resource.resource_name?.toLowerCase().includes(searchKeyword.toLowerCase().trim()) ||
        resource.title?.toLowerCase().includes(searchKeyword.toLowerCase().trim()) ||
        resource.name?.toLowerCase().includes(searchKeyword.toLowerCase().trim())
      )
      setFilteredResources(filtered)
    } else {
      setFilteredResources(resources)
    }
  }, [resources, searchKeyword])

  // 加载资源列表
  useEffect(() => {
    if (currentCategory) {
      loadResources(currentCategory)
    }
  }, [currentCategory, isLoggedIn, loadResources])

  // 切换分类
  const handleCategoryChange = (categoryId: RatingCategory) => {
    setCurrentCategoryState(categoryId)
    dispatch(setCurrentCategory(categoryId))
    // 清空当前资源列表，准备加载新数据
    setResources([])
    setFilteredResources([])
    // 切换分类时清空搜索
    setSearchKeyword('')
  }

  // 跳转到资源详情页（显示该资源的所有评价）
  const handleItemClick = (resource: any) => {
    
    Taro.navigateTo({
      url: `/pages/subpackage-discover/rating/detail/index?resourceId=${resource.id}&resourceType=${resource.resource_type}&resourceName=${encodeURIComponent(resource.resource_name)}`
    })
  }

  // 获取分类显示名称 (暂时未使用)
  // const getCategoryDisplayName = (categoryValue: string) => {
  //   const category = predefinedRatingTypes.find(type => type.value === categoryValue)
  //   return category ? category.label : categoryValue
  // }

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
      <CustomHeader title='评分' />
      
      {/* 搜索框 */}
      <View className={styles.searchContainer}>
        <View className={styles.searchBox}>
          <View className={styles.searchIcon}>🔍</View>
          <Input
            className={styles.searchInput}
            placeholder='搜索评分内容标题...'
            value={searchKeyword}
            onInput={(e) => handleSearch(e.detail.value)}
            confirmType='search'
          />
          {searchKeyword && (
            <View 
              className={styles.clearIcon}
              onClick={() => handleSearch('')}
            >
              ✕
            </View>
          )}
        </View>
      </View>
      
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

          {/* 错误状态或登录提示 */}
          {error && (
            <View className={styles.errorState}>
              {error === '请先登录后查看评分内容' ? (
                <View className={styles.loginPrompt}>
                  <Text className={styles.loginPromptIcon}>🔒</Text>
                  <Text className={styles.loginPromptTitle}>请先登录</Text>
                  <Text className={styles.loginPromptDesc}>登录后可查看和发布评分内容</Text>
                  <View 
                    className={styles.loginPromptButton}
                    onClick={() => {
                      Taro.switchTab({ url: '/pages/profile/index' });
                    }}
                  >
                    <Text className={styles.loginPromptButtonText}>立即登录</Text>
                  </View>
                </View>
              ) : (
                <View>
                  <Text className={styles.errorText}>加载失败: {error}</Text>
                  <Text className={styles.errorSubText}>请检查网络连接或稍后重试</Text>
                </View>
              )}
            </View>
          )}

          {/* 资源列表 */}
          <View className={styles.ratingList}>
            {filteredResources.map(resource => (
              <RatingItem
                key={resource.id}
                resource={resource}
                onItemClick={handleItemClick}
              />
            ))}
            
            {/* 空状态 */}
            {!loading && !error && filteredResources.length === 0 && resources.length > 0 && searchKeyword && (
              <View className={styles.emptyState}>
                <View className={styles.emptyIcon}>🔍</View>
                <Text className={styles.emptyText}>未找到相关内容</Text>
                <Text className={styles.emptySubText}>尝试使用其他关键词搜索</Text>
              </View>
            )}
            
            {/* 完全空状态 */}
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

      {/* 带鉴权的悬浮发布按钮 */}
      <AuthFloatingButton
        variant='plus'
        onClick={() => Taro.navigateTo({ url: '/pages/subpackage-discover/rating/publish/index' })}
        loginPrompt='您需要登录后才能发布评分，是否立即前往登录页面？'
        redirectUrl='/pages/subpackage-discover/rating/publish/index'
      />
    </View>
  )
}

export default RatingPage
