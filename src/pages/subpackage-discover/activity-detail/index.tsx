import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import activityApi from "@/services/api/activity";
import { ActivityRead, ActivityType } from "@/types/api/activity.d";
import CustomHeader from "@/components/custom-header";
import styles from "./index.module.scss";

export default function ActivityDetail() {
  const [activity, setActivity] = useState<ActivityRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityId, setActivityId] = useState<string>("");

  useEffect(() => {
    // 获取页面参数中的活动ID
    const params = Taro.getCurrentInstance().router?.params;
    const id = params?.id as string;

    if (id) {
      setActivityId(id);
      fetchActivityDetail(id);
    } else {
      Taro.showToast({ title: '活动ID不存在', icon: 'none' });
      Taro.navigateBack();
    }
  }, []);

  const fetchActivityDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await activityApi.getActivityDetail(id);

      if (response?.data && response.data) {
        setActivity(response.data as ActivityRead);
      } else {
        Taro.showToast({ title: '活动不存在', icon: 'none' });
        Taro.navigateBack();
      }
    } catch (error) {
      Taro.showToast({ title: '加载失败', icon: 'none' });
      Taro.navigateBack();
    } finally {
      setLoading(false);
    }
  };

  const handleJoinActivity = async () => {
    if (!activity) return;

    try {
      // 检查用户是否已登录
      const token = Taro.getStorageSync('token');
      if (!token) {
        Taro.showModal({
          title: '提示',
          content: '请先登录后再报名活动',
          showCancel: false,
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/auth/login/index' });
            }
          }
        });
        return;
      }

      // 检查活动是否还有名额
      if (activity.max_participants && activity.current_participants >= activity.max_participants) {
        Taro.showToast({
          title: '活动名额已满',
          icon: 'none'
        });
        return;
      }

      // 检查用户是否已经报名
      if (activity.is_registered) {
        Taro.showToast({
          title: '您已经报名了这个活动',
          icon: 'none'
        });
        return;
      }

      // 显示确认对话框
      const result = await Taro.showModal({
        title: '确认报名',
        content: `确定要报名参加"${activity.title}"吗？`,
        confirmText: '确认报名',
        cancelText: '取消'
      });

      if (!result.confirm) {
        return;
      }

      // 显示加载中
      Taro.showLoading({ title: '报名中...' });

      // 调用参加活动API
      const response = await activityApi.joinActivity({
        activity_id: activity.id
      });

      Taro.hideLoading();

      if (response.code === 0) {
        Taro.showToast({
          title: '报名成功！',
          icon: 'success'
        });

        // 重新获取活动详情以更新状态
        fetchActivityDetail(activityId);
      } else {
        Taro.showToast({
          title: response.message || '报名失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false  // 使用24小时制
    });
  };

  if (loading) {
    return (
      <View className={styles.activityDetailPage}>
        <CustomHeader title='活动详情' />
        <View className={styles.loadingState}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!activity) {
    return (
      <View className={styles.activityDetailPage}>
        <CustomHeader title='活动详情' />
        <View className={styles.emptyState}>
          <Text>活动不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.activityDetailPage}>
      <CustomHeader title='活动详情' />

      <ScrollView scrollY className={styles.scrollView}>
        {/* 主活动卡片 */}
        <View className={styles.mainCard}>
          {/* 活动标题 */}
          <View className={styles.activityHeader}>
            <Text className={styles.activityTitle}>{activity.title}</Text>
            <View className={styles.activityMeta}>
              <Text className={styles.activityCategory}>{activity.category}</Text>
              <Text className={styles.activityType}>
                {activity.activity_type === ActivityType.Offline ? '线下活动' :
                 activity.activity_type === ActivityType.Online ? '线上活动' : '混合活动'}
              </Text>
            </View>
          </View>

          {/* 活动时间 */}
          <View className={styles.activityInfo}>
            {/* 时间信息 - 开始时间和结束时间在一行 */}
            <View className={styles.infoItem}>
              <Image src={require("@/assets/date.png")} className={styles.infoDateIcon} />
              <View className={styles.infoContent}>
                <View className={styles.timeRow}>
                  <Text className={styles.timeValue}>{formatDateTime(activity.start_time)}</Text>
                  <Text className={styles.timeSeparator}>-</Text>
                  <Text className={styles.timeValue}>{formatDateTime(activity.end_time)}</Text>
                </View>
              </View>
            </View>

            {/* 地点或链接 */}
            {activity.activity_type !== ActivityType.Online && activity.location && (
              <View className={styles.infoItem}>
                <Image src={require("@/assets/location-green.png")} className={styles.infoLocationIcon} />
                <View className={styles.infoContent}>
                  <Text className={styles.infoLocation}>{activity.location}</Text>
                </View>
              </View>
            )}

            {activity.activity_type !== ActivityType.Offline && activity.online_url && (
              <View className={styles.infoItem}>
                <Image src={require("@/assets/globe.svg")} className={styles.infoDateIcon} />
                <View className={styles.infoContent}>
                  <Text className={styles.infoLabel}>活动链接</Text>
                  <Text className={styles.infoValue}>{activity.online_url}</Text>
                </View>
              </View>
            )}

            {/* 参与人数 */}
            <View className={styles.infoItem}>
              <Image src={require("@/assets/people.png")} className={styles.infoPeopleIcon} />
              <View className={styles.infoContent}>
                <Text className={styles.infoValue}>
                  {activity.current_participants}
                  {activity.max_participants ? `/${activity.max_participants}` : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* 活动描述 */}
          <View className={styles.activityDescription}>
            <Text className={styles.descriptionTitle}>活动详情</Text>
            <Text className={styles.descriptionContent}>{activity.description}</Text>
          </View>

          {/* 活动标签 */}
          {activity.tags && activity.tags.length > 0 && (
            <View className={styles.activityTags}>
              <Text className={styles.tagsTitle}>活动标签</Text>
              <View className={styles.tagsContainer}>
                {activity.tags.map((tag, index) => (
                  <View key={index} className={styles.tag}>
                    <Text className={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 活动统计 */}
          <View className={styles.activityStats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{activity.view_count}</Text>
              <Text className={styles.statLabel}>浏览</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{activity.favorite_count}</Text>
              <Text className={styles.statLabel}>收藏</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{activity.share_count}</Text>
              <Text className={styles.statLabel}>分享</Text>
            </View>
          </View>

          {/* 报名按钮 - 放在主卡片内 */}
          <View className={styles.actionContainer}>
            <View
              className={`${styles.joinButton} ${
                activity.is_registered ? styles.joinedButton :
                (activity.max_participants && activity.current_participants >= activity.max_participants) ? styles.fullButton : ''
              }`}
              onClick={handleJoinActivity}
            >
              <Text className={styles.joinButtonText}>
                {activity.is_registered ? '已报名' :
                 (activity.max_participants && activity.current_participants >= activity.max_participants) ? '名额已满' :
                 '立即报名'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
