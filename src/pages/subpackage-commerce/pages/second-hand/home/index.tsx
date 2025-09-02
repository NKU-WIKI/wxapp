// Third-party imports
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useCallback, useRef } from 'react'
import { View, ScrollView, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'

// Relative imports
import CustomHeader from '@/components/custom-header'
import EmptyState from '@/components/empty-state'
import SearchBar from '@/components/search-bar'
import { fetchListings, searchListings, clearError } from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ListingRead, ListingType } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useRelativeTime } from '@/hooks/useRelativeTime'

// Assets imports
import emptyIcon from '@/assets/empty.svg'

import styles from './index.module.scss'

// 筛选标签组件
const FilterTabs = ({
  selectedType,
  onTypeChange,
}: {
  selectedType: 'all' | 'sell' | 'buy'
  onTypeChange: (_type: 'all' | 'sell' | 'buy') => void
}) => (
  <View className={styles.filterTabs}>
    <Text
      className={`${styles.tab} ${selectedType === 'all' ? styles.active : ''}`}
      onClick={() => onTypeChange('all')}
    >
      全部
    </Text>
    <Text
      className={`${styles.tab} ${selectedType === 'sell' ? styles.active : ''}`}
      onClick={() => onTypeChange('sell')}
    >
      出闲置
    </Text>
    <Text
      className={`${styles.tab} ${selectedType === 'buy' ? styles.active : ''}`}
      onClick={() => onTypeChange('buy')}
    >
      收二手
    </Text>
  </View>
)

const SecondHandHomePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()
  const { listings, listingsLoading, listingsPagination, error } = useSelector(
    (state: RootState) => state.marketplace
  )

  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'sell' | 'buy'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 跟踪用户是否主动进行了筛选操作
  const userFilterChangedRef = useRef(false)

  // 获取商品列表 - 关键词必须通过参数显式传递
  const loadListings = useCallback(async (params: { skip?: number; refresh?: boolean; keyword: string }) => {
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
        queryParams.listing_type = selectedType === 'sell' ? ListingType.SELL : ListingType.BUY
      }

      // 使用显式传递的关键词参数
      if (params.keyword.trim()) {
        queryParams.keyword = params.keyword.trim()
      }

      await dispatch(fetchListings(queryParams)).unwrap()
    } catch (fetchError) {
      //
      Taro.showToast({ title: '获取商品列表失败', icon: 'none' })
    } finally {
      if (params?.refresh) {
        setIsRefreshing(false)
      }
    }
  }, [dispatch, selectedType])

  // 处理搜索
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) return

    try {
      setIsRefreshing(true)
      const searchParams: any = {
        q: searchKeyword.trim(),
        skip: 0,
        limit: 20,
      }

      // 只在用户主动选择类型时才添加类型参数
      if (selectedType !== 'all') {
        searchParams.listing_type = selectedType === 'sell' ? ListingType.SELL : ListingType.BUY
      }

      await dispatch(searchListings(searchParams)).unwrap()
    } catch (searchError) {
      //
      Taro.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      setIsRefreshing(false)
    }
  }, [dispatch, searchKeyword, selectedType])

  // 处理刷新
  const handleRefresh = useCallback(async () => {
    // 刷新时保持当前的搜索关键词
    await loadListings({ refresh: true, keyword: searchKeyword })
  }, [loadListings, searchKeyword])

  // 处理加载更多
  const handleLoadMore = useCallback(async () => {
    if (!listingsPagination?.has_more || listingsLoading === 'pending') return

    const nextSkip = (listingsPagination?.skip || 0) + (listingsPagination?.limit || 20)
    // 传递当前搜索关键词以保持搜索状态
    await loadListings({ skip: nextSkip, keyword: searchKeyword })
  }, [listingsPagination, listingsLoading, loadListings, searchKeyword])

  // 处理商品点击
  const handleProductClick = useCallback((product: ListingRead) => {
    Taro.navigateTo({
      url: `/pages/subpackage-commerce/pages/second-hand/detail/index?id=${product.id}`,
    }).catch(() => {
      Taro.showToast({ title: '详情页面开发中', icon: 'none' })
    })
  }, [])

  // 处理发布按钮点击
  const handlePublishClick = useCallback(() => {
    if (!checkAuth()) return

    Taro.navigateTo({
      url: '/pages/subpackage-commerce/pages/second-hand/publish/index',
    })
  }, [checkAuth])

  // 页面每次显示时刷新数据（包括首次进入和从其他页面返回）
  useDidShow(() => {
    loadListings({ refresh: true, keyword: searchKeyword })
  })

  // 当筛选类型发生变化时，自动重新加载数据
  useEffect(() => {
    // 只有当用户主动进行了筛选操作时才重新加载
    if (userFilterChangedRef.current) {
      loadListings({ refresh: true, keyword: searchKeyword })
      userFilterChangedRef.current = false // 重置标记
    }
  }, [selectedType, loadListings, searchKeyword])

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // 处理搜索输入 - 使用 useCallback 保持函数稳定性
  const handleSearchInput = useCallback((e: any) => {
    setSearchKeyword(e.detail.value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchKeyword('')
    // 清空后重新加载所有商品
    loadListings({ refresh: true, keyword: '' })
  }, [loadListings])

  // 处理筛选类型变化
  const handleTypeChange = useCallback((type: 'all' | 'sell' | 'buy') => {
    userFilterChangedRef.current = true
    setSelectedType(type)
  }, [])

  // 商品卡片组件
  const ProductCard = ({ product }: { product: ListingRead }) => {
    const { formattedTime } = useRelativeTime(product.created_at, {
      autoUpdate: true,
      updateInterval: 60000 // 每分钟更新一次
    })

    const getConditionText = (condition?: string) => {
      switch (condition) {
        case 'new': return '全新'
        case 'like_new': return '九成新'
        case 'good': return '八成新'
        case 'acceptable': return '七成新'
        case 'damaged': return '其他'
        default: return ''
      }
    }

    return (
      <View className={styles.productCard} onClick={() => handleProductClick(product)}>
        <View className={styles.imageWrapper}>
          <Image
            src={product.images?.[0] || '/assets/placeholder.jpg'}
            className={styles.productImage}
            mode='aspectFill'
          />
          {!!product.condition && (
            <View
              className={`${styles.conditionBadge} ${styles[`cond_${product.condition}`] || ''}`}
            >
              <Text className={styles.badgeText}>{getConditionText(product.condition)}</Text>
            </View>
          )}
        </View>
        <Text className={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>
        <View className={styles.productFooter}>
          <Text className={styles.productPrice}>
            ¥{typeof product.price === 'string' ? product.price : product.price || '面议'}
          </Text>
          <Text className={styles.productTime}>
            {formattedTime}
          </Text>
        </View>
      </View>
    )
  }

  // 悬浮发布按钮
  const FloatingActionButton = () => (
    <View className={styles.fab} onClick={handlePublishClick}>
      <Text className={styles.fabIcon}>+</Text>
    </View>
  )

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title='二手交易' />

      {/* 搜索框和筛选标签 - 固定在顶部，不随滚动 */}
      <View className={styles.fixedHeader}>
        <SearchBar
          keyword={searchKeyword}
          placeholder='搜索二手商品'
          onInput={handleSearchInput}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
        <FilterTabs selectedType={selectedType} onTypeChange={handleTypeChange} />
      </View>

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
          {/* 商品列表 */}
          {listingsLoading === 'pending' && listings.length === 0 ? (
            <View className={styles.loadingContainer}>
              <Text className={styles.loadingText}>加载中...</Text>
            </View>
          ) : listings.length > 0 ? (
            <View className={styles.productGrid}>
              {listings.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={emptyIcon}
              text={searchKeyword ? '没有找到相关商品' : '暂无商品'}
            />
          )}

          {/* 加载更多指示器 */}
          {listingsLoading === 'pending' && listings.length > 0 && (
            <View className={styles.loadMoreContainer}>
              <Text className={styles.loadMoreText}>加载更多...</Text>
            </View>
          )}
        </ScrollView>
      </View>
      <FloatingActionButton />
    </View>
  )
}

export default SecondHandHomePage
