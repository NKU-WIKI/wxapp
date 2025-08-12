import { View, ScrollView, Text, Input, Image } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Post } from "@/types/api/post.d";
import { fetchPosts } from "@/store/slices/postSlice";
import CustomHeader from "@/components/custom-header";
import PostItem from "@/components/post-item";
import PostItemSkeleton from "@/components/post-item-skeleton";
import EmptyState from "@/components/empty-state";
import styles from "./index.module.scss";
import emptyIcon from "@/assets/empty.svg";
import searchIcon from "@/assets/search.svg";
import studyIcon from "@/assets/school.svg";
import hatIcon from "@/assets/hat.svg";
import starIcon from "@/assets/star2.svg";
import usersGroupIcon from "@/assets/p2p-fill.svg";
import bagIcon from "@/assets/bag.svg";

const mockCategories = [
  {
    id: 1,
    name: "学习交流",
    icon: studyIcon,
  },
  {
    id: 2,
    name: "校园生活",
    icon: hatIcon,
  },
  {
    id: 3,
    name: "就业创业",
    icon: starIcon,
  },
  {
    id: 4,
    name: "社团活动",
    icon: usersGroupIcon,
  },
  {
    id: 5,
    name: "失物招领",
    icon: bagIcon,
  },
];

export default function Home() {
  console.log("--- HOME COMPONENT RENDER CHECK (PRODUCTION) ---");
  const dispatch = useDispatch<AppDispatch>();
  const { list: posts, loading, pagination } = useSelector(
    (state: RootState) => state.post || { list: [] as Post[], loading: 'idle', pagination: null }
  );
  const { isLoggedIn } = useSelector((state: RootState) => state.user || { isLoggedIn: false });
  const isLoading = loading === "pending";

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts({ page: 1, page_size: 5, isAppend: false }));
    setPage(1);
  }, [dispatch]);

  useDidShow(() => {
    const { refresh } = Taro.getCurrentInstance().router.params;
    if (refresh === 'true') {
      handlePullRefresh();
    }
  });

  // 根据分类名称获取分类ID
  const getCategoryId = (categoryName: string): number | undefined => {
    const category = mockCategories.find(cat => cat.name === categoryName);
    return category?.id;
  };

  // 下拉刷新处理函数
  const handlePullRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const params: { page: number; page_size: number; category_id?: number; isAppend: boolean } = {
        page: 1,
        page_size: 5,
        isAppend: false, // 刷新时不追加，替换所有内容
      };

      if (selectedCategory) {
        params.category_id = selectedCategory;
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
      const params: { page: number; page_size: number; category_id?: number; isAppend: boolean } = {
        page: nextPage,
        page_size: 5,
        isAppend: true, // 加载更多时追加到现有帖子后面
      };

      if (selectedCategory) {
        params.category_id = selectedCategory;
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

  const handleCategoryClick = (categoryId: number) => {
    const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelectedCategory);

    const params: { page: number; page_size: number; category_id?: number; isAppend: boolean } = {
      page: 1,
      page_size: 5,
      isAppend: false, // 分类筛选时不追加，替换内容
    };

    if (newSelectedCategory) {
      params.category_id = newSelectedCategory;
    }

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

    const content = posts
      .filter((post) => post && post.id && post.author_info)
      .map((post) => (
        <PostItem key={post.id} post={post} className={styles.postListItem} />
      ));

    // 添加加载更多的骨架屏
    if (isLoadingMore) {
      content.push(
        ...Array.from({ length: 2 }).map((_, index) => (
          <PostItemSkeleton key={`loading-skeleton-${index}`} className={styles.postListItem} />
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
      <CustomHeader title="首页" hideBack={true} showWikiButton={true} showNotificationIcon={true} />

      <View className={styles.fixedContainer}>
        {/* 搜索区域 - 固定 */}
        <View
          className={styles.searchContainer}
          onClick={() => {
            try {
              Taro.setStorageSync('explore_focus', 'true');
              Taro.switchTab({ url: '/pages/explore/index' });
            } catch {}
          }}
        >
          <Image src={searchIcon} className={styles.searchIcon} />
          <Input
            placeholder="搜索校园知识"
            className={styles.searchInput}
            onFocus={() => {
              try {
                Taro.setStorageSync('explore_focus', 'true');
                Taro.switchTab({ url: '/pages/explore/index' });
              } catch {}
            }}
          />
        </View>
        {/* 分类区域 - 固定 */}
        <View className={styles.categoriesContainer}>
          {mockCategories.map((category) => (
            <View
              key={category.id}
              className={`${styles.categoryItem} ${
                selectedCategory === category.id ? styles.selected : ""
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <View className={styles.categoryIconContainer}>
                <Image
                  src={category.icon}
                  className={styles.categoryIcon}
                  mode='aspectFit'
                />
              </View>
              <Text
                className={`${styles.categoryName} ${
                  selectedCategory === category.id
                    ? styles.categoryNameSelected
                    : styles.categoryNameDefault
                }`}
              >
                {category.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 帖子列表滚动区域 */}
      <View className={styles.postScrollContainer}>
        <ScrollView
          scrollY
          className={styles.postScrollView}
          onScrollToLower={handleScrollToLower}
          lowerThreshold={50} // 降低触发阈值，更敏感
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
