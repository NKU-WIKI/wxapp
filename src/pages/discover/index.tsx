import { View, ScrollView, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState, useCallback } from "react";
import postApi from "@/services/api/post";
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";
import Section from "./components/Section";

interface HotPost {
  id?: string | number;
  post_id?: string | number;
  title?: string;
  comment_count?: number;
  view_count?: number;
  like_count?: number;
  platform?: string;
  original_url?: string;
}

// 验证 UUID 格式的辅助函数
function isValidUUID(uuid: string | number): boolean {
  if (typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// eslint-disable-next-line import/no-unused-modules
export default function Discover() {
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHotPosts = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsRefreshing(true);
      }

      const params = {
        limit: 5
      };

      const response = await postApi.getHotPostList(params);
      let postsData: HotPost[] = [];

      console.log(response);

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          postsData = response.data as HotPost[];
        }
        setHotPosts(postsData);
      } else {
        setHotPosts([]);
      }
    } catch (error) {
      console.error('获取热门帖子失败:', error);
      setHotPosts([]);
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchHotPosts(false);
  }, [fetchHotPosts]);

  const handleRefresh = async () => {
    await fetchHotPosts(true);
  };

  const handlePostClick = (post: HotPost) => {
    if (post.platform === 'wxapp' && post.id) {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}`
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' });
      });
      return;
    }

    if (post.original_url) {
      Taro.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(post.original_url)}&title=${encodeURIComponent(post.title || '')}`
      }).catch(() => {
        Taro.showModal({
          title: '打开链接',
          content: '是否使用浏览器打开此链接？',
          success: (res) => {
            if (res.confirm && post.original_url) {
              Taro.setClipboardData({
                data: post.original_url,
                success: () => {
                  Taro.showToast({ title: '链接已复制', icon: 'success' });
                }
              });
            }
          }
        });
      });
      return;
    }

    if (post.post_id) {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${post.post_id}`
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' });
      });
    } else {
      Taro.showToast({ title: `点击了: ${post.post_id}`, icon: 'none' });
    }
  };

  return (
    <View className={styles.discoverPage}>
      <CustomHeader title='探索' hideBack showWikiButton showNotificationIcon />

      <View className={styles.contentContainer}>
        {/* 热门帖子 */}
        <Section
          title='热榜 TOP5'
          extraText='更多'
          isLink
          onExtraClick={() => {
            Taro.navigateTo({ url: '/pages/subpackage-interactive/hot-posts/index' });
          }}
        >
          <ScrollView
            scrollY
            className={styles.hotPostsList}
            style={{ height: '300px' }}
            refresherEnabled
            refresherTriggered={isRefreshing}
            onRefresherRefresh={handleRefresh}
            refresherBackground='#f8fafc'
          >
            {Array.isArray(hotPosts) && hotPosts.length > 0 ? (
              hotPosts.slice(0, 5).map((post: HotPost, index: number) => (
                <View
                  key={post.id || index}
                  className={styles.hotPostItem}
                  onClick={() => handlePostClick(post)}
                >
                  <View className={styles.hotPostContent}>
                    <View className={styles.rankWrapper}>
                      <Text className={`${styles.rankNumber} ${styles[`rank${index + 1 <= 3 ? index + 1 : 'Other'}`]}`}>
                        {index + 1}
                      </Text>
                      <Text className={styles.hotPostTitle} numberOfLines={1}>
                        {post.title}
                      </Text>
                    </View>
                    <Text className={styles.hotPostReadCount}>
                      {((post.comment_count || 0) + (post.view_count || 0) + (post.like_count || 0)) > 1000
                        ? `${(((post.comment_count || 0) + (post.view_count || 0) + (post.like_count || 0)) / 1000).toFixed(1)}K`
                        : (post.comment_count || 0) + (post.view_count || 0) + (post.like_count || 0)
                      }
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              [
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
                      url: `/pages/subpackage-interactive/post-detail/index?id=${item.id}`
                    }).catch(() => {
                      Taro.showToast({ title: '暂无详情页面', icon: 'none' });
                    });
                  }}
                >
                  <View className={styles.hotPostContent}>
                    <View className={styles.rankWrapper}>
                      <Text className={`${styles.rankNumber} ${styles[`rank${item.rank <= 3 ? item.rank : 'Other'}`]}`}>
                        {item.rank}
                      </Text>
                      <Text className={styles.hotPostTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                    <Text className={styles.hotPostReadCount}>{item.readCount}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </Section>

        {/* 功能模块 */}
        <View className={styles.moduleGrid}>
          {/* 第一行：活动广场 + 二手交易 */}
          <View className={styles.moduleRow}>
            <View
              className={styles.moduleCard}
              onClick={() => {
                Taro.navigateTo({ url: '/pages/discover/activity-square/index' });
              }}
            >
              <View className={styles.moduleContentWrapper}>
                <Image src={require("../../assets/activity.png")} className={styles.moduleIcon} />
                <View className={styles.moduleTextWrapper}>
                  <Text className={styles.moduleTitle}>活动广场</Text>
                  <Text className={styles.moduleSubtitle}>发现精彩活动</Text>
                </View>
              </View>
            </View>

            <View
              className={styles.moduleCard}
              onClick={() => {
                Taro.navigateTo({ url: '/pages/second-hand/index' });
              }}
            >
              <View className={styles.moduleContentWrapper}>
                <Image src={require("../../assets/exchange.png")} className={styles.moduleIcon} />
                <View className={styles.moduleTextWrapper}>
                  <Text className={styles.moduleTitle}>二手市场</Text>
                  <Text className={styles.moduleSubtitle}>买卖闲置物品</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 第二行：学习资料 + 评分评价 */}
          <View className={styles.moduleRow}>
            <View
              className={styles.moduleCard}
              onClick={() => {
                Taro.navigateTo({ url: '/pages/study-materials/index' });
              }}
            >
              <View className={styles.moduleContentWrapper}>
                <Image src={require("../../assets/book-green.png")} className={styles.moduleIcon} />
                <View className={styles.moduleTextWrapper}>
                  <Text className={styles.moduleTitle}>学习资源</Text>
                  <Text className={styles.moduleSubtitle}>共享学习资料</Text>
                </View>
              </View>
            </View>

            <View
              className={styles.moduleCard}
              onClick={() => {
                Taro.navigateTo({ url: '/pages/subpackage-interactive/rating/index' });
              }}
            >
              <View className={styles.moduleContentWrapper}>
                <Image src={require("../../assets/star-yellow.png")} className={styles.moduleIcon} />
                <View className={styles.moduleTextWrapper}>
                  <Text className={styles.moduleTitle}>课程评价</Text>
                  <Text className={styles.moduleSubtitle}>分享学习体验</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
