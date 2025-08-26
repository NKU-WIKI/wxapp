import { View, ScrollView, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState, useCallback } from "react";
import recommendApi from "@/services/api/recommend";
import { recommendParams } from "@/types/api/recommend";
import activityApi from "@/services/api/activity"; // moved up absolute import
import { ActivityRead, ActivityStatus, GetActivityListRequest } from "@/types/api/activity.d"; // moved up absolute import
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";
import Section from "./components/Section";
import { activity } from "./mock";

interface HotPost {
  id?: string | number;
  title?: string;
  comment_count?: number;
  view_count?: number;
  like_count?: number;
  platform?: string;
  original_url?: string;
}

// eslint-disable-next-line import/no-unused-modules
export default function Discover() {
  const [hotPosts, setHotPosts] = useState<HotPost[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [enableAiRecommendation, setEnableAiRecommendation] = useState(false);
  const [activities, setActivities] = useState<ActivityRead[]>([]); // 新增活动列表
  const [activitiesLoading, setActivitiesLoading] = useState(false); // 新增加载状态

  const fetchHotPosts = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsRefreshing(true);
      }

      const params: recommendParams = {
        enable_ai_recommendation: enableAiRecommendation,
        limit: 20,
        hot_weight: 0.7,
        new_weight: 0.3,
        user_id: null,
        days: 7
      };

      const response: any = await recommendApi.getRecommendations(params);
      let postsData: HotPost[] = [];

      if (response && response.data) {
        const data: any = response.data;
        if (enableAiRecommendation && Array.isArray(data.ai_recommended_posts)) {
          postsData = data.ai_recommended_posts as HotPost[];
        } else if (Array.isArray(data.recommended_posts)) {
          postsData = data.recommended_posts as HotPost[];
        }
        setHotPosts(postsData);
      } else {
        setHotPosts([]);
      }
    } catch (error) {
      // 失败时重置为空
      setHotPosts([]);
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  }, [enableAiRecommendation]);

  // 新增：获取活动列表
  const fetchActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true);
      const params: GetActivityListRequest = {
        limit: 10,
        status: ActivityStatus.Published,
        sort_by: 'start_time',
        sort_order: 'desc'
      };
      const res = await activityApi.getActivityList(params);
      // 兼容后端 data?.data?.items / data?.data?.items 结构
      let list: ActivityRead[] = [];
      if (res?.data) {
        // 优先 PageActivityRead 结构
        const pageData: any = res.data as any;
        if (pageData?.items && Array.isArray(pageData.items)) {
          list = pageData.items as ActivityRead[];
        } else if (Array.isArray(res.data as any)) {
          list = res.data as unknown as ActivityRead[];
        }
      }
      setActivities(list);
      console.log('Fetched activities:', res); // 终端输出列表
    } catch (err) {
      console.warn('获取活动失败', err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  // 获取热门帖子与活动
  useEffect(() => {
    fetchHotPosts(false);
  }, [fetchHotPosts]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const toggleAiRecommendation = () => {
    setEnableAiRecommendation(prev => !prev);
  };

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
    else if (post.id) {
      Taro.navigateTo({
        url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}`
      }).catch(() => {
        Taro.showToast({ title: '暂无详情页面', icon: 'none' });
      });
    }
  };

  return (
    <View className={styles.discoverPage}>
      <CustomHeader title='探索' hideBack showWikiButton showNotificationIcon />

      <ScrollView scrollY className={styles.scrollView}>
        {/* 热门帖子 */}
        <Section
          title='活动广场'
          showAiToggle
          aiEnabled={enableAiRecommendation}
          onAiToggle={toggleAiRecommendation}
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
              hotPosts.map((post: HotPost, index: number) => (
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
                    Taro.showToast({ title: `点击了: ${item.title}`, icon: 'none' });
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

        {/* 活动广场 */}
        <Section
          title='活动广场'
          extraText='发布活动'
          isLink
          onExtraClick={() => {
            Taro.navigateTo({ url: '/pages/discover/publish-activity/index' });
          }}
        >
          {activitiesLoading ? (
            <View className={styles.emptyState}>加载中...</View>
          ) : (activities && activities.length > 0 ? (
            activities.map(act => (
              <View
                key={act.id}
                className={styles.activityCard}
                onClick={() => {
                  Taro.showToast({ title: act.title, icon: 'none' });
                }}
              >
                <Image
                  src='https://via.placeholder.com/240x240.png?text=Activity'
                  className={styles.activityImage}
                  mode='aspectFill'
                />
                <View className={styles.activityInfo}>
                  <Text className={styles.activityTitle}>{act.title}</Text>
                  <View className={styles.activityDetails}>
                    <View className={styles.activityDetailItem}>
                      <Image src={require("../../assets/clock.svg")} className={styles.detailIcon} />
                      <Text className={styles.activityDetail}>{(act.start_time ? (new Date(act.start_time).toLocaleString()) : '-') }</Text>
                    </View>
                    <View className={styles.activityDetailItem}>
                      <Image src={require("../../assets/map-pin.svg")} className={styles.detailIcon} />
                      <Text className={styles.activityDetail}>{act.location || '待定'}</Text>
                    </View>
                  </View>
                  <View className={styles.activityAction}>
                    <Text className={styles.actionButton}>立即报名</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
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
          ))}
        </Section>

        <View className={styles.bottomSpacing} />
        <View className={styles.bottomTip}>
          <Text>已经到底了</Text>
        </View>
      </ScrollView>
      <View></View>
    </View>
  );
}
