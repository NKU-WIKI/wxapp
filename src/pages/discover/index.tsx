import { View, ScrollView, Text, Image } from "@tarojs/components";
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";
import Section from "./components/Section";
import { hotspots, aiAssistants, activity, resources } from "./mock";

export default function Discover() {
  return (
    <View className={styles.discoverPage}>
      <CustomHeader title="探索" hideBack={true} showWikiButton={true} showNotificationIcon={true} />

      <ScrollView scrollY className={styles.scrollView}>
        {/* 校园热点 */}
        <Section title="校园热点" extraText="查看更多" isLink>
          <ScrollView scrollX className={styles.hotspotsScrollContainer}>
            <View className={styles.hotspotsContainer}>
              {hotspots.map((item) => (
                <View key={item.id} className={styles.hotspotItem}>
                  <Image
                    src={item.image}
                    className={styles.hotspotImage}
                    mode="aspectFill"
                  />
                  <View className={styles.hotspotOverlay}>
                    <Text className={styles.hotspotTitle}>{item.title}</Text>
                    <Text className={styles.hotspotDiscussions}>
                      {item.discussions}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </Section>

        {/* AI 助手 */}
        <Section title="AI 助手" extraText="查看更多" isLink>
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
        <Section title="学习资源" extraText="更多资源" isLink>
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
        <Section title="校园活动" extraText="全部活动" isLink>
          <View className={styles.activityCard}>
            <Image
              src={activity.image}
              className={styles.activityImage}
              mode="aspectFill"
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
    </View>
  );
}
