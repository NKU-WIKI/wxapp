import { View, Text, Input, Image, Switch } from "@tarojs/components";
import styles from "./index.module.scss";

const iconColor = "9B9B9B"; // 辅助色
const iconColorPrimary = "4A90E2"; // 主色

const searchSources = [
  { name: "网站", checked: true },
  { name: "微信", checked: false },
  { name: "集市", checked: false },
  { name: "小红书", checked: false },
  { name: "抖音", checked: false },
  { name: "Deep Search", checked: false },
];

const recommendations = [
  { id: 1, text: "校园跑步打卡活动规则?", users: 756 },
  { id: 2, text: "如何加入校园社团?", users: 543 },
];

const wikiHotspots = [
  "科研突破: 化学学院在《自然》发表新型纳米材料研究,相关成果获央视报道[1]。",
  '招生争议: 知乎热帖讨论"强基计划面试公平性",校方官微两小时内回应称"全程录像可复核",舆情迅速降温[2]。',
];

const wikiLinks = [
  { id: 1, text: "微博话题 #南开纳米新材料" },
  { id: 2, text: '知乎问题 "强基计划面试公平性"' },
];

const campusRanking = [
  {
    id: 1,
    text: "期末考试时间调整通知: 12月20日起陆续开始",
    views: "2.8万讨论",
  },
  { id: 2, text: "新图书馆开放时间延长至晚上11点", views: "1.5万讨论" },
  { id: 3, text: "校园跑步打卡活动正式启动", views: "9,826讨论" },
];

export default function Explore() {
  return (
    <View className={styles.explorePage}>
      {/* Search Section */}
      <View className={styles.searchSection}>
        <View className={styles.searchInputContainer}>
          <Image
            src={`https://api.iconify.design/solar/lightbulb-bold-duotone.svg?color=%23${iconColorPrimary}`}
            className={styles.searchIcon}
          />
          <Input
            placeholder="@wiki 探索关于南开的一切, 或者贡献您的资料"
            className={styles.searchInput}
          />
          <Image
            src={`https://api.iconify.design/solar/microphone-3-bold-duotone.svg?color=%23${iconColor}`}
            className={styles.micIcon}
          />
        </View>
        <View className={styles.sourceToggles}>
          {searchSources.map((source) => (
            <View key={source.name} className={styles.toggleItem}>
              <Switch checked={source.checked} color="#4A90E2" />
              <Text className={styles.toggleLabel}>{source.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recommendations */}
      <View className={styles.recommendations}>
        <Text className={styles.sectionTitle}>为您推荐</Text>
        <View className={styles.recommendationContainer}>
          {recommendations.map((item) => (
            <View key={item.id} className={styles.recommendationCard}>
              <Text className={styles.recommendationText}>{item.text}</Text>
              <Text className={styles.recommendationUsers}>
                <Image
                  src={`https://api.iconify.design/solar/users-group-rounded-bold-duotone.svg?color=%23${iconColor}`}
                  className={styles.usersIcon}
                />
                {item.users}人提问
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Wiki Hotspots */}
      <View className={styles.wikiSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>wiki 今日南开热点总结</Text>
          <Image
            src={`https://api.iconify.design/solar/refresh-bold-duotone.svg?color=%23${iconColor}`}
            className={styles.refreshIcon}
          />
        </View>
        <View>
          {wikiHotspots.map((item, index) => (
            <Text key={index} className={styles.wikiItem}>
              {index + 1}. {item}
            </Text>
          ))}
          {wikiLinks.map((link) => (
            <Text key={link.id} className={styles.wikiLinkItem}>
              [{link.id}]{link.text}
            </Text>
          ))}
        </View>
      </View>

      {/* Campus Ranking */}
      <View className={styles.rankingSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>校园热榜</Text>
          <Text className={styles.seeMore}>查看更多</Text>
        </View>
        {campusRanking.map((item, index) => (
          <View key={item.id} className={styles.rankingItem}>
            <Text
              className={`${styles.rankingIndex} ${
                index < 3 ? styles.topRank : ""
              }`}
            >
              {index + 1}
            </Text>
            <View className={styles.rankingInfo}>
              <Text className={styles.rankingText}>{item.text}</Text>
              <Text className={styles.rankingViews}>{item.views}</Text>
            </View>
            {index < 3 && (
              <View className={styles.hotTag}>
                <Text>热</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
