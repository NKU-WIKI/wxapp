import { View, Text, Image, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";

// --- 导入图标 ---
import starIcon from "../../assets/star.png";
import historyIcon from "../../assets/history.png";
import commentIcon from "../../assets/comment.png";
import likeIcon from "../../assets/like.png";
import draftIcon from "../../assets/draft.png";
import feedbackIcon from "../../assets/feedback.png";
import settingsIcon from "../../assets/settings.png";
import notificationIcon from "../../assets/notification.png";
import clearIcon from "../../assets/clear.png";
import aboutIcon from "../../assets/about.png";
import logoutIcon from "../../assets/logout.png";
import arrowRightIcon from "../../assets/arrow-right.png";

const mockUser = {
  avatar: "https://picsum.photos/id/1025/80/80",
  nickname: "北极熊",
  university: "南开大学",
  bio: "卷又卷不动，躺又躺不平",
  stats: [
    { value: 238, label: "帖子" },
    { value: "1,459", label: "获赞" },
    { value: 328, label: "关注" },
    { value: 892, label: "粉丝" },
    { value: "5w", label: "token" },
  ],
  actions: [
    { name: "我的收藏", icon: starIcon },
    { name: "浏览历史", icon: historyIcon },
    { name: "我的评论", icon: commentIcon },
    { name: "我的点赞", icon: likeIcon },
    { name: "草稿箱", icon: draftIcon },
    { name: "意见反馈", icon: feedbackIcon },
  ],
  settings: [
    { name: "消息通知", icon: notificationIcon },
    { name: "清除缓存", icon: clearIcon },
    { name: "关于我们", icon: aboutIcon },
    { name: "退出登录", icon: logoutIcon },
  ],
};

export default function Profile() {
  const handleNavigateToEdit = () => {
    Taro.navigateTo({
      url: "/pages/edit-profile/index",
    });
  };

  const handleSettingClick = (settingName: string) => {
    if (settingName === "消息通知") {
      Taro.navigateTo({
        url: "/pages/notifications/index",
      });
    }
    // 可以为其他设置项添加逻辑
  };

  return (
    <View className={styles.profilePage}>
      {/* --- 页面标题 --- */}
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>我的</Text>
        <Image src={settingsIcon} className={styles.settingsIcon} />
      </View>

      <ScrollView scrollY className={styles.content}>
        {/* --- 用户信息 --- */}
        <View className={styles.userInfoCard}>
          <Image src={mockUser.avatar} className={styles.avatar} />
          <View className={styles.userInfo}>
            <Text className={styles.nickname}>{mockUser.nickname}</Text>
            <Text className={styles.university}>{mockUser.university}</Text>
            <Text className={styles.bio}>{mockUser.bio}</Text>
          </View>
          <View className={styles.editButton} onClick={handleNavigateToEdit}>
            <Text className={styles.editButtonText}>编辑资料</Text>
          </View>
        </View>

        {/* --- 数据统计 --- */}
        <View className={styles.statsCard}>
          {mockUser.stats.map((stat) => (
            <View key={stat.label} className={styles.statItem}>
              <Text className={styles.statValue}>{stat.value}</Text>
              <Text className={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* --- 操作入口 --- */}
        <View className={styles.actionsCard}>
          {mockUser.actions.map((action) => (
            <View key={action.name} className={styles.actionItem}>
              <View className={styles.actionIconWrapper}>
                <Image src={action.icon} className={styles.actionIcon} />
              </View>
              <Text className={styles.actionName}>{action.name}</Text>
            </View>
          ))}
        </View>

        {/* --- 设置列表 --- */}
        <View className={styles.settingsCard}>
          {mockUser.settings.map((setting) => (
            <View
              key={setting.name}
              className={styles.settingItem}
              onClick={() => handleSettingClick(setting.name)}
            >
              <Image src={setting.icon} className={styles.settingIcon} />
              <Text className={styles.settingName}>{setting.name}</Text>
              <Image src={arrowRightIcon} className={styles.arrowIcon} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
