import { View, ScrollView, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState, useCallback, useMemo } from "react";

import activityApi from "@/services/api/activity";
import { ActivityRead, ActivityStatus, GetActivityListRequest } from "@/types/api/activity.d";
import CustomHeader from "@/components/custom-header";
import AuthFloatingButton from "@/components/auth-floating-button";
import SearchBar from "@/components/search-bar";
import HighlightText from "@/components/highlight-text";

import styles from "./index.module.scss";

// eslint-disable-next-line import/no-unused-modules
export default function ActivitySquare() {
  const [activities, setActivities] = useState<ActivityRead[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]); // 用于高亮的关键词列表


  // 活动分类列表
  const categories = [
    '全部',
    '运动健身',
    '创意艺术',
    '志愿公益',
    '吃喝娱乐',
    '学习搭子',
    '其他活动'
  ];

  // 获取活动列表
  const fetchActivities = useCallback(async (showLoading = true, category?: string) => {
    try {
      if (showLoading) {
        setActivitiesLoading(true);
      }
      setIsRefreshing(true);

      const params: GetActivityListRequest = {
        limit: 20,
        status: ActivityStatus.Published,
        sort_by: 'start_time',
        sort_order: 'desc'
      };

      // 根据选择的分类添加过滤条件
      if (category && category !== '全部') {
        // 假设后端API支持category参数
        (params as any).category = category;
      }

      const res = await activityApi.getActivityList(params);
      // 兼容后端 data?.data?.items / data?.data?.items 结构
      let list: ActivityRead[] = [];
      if (res?.data) {
        // 优先 PageActivityRead 结构
        const pageData: any = res.data as any;
        if (pageData?.items && Array.isArray(pageData.items)) {
          list = pageData.items as ActivityRead[];
        } else if (Array.isArray(res.data as any)) {
          list = res.data as unknown as ActivityRead[];
        }
      }
      setActivities(list);
      
    } catch (err) {
      
      setActivities([]);
    } finally {
      if (showLoading) {
        setActivitiesLoading(false);
      }
      setIsRefreshing(false);
    }
  }, []);



  useEffect(() => {
    fetchActivities(true, selectedCategory);
  }, [fetchActivities, selectedCategory]);

  // 页面显示时刷新活动列表（每次进入页面都会触发）
  useEffect(() => {
    const refreshActivities = () => {
      fetchActivities(false, selectedCategory);
    };

    // 使用 Taro 的事件监听
    const handleShow = () => {
      refreshActivities();
    };

    // 添加页面显示监听
    Taro.eventCenter.on('__taro_page_show', handleShow);

    // 清理函数
    return () => {
      Taro.eventCenter.off('__taro_page_show', handleShow);
    };
  }, [fetchActivities, selectedCategory]);

  const handleRefresh = async () => {
    await fetchActivities(false);
  };

  // 处理搜索输入
  const handleSearchInput = useCallback((e: any) => {
    const value = e.detail.value;
    setSearchKeyword(value);

    // 设置关键词用于高亮
    if (value.trim()) {
      const keywords = value.trim().split(/\s+/).filter(k => k.length > 0);
      setSearchKeywords(keywords);
    } else {
      setSearchKeywords([]);
    }
  }, []);

  // 处理搜索确认
  const handleSearchConfirm = useCallback(() => {
    // 本地搜索已经在filteredActivities中自动执行
    // 这里可以添加一些用户反馈
    if (searchKeyword.trim()) {
      // 延迟执行以确保状态已更新
      setTimeout(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        // 根据搜索关键词过滤
        const filtered = activities.filter(activityItem =>
          activityItem.title?.toLowerCase().includes(keyword) ||
          activityItem.description?.toLowerCase().includes(keyword) ||
          activityItem.location?.toLowerCase().includes(keyword) ||
          activityItem.category?.toLowerCase().includes(keyword) ||
          activityItem.organizer?.nickname?.toLowerCase().includes(keyword)
        );

        // 如果有分类过滤，再次应用分类过滤
        let finalFiltered = filtered;
        if (selectedCategory !== '全部') {
          finalFiltered = filtered.filter(activityItem => activityItem.category === selectedCategory);
        }

        if (finalFiltered.length === 0) {
          Taro.showToast({
            title: '未找到相关活动',
            icon: 'none',
            duration: 1500
          });
        } else {
          Taro.showToast({
            title: `找到 ${finalFiltered.length} 个相关活动`,
            icon: 'success',
            duration: 1500
          });
        }
      }, 100);
    }
  }, [searchKeyword, activities, selectedCategory]);

  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setSearchKeyword('');
    setSearchKeywords([]);
    // 清空搜索后显示所有活动（根据当前分类）
    Taro.showToast({
      title: '已清空搜索',
      icon: 'success',
      duration: 1000
    });
  }, []);


  const handleActivityClick = (act: ActivityRead) => {
    // 跳转到活动详情页面
    Taro.navigateTo({
      url: `/pages/subpackage-discover/activity-detail/index?id=${act.id}`
    });
  };

  const handleJoinActivity = async (act: ActivityRead, event: any) => {
    event.stopPropagation(); // 阻止事件冒泡到活动卡片

    try {
      // 检查用户是否已登录
      const token = Taro.getStorageSync('token');
      if (!token) {
        Taro.showModal({
          title: '提示',
          content: '请先登录后再报名活动',
          showCancel: false,
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/auth/login/index' });
            }
          }
        });
        return;
      }

      // 检查活动是否还有名额
      if (act.max_participants && act.current_participants >= act.max_participants) {
        Taro.showToast({
          title: '活动名额已满',
          icon: 'none'
        });
        return;
      }

      // 检查用户是否已经报名
      if (act.is_registered) {
        Taro.showToast({
          title: '您已经报名了这个活动',
          icon: 'none'
        });
        return;
      }

      // 显示确认对话框
      const result = await Taro.showModal({
        title: '确认报名',
        content: `确定要报名参加"${act.title}"吗？`,
        confirmText: '确认报名',
        cancelText: '取消'
      });

      if (!result.confirm) {
        return;
      }

      // 显示加载中
      Taro.showLoading({ title: '报名中...' });

      // 调用参加活动API
      const response = await activityApi.joinActivity({
        activity_id: act.id
      });
      // console.log('Join activity response:', response);

      Taro.hideLoading();

      if (response.code === 0) {
        Taro.showToast({
          title: '报名成功！',
          icon: 'success'
        });

        // 重新获取活动列表以更新状态
        await fetchActivities(false, selectedCategory);
      } else {
        Taro.showToast({
          title: response.message || '报名失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      Taro.hideLoading();
      // console.error('参加活动失败:', error);
      Taro.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  };

  const handlePublishActivity = () => {
    Taro.navigateTo({ url: '/pages/subpackage-discover/publish-activity/index' });
  };

  const toggleExpanded = (activityId: string, event: any) => {
    event.stopPropagation(); // 阻止事件冒泡到活动卡片
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // 根据选择的分类重新获取活动列表
    fetchActivities(true, category);
  };

  // 过滤活动列表的函数（同时支持分类和搜索过滤）
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // 根据分类过滤
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(activityItem => activityItem.category === selectedCategory);
    }

    // 根据搜索关键词过滤
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(activityItem =>
        activityItem.title?.toLowerCase().includes(keyword) ||
        activityItem.description?.toLowerCase().includes(keyword) ||
        activityItem.location?.toLowerCase().includes(keyword) ||
        activityItem.category?.toLowerCase().includes(keyword) ||
        activityItem.organizer?.nickname?.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  }, [activities, selectedCategory, searchKeyword]);

  return (
    <View className={styles.activitySquarePage}>
      <CustomHeader title='活动广场' />

      {/* 固定的搜索框和分类栏 */}
      <View className={styles.fixedHeader}>
        {/* 搜索框 */}
        <View className={styles.searchContainer}>
          <SearchBar
            key='activity-square-search'
            keyword={searchKeyword}
            placeholder='搜索活动'
            onInput={handleSearchInput}
            onSearch={handleSearchConfirm}
            onClear={handleClearSearch}
          />
        </View>

        {/* 活动分类 */}
        <ScrollView
          scrollX
          className={styles.categoryScrollContainer}
          showScrollbar={false}
        >
          <View className={styles.categoryContainer}>
            {categories.map(category => (
              <View
                key={category}
                className={`${styles.categoryItem} ${selectedCategory === category ? styles.activeCategory : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                <Text className={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 可滚动的活动列表 */}
      <ScrollView
        scrollY
        className={styles.scrollView}
        refresherEnabled
        refresherTriggered={isRefreshing}
        onRefresherRefresh={handleRefresh}
        refresherBackground='#f8fafc'
      >
        {/* 活动列表 */}
        <View
          className={`${styles.activitiesContainer} ${
            (filteredActivities && filteredActivities.length > 0 ? filteredActivities.length : 0) === 1
              ? styles.singleActivity
              : styles.multipleActivities
          }`}
        >
          {activitiesLoading ? (
            <View className={styles.loadingState}>
              <Text>加载中...</Text>
            </View>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            filteredActivities.map(act => {
              const isExpanded = expandedItems.has(act.id || '');
              return (
                <View
                  key={act.id}
                  className={styles.activityCard}
                  onClick={() => handleActivityClick(act)}
                >
                  <View className={styles.activityContent}>
                    <HighlightText
                      text={act.title}
                      keywords={searchKeywords}
                      highlightStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
                    />
                    <View className={styles.activityDetails}>
                      <View className={styles.activityDetailItem}>
                        <Image src={require("@/assets/clock.svg")} className={styles.detailIcon} />
                        <Text className={styles.activityDetail}>
                          {act.start_time ? new Date(act.start_time).toLocaleString() : '待定'}
                        </Text>
                      </View>
                      <View className={styles.activityDetailItem}>
                        <Image src={require("@/assets/map-pin.svg")} className={styles.detailIcon} />
                        <Text className={styles.activityDetail}>{act.location || '待定'}</Text>
                      </View>
                    </View>
                    <View className={styles.descriptionContainer}>
                      <Text
                        className={`${styles.activityDescription} ${!isExpanded ? styles.collapsed : ''}`}
                        numberOfLines={!isExpanded ? 2 : undefined}
                      >
                        {act.description || '暂无描述'}
                      </Text>
                    </View>
                    <View className={styles.activityAction}>
                      {(act.description && act.description.length > 50) && (
                        <View
                          className={styles.expandButton}
                          onClick={(e) => toggleExpanded(act.id || '', e)}
                        >
                          <Image
                            src={require("@/assets/chevron-down.svg")}
                            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                          />
                        </View>
                      )}
                      <Text
                        className={styles.actionButton}
                        onClick={(e) => handleJoinActivity(act, e)}
                      >
                        立即报名
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            // 显示暂无活动
            <View className={styles.emptyState}>
              <Image src={require("@/assets/empty.svg")} className={styles.emptyIcon} />
              <Text className={styles.emptyText}>暂无活动</Text>
              <Text className={styles.emptySubText}>快来发布第一个活动吧</Text>
            </View>
          )}
        </View>

        <View className={styles.bottomTip}>
          <Text>已经到底了</Text>
        </View>
      </ScrollView>

      {/* 带鉴权的悬浮发布活动按钮 */}
      <AuthFloatingButton
        variant='plus'
        onClick={handlePublishActivity}
        loginPrompt='您需要登录后才能发布活动，是否立即前往登录页面？'
        redirectUrl='/pages/discover/publish-activity/index'
      />
    </View>
  );
}
