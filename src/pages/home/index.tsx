import { useState, useEffect, useMemo } from "react";
import { View, ScrollView, Text, Image } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";

import type { Post as PostType } from "@/types/api/post.d";
import { AppDispatch, RootState } from "@/store";
import { fetchFeed, fetchForumPosts } from "@/store/slices/postSlice";
import { useMultipleFollowStatus } from "@/hooks/useFollowStatus";
import { getRecommendedContent, collectUserInteraction } from "@/utils/contentRecommendation";
import CustomHeader from "@/components/custom-header";
import PostItemSkeleton from "@/components/post-item-skeleton";
import EmptyState from "@/components/empty-state";
import Post from "@/components/post";
import SearchBar from "@/components/search-bar";

// Assets imports
import emptyIcon from "@/assets/empty.svg";
import studyIcon from "@/assets/school.svg";
import hatIcon from "@/assets/hat.svg";
import starIcon from "@/assets/star2.svg";
import usersGroupIcon from "@/assets/p2p-fill.svg";
import bagIcon from "@/assets/bag.svg";

// Relative imports
import styles from "./index.module.scss";

const mockCategories = [
  { id: 'c1a7e7e4-a5a6-4b1b-8c8d-9e9f9f9f9f9f', name: '学习交流', icon: studyIcon },
  { id: 'c2b8f8f5-b6b7-4c2c-9d9e-1f1f1f1f1f1f', name: '校园生活', icon: hatIcon },
  { id: 'c3c9a9a6-c7c8-4d3d-aeaf-2a2b2c2d2e2f', name: '就业创业', icon: starIcon },
  { id: 'd4d1a1a7-d8d9-4e4e-bfbf-3a3b3c3d3e3f', name: '社团活动', icon: usersGroupIcon },
  { id: 'e5e2b2b8-e9ea-4f5f-cfdf-4a4b4c4d4e4f', name: '失物招领', icon: bagIcon },
];

export default function Home() {
  
  const dispatch = useDispatch<AppDispatch>();
  const { list: posts, loading, pagination } = useSelector(
    (state: RootState) => state.post || { list: [] as PostType[], loading: 'idle', pagination: null }
  );
  const { isLoggedIn } = useSelector((state: RootState) => state.user || { isLoggedIn: false });
  const isLoading = loading === "pending";
  const isLoadingMore = loading === "pending" && posts.length > 0;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

  // 提取所有帖子作者ID用于批量获取关注状态
  const authorIds = useMemo(() => {
    // 只有在用户登录时才返回作者ID数组
    if (!isLoggedIn) {
      return [];
    }
    return Array.from(new Set(
      posts
        .filter(post => post?.user?.id)
        .map(post => post.user.id)
    ));
  }, [posts, isLoggedIn]);

  // 获取批量关注状态
  const { followStatusMap, refreshFollowStatus } = useMultipleFollowStatus(authorIds);

  useEffect(() => {
    // 登录状态改变或首次加载时获取信息流
    dispatch(fetchFeed({ skip: 0, limit: 10 }));
  }, [dispatch, isLoggedIn]);

  useDidShow(() => {
    // 每次显示首页时都刷新帖子数据和关注状态
    
    
    const now = Date.now();
    
    // 防抖：如果距离上次刷新不足2秒，则跳过
    if (now - lastRefreshTime < 2000) {
      
      return;
    }
    
    setLastRefreshTime(now);
    
    // 刷新帖子数据
    handlePullRefresh();
    
    // 刷新关注状态
    if (isLoggedIn && authorIds.length > 0) {
      refreshFollowStatus();
    }
  });

  // 下拉刷新处理函数
  const handlePullRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const params = { skip: 0, limit: 10 };
      if (selectedCategory) {
        await dispatch(fetchForumPosts({ ...params, category_id: selectedCategory as any })).unwrap();
      } else {
        await dispatch(fetchFeed(params)).unwrap();
      }
    } catch (error) {
      
    } finally {
      setIsRefreshing(false);
    }
  };

  // 滚动到底部加载更多
  const handleScrollToLower = async () => {
    if (isLoading || isRefreshing || !pagination || !pagination.has_more) return;

    try {
      const nextSkip = (pagination.skip || 0) + (pagination.limit || 10);
      const params = { skip: nextSkip, limit: 10 };

      if (selectedCategory) {
        await dispatch(
          fetchForumPosts({ ...params, category_id: selectedCategory })
        ).unwrap();
      } else {
        await dispatch(fetchFeed(params)).unwrap();
      }
    } catch (error) {
      
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelectedCategory);

    const params = { skip: 0, limit: 10 };

    if (newSelectedCategory) {
      dispatch(fetchForumPosts({ ...params, category_id: newSelectedCategory as any }));
    } else {
      dispatch(fetchFeed(params));
    }
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
          text='暂时没有帖子，快来发布第一条吧！'
        />
      );
    }

    // 根据用户设置决定帖子排序方式
    const sortedPosts = getRecommendedContent(
      // 默认按时间排序的帖子
      [...posts].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      }),
      // 个性化推荐排序的帖子（这里简化为按点赞数排序作为示例）
      [...posts].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    );

    const content = sortedPosts
      .filter((post) => post && post.id && post.user) // Changed from author_info to user
      .map((post) => {
        // 从关注状态映射中获取该作者的关注状态
        const isFollowingAuthor = followStatusMap[post.user.id] === true;
        
        // 创建包含正确关注状态的帖子对象
        const postWithFollowStatus = {
          ...post,
          is_following_author: isFollowingAuthor
        };
        
        // 收集用户查看行为数据
        collectUserInteraction('view', post.id, 'post');
        
        return (
          <Post 
            key={post.id} 
            post={postWithFollowStatus} 
            className={styles.postListItem} 
            mode='list'
          />
        );
      });

    // 添加加载更多的骨架屏
    if (isLoadingMore) {
      content.push(
        ...Array.from({ length: 2 }).map((_, index) => (
          <PostItemSkeleton key={`loading-skeleton-${index}`} className={styles.postListItem} />
        ))
      );
    }

    // 添加没有更多数据的提示
    if (posts.length > 0 && !isLoading && pagination && !pagination.has_more) {
      content.push(
        <View key='no-more' className={styles.noMoreTip}>
          <Text>没有更多内容了</Text>
        </View>
      );
    }

    return content;
  };

  return (
    <View className={styles.homeContainer}>
      <CustomHeader title='首页' hideBack showWikiButton showNotificationIcon />

      <View className={styles.fixedContainer}>
        {/* 搜索区域 - 固定 */}
        <SearchBar
          key='home-nav-search'
          keyword=''
          placeholder='搜索校园知识'
          readonly
          onClick={() => {
            try {
              Taro.setStorageSync('explore_focus', 'true');
              Taro.switchTab({ url: '/pages/explore/index' });
            } catch {}
          }}
        />
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
