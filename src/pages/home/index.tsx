import { View, ScrollView, Text, Input, Image } from "@tarojs/components";
import { useEffect } from "react";
import Taro from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import PostItem from "@/components/post-item";
import PostItemSkeleton from "@/components/post-item-skeleton";
import EmptyState from "@/components/empty-state";
import Categories from "@/components/categories"; // 引入新组件
import emptyIcon from "@/assets/empty.svg";
import styles from "./index.module.scss";
import CustomHeader from "@/components/custom-header";
import { AppDispatch, RootState } from "@/store";
import { fetchPosts } from "@/store/slices/postSlice";
import { fetchUserProfile } from "@/store/slices/userSlice";
import searchIcon from "@/assets/search.svg";

export default function Home() {
  console.log("--- HOME COMPONENT RENDER CHECK (PRODUCTION) ---");
  const dispatch = useDispatch<AppDispatch>();
  const { list: posts, loading } = useSelector(
    (state: RootState) => state.post
  );
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const isLoading = loading === "pending";

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [isLoggedIn, dispatch]);

  const handleCategorySelect = (categoryId: number | null) => {
    const params: { page: number; pageSize: number; category_id?: number } = {
      page: 1,
      pageSize: 10,
    };
    if (categoryId) {
      params.category_id = categoryId;
    }
    dispatch(fetchPosts(params));
  };

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <PostItemSkeleton key={index} className={styles.postListItem} />
      ));
    }
    if (posts.length === 0) {
      return (
        <EmptyState
          icon={emptyIcon}
          text="暂时没有帖子，快来发布第一条吧！"
        />
      );
    }
    return posts.map((post) => (
      <PostItem key={post.id} post={post} className={styles.postListItem} />
    ));
  };

  return (
    <View className={styles.homeContainer}>
      <CustomHeader title="首页" showNotificationIcon />
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ScrollView scrollY className={styles.scrollView}>
          {/* Search Bar */}
          <View className={styles.searchContainer}>
            <Image src={searchIcon} className={styles.searchIcon} />
            <Input placeholder="搜索校园知识" className={styles.searchInput} />
          </View>

          {/* Categories Navigation */}
          <Categories onCategorySelect={handleCategorySelect} />

          {/* Post List */}
          <View className={styles.postList}>{renderContent()}</View>
        </ScrollView>
      </View>
    </View>
  );
}
