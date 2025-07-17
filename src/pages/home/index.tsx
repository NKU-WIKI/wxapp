import { View, ScrollView, Text, Input, Image } from "@tarojs/components";
import { useEffect } from "react";
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
import bookIcon from "@/assets/book-bold-duotone.svg";
import buildingsIcon from "@/assets/buildings-2-bold-duotone.svg";
import rocketIcon from "@/assets/rocket-bold-duotone.svg";
import usersGroupIcon from "@/assets/users-group-rounded-bold-duotone.svg";
import magniferIcon from "@/assets/magnifer-bold-duotone.svg";

const mockCategories = [
  {
    name: "学习交流",
    icon: bookIcon,
  },
  {
    name: "校园生活",
    icon: buildingsIcon,
  },
  {
    name: "就业创业",
    icon: rocketIcon,
  },
  {
    name: "社团活动",
    icon: usersGroupIcon,
  },
  {
    name: "失物招领",
    icon: magniferIcon,
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
