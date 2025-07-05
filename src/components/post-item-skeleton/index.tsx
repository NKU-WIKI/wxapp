import { View } from "@tarojs/components";
import styles from "./index.module.scss";
import Card from "../card";

export default function PostItemSkeleton() {
  return (
    <Card className={styles.skeletonCard}>
      <View className={styles.postHeader}>
        <View className={styles.avatar} />
        <View className={styles.authorInfo}>
          <View className={styles.line} style={{ width: "100px" }} />
          <View className={styles.line} style={{ width: "60px" }} />
        </View>
      </View>
      <View className={styles.postContent}>
        <View className={styles.line} />
        <View className={styles.line} style={{ width: "90%" }} />
        <View className={styles.line} style={{ width: "70%" }} />
      </View>
    </Card>
  );
}
