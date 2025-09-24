import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchUserPosts, resetUserPosts } from '@/store/slices/userPostsSlice'
import CustomHeader from '@/components/custom-header'
import EmptyState from '@/components/empty-state'
import Post from '@/components/post'
import heartIcon from '@/assets/heart.svg'
import styles from './index.module.scss'

const ReceivedLikesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    items: posts,
    loading,
    error,
    pagination,
  } = useSelector((state: RootState) => state.userPosts)
  const userState = useSelector((state: RootState) => state.user)
  const [isInitialized, setIsInitialized] = useState(false)

  // 过滤出有获赞的帖子
  const likedPosts = posts.filter((post) => post.like_count > 0)

  // 加载用户帖子 - 使用 ref 来获取最新的 pagination 状态
  const paginationRef = React.useRef(pagination)
  paginationRef.current = pagination

  const loadUserPosts = useCallback(
    async (isRefresh = false) => {
      try {
        // 从 ref 获取最新的 pagination 状态
        const currentPagination = paginationRef.current
        const params = {
          skip: isRefresh ? 0 : currentPagination.skip + currentPagination.limit,
          limit: 20,
          isAppend: !isRefresh,
        }

        if (isRefresh) {
          dispatch(resetUserPosts())
        }

        await dispatch(fetchUserPosts(params)).unwrap()
      } catch (err) {
        Taro.showToast({
          title: String(err) || '加载失败',
          icon: 'none',
        })
      }
    },
    [dispatch]
  )

  // 初始加载 - 避免循环依赖
  useEffect(() => {
    if (!userState.isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
      })
      return
    }

    if (!isInitialized) {
      setIsInitialized(true)
      loadUserPosts(true)
    }
  }, [userState.isLoggedIn, isInitialized, loadUserPosts])

  // 下拉刷新
  usePullDownRefresh(async () => {
    await loadUserPosts(true)
    Taro.stopPullDownRefresh()
  })

  // 上拉加载更多
  useReachBottom(async () => {
    if (pagination.has_more && loading !== 'pending') {
      await loadUserPosts(false)
    }
  })

  // 渲染加载状态
  if (loading === 'pending' && posts.length === 0) {
    return (
      <View className={styles.container}>
        <CustomHeader title="获赞" />
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    )
  }

  // 渲染错误状态
  if (loading === 'failed' && posts.length === 0) {
    return (
      <View className={styles.container}>
        <CustomHeader title="获赞" />
        <View className={styles.errorContainer}>
          <Text className={styles.errorText}>{error || '加载失败，请重试'}</Text>
          <View className={styles.retryButton} onClick={() => loadUserPosts(true)}>
            <Text className={styles.retryText}>重新加载</Text>
          </View>
        </View>
      </View>
    )
  }

  // 渲染空状态
  if (likedPosts.length === 0) {
    return (
      <View className={styles.container}>
        <CustomHeader title="获赞" />
        <EmptyState
          icon={heartIcon}
          text={
            <View>
              <Text>还没有获得任何点赞</Text>
              <Text>继续创作优质内容吧</Text>
            </View>
          }
        />
        <View className={styles.actionContainer}>
          <View
            className={styles.publishButton}
            onClick={() => {
              Taro.navigateTo({
                url: '/pages/subpackage-interactive/publish/index',
              })
            }}
          >
            <Text className={styles.publishButtonText}>发布内容</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <CustomHeader title="获赞" />

      <ScrollView className={styles.scrollView} scrollY enhanced showScrollbar={false}>
        <View className={styles.postsContainer}>
          {likedPosts.map((post) => (
            <View key={post.id} className={styles.postWrapper}>
              <Post post={post} mode="list" enableNavigation />
            </View>
          ))}

          {/* 加载更多指示器 */}
          {loading === 'pending' && posts.length > 0 && (
            <View className={styles.loadMore}>
              <Text className={styles.loadMoreText}>加载中...</Text>
            </View>
          )}

          {/* 没有更多数据提示 */}
          {!pagination.has_more && posts.length > 0 && (
            <View className={styles.noMore}>
              <Text className={styles.noMoreText}>没有更多内容了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ReceivedLikesPage
