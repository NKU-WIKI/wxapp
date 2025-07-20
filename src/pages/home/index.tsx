import { View, ScrollView, Text, Input, Image } from "@tarojs/components";
import { useEffect, useState } from "react";
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
  console.log("--- HOME COMPONENT RENDER CHECK (PRODUCTION) ---");
  const dispatch = useDispatch<AppDispatch>();
  const { list: posts, loading } = useSelector(
    (state: RootState) => state.post
  );
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const isLoading = loading === "pending";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, pageSize: 5}));
    setPage(1);
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  }, [isLoggedIn, dispatch]);

  // 下拉刷新处理函数
  const handlePullRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const params: { page: number; pageSize: number; category_id?: number } = {
        page: 1,
        pageSize: 5,
      };

      // 如果有选中的分类，保持分类筛选
      if (selectedCategory) {
        // 这里可以根据分类名称映射到分类ID
        // params.category_id = getCategoryId(selectedCategory);
      }

      await dispatch(fetchPosts(params)).unwrap();
      setPage(1);
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 滚动到底部加载更多
  const handleScrollToLower = async () => {
    if (isLoadingMore || isLoading || isRefreshing) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params: { page: number; pageSize: number; category_id?: number } = {
        page: nextPage,
        pageSize: 5,
      };

      if (selectedCategory) {
        // params.category_id = getCategoryId(selectedCategory);
      }

      const result = await dispatch(fetchPosts(params)).unwrap();

      if (result.items.length > 0) {
        setPage(nextPage);
      }
    } catch (error) {
      console.error('加载更多失败:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCategorySelect = (categoryId: number | null) => {
    const params: { page: number; pageSize: number; category_id?: number } = {
      page: 1,
      pageSize: 5,
    };
    if (categoryId) {
      params.category_id = categoryId;
    }
    dispatch(fetchPosts(params));
    setPage(1);
    setSelectedCategory(null); // 重置分类选择状态
  };

  const handleCategoryClick = (categoryName: string) => {
    const newSelectedCategory = selectedCategory === categoryName ? null : categoryName;
    setSelectedCategory(newSelectedCategory);

    // 重新加载数据
    const params: { page: number; pageSize: number; category_id?: number } = {
      page: 1,
      pageSize: 5,
    };
    // 这里可以根据分类名称映射到分类ID
    // if (newSelectedCategory) {
    //   params.category_id = getCategoryId(newSelectedCategory);
    // }
    dispatch(fetchPosts(params));
    setPage(1);
  };

  const renderContent = () => {
    if (isLoading && posts.length === 0) {
      return Array.from({ length: 3 }).map((_, index) => (
        <PostItemSkeleton key={index} className={styles.postListItem} />
      ));
    }

    if (!posts || posts.length === 0) {
      return (
        <EmptyState
          icon={emptyIcon}
          text="暂时没有帖子，快来发布第一条吧！"
        />
      );
    }

    const content = posts.map((post) => (
      <PostItem key={post.id} post={post} className={styles.postListItem} />
    ));

    // 添加加载更多的骨架屏
    if (isLoadingMore) {
      content.push(
        ...Array.from({ length: 2 }).map((_, index) => (
          <PostItemSkeleton key={`loading-${index}`} className={styles.postListItem} />
        ))
      );
    }

    // 添加没有更多数据的提示
    if (posts.length > 0 && !isLoadingMore) {
      content.push(
        <View key="no-more" className={styles.noMoreTip}>
          <Text>没有更多内容了</Text>
        </View>
      );
    }

    return content;
  };

  return (
    <View className={styles.homeContainer}>
      <CustomHeader title="首页" showNotificationIcon />

      {/* 搜索区域 - 固定 */}
      <View className={styles.searchContainer}>
        <Image src={searchIcon} className={styles.searchIcon} />
        <Input placeholder="搜索校园知识" className={styles.searchInput} />
      </View>

      {/* 分类区域 - 固定 */}
      <View className={styles.categoriesContainer}>
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
      </View>

      {/* 帖子列表滚动区域 */}
      <View className={styles.postScrollContainer}>
        <ScrollView
          scrollY
          className={styles.postScrollView}
          onScrollToLower={handleScrollToLower}
          lowerThreshold={100}
          enableBackToTop
          refresherEnabled
          refresherTriggered={isRefreshing}
          onRefresherRefresh={handlePullRefresh}
        >
          <View className={styles.postList}>{renderContent()}</View>
        </ScrollView>
      </View>
    </View>
  );
}
