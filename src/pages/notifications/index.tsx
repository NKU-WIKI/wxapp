import { View, Text, Image, ScrollView } from "@tarojs/components";
import { useState } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";
import likeIcon from "../../assets/like.png";
import CustomHeader from "../../components/custom-header";

// 模拟数据
const mockNotifications = {
  likes: [
    {
      id: 1,
      user: "小艺",
      avatar: likeIcon,
      postTitle: "分享一下今天的穿搭",
      time: "10 分钟前",
      isNew: true,
    },
    {
      id: 2,
      user: "佳佳",
      avatar: likeIcon,
      postTitle: "今天去了很多地方玩",
      time: "2 小时前",
    },
    {
      id: 3,
      user: "梓梓",
      avatar: likeIcon,
      postTitle: "记录一下今天的心情",
      time: "昨天 14:30",
    },
    {
      id: 4,
      user: "琪琪",
      avatar: likeIcon,
      postTitle: "分享下午茶时光",
      time: "2 天前",
    },
  ],
  collections: [],
  comments: [],
};

const TABS = ["点赞", "收藏", "评论"];

export default function Notifications() {
  const [activeTab, setActiveTab] = useState(0);

  const renderList = () => {
    const data = mockNotifications.likes; // 暂时只用点赞数据
    if (data.length === 0) {
      return <View className={styles.empty}>暂无新消息</View>;
    }
    return data.map((item) => (
      <View key={item.id} className={styles.notificationItem}>
        <Image src={item.avatar} className={styles.avatar} />
        <View className={styles.content}>
          <Text className={styles.userName}>{item.user}赞了你的帖子</Text>
          <Text className={styles.postInfo}>在「{item.postTitle}」这条帖子</Text>
        </View>
        <View className={styles.timeInfo}>
           <Text className={styles.time}>{item.time}</Text>
           {item.isNew && <View className={styles.newDot} />}
        </View>
      </View>
    ));
  };


  return (
    <View className={styles.container}>
      <CustomHeader
        title="消息通知"
      />

      {/* Tab */}
      <View className={styles.tabs}>
        {TABS.map((tab, index) => (
          <View
            key={tab}
            className={`${styles.tabItem} ${
              activeTab === index ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </View>
        ))}
      </View>
      
      {/* 列表 */}
      <ScrollView scrollY className={styles.scrollView}>
        {renderList()}
      </ScrollView>

      {/* 底部按钮 */}
      <View className={styles.footer}>
        <View className={styles.markAllReadButton}>
          <Image src={likeIcon} className={styles.buttonIcon} />
          <Text>全部标记为已读</Text>
        </View>
      </View>
    </View>
  );
} 