import { View, ScrollView, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'

import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import styles from './index.module.scss'

import type { Post as PostType } from '@/types/api/post.d'

import emptyIcon from '@/assets/empty.svg'
import CustomHeader from '@/components/custom-header'
import EmptyState from '@/components/empty-state'
import Post from '@/components/post'
import PostItemSkeleton from '@/components/post-item-skeleton'
import SearchBar from '@/components/search-bar'
import { Categories } from '@/constants/categories'
import { useMultipleFollowStatus } from '@/hooks/useFollowStatus'
import { AppDispatch, RootState } from '@/store'
import { fetchUnreadCounts } from '@/store/slices/notificationSlice'
import { fetchFeed, fetchForumPosts } from '@/store/slices/postSlice'
import { getRecommendedContent, collectUserInteraction } from '@/utils/contentRecommendation'
import { usePageRefresh } from '@/utils/pageRefreshManager'

// Assets imports

// Relative imports

export default function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    list: posts,
    loading,
    pagination,
  } = useSelector(
    (state: RootState) =>
      state.post || { list: [] as PostType[], loading: 'idle', pagination: null }
  )
  const { isLoggedIn } = useSelector((state: RootState) => state.user || { isLoggedIn: false })
  const isLoading = loading === 'pending'
  const isLoadingMore = loading === 'pending' && posts.length > 0

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0)

  // 提取所有帖子作者ID用于批量获取关注状态
  const authorIds = useMemo(() => {
    // 只有在用户登录时才返回作者ID数组
    if (!isLoggedIn) {
      return []
    }
    return Array.from(new Set(posts.filter((post) => post?.user?.id).map((post) => post.user.id)))
  }, [posts, isLoggedIn])

  // 获取批量关注状态
  const { followStatusMap, refreshFollowStatus } = useMultipleFollowStatus(authorIds)

  useEffect(() => {
    // 登录状态改变或首次加载时获取信息流
    dispatch(fetchFeed({ skip: 0, limit: 10 }))
  }, [dispatch, isLoggedIn])

  // 注册页面刷新监听器
  const pageRefresh = usePageRefresh('/pages/home/index', () => {
    // 刷新页面数据
    handlePullRefresh()
  })

  useEffect(() => {
    pageRefresh.subscribe()
    return () => {
      pageRefresh.unsubscribe()
    }
  }, [pageRefresh])

  useDidShow(() => {
    // 每次显示首页时都刷新帖子数据和关注状态

    const now = Date.now()

    // 防抖：如果距离上次刷新不足2秒，则跳过
    if (now - lastRefreshTime < 2000) {
      return
    }

    setLastRefreshTime(now)

    // 刷新帖子数据
    handlePullRefresh()

    // 刷新关注状态
    if (isLoggedIn && authorIds.length > 0) {
      refreshFollowStatus()
    }
  })

  // 下拉刷新处理函数
  const handlePullRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const params = { skip: 0, limit: 10 }
      if (selectedCategory) {
        await dispatch(
          fetchForumPosts({ ...params, category_id: selectedCategory as any })
        ).unwrap()
      } else {
        await dispatch(fetchFeed(params)).unwrap()
      }
    } catch (error) {
    } finally {
      setIsRefreshing(false)
    }
  }

  // 滚动到底部加载更多
  const handleScrollToLower = async () => {
    if (isLoading || isRefreshing || !pagination || !pagination.has_more) return

    try {
      const nextSkip = (pagination.skip || 0) + (pagination.limit || 10)
      const params = { skip: nextSkip, limit: 10 }

      if (selectedCategory) {
        await dispatch(fetchForumPosts({ ...params, category_id: selectedCategory })).unwrap()
      } else {
        await dispatch(fetchFeed(params)).unwrap()
      }
    } catch (error) {}
  }

  const handleCategoryClick = (categoryId: string) => {
    const newSelectedCategory = selectedCategory === categoryId ? null : categoryId
    setSelectedCategory(newSelectedCategory)

    const params = { skip: 0, limit: 10 }

    if (newSelectedCategory) {
      dispatch(fetchForumPosts({ ...params, category_id: newSelectedCategory as any }))
    } else {
      dispatch(fetchFeed(params))
    }
  }

  // 页面显示时刷新未读通知数量
  useDidShow(() => {
    const storedToken = Taro.getStorageSync('token')
    if (storedToken) {
      dispatch(fetchUnreadCounts()).catch((_error) => {
        // 静默处理错误，不影响主要功能
      })
    }
  })

  const renderContent = () => {
    if (isLoading && posts.length === 0) {
      return Array.from({ length: 3 }).map((_, index) => (
        <PostItemSkeleton key={index} className={styles.postListItem} />
      ))
    }

    if (!posts || posts.length === 0) {
      return <EmptyState icon={emptyIcon} text="暂时没有帖子，快来发布第一条吧！" />
    }

    // 根据用户设置决定帖子排序方式
    const sortedPosts = getRecommendedContent(
      // 默认按时间排序的帖子
      [...posts].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeB - timeA
      }),
      // 个性化推荐排序的帖子（这里简化为按点赞数排序作为示例）
      [...posts].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    )

    const content = sortedPosts
      .filter((post) => post && post.id && post.user) // Changed from author_info to user
      .map((post) => {
        // 从关注状态映射中获取该作者的关注状态
        const isFollowingAuthor = followStatusMap[post.user.id] === true

        // 创建包含正确关注状态的帖子对象
        const postWithFollowStatus = {
          ...post,
          is_following_author: isFollowingAuthor,
        }

        // 收集用户查看行为数据
        collectUserInteraction('view', post.id, 'post')

        return (
          <Post
            key={post.id}
            post={postWithFollowStatus}
            className={styles.postListItem}
            mode="list"
          />
        )
      })

    // 添加加载更多的骨架屏
    if (isLoadingMore) {
      content.push(
        ...Array.from({ length: 2 }).map((_, index) => (
          <PostItemSkeleton key={`loading-skeleton-${index}`} className={styles.postListItem} />
        ))
      )
    }

    // 添加没有更多数据的提示
    if (posts.length > 0 && !isLoading && pagination && !pagination.has_more) {
      content.push(
        <View key="no-more" className={styles.noMoreTip}>
          <Text>没有更多内容了</Text>
        </View>
      )
    }

    return content
  }

  return (
    <View className={styles.homeContainer}>
      <CustomHeader title="首页" hideBack showWikiButton showNotificationIcon />

      <View className={styles.fixedContainer}>
        {/* 搜索区域 - 固定 */}
        <SearchBar
          key="home-nav-search"
          keyword=""
          placeholder="搜索校园知识"
          readonly
          onClick={() => {
            try {
              Taro.setStorageSync('explore_focus', 'true')
              Taro.switchTab({ url: '/pages/explore/index' })
            } catch {}
          }}
        />
        {/* 分类区域 - 固定 */}
        <View className={styles.categoriesContainer}>
          {Categories.map((category) => (
            <View
              key={category.id}
              className={`${styles.categoryItem} ${
                selectedCategory === category.id ? styles.selected : ''
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <View className={styles.categoryIconContainer}>
                <Image src={category.icon} className={styles.categoryIcon} mode="aspectFit" />
              </View>
              <Text
                className={`${styles.categoryName} ${
                  selectedCategory === category.id
                    ? styles.categoryNameSelected
                    : styles.categoryNameDefault
                }`}
              >
                {category.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 帖子列表滚动区域 */}
      <View className={styles.postScrollContainer}>
        <ScrollView
          scrollY
          className={styles.postScrollView}
          onScrollToLower={handleScrollToLower}
          lowerThreshold={50} // 降低触发阈值，更敏感
          enableBackToTop
          refresherEnabled
          refresherTriggered={isRefreshing}
          onRefresherRefresh={handlePullRefresh}
        >
          <View className={styles.postList}>
            {renderContent()}
            {/* 底部占位元素，防止内容被tab bar遮挡 */}
            <View className={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
