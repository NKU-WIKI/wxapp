import { View, ScrollView, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import postApi from '@/services/api/post'
import { getPinnedPosts } from '@/services/api/pin'
import { AppDispatch } from '@/store'
import { fetchUnreadCounts } from '@/store/slices/notificationSlice'
import type { Post as PostData } from '@/types/api/post.d'
import { usePageRefresh } from '@/utils/pageRefreshManager'
import styles from './index.module.scss'
import CustomHeader from '../../components/custom-header'
import Section from './components/Section'

interface HotPost {
  id?: string | number
  post_id?: string | number
  title?: string
  comment_count?: number
  view_count?: number
  like_count?: number
  hot_score?: number
  platform?: string
  original_url?: string
  isPinned?: boolean // 新增字段标记是否为置顶帖子
}

interface CombinedPost {
  id?: string | number
  post_id?: string | number
  title?: string
  comment_count?: number
  view_count?: number
  like_count?: number
  hot_score?: number
  platform?: string
  original_url?: string
  isPinned?: boolean
  created_at?: string
  create_time?: string
}

// eslint-disable-next-line import/no-unused-modules
export default function Discover() {
  const dispatch = useDispatch<AppDispatch>()
  const [hotPosts, setHotPosts] = useState<HotPost[]>([])
  const [pinnedPosts, setPinnedPosts] = useState<PostData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 合并置顶帖子和热榜帖子的数据
  const [combinedPosts, setCombinedPosts] = useState<CombinedPost[]>([])

  // 页面显示时刷新未读通知数量
  useDidShow(() => {
    const storedToken = Taro.getStorageSync('token')
    if (storedToken) {
      dispatch(fetchUnreadCounts()).catch((_error) => {
        // 静默处理错误，不影响主要功能
      })
    }
  })

  const fetchHotPosts = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsRefreshing(true)
      }

      const params = {
        limit: 5,
      }

      const response = await postApi.getHotPostList(params)
      let postsData: HotPost[] = []

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          postsData = response.data as HotPost[]
          // 按照hot_score降序排序，确保排名与显示分数一致
          postsData.sort((a, b) => {
            const scoreA = a.hot_score || 0
            const scoreB = b.hot_score || 0
            return scoreB - scoreA
          })
        }
        setHotPosts(postsData)
      } else {
        setHotPosts([])
      }
    } catch (error) {
      setHotPosts([])
    } finally {
      if (showLoading) {
        setIsRefreshing(false)
      }
    }
  }, [])

  // 获取置顶帖子
  const fetchPinnedPosts = useCallback(async () => {
    try {
      const response = await getPinnedPosts()
      if (response.code === 0 && response.data) {
        setPinnedPosts(response.data)
      } else {
        setPinnedPosts([])
      }
    } catch (error) {
      setPinnedPosts([])
    }
  }, [])

  // 合并置顶帖子和热榜帖子
  useEffect(() => {
    const combined: CombinedPost[] = []

    // 先添加置顶帖子（转换为HotPost格式）
    pinnedPosts.forEach((post, index) => {
      combined.push({
        id: post.id,
        post_id: post.id,
        title: post.title,
        comment_count: post.comment_count,
        view_count: post.view_count,
        like_count: post.like_count,
        hot_score: 999999 - index, // 给置顶帖子很高的热度分数，确保排在前面
        platform: 'pinned',
        isPinned: true, // 标记为置顶帖子
        created_at: post.created_at,
        create_time: post.create_time,
      })
    })

    // 然后添加热榜帖子
    hotPosts.forEach((post) => {
      combined.push({
        ...post,
        isPinned: false,
      })
    })

    // 按指定规则排序
    combined.sort((a, b) => {
      // 如果都是置顶帖子，按创建时间从新到旧排序（假设最新置顶的会有更新的创建时间）
      if (a.isPinned && b.isPinned) {
        const timeA = new Date(a.created_at || a.create_time || 0).getTime()
        const timeB = new Date(b.created_at || b.create_time || 0).getTime()
        return timeB - timeA // 新的在前
      }
      // 置顶帖子排在前面
      if (a.isPinned) return -1
      if (b.isPinned) return 1
      // 其他帖子按点赞量排序
      return (b.like_count || 0) - (a.like_count || 0)
    })

    // 只取前5个
    setCombinedPosts(combined.slice(0, 5))
  }, [pinnedPosts, hotPosts])

  useEffect(() => {
    fetchHotPosts(false)
    fetchPinnedPosts()
  }, [fetchHotPosts, fetchPinnedPosts])

  // 注册页面刷新监听器
  const pageRefresh = usePageRefresh('/pages/discover/index', () => {
    // 刷新页面数据
    fetchHotPosts(false)
    fetchPinnedPosts()
  })

  useEffect(() => {
    pageRefresh.subscribe()
    return () => {
      pageRefresh.unsubscribe()
    }
  }, [pageRefresh])

  const handleRefresh = async () => {
    await Promise.all([fetchHotPosts(true), fetchPinnedPosts()])
  }

  const handlePostClick = (post: HotPost) => {
    if (post.platform === 'wxapp' && post.id) {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}`,
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' })
      })
      return
    }

    if (post.original_url) {
      Taro.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(post.original_url)}&title=${encodeURIComponent(post.title || '')}`,
      }).catch(() => {
        Taro.showModal({
          title: '打开链接',
          content: '是否使用浏览器打开此链接？',
          success: (res) => {
            if (res.confirm && post.original_url) {
              Taro.setClipboardData({
                data: post.original_url,
                success: () => {
                  Taro.showToast({ title: '链接已复制', icon: 'success' })
                },
              })
            }
          },
        })
      })
      return
    }

    if (post.post_id) {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${post.post_id}`,
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' })
      })
    } else {
      Taro.showToast({ title: `点击了: ${post.post_id}`, icon: 'none' })
    }
  }

  return (
    <View className={styles.discoverPage}>
      <CustomHeader title="发现" hideBack showWikiButton showNotificationIcon />

      <ScrollView
        scrollY
        className={styles.pageScrollView}
        enhanced
        bounces={false}
        scrollWithAnimation
        enableFlex
      >
        <View className={styles.contentContainer}>
          {/* 热门帖子 - 包含置顶和热榜 */}
          <Section title="🔥 热榜">
            <ScrollView
              scrollY
              className={styles.hotPostsList}
              style={{ height: '300px' }}
              refresherEnabled
              refresherTriggered={isRefreshing}
              onRefresherRefresh={handleRefresh}
              refresherBackground="#f8fafc"
            >
              {Array.isArray(combinedPosts) && combinedPosts.length > 0
                ? combinedPosts.map((post: CombinedPost, index: number) => (
                    <View
                      key={post.post_id || index}
                      className={styles.hotPostItem}
                      onClick={() => handlePostClick(post)}
                    >
                      <View className={styles.hotPostContent}>
                        <View className={styles.rankWrapper}>
                          <Text
                            className={`${styles.rankNumber} ${styles[`rank${index + 1 <= 3 ? index + 1 : 'Other'}`]}`}
                          >
                            {index + 1}
                          </Text>
                          <View className={styles.titleWrapper}>
                            {post.isPinned ? (
                              <Text className={styles.pinnedBadge}>顶</Text>
                            ) : (
                              <Text className={styles.hotBadge}>🔥</Text>
                            )}
                            <Text className={styles.hotPostTitle} numberOfLines={1}>
                              {post.title}
                            </Text>
                          </View>
                        </View>
                        <Text className={styles.hotPostReadCount}>
                          {post.comment_count && post.comment_count > 1000
                            ? `${(post.comment_count / 1000).toFixed(1)}K`
                            : post.comment_count || 0}
                        </Text>
                      </View>
                    </View>
                  ))
                : [
                    { id: '1', title: '实习工资怎么理财', readCount: '5.9K', rank: 1 },
                    { id: '2', title: '心事和谁说比较好', readCount: '4.6K', rank: 2 },
                    { id: '3', title: '求男女对唱歌曲推荐', readCount: '1.3K', rank: 3 },
                    { id: '4', title: '帮忙看鞋', readCount: '4.6K', rank: 4 },
                    { id: '5', title: '准备考选调需要做什么', readCount: '2.7K', rank: 5 },
                  ].map((item) => (
                    <View
                      key={item.id}
                      className={styles.hotPostItem}
                      onClick={() => {
                        // 尝试跳转到详情页面，如果失败则显示提示
                        Taro.navigateTo({
                          url: `/pages/subpackage-interactive/post-detail/index?id=${item.id}`,
                        }).catch(() => {
                          Taro.showToast({ title: '暂无详情页面', icon: 'none' })
                        })
                      }}
                    >
                      <View className={styles.hotPostContent}>
                        <View className={styles.rankWrapper}>
                          <Text
                            className={`${styles.rankNumber} ${styles[`rank${item.rank <= 3 ? item.rank : 'Other'}`]}`}
                          >
                            {item.rank}
                          </Text>
                          <Text className={styles.hotPostTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                        </View>
                        <Text className={styles.hotPostReadCount}>{item.readCount}</Text>
                      </View>
                    </View>
                  ))}
            </ScrollView>
          </Section>

          {/* 功能模块 */}
          <View className={styles.moduleGrid}>
            {/* 第一行 */}
            <View className={styles.moduleRow}>
              <View
                className={styles.moduleCard}
                onClick={() => {
                  Taro.navigateTo({ url: '/pages/subpackage-discover/activity-square/index' })
                }}
              >
                <View className={styles.moduleContentWrapper}>
                  <Image src="/assets/activity.png" className={styles.moduleIcon} />
                  <View className={styles.moduleTextWrapper}>
                    <Text className={styles.moduleTitle}>活动广场</Text>
                    <Text className={styles.moduleSubtitle}>发现精彩活动</Text>
                  </View>
                </View>
              </View>
              <View
                className={styles.moduleCard}
                onClick={() => {
                  Taro.navigateTo({
                    url: '/pages/subpackage-commerce/pages/second-hand/home/index',
                  })
                }}
              >
                <View className={styles.moduleContentWrapper}>
                  <Image src="/assets/exchange.png" className={styles.moduleIcon} />
                  <View className={styles.moduleTextWrapper}>
                    <Text className={styles.moduleTitle}>二手市场</Text>
                    <Text className={styles.moduleSubtitle}>买卖闲置物品</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 第二行 */}
            <View className={styles.moduleRow}>
              <View
                className={styles.moduleCard}
                onClick={() => {
                  Taro.navigateTo({ url: '/pages/subpackage-discover/learning-materials/index' })
                }}
              >
                <View className={styles.moduleContentWrapper}>
                  <Image src="/assets/book-green.png" className={styles.moduleIcon} />
                  <View className={styles.moduleTextWrapper}>
                    <Text className={styles.moduleTitle}>学习资源</Text>
                    <Text className={styles.moduleSubtitle}>共享学习资料</Text>
                  </View>
                </View>
              </View>
              <View
                className={styles.moduleCard}
                onClick={() => {
                  Taro.navigateTo({ url: '/pages/subpackage-discover/rating/index' })
                }}
              >
                <View className={styles.moduleContentWrapper}>
                  <Image src="/assets/star-yellow.png" className={styles.moduleIcon} />
                  <View className={styles.moduleTextWrapper}>
                    <Text className={styles.moduleTitle}>课程评价</Text>
                    <Text className={styles.moduleSubtitle}>分享学习体验</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
