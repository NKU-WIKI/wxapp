import { View, ScrollView, Text, Image } from "@tarojs/components";
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";
import Section from "./components/Section";
import { hotspots, aiAssistants, activity, resources } from "./mock";

export default function Discover() {
  return (
    <View className={styles.discoverPage}>
      <CustomHeader showNotificationIcon />

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
