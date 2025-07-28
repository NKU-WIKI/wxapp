import { View, ScrollView, Text, Image } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { recommendApi } from "@/services/api/recommend";
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";
import Section from "./components/Section";
import { aiAssistants, activity, resources } from "./mock";
import { recommendParams } from "@/types/api/recommend";


export default function Discover() {
  const [hotPosts, setHotPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [enableAiRecommendation, setEnableAiRecommendation] = useState(false);

  const fetchHotPosts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsRefreshing(true);
      }

      const params: recommendParams = {
        enable_ai_recommendation: enableAiRecommendation, // 使用状态中的AI推荐设置
        limit: 20, // 限制返回的帖子数量
        hot_weight: 0.7, // 热门帖子的权重
        new_weight: 0.3, // 新帖子的权重
        user_id: null, // 用户ID，如果需要可以传入
        days: 7 // 获取最近7天的数据
      };

      console.log("开始获取热门帖子...");
      const response = await recommendApi.getRecommendPost(params);
      console.log("热门帖子数据:", response);
      console.log("API调用成功，数据类型:", typeof response);
      console.log("API返回的完整响应:", JSON.stringify(response.code, null, 2));
      let postsData = [];

      // 保存热门帖子数据到状态，确保是数组
      if (response && response.data) {
        if (enableAiRecommendation) {
          // 启用AI推荐时使用 ai_recommended_posts
          if (response.data.ai_recommended_posts && Array.isArray(response.data.ai_recommended_posts)) {
            postsData = response.data.ai_recommended_posts;
          } else if (Array.isArray(response.data.recommended_posts) && response.data.recommended_posts) {
            postsData = response.data.recommended_posts;
          }
        } else {
          // 不启用AI推荐时使用 recommended_posts
          if (response.data.recommended_posts && Array.isArray(response.data.recommended_posts)) {
            postsData = response.data.recommended_posts;
          } else if (Array.isArray(response.data)) {
            postsData = []
          }
        }

        setHotPosts(postsData);
        console.log(`使用${enableAiRecommendation ? 'AI推荐' : '普通推荐'}数据，获取到${postsData.length}条帖子`);
      } else {
        console.warn("API响应中没有data字段");
        setHotPosts([]);
      }
    } catch (error) {
      console.error("获取热门帖子失败:", error);
      console.error("错误详情:", error.message);
      setHotPosts([]); // 错误时设置为空数组
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  };

  // 切换AI推荐
  const toggleAiRecommendation = () => {
    setEnableAiRecommendation(!enableAiRecommendation);
  };

  // 监听AI推荐状态变化，重新获取数据
  useEffect(() => {
    if (hotPosts.length > 0) { // 避免初始化时重复请求
      fetchHotPosts(false);
    }
  }, [enableAiRecommendation]);

  // 下拉刷新处理函数
  const handleRefresh = async () => {
    await fetchHotPosts(true);
  };

  // 处理帖子点击事件
  const handlePostClick = (post) => {
    // 如果是小程序内部帖子，直接跳转到详情页面
    if (post.platform === 'wxapp' && post.id) {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}`
      }).catch(() => {
        Taro.showToast({
          title: '暂无详情页面',
          icon: 'none'
        });
      });
      return;
    }

    // 如果有原始链接，使用webview打开
    if (post.original_url) {
      Taro.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(post.original_url)}&title=${encodeURIComponent(post.title)}`
      }).catch(() => {
        // 如果webview页面不存在，尝试使用系统浏览器打开
        Taro.showModal({
          title: '打开链接',
          content: '是否使用浏览器打开此链接？',
          success: (res) => {
            if (res.confirm) {
              // 在小程序中，可以复制链接到剪贴板
              Taro.setClipboardData({
                data: post.original_url,
                success: () => {
                  Taro.showToast({
                    title: '链接已复制',
                    icon: 'success'
                  });
                }
              });
            }
          }
        });
      });
    } else {
      // 如果没有原始链接，跳转到帖子详情页面
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}`
      }).catch(() => {
        Taro.showToast({
          title: '暂无详情页面',
          icon: 'none'
        });
      });
    }
  };

  useEffect(() => {
    fetchHotPosts(false);
  }, []);

  return (
    <View className={styles.discoverPage}>
      <CustomHeader title='探索' hideBack showWikiButton showNotificationIcon />

      <ScrollView scrollY className={styles.scrollView}>
        {/* 热门帖子 */}
        <Section
          title='校园热点'
          showAiToggle={true}
          aiEnabled={enableAiRecommendation}
          onAiToggle={toggleAiRecommendation}
        >
          <ScrollView
            scrollY
            className={styles.hotPostsList}
            style={{ height: '300px' }}
            refresherEnabled={true}
            refresherTriggered={isRefreshing}
            onRefresherRefresh={handleRefresh}
            refresherBackground="#f8fafc"
          >
            {Array.isArray(hotPosts) && hotPosts.length > 0 ? (
              hotPosts.map((post, index) => (
                <View
                  key={post.id || index}
                  className={styles.hotPostItem}
                  onClick={() => handlePostClick(post)}
                >
                  <View className={styles.hotPostContent}>
                    <Text className={styles.hotPostTitle} numberOfLines={1}>
                      {post.title}
                    </Text>
                    <View className={styles.hotPostMeta}>
                      <Text className={styles.hotPostComments}>
                        {post.comment_count + post.view_count + post.like_count || 0} 讨论
                      </Text>
                      <Text className={styles.hotPostDot}>•</Text>
                      <Text className={styles.hotPostTime}>
                        {post.create_time ? new Date(post.create_time).toLocaleDateString() : '今天'}
                      </Text>
                      {post.platform !== 'wxapp' && (
                        <>
                          <Text className={styles.hotPostDot}>• </Text>
                          <Text className={styles.hotPostSource}>外部链接</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View className={styles.hotPostArrow}>
                    <Image
                      src={require("../../assets/chevron-right.svg")}
                      className={styles.arrowIcon}
                    />
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text>{isRefreshing ? '正在刷新...' : '暂无热门帖子'}</Text>
              </View>
            )}
          </ScrollView>
        </Section>

        {/* AI 助手 */}
        <Section title='AI 助手' extraText='查看更多' isLink>
          <View className={styles.aiAssistantsContainer}>
            {aiAssistants.slice(0, 3).map((item) => (
              <View key={item.id} className={styles.aiAssistantCard}>
                <View className={styles.aiIconWrapper}>
                  <Image src={item.icon} className={styles.aiAssistantIcon} />
                </View>
                <Text className={styles.aiAssistantName}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* 学习资源 */}
        <Section title='学习资源' extraText='更多资源' isLink>
          <View className={styles.resourcesContainer}>
            {resources.slice(0, 3).map((item) => (
              <View key={item.id} className={styles.resourceCard}>
                <View className={styles.resourceIcon}>
                  <Image src={item.icon} className={styles.resourceIconImage} />
                </View>
                <View className={styles.resourceInfo}>
                  <Text className={styles.resourceTitle}>{item.title}</Text>
                  <Text className={styles.resourceCount}>{item.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        {/* 校园活动 */}
        <Section title='校园活动' extraText='全部活动' isLink>
          <View className={styles.activityCard}>
            <Image
              src={activity.image}
              className={styles.activityImage}
              mode='aspectFill'
            />
            <View className={styles.activityInfo}>
              <Text className={styles.activityTitle}>{activity.title}</Text>
              <View className={styles.activityDetails}>
                <View className={styles.activityDetailItem}>
                  <Image src={require("../../assets/clock.svg")} className={styles.detailIcon} />
                  <Text className={styles.activityDetail}>{activity.time}</Text>
                </View>
                <View className={styles.activityDetailItem}>
                  <Image src={require("../../assets/map-pin.svg")} className={styles.detailIcon} />
                  <Text className={styles.activityDetail}>{activity.location}</Text>
                </View>
              </View>
              <View className={styles.activityAction}>
                <Text className={styles.actionButton}>立即报名</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* 底部间距 */}
        <View className={styles.bottomSpacing} />

        {/* 底部提示 */}
        <View className={styles.bottomTip}>
          <Text>已经到底了</Text>
        </View>
      </ScrollView>
      <View></View>
    </View>
  );
}
