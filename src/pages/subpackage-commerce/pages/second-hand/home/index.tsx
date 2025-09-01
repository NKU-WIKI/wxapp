import { View, ScrollView, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useCallback } from 'react'

import CustomHeader from '@/components/custom-header'
import EmptyState from '@/components/empty-state'
import { fetchListings, searchListings, clearError } from '@/store/slices/marketplaceSlice'
import { RootState, AppDispatch } from '@/store'
import { ListingRead, ListingType } from '@/types/api/marketplace.d'
import { useAuthGuard } from '@/hooks/useAuthGuard'

import styles from './index.module.scss'

const SecondHandHomePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()
  const { listings, listingsLoading, listingsPagination, error } = useSelector(
    (state: RootState) => state.marketplace
  )

  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'sell' | 'buy'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 获取商品列表
  const loadListings = useCallback(async (params?: { skip?: number; refresh?: boolean }) => {
    try {
      if (params?.refresh) {
        setIsRefreshing(true)
      }

      const queryParams = {
        skip: params?.skip || 0,
        limit: 20,
        listing_type: selectedType === 'all' ? undefined : (selectedType === 'sell' ? ListingType.SELL : ListingType.BUY),
        keyword: searchKeyword || undefined,
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
  }, [dispatch, selectedType, searchKeyword])

  // 处理搜索
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) return

    try {
      setIsRefreshing(true)
      const searchParams = {
        q: searchKeyword,
        listing_type: selectedType === 'all' ? undefined : (selectedType === 'sell' ? ListingType.SELL : ListingType.BUY),
        skip: 0,
        limit: 20,
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
    await loadListings({ refresh: true })
  }, [loadListings])

  // 处理加载更多
  const handleLoadMore = useCallback(async () => {
    if (!listingsPagination?.has_more || listingsLoading === 'pending') return

    const nextSkip = (listingsPagination?.skip || 0) + (listingsPagination?.limit || 20)
    await loadListings({ skip: nextSkip })
  }, [listingsPagination, listingsLoading, loadListings])

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

  // 初始化数据
  useEffect(() => {
    loadListings()
  }, [loadListings])

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
          placeholder='搜索二手商品'
          value={searchKeyword}
          onInput={(e) => setSearchKeyword(e.detail.value)}
          onConfirm={handleSearch}
        />
        <Image
          src='/assets/search.svg'
          className={styles.searchIcon}
          onClick={handleSearch}
        />
      </View>
    </View>
  )

  // 筛选标签组件
  const FilterTabs = () => (
    <View className={styles.filterTabs}>
      <Text
        className={`${styles.tab} ${selectedType === 'all' ? styles.active : ''}`}
        onClick={() => setSelectedType('all')}
      >
        全部
      </Text>
      <Text
        className={`${styles.tab} ${selectedType === 'sell' ? styles.active : ''}`}
        onClick={() => setSelectedType('sell')}
      >
        出闲置
      </Text>
      <Text
        className={`${styles.tab} ${selectedType === 'buy' ? styles.active : ''}`}
        onClick={() => setSelectedType('buy')}
      >
        收二手
      </Text>
    </View>
  )

  // 商品卡片组件
  const ProductCard = ({ product }: { product: ListingRead }) => (
    <View className={styles.productCard} onClick={() => handleProductClick(product)}>
      <Image
        src={product.images?.[0] || '/assets/placeholder.jpg'}
        className={styles.productImage}
        mode='aspectFill'
      />
      <Text className={styles.productTitle} numberOfLines={2}>
        {product.title}
      </Text>
      <View className={styles.productFooter}>
        <Text className={styles.productPrice}>
          ¥{typeof product.price === 'string' ? product.price : product.price || '面议'}
        </Text>
        <Text className={styles.productTime}>
          {product.created_at ? new Date(product.created_at).toLocaleDateString() : ''}
        </Text>
      </View>
      {product.condition && (
        <View className={styles.productCondition}>
          <Text className={styles.conditionText}>{product.condition}</Text>
        </View>
      )}
    </View>
  )

  // 悬浮发布按钮
  const FloatingActionButton = () => (
    <View className={styles.fab} onClick={handlePublishClick}>
      <Text className={styles.fabIcon}>+</Text>
    </View>
  )

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title='二手交易' />
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
              icon='/assets/empty.svg'
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
