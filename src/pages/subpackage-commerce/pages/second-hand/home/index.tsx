// Third-party imports
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback, useRef } from "react";
import { View, ScrollView, Text, Image } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";

// Relative imports
import CustomHeader from "@/components/custom-header";
import EmptyState from "@/components/empty-state";
import SearchBar from "@/components/search-bar";
import HighlightText from "@/components/highlight-text";
import AuthFloatingButton from "@/components/auth-floating-button";
import { fetchListings, clearError } from "@/store/slices/marketplaceSlice";
import { RootState, AppDispatch } from "@/store";
import { ListingRead, ListingType } from "@/types/api/marketplace.d";

import { useRelativeTime } from "@/hooks/useRelativeTime";
import { useProductDetails } from "@/hooks/useProductDetails";
import searchApi from "@/services/api/search";
import { SearchRequest } from "@/types/api/search";

// Assets imports
import emptyIcon from "@/assets/empty.svg";

import styles from "./index.module.scss";

// 筛选标签组件
const FilterTabs = ({
  selectedType,
  onTypeChange,
}: {
  selectedType: "all" | "sell" | "buy";
  onTypeChange: (_nextType: "all" | "sell" | "buy") => void;
}) => (
  <View className={styles.filterTabs}>
    <Text
      className={`${styles.tab} ${selectedType === "all" ? styles.active : ""}`}
      onClick={() => onTypeChange("all")}
    >
      全部
    </Text>
    <Text
      className={`${styles.tab} ${
        selectedType === "sell" ? styles.active : ""
      }`}
      onClick={() => onTypeChange("sell")}
    >
      出闲�?{" "}
    </Text>
    <Text
      className={`${styles.tab} ${selectedType === "buy" ? styles.active : ""}`}
      onClick={() => onTypeChange("buy")}
    >
      收二�?{" "}
    </Text>
  </View>
);

const SecondHandHomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { listings, listingsLoading, listingsPagination, error } = useSelector(
    (state: RootState) => state.marketplace,
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]); // 用于高亮的关键词列表
  const [selectedType, setSelectedType] = useState<"all" | "sell" | "buy">(
    "all",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 使用商品详情hook
  const { loadProductDetails, isLoadingDetails } = useProductDetails();

  // 跟踪用户是否主动进行了筛选操作
  const userFilterChangedRef = useRef(false);

  // 获取商品列表 - 支持搜索关键词
  const loadListings = useCallback(
    async (params: { skip?: number; refresh?: boolean; keyword?: string }) => {
      try {
        if (params?.refresh) {
          setIsRefreshing(true);
        }

        const keyword = params.keyword || "";
        const skip = params?.skip || 0;

        // 如果有搜索关键词，使用统一搜索接口
        if (keyword.trim()) {
          const searchParams: SearchRequest = {
            q: keyword.trim(),
            type: "listing",
            size: 20,
            offset: skip,
            sort_field: "relevance",
            sort_order: "desc",
            filters: {},
          };

          // 只在用户主动选择类型时才添加类型过滤
          if (selectedType !== "all") {
            searchParams.filters = {
              listing_type: selectedType === "sell" ? "sell" : "buy",
            };
          }

          const response = await searchApi.search(searchParams);
          if (response.code === 0 && response.data) {
            // 将搜索结果转换为现有�?Redux store 格式
            const searchResults = response.data.items.map((item) => {
              // 处理ID，提取真正的ID部分
              let itemId = item.id || "";
              if (itemId.includes(":")) {
                itemId = itemId.split(":")[1];
              }

              return {
                id: itemId,
                title: item.title || "",
                description: item.content || "",
                price: item.price || null,
                images: item.images || ["/assets/placeholder.jpg"], // 确保至少有一个图片
                condition: item.condition || "",
                category: item.category || "",
                created_at: item.created_at || item.create_time || "",
                user: {
                  id: item.user_id || "",
                  nickname: item.nickname || item.user?.nickname || "",
                  avatar: item.user?.avatar || item.avatar || "",
                },
                listing_type:
                  item.listing_type ||
                  (selectedType === "sell"
                    ? ListingType.SELL
                    : ListingType.BUY),
              };
            });

            // 手动更新 Redux store
            if (skip === 0) {
              // 首次加载或刷新
              dispatch({
                type: "marketplace/setListings",
                payload: searchResults,
              });
            } else {
              // 加载更多
              dispatch({
                type: "marketplace/addListings",
                payload: searchResults,
              });
            }

            dispatch({
              type: "marketplace/setPagination",
              payload: {
                has_more: response.data.items.length === 20,
                skip: skip,
                limit: 20,
                total: response.data.total,
              },
            });
          } else {
            Taro.showToast({ title: "获取商品列表失败", icon: "none" });
          }
        } else {
          // 没有搜索关键词，使用原有的商品列表接口
          const queryParams: any = {
            skip: skip,
            limit: 20,
          };

          // 只在用户主动选择类型时才添加类型参数
          if (selectedType !== "all") {
            queryParams.listing_type =
              selectedType === "sell" ? ListingType.SELL : ListingType.BUY;
          }

          await dispatch(fetchListings(queryParams)).unwrap();
        }
      } catch {
        Taro.showToast({ title: "获取商品列表失败", icon: "none" });
      } finally {
        if (params?.refresh) {
          setIsRefreshing(false);
        }
      }
    },
    [dispatch, selectedType],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理搜索
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) return;

    try {
      setIsRefreshing(true);

      const searchParams: SearchRequest = {
        q: searchKeyword.trim(),
        type: "listing",
        size: 20,
        offset: 0,
        sort_field: "relevance",
        sort_order: "desc",
        filters: {},
      };

      // 只在用户主动选择类型时才添加类型过滤
      if (selectedType !== "all") {
        searchParams.filters = {
          listing_type: selectedType === "sell" ? "sell" : "buy",
        };
      }

      const response = await searchApi.search(searchParams);
      if (response.code === 0 && response.data) {
        // 将搜索结果转换为现有�?Redux store 格式
        const searchResults = response.data.items.map((item) => {
          // 处理ID，提取真正的ID部分
          let itemId = item.id || "";
          if (itemId.includes(":")) {
            itemId = itemId.split(":")[1];
          }

          return {
            id: itemId,
            title: item.title || "",
            description: item.content || "",
            price: item.price || null,
            images: item.images || ["/assets/placeholder.jpg"], // 确保至少有一个图�?            condition: item.condition || '',
            category: item.category || "",
            created_at: item.created_at || item.create_time || "",
            user: {
              id: item.user_id || "",
              nickname: item.nickname || item.user?.nickname || "",
              avatar: item.user?.avatar || item.avatar || "",
            },
            listing_type:
              item.listing_type ||
              (selectedType === "sell" ? ListingType.SELL : ListingType.BUY),
          };
        });

        // 手动更新 Redux store
        dispatch({
          type: "marketplace/setListings",
          payload: searchResults,
        });
        dispatch({
          type: "marketplace/setPagination",
          payload: {
            has_more: response.data.items.length === 20,
            skip: 0,
            limit: 20,
            total: response.data.total,
          },
        });

        // 设置关键词用于高亮显示
        const keywords = searchParams.q
          .trim()
          .split(/\s+/)
          .filter((k) => k.length > 0);
        setSearchKeywords(keywords);

        // 批量获取商品详情（异步执行，不阻塞UI）
        const productIds = searchResults.map((item) => item.id);
        loadProductDetails(productIds);
      } else {
        Taro.showToast({ title: "搜索失败", icon: "none" });
      }
    } catch {
      Taro.showToast({ title: "搜索失败", icon: "none" });
    } finally {
      setIsRefreshing(false);
    }
  }, [
    dispatch,
    searchKeyword,
    selectedType,
    setSearchKeywords,
    loadProductDetails,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理刷新
  const handleRefresh = async () => {
    // 刷新时保持当前的搜索关键词
    await loadListings({ refresh: true, keyword: searchKeyword });
  };

  // 处理加载更多
  const handleLoadMore = useCallback(async () => {
    if (!listingsPagination?.has_more || listingsLoading === "pending") return;
    // 传递当前搜索关键词以保持搜索状态
    await loadListings({
      skip: (listingsPagination?.skip || 0) + (listingsPagination?.limit || 20),
      keyword: searchKeyword,
    });
  }, [listingsPagination, listingsLoading, loadListings, searchKeyword]);

  // 处理商品点击
  const handleProductClick = useCallback((product: ListingRead) => {
    Taro.navigateTo({
      url: `/pages/subpackage-commerce/pages/second-hand/detail/index?id=${product.id}`,
    }).catch(() => {
      Taro.showToast({ title: "详情页面开发中", icon: "none" });
    });
  }, []);

  // 页面每次显示时刷新数据（包括首次进入和从其他页面返回�?
  useDidShow(() => {
    loadListings({ refresh: true, keyword: searchKeyword });
  });

  // 当筛选类型发生变化时，自动重新加载数�?
  useEffect(() => {
    // 只有当用户主动进行了筛选操作时才重新加�?
    if (userFilterChangedRef.current) {
      loadListings({ refresh: true, keyword: searchKeyword });
      userFilterChangedRef.current = false; // 重置标记
    }
  }, [selectedType, loadListings, searchKeyword]);

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: "none" });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // 处理搜索输入 - 使用 useCallback 保持函数稳定性，防抖优化
  const handleSearchInput = useCallback((e: any) => {
    const value = e.detail.value;
    setSearchKeyword(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchKeyword("");
    setSearchKeywords([]);
    // 清空后重新加载所有商�?
    loadListings({ refresh: true, keyword: "" });
  }, [loadListings]);

  // 处理筛选类型变�?
  const handleTypeChange = useCallback((type: "all" | "sell" | "buy") => {
    userFilterChangedRef.current = true;
    setSelectedType(type);
  }, []);

  // 商品卡片组件
  const ProductCard = ({ product }: { product: ListingRead }) => {
    const { formattedTime } = useRelativeTime(product.created_at, {
      autoUpdate: true,
      updateInterval: 60000, // 每分钟更新一�?
    });

    const getConditionText = (condition?: string) => {
      switch (condition) {
        case "new":
          return "全新";
        case "like_new":
          return "九成?";
        case "good":
          return "八成?";
        case "acceptable":
          return "七成?";
        case "damaged":
          return "其他";
        default:
          return "";
      }
    };

    return (
      <View
        className={styles.productCard}
        onClick={() => handleProductClick(product)}
      >
        <View className={styles.imageWrapper}>
          <Image
            src={product.images?.[0] || "/assets/placeholder.jpg"}
            className={styles.productImage}
            mode="aspectFill"
          />
          {!!product.condition && (
            <View
              className={`${styles.conditionBadge} ${
                styles[`cond_${product.condition}`] || ""
              }`}
            >
              <Text className={styles.badgeText}>
                {getConditionText(product.condition)}
              </Text>
            </View>
          )}
          {/* 状态标�?- �?�?*/}
          <View
            className={`${styles.statusBadge} ${
              styles[`status_${product.listing_type}`]
            }`}
          >
            <Text className={styles.badgeText}>
              {product.listing_type === "sell" ? "�?" : "�?"}
            </Text>
          </View>
        </View>
        <View className={styles.productTitle}>
          <HighlightText text={product.title} keywords={searchKeywords} />
        </View>
        <View className={styles.productFooter}>
          <Text className={styles.productPrice}>
            ¥
            {typeof product.price === "string"
              ? product.price
              : product.price || "面议"}
          </Text>
          <Text className={styles.productTime}>{formattedTime}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CustomHeader title="二手交易" />

      {/* 搜索框和筛选标�?- 固定在顶部，不随滚动 */}
      <View className={styles.fixedHeader}>
        <SearchBar
          key="second-hand-search"
          keyword={searchKeyword}
          placeholder="搜索二手商品"
          onInput={handleSearchInput}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
        <FilterTabs
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
        />
      </View>

      <View style={{ flex: 1, overflow: "hidden" }}>
        <ScrollView
          scrollY
          style={{ height: "100%" }}
          refresherEnabled
          refresherTriggered={isRefreshing}
          onRefresherRefresh={handleRefresh}
          refresherBackground="#f8fafc"
          onScrollToLower={handleLoadMore}
        >
          {/* 商品列表 */}
          {listingsLoading === "pending" && listings.length === 0 ? (
            <View className={styles.loadingContainer}>
              <Text className={styles.loadingText}>加载�?..</Text>
            </View>
          ) : listings.length > 0 ? (
            <View>
              {/* 加载详情状态指示器 */}
              {isLoadingDetails && searchKeywords.length > 0 && (
                <View className={styles.loadingDetailsIndicator}>
                  <Text className={styles.loadingDetailsText}>
                    正在加载商品详情...
                  </Text>
                </View>
              )}

              <View className={styles.productGrid}>
                {listings.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </View>
            </View>
          ) : (
            <EmptyState
              icon={emptyIcon}
              text={searchKeyword ? "没有找到相关商品" : "暂无商品"}
            />
          )}

          {/* 加载更多指示�?*/}
          {listingsLoading === "pending" && listings.length > 0 && (
            <View className={styles.loadMoreContainer}>
              <Text className={styles.loadMoreText}>加载更多...</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* 带鉴权的悬浮发布按钮 */}
      <AuthFloatingButton
        variant="plus"
        onClick={() =>
          Taro.navigateTo({
            url: "/pages/subpackage-commerce/pages/second-hand/publish/index",
          })
        }
        loginPrompt="您需要登录后才能发布商品，是否立即前往登录页面?"
        redirectUrl="/pages/subpackage-commerce/pages/second-hand/publish/index"
      />
    </View>
  );
};

export default SecondHandHomePage;
