import { View, ScrollView, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState, useCallback } from "react";
import activityApi from "@/services/api/activity";
import { ActivityRead, ActivityStatus, GetActivityListRequest } from "@/types/api/activity.d";
import styles from "./index.module.scss";
import CustomHeader from "../../../components/custom-header";
import { activity } from "../mock";

// eslint-disable-next-line import/no-unused-modules
export default function ActivitySquare() {
  const [activities, setActivities] = useState<ActivityRead[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 获取活动列表
  const fetchActivities = useCallback(async (showLoading = true) => {
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
    fetchActivities(true);
  }, [fetchActivities]);

  const handleRefresh = async () => {
    await fetchActivities(false);
  };

  const handleActivityClick = (act: ActivityRead) => {
    Taro.showToast({ title: `点击了活动: ${act.title}`, icon: 'none' });
  };

  const handlePublishActivity = () => {
    Taro.navigateTo({ url: '/pages/discover/publish-activity/index' });
  };

  return (
    <View className={styles.activitySquarePage}>
      <CustomHeader title='活动广场' />

      <ScrollView
        scrollY
        className={styles.scrollView}
        refresherEnabled
        refresherTriggered={isRefreshing}
        onRefresherRefresh={handleRefresh}
        refresherBackground='#f8fafc'
      >
        {/* 发布活动按钮 */}
        <View className={styles.publishSection}>
          <View className={styles.publishButton} onClick={handlePublishActivity}>
            <Image src={require("../../../assets/plus.svg")} className={styles.publishIcon} />
            <Text className={styles.publishText}>发布活动</Text>
          </View>
        </View>

        {/* 活动列表 */}
        <View className={styles.activitiesContainer}>
          {activitiesLoading ? (
            <View className={styles.loadingState}>
              <Text>加载中...</Text>
            </View>
          ) : (activities && activities.length > 0 ? (
            activities.map(act => (
              <View
                key={act.id}
                className={styles.activityCard}
                onClick={() => handleActivityClick(act)}
              >
                <Image
                  src='https://via.placeholder.com/320x160.png?text=Activity'
                  className={styles.activityImage}
                  mode='aspectFill'
                />
                <View className={styles.activityContent}>
                  <Text className={styles.activityTitle}>{act.title}</Text>
                  <Text className={styles.activityDescription} numberOfLines={2}>
                    {act.description || '暂无描述'}
                  </Text>
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
                  <View className={styles.activityAction}>
                    <Text className={styles.actionButton}>立即报名</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            // 显示模拟数据
            <View className={styles.activityCard} onClick={() => handleActivityClick({} as ActivityRead)}>
              <Image
                src={activity.image}
                className={styles.activityImage}
                mode='aspectFill'
              />
              <View className={styles.activityContent}>
                <Text className={styles.activityTitle}>{activity.title}</Text>
                <Text className={styles.activityDescription} numberOfLines={2}>
                  一起来参加这个精彩的活动吧！
                </Text>
                <View className={styles.activityDetails}>
                  <View className={styles.activityDetailItem}>
                    <Image src={require("../../../assets/clock.svg")} className={styles.detailIcon} />
                    <Text className={styles.activityDetail}>{activity.time}</Text>
                  </View>
                  <View className={styles.activityDetailItem}>
                    <Image src={require("../../../assets/map-pin.svg")} className={styles.detailIcon} />
                    <Text className={styles.activityDetail}>{activity.location}</Text>
                  </View>
                </View>
                <View className={styles.activityAction}>
                  <Text className={styles.actionButton}>立即报名</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.bottomSpacing} />
        <View className={styles.bottomTip}>
          <Text>已经到底了</Text>
        </View>
      </ScrollView>
    </View>
  );
}
