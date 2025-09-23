// Third-party imports
import { useEffect, useState, useCallback, useRef } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'

// Absolute imports (alphabetical order)
import CustomHeader from '@/components/custom-header'
import EmptyState from '@/components/empty-state'
import AuthFloatingButton from '@/components/auth-floating-button'
import SearchBar from '@/components/search-bar'
import HighlightText from '@/components/highlight-text'
import { fetchErrands, clearError } from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ErrandType } from '@/types/api/marketplace.d'

// Relative imports
import ErrandsTabBar from '../../../components/ErrandsTabBar'

import styles from './index.module.scss'

const ErrandsHomePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { errands, errandsLoading, errandsPagination, error } = useSelector(
    (state: RootState) => state.marketplace
  )

  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]) // 用于高亮的关键词列表
  const [selectedType, setSelectedType] = useState<'all' | 'express' | 'food' | 'shopping'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 跟踪用户是否主动进行了筛选操�?  const userFilterChangedRef = useRef(false)

  // 获取任务列表
  const loadErrands = useCallback(async (params?: { skip?: number; refresh?: boolean }) => {
    try {
      if (params?.refresh) {
        setIsRefreshing(true)
      }

      const queryParams: any = {
        skip: params?.skip || 0,
        limit: 20,
      }

      // 只在用户主动选择类型时才添加类型参数
      if (selectedType !== 'all') {
        queryParams.errand_type = selectedType === 'express' ? ErrandType.EXPRESS_PICKUP :
          selectedType === 'food' ? ErrandType.FOOD_DELIVERY :
            selectedType === 'shopping' ? ErrandType.GROCERY_SHOPPING : undefined
      }

      await dispatch(fetchErrands(queryParams)).unwrap()
    } catch (fetchError) {
      //
      Taro.showToast({ title: '获取任务列表失败', icon: 'none' })
    } finally {
      if (params?.refresh) {
        setIsRefreshing(false)
      }
    }
  }, [dispatch, selectedType])

  // 处理刷新
  const handleRefresh = useCallback(async () => {
    await loadErrands({ refresh: true })
  }, [loadErrands])

  // 处理加载更多
  const handleLoadMore = useCallback(async () => {
    if (!errandsPagination?.has_more || errandsLoading === 'pending') return

    const nextSkip = (errandsPagination?.skip || 0) + (errandsPagination?.limit || 20)
    await loadErrands({ skip: nextSkip })
  }, [errandsPagination, errandsLoading, loadErrands])

  // 处理任务点击
  const handleTaskClick = useCallback((task: any) => {
    Taro.navigateTo({
      url: `/pages/subpackage-commerce/pages/errands/detail/index?id=${task.id}`,
    }).catch(() => {
      Taro.showToast({ title: '详情页面开发中', icon: 'none' });
    });
  }, [])

  // 页面每次显示时刷新数据（包括首次进入和从其他页面返回）
  useDidShow(() => {
    loadErrands({ refresh: true });
  });

  // 当筛选类型发生变化时，自动重新加载数据
  useEffect(() => {
    // 只有当用户主动进行了筛选操作时才重新加载
    if (userFilterChangedRef.current) {
      loadErrands({ refresh: true })
      userFilterChangedRef.current = false // 重置标记
    }
  }, [selectedType, loadErrands])

  // 监听发布成功事件，刷新列�?  useEffect(() => {
  const handleRefreshEvent = () => {
    loadErrands({ refresh: true })
  }

  // 监听发布成功事件
  Taro.eventCenter.on('refreshErrandsListings', handleRefreshEvent)

  // 清理事件监听
  return () => {
    Taro.eventCenter.off('refreshErrandsListings', handleRefreshEvent);
  };
}, [loadErrands]);

// 错误处理
useEffect(() => {
  if (error) {
    Taro.showToast({ title: error, icon: 'none' })
    dispatch(clearError())
  }
}, [error, dispatch])


// 处理搜索
const handleSearch = useCallback(async () => {
  if (!searchKeyword.trim()) return

  try {
    // 这里可以添加搜索逻辑，如果需要的�?      const keywords = searchKeyword.trim().split(/\s+/).filter(k => k.length > 0)
    setSearchKeywords(keywords)
  } catch (searchError) {
    Taro.showToast({ title: '搜索失败', icon: 'none' })
  }
}, [searchKeyword])

// 处理搜索输入
const handleSearchInput = useCallback((e: any) => {
  setSearchKeyword(e.detail.value)
}, [])

// 处理清空搜索
const handleClearSearch = useCallback(() => {
  setSearchKeyword('')
  setSearchKeywords([])
}, [])

// 处理筛选类型变�?  const handleTypeChange = useCallback((type: 'all' | 'express' | 'food' | 'shopping') => {
userFilterChangedRef.current = true
setSelectedType(type)
  }, [])

// 筛选标签组�?  const FilterTabs = () => (
<View className={styles.filterTabs}>
  <Text
    className={`${styles.tab} ${selectedType === 'all' ? styles.active : ''}`}
    onClick={() => handleTypeChange('all')}
  >
    全部订单
  </Text>
  <Text
    className={`${styles.tab} ${selectedType === 'express' ? styles.active : ''}`}
    onClick={() => handleTypeChange('express')}
  >
    快递代�?      </Text>
  <Text
    className={`${styles.tab} ${selectedType === 'food' ? styles.active : ''}`}
    onClick={() => handleTypeChange('food')}
  >
    食堂打饭
  </Text>
  <Text
    className={`${styles.tab} ${selectedType === 'shopping' ? styles.active : ''}`}
    onClick={() => handleTypeChange('shopping')}
  >
    超市代购
  </Text>
</View>
  )

// 任务卡片组件
const TaskCard = ({ task }: { task: any }) => {
  const getTaskTypeDisplay = (taskItem: any) => {
    if (taskItem.errand_type === 'express_pickup') return '快递代�?
    if (taskItem.errand_type === 'food_delivery') return '食堂打饭'
    if (taskItem.errand_type === 'grocery_shopping') return '超市代购'
    if (taskItem.errand_type === 'other') return '其他'
    return taskItem.title || '其他'
  }

  const getTaskRouteDisplay = (taskItem: any) => {
    const from = taskItem.location_from || '起始地点'
    const to = taskItem.location_to || '目的地点'
    return `${from} �?${to}`
  }

  const getTaskStatusDisplay = (status?: string) => {
    switch (status) {
      case 'pending': return '待接�?
      case 'accepted': return '进行�?
      case 'completed': return '已完�?
      case 'cancelled': return '已取�?
      default: return '待接�?
    }
  }

  return (
    <View className={styles.taskCard} onClick={() => handleTaskClick(task)}>
      <View className={styles.cardHeader}>
        <HighlightText
          text={getTaskTypeDisplay(task)}
          keywords={searchKeywords}
        />
        <Text className={styles.taskReward}>¥{task.reward}</Text>
      </View>
      <View className={styles.cardBody}>
        <HighlightText
          text={getTaskRouteDisplay(task)}
          keywords={searchKeywords}
        />
        <Text className={styles.deadline}>
          期望送达：{task.deadline ? new Date(task.deadline).toLocaleString() : '尽快'}
        </Text>
      </View>
      <View className={styles.cardFooter}>
        <Text className={styles.status}>
          {getTaskStatusDisplay(task.status)}
        </Text>
      </View>
    </View>
  )
}

return (
  <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    <CustomHeader title='校园跑腿' />
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <ScrollView
        scrollY
        style={{ height: '100%' }}
        refresherEnabled
        refresherTriggered={isRefreshing}
        onRefresherRefresh={handleRefresh}
        refresherBackground='#f8fafc'
        onScrollToLower={handleLoadMore}
      >
        {/* 搜索栏和发布按钮 */}
        <View className={styles.searchContainer}>
          <View className={styles.searchBarWrapper}>
            <SearchBar
              key='errands-search'
              keyword={searchKeyword}
              placeholder='搜索跑腿订单'
              onInput={handleSearchInput}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </View>
          <View className={styles.publishButton} onClick={() => Taro.navigateTo({ url: '/pages/subpackage-commerce/pages/errands/publish/index' })}>
            <Text className={styles.plusIcon}>+</Text>
            <Text>发布需�?/Text>
          </View>
        </View>
        <FilterTabs />

        {/* 任务列表 */}
        {errandsLoading === 'pending' && errands.length === 0 ? (
          <View className={styles.loadingContainer}>
            <Text className={styles.loadingText}>加载�?..</Text>
          </View>
        ) : errands.length > 0 ? (
          <View className={styles.taskList}>
            {errands.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon='/assets/empty.svg'
            text={searchKeyword ? '没有找到相关任务' : '暂无任务'}
          />
        )}

        {/* 加载更多指示�?*/}
        {errandsLoading === 'pending' && errands.length > 0 && (
          <View className={styles.loadMoreContainer}>
            <Text className={styles.loadMoreText}>加载更多...</Text>
          </View>
        )}
      </ScrollView>
    </View>

    {/* 带鉴权的悬浮发布按钮 */}
    <AuthFloatingButton
      variant='plus'
      onClick={() => Taro.navigateTo({ url: '/pages/subpackage-commerce/pages/errands/publish/index' })}
      loginPrompt='您需要登录后才能发布跑腿任务，是否立即前往登录页面�?
        redirectUrl='/pages/subpackage-commerce/pages/errands/publish/index'
      />

    <ErrandsTabBar activeTab='home' />
  </View>
)
}

export default ErrandsHomePage
