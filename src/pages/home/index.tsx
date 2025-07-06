import { View, ScrollView, Text, Input, Image } from "@tarojs/components";
import { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import PostItem from "../../components/post-item";
import PostItemSkeleton from "../../components/post-item-skeleton";
import EmptyState from "../../components/empty-state";
import emptyIcon from "../../assets/empty.png";
import { Post } from "../../types/post";
import { MOCK_POSTS } from "../../services/mock";
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";

const iconColor = "4A90E2"; // 主色调
const mockCategories = [
  {
    name: "学习交流",
    icon: `https://api.iconify.design/solar/book-bold-duotone.svg?color=%23${iconColor}`,
  },
  {
    name: "校园生活",
    icon: `https://api.iconify.design/solar/buildings-2-bold-duotone.svg?color=%23${iconColor}`,
  },
  {
    name: "就业创业",
    icon: `https://api.iconify.design/solar/rocket-bold-duotone.svg?color=%23${iconColor}`,
  },
  {
    name: "社团活动",
    icon: `https://api.iconify.design/solar/users-group-rounded-bold-duotone.svg?color=%23${iconColor}`,
  },
  {
    name: "失物招领",
    icon: `https://api.iconify.design/solar/magnifer-bold-duotone.svg?color=%23${iconColor}`,
  },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 1000); // 模拟1秒加载时间
    return () => clearTimeout(timer);
  }, []);

  const handleFabClick = () => {
    Taro.navigateTo({
      url: "/pages/publish/index",
    });
  };

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <PostItemSkeleton key={index} />
      ));
    }
    if (posts.length === 0) {
      return (
        <EmptyState icon={emptyIcon} text="暂时没有帖子，快来发布第一条吧！" />
      );
    }
    return posts.map((post) => <PostItem key={post.id} post={post} />);
  };

  return (
    <View className={styles.homeContainer}>
      <CustomHeader showNotificationIcon />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView className={styles.home} scrollY>
          {/* The content that was inside the old header */}
          <View className={styles.searchBar}>
            <Input className={styles.searchInput} placeholder="搜索话题" />
          </View>
          <View className={styles.categories}>
            {mockCategories.map((category) => (
              <View key={category.name} className={styles.categoryItem}>
                <View className={styles.categoryIconContainer}>
                  <Image
                    src={category.icon}
                    className={styles.categoryIcon}
                    mode="aspectFit"
                  />
                </View>
                <Text className={styles.categoryName}>{category.name}</Text>
              </View>
            ))}
          </View>
          {renderContent()}
        </ScrollView>
      </View>
      <View className={styles.fab} onClick={handleFabClick}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
}
