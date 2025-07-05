import { View, Text, Image, ScrollView } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";

// --- 导入本地资源 ---
import RobotIcon from "../../assets/robot.png";
import TranslateIcon from "../../assets/translate.png";
import PlanIcon from "../../assets/plan.png";
import BookIcon from "../../assets/book.png";
import CodeIcon from "../../assets/code.png";
import NotificationIcon from "../../assets/notification.png";
import MessageIcon from "../../assets/message.png";
// import MusicFestivalImage from "../../assets/activity.png";

// --- 模拟数据 ---
const hotspots = [
  {
    id: 1,
    title: "期末复习攻略分享",
    discussions: "2.3K 讨论",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
  },
  {
    id: 2,
    title: "校园美食探店",
    discussions: "1.8K 讨论",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=481&q=80",
  },
];

const aiAssistants = [
  { id: 1, name: "作业助手", icon: RobotIcon },
  { id: 2, name: "英语口语", icon: TranslateIcon },
  { id: 3, name: "保研规划", icon: PlanIcon },
];

const activity = {
  title: "校园音乐节",
  time: "2024-01-20 19:00",
  location: "大学生活动中心",
  image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
};

const resources = [
  { id: 1, title: "考研资料", count: "12个精品资源", icon: BookIcon },
  { id: 2, title: "编程课程", count: "8个在线课程", icon: CodeIcon },
];

const Section = ({ title, extraText, children, titleStyle = {} }) => (
  <View className={styles.section}>
    <View className={styles.sectionHeader}>
      <Text className={styles.sectionTitle} style={titleStyle}>{title}</Text>
      {extraText && <Text className={styles.sectionExtra}>{extraText}</Text>}
    </View>
    <View className={styles.sectionContent}>{children}</View>
  </View>
);

export default function Discover() {
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  useEffect(() => {
    const getSystemInfo = async () => {
      const systemInfo = await Taro.getSystemInfoAsync();
      setStatusBarHeight(systemInfo.statusBarHeight || 0);
    };
    getSystemInfo();
  }, []);

  const handleNavigateToNotifications = () => {
    Taro.navigateTo({
      url: "/pages/notifications/index",
    });
  };

  return (
    <View className={styles.discoverPage}>
      <View
        className={styles.header}
        style={{ paddingTop: `${statusBarHeight}px` }}
      >
        <Text className={styles.headerTitle}>发现</Text>
        <View className={styles.headerIcons}>
          <Image
            src={NotificationIcon}
            className={styles.headerIcon}
            onClick={handleNavigateToNotifications}
          />
          <Image src={MessageIcon} className={styles.headerIcon} />
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <Section title="校园热点" extraText="实时更新">
          <View className={styles.hotspotsContainer}>
            {hotspots.map((item) => (
              <View key={item.id} className={styles.hotspotItem}>
                <Image
                  src={item.image}
                  className={styles.hotspotImage}
                  mode="aspectFill"
                />
                <View className={styles.hotspotInfo}>
                  <Text className={styles.hotspotTitle}>{item.title}</Text>
                  <Text className={styles.hotspotDiscussions}>
                    {item.discussions}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section title="AI 助手" extraText="查看更多">
          <View className={styles.aiAssistantsContainer}>
            {aiAssistants.map((item) => (
              <View key={item.id} className={styles.aiAssistantCard}>
                <Image src={item.icon} className={styles.aiAssistantIcon} />
                <Text className={styles.aiAssistantName}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="校园活动" extraText="全部活动">
          <View className={styles.activityCard}>
            <Image
              src={activity.image}
              className={styles.activityImage}
              mode="aspectFill"
            />
            <View className={styles.activityInfo}>
              <Text className={styles.activityTitle}>{activity.title}</Text>
              <Text className={styles.activityDetail}>时间: {activity.time}</Text>
              <Text className={styles.activityDetail}>地点: {activity.location}</Text>
            </View>
          </View>
        </Section>

        <Section title="学习资源" extraText="更多资源">
          <View className={styles.resourcesContainer}>
            {resources.map((item) => (
              <View key={item.id} className={styles.resourceCard}>
                <View className={styles.resourceInfo}>
                  <Text className={styles.resourceTitle}>{item.title}</Text>
                  <Text className={styles.resourceCount}>{item.count}</Text>
                </View>
                <Image src={item.icon} className={styles.resourceIcon} />
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}
