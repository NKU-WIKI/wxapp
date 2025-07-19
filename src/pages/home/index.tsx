import { View, ScrollView, Text, Input, Image } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import PostItem from "@/components/post-item";
import PostItemSkeleton from "@/components/post-item-skeleton";
import EmptyState from "@/components/empty-state";
import emptyIcon from "@/assets/empty.svg";
import styles from "./index.module.scss";
import CustomHeader from "@/components/custom-header";
import { AppDispatch, RootState } from "@/store";
import { fetchPosts } from "@/store/slices/postSlice";
import { fetchUserProfile } from "@/store/slices/userSlice";
import searchIcon from "@/assets/search.svg";
import studyIcon from "@/assets/school.svg";
import hatIcon from "@/assets/hat.svg";
import starIcon from "@/assets/star2.svg";
import usersGroupIcon from "@/assets/p2p-fill.svg";
import bagIcon from "@/assets/bag.svg";

const mockCategories = [
  {
    name: "学习交流",
    icon: studyIcon,
  },
  {
    name: "校园生活",
    icon: hatIcon,
  },
  {
    name: "就业创业",
    icon: starIcon,
  },
  {
    name: "社团活动",
    icon: usersGroupIcon,
  },
  {
    name: "失物招领",
    icon: bagIcon,
  },
];

export default function Home() {
  console.log('--- HOME COMPONENT RENDER CHECK (PRODUCTION) ---');
  const dispatch = useDispatch<AppDispatch>();
  const { list: posts, loading } = useSelector(
    (state: RootState) => state.post
  );
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const isLoading = loading === "pending";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, pageSize: 10 }));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [isLoggedIn]);

  const handleFabClick = () => {
    if (isLoggedIn) {
      Taro.navigateTo({
        url: "/pages/publish/index",
      });
    } else {
      Taro.showModal({
        title: "登录提示",
        content: "发布帖子需要先登录，是否前往登录？",
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: "/pages/login/index" });
          }
        },
      });
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <PostItemSkeleton key={index} className={styles.postListItem} />
      ));
    }
    if (posts.length === 0) {
      return (
        <EmptyState icon={emptyIcon} text="暂时没有帖子，快来发布第一条吧！" />
      );
    }
    return posts.map((post) => (
      <PostItem key={post.id} post={post} className={styles.postListItem} />
    ));
  };

  return (
    <View className={styles.homeContainer}>
      <CustomHeader showNotificationIcon />
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ScrollView scrollY className={styles.scrollView}>
          {/* Search Bar */}
          <View className={styles.searchContainer}>
            <Image src={searchIcon} className={styles.searchIcon} />
            <Input placeholder="搜索校园知识" className={styles.searchInput} />
          </View>

          {/* Categories Navigation */}
          <View className={styles.categoriesContainer}>
            <ScrollView
              scrollX
              className={styles.categoriesScrollView}
              showScrollbar={false}
            >
              {mockCategories.map((category) => (
                <View
                  key={category.name}
                  className={styles.categoryItem}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <View className={styles.categoryIconContainer}>
                    <Image
                      src={category.icon}
                      className={styles.categoryIcon}
                      mode="aspectFit"
                    />
                  </View>
                  <Text
                    className={`${styles.categoryName} ${
                      selectedCategory === category.name
                        ? styles.categoryNameSelected
                        : styles.categoryNameDefault
                    }`}
                  >
                    {category.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Post List */}
          <View className={styles.postList}>{renderContent()}</View>
        </ScrollView>
      </View>
      <View className={styles.fab} onClick={handleFabClick}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
}
