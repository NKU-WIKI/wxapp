import { View, ScrollView, Text, Image, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState, useCallback, useMemo } from "react";
import activityApi from "@/services/api/activity";
import { ActivityRead, ActivityStatus, GetActivityListRequest } from "@/types/api/activity.d";
import searchIcon from "@/assets/search.svg";
import styles from "./index.module.scss";
import CustomHeader from "../../../components/custom-header";

// eslint-disable-next-line import/no-unused-modules
export default function ActivitySquare() {
  const [activities, setActivities] = useState<ActivityRead[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  // 活动分类列表
  const categories = [
    '全部',
    '运动健身',
    '创意艺术',
    '志愿公益',
    '吃喝娱乐',
    '学习搭子',
    '其他活动'
  ];

  // 获取活动列表
  const fetchActivities = useCallback(async (showLoading = true, category?: string) => {
    try {
      if (showLoading) {
        setActivitiesLoading(true);
      }
      setIsRefreshing(true);

      const params: GetActivityListRequest = {
        limit: 20,
        status: ActivityStatus.Published,
        sort_by: 'start_time',
        sort_order: 'desc'
      };

      // 根据选择的分类添加过滤条件
      if (category && category !== '全部') {
        // 假设后端API支持category参数
        (params as any).category = category;
      }

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
      console.log('Fetched activities:', res);
    } catch (err) {
      console.warn('获取活动失败', err);
      setActivities([]);
    } finally {
      if (showLoading) {
        setActivitiesLoading(false);
      }
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(true, selectedCategory);
  }, [fetchActivities, selectedCategory]);

  const handleRefresh = async () => {
    await fetchActivities(false);
  };

  const handleActivityClick = (act: ActivityRead) => {
    Taro.showToast({ title: `点击了活动: ${act.title}`, icon: 'none' });
  };

  const handlePublishActivity = () => {
    Taro.navigateTo({ url: '/pages/discover/publish-activity/index' });
  };

  const toggleExpanded = (activityId: string, event: any) => {
    event.stopPropagation(); // 阻止事件冒泡到活动卡片
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // 根据选择的分类重新获取活动列表
    fetchActivities(true, category);
  };

  // 过滤活动列表的函数（如果后端不支持分类过滤，则在前端进行过滤）
  const filteredActivities = useMemo(() => {
    if (selectedCategory === '全部') {
      return activities;
    }
    // 根据活动的category字段进行过滤
    return activities.filter(activityItem => activityItem.category === selectedCategory);
  }, [activities, selectedCategory]);

  return (
    <View className={styles.activitySquarePage}>
      <CustomHeader title='活动广场' />

      {/* 固定的搜索框和分类栏 */}
      <View className={styles.fixedHeader}>
        {/* 搜索框 */}
        <View className={styles.searchContainer}>
          <Image src={searchIcon} className={styles.searchIcon} />
          <Input
            className={styles.searchInput}
            placeholder='搜索活动'
            placeholderClass={styles.searchPlaceholder}
            onConfirm={(e) => console.log('搜索:', e.detail.value)}
          />
        </View>

        {/* 活动分类 */}
        <ScrollView
          scrollX
          className={styles.categoryScrollContainer}
          showScrollbar={false}
        >
          <View className={styles.categoryContainer}>
            {categories.map(category => (
              <View
                key={category}
                className={`${styles.categoryItem} ${selectedCategory === category ? styles.activeCategory : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                <Text className={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 可滚动的活动列表 */}
      <ScrollView
        scrollY
        className={styles.scrollView}
        refresherEnabled
        refresherTriggered={isRefreshing}
        onRefresherRefresh={handleRefresh}
        refresherBackground='#f8fafc'
      >
        {/* 活动列表 */}
        <View
          className={`${styles.activitiesContainer} ${
            (filteredActivities && filteredActivities.length > 0 ? filteredActivities.length : 0) === 1
              ? styles.singleActivity
              : styles.multipleActivities
          }`}
        >
          {activitiesLoading ? (
            <View className={styles.loadingState}>
              <Text>加载中...</Text>
            </View>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            filteredActivities.map(act => {
              const isExpanded = expandedItems.has(act.id || '');
              return (
                <View
                  key={act.id}
                  className={styles.activityCard}
                  onClick={() => handleActivityClick(act)}
                >
                  <View className={styles.activityContent}>
                    <Text className={styles.activityTitle}>{act.title}</Text>
                    <View className={styles.activityDetails}>
                      <View className={styles.activityDetailItem}>
                        <Image src={require("../../../assets/clock.svg")} className={styles.detailIcon} />
                        <Text className={styles.activityDetail}>
                          {act.start_time ? new Date(act.start_time).toLocaleString() : '待定'}
                        </Text>
                      </View>
                      <View className={styles.activityDetailItem}>
                        <Image src={require("../../../assets/map-pin.svg")} className={styles.detailIcon} />
                        <Text className={styles.activityDetail}>{act.location || '待定'}</Text>
                      </View>
                    </View>
                    <View className={styles.descriptionContainer}>
                      <Text
                        className={`${styles.activityDescription} ${!isExpanded ? styles.collapsed : ''}`}
                        numberOfLines={!isExpanded ? 2 : undefined}
                      >
                        {act.description || '暂无描述'}
                      </Text>
                    </View>
                    <View className={styles.activityAction}>
                      {(act.description && act.description.length > 50) && (
                        <View
                          className={styles.expandButton}
                          onClick={(e) => toggleExpanded(act.id || '', e)}
                        >
                          <Image
                            src={require("../../../assets/chevron-down.svg")}
                            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                          />
                        </View>
                      )}
                      <Text className={styles.actionButton}>立即报名</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            // 显示暂无活动
            <View className={styles.emptyState}>
              <Image src={require("../../../assets/empty.svg")} className={styles.emptyIcon} />
              <Text className={styles.emptyText}>暂无活动</Text>
              <Text className={styles.emptySubText}>快来发布第一个活动吧</Text>
            </View>
          )}
        </View>

        <View className={styles.bottomTip}>
          <Text>已经到底了</Text>
        </View>
      </ScrollView>

      {/* 圆形悬浮发布活动按钮 */}
      <View className={styles.floatingPublishButton} onClick={handlePublishActivity}>
        <Image src={require("../../../assets/plus.svg")} className={styles.floatingPublishIcon} />
      </View>
    </View>
  );
}
