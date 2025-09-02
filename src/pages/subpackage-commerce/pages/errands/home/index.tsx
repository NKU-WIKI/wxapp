import { View, ScrollView, Text, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useCallback, useRef } from 'react'

import CustomHeader from '@/components/custom-header'
import EmptyState from '@/components/empty-state'
import { fetchErrands, clearError } from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ErrandType } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'

import ErrandsTabBar from '../../../components/ErrandsTabBar'
import styles from './index.module.scss'

const ErrandsHomePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()
  const { errands, errandsLoading, errandsPagination, error } = useSelector(
    (state: RootState) => state.marketplace
  )

  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'express' | 'food' | 'shopping'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 跟踪用户是否主动进行了筛选操作
  const userFilterChangedRef = useRef(false)

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
      Taro.showToast({ title: '详情页面开发中', icon: 'none' })
    })
  }, [])

  // 处理发布按钮点击
  const handlePublishClick = useCallback(() => {
    if (!checkAuth()) return

    Taro.navigateTo({
      url: '/pages/subpackage-commerce/pages/errands/publish/index',
    })
  }, [checkAuth])

  // 页面每次显示时刷新数据（包括首次进入和从其他页面返回）
  useDidShow(() => {
    loadErrands({ refresh: true })
  })

  // 当筛选类型发生变化时，自动重新加载数据
  useEffect(() => {
    // 只有当用户主动进行了筛选操作时才重新加载
    if (userFilterChangedRef.current) {
      loadErrands({ refresh: true })
      userFilterChangedRef.current = false // 重置标记
    }
  }, [selectedType, loadErrands])

  // 监听发布成功事件，刷新列表
  useEffect(() => {
    const handleRefreshEvent = () => {
      loadErrands({ refresh: true })
    }

    // 监听发布成功事件
    Taro.eventCenter.on('refreshErrandsListings', handleRefreshEvent)

    // 清理事件监听
    return () => {
      Taro.eventCenter.off('refreshErrandsListings', handleRefreshEvent)
    }
  }, [loadErrands])

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // 搜索框组件
  const SearchBar = () => (
    <View className={styles.searchContainer}>
      <View className={styles.searchBar}>
        <Input
          placeholder='搜索跑腿订单'
          value={searchKeyword}
          onInput={(e) => setSearchKeyword(e.detail.value)}
        />
      </View>
      <View className={styles.publishButton} onClick={handlePublishClick}>
        <Text className={styles.plusIcon}>+</Text>
        <Text>发布需求</Text>
      </View>
    </View>
  )

  // 处理筛选类型变化
  const handleTypeChange = useCallback((type: 'all' | 'express' | 'food' | 'shopping') => {
    userFilterChangedRef.current = true
    setSelectedType(type)
  }, [])

  // 筛选标签组件
  const FilterTabs = () => (
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
        快递代取
      </Text>
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
  const TaskCard = ({ task }: { task: any }) => (
    <View className={styles.taskCard} onClick={() => handleTaskClick(task)}>
      <View className={styles.cardHeader}>
        <Text className={styles.taskType}>
          {task.errand_type === 'express_pickup' && '快递代取'}
          {task.errand_type === 'food_delivery' && '食堂打饭'}
          {task.errand_type === 'grocery_shopping' && '超市代购'}
          {task.errand_type === 'other' && '其他'}
          {!task.errand_type && task.title}
        </Text>
        <Text className={styles.taskReward}>¥{task.reward}</Text>
      </View>
      <View className={styles.cardBody}>
        <Text className={styles.route}>
          {task.location_from || '起始地点'} → {task.location_to || '目的地点'}
        </Text>
        <Text className={styles.deadline}>
          期望送达：{task.deadline ? new Date(task.deadline).toLocaleString() : '尽快'}
        </Text>
      </View>
      <View className={styles.cardFooter}>
        <Text className={styles.status}>
          {task.status === 'pending' && '待接单'}
          {task.status === 'accepted' && '进行中'}
          {task.status === 'completed' && '已完成'}
          {task.status === 'cancelled' && '已取消'}
          {!task.status && '待接单'}
        </Text>
      </View>
    </View>
  )

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
          <SearchBar />
          <FilterTabs />

          {/* 任务列表 */}
          {errandsLoading === 'pending' && errands.length === 0 ? (
            <View className={styles.loadingContainer}>
              <Text className={styles.loadingText}>加载中...</Text>
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

          {/* 加载更多指示器 */}
          {errandsLoading === 'pending' && errands.length > 0 && (
            <View className={styles.loadMoreContainer}>
              <Text className={styles.loadMoreText}>加载更多...</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <ErrandsTabBar activeTab='home' />
    </View>
  )
}

export default ErrandsHomePage
