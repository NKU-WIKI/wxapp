import { View, ScrollView, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";

import activityApi from "@/services/api/activity";
import { ActivityRead, ActivityStatus, ActivityType, GetActivityListRequest, RegistrationStatus } from "@/types/api/activity.d";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ActivityNotificationHelper } from "@/utils/notificationHelper";
import CustomHeader from "@/components/custom-header";
import AuthFloatingButton from "@/components/auth-floating-button";
import SearchBar from "@/components/search-bar";
import HighlightText from "@/components/highlight-text";

import styles from "./index.module.scss";

// eslint-disable-next-line import/no-unused-modules
export default function ActivitySquare() {
  const { isLoggedIn, user: currentUser } = useSelector((state: RootState) => state.user);

  // 添加ScrollView的ref
  const scrollViewRef = useRef<any>(null);

  const [activities, setActivities] = useState<ActivityRead[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('全部');
  const [showCategoryBar, setShowCategoryBar] = useState<boolean>(false);

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  // 活动筛选选项
  const filterOptions = [
    '全部',
    '我报名的',
    '我发布的'
  ];

  // 获取活动列表
  const fetchActivities = useCallback(async (showLoading = true, category?: string, filter?: string, isLoadMore = false) => {
    try {
      if (showLoading) {
        setActivitiesLoading(true);
      }
      if (!isLoadMore) {
        setIsRefreshing(true);
      }

      const pageToFetch = isLoadMore ? currentPage : 0;
      const params: GetActivityListRequest = {
        limit: 20,
        status: ActivityStatus.Published,
        sort_by: 'start_time',
        sort_order: 'desc',
        skip: pageToFetch * 20
      };

      // 根据选择的分类添加过滤条件
      if (category && category !== '全部' && !['我报名的', '我组织的'].includes(category)) {
        (params as any).category = category;
      }

      // 根据筛选类型调用不同的API
      let res;
      const currentFilter = filter || selectedFilter;

      if (currentFilter === '我报名的') {
        if (!isLoggedIn) {
          setActivities([]);
          setHasMore(false);
          return;
        }
        res = await activityApi.myActivity({
          limit: params.limit,
          skip: params.skip
        });
      } else if (currentFilter === '我发布的') {
        if (!isLoggedIn) {
          setActivities([]);
          setHasMore(false);
          return;
        }
        res = await activityApi.myOrganizedActivity({
          limit: params.limit,
          skip: params.skip
        });
      } else {
        res = await activityApi.getActivityList(params);
      }

      // 兼容后端数据结构
      let list: ActivityRead[] = [];
      if (res?.data) {
        const pageData: any = res.data as any;
        if (pageData?.items && Array.isArray(pageData.items)) {
          if (currentFilter === '我报名的') {
            list = pageData.items.map((item: any) => item.activity || item) as ActivityRead[];
          } else {
            list = pageData.items as ActivityRead[];
          }
        } else if (Array.isArray(res.data as any)) {
          list = res.data as unknown as ActivityRead[];
        }
      }

      setActivities(prevActivities => {
        // 如果是加载更多，拼接数据
        if (isLoadMore) {
          return [...prevActivities, ...list];
        }
        // 否则直接替换
        return list;
      });

      // 更新是否还有更多数据的状态
      setHasMore(list.length === params.limit);

    } catch (err: any) {
      const currentFilterValue = filter || selectedFilter;
      if (err?.status === 401 && (currentFilterValue === '我报名的' || currentFilterValue === '我发布的')) {
        setSelectedFilter('全部');
        setTimeout(() => {
          setCurrentPage(0);
          setHasMore(true);
          fetchActivities(false, category, '全部');
        }, 100);
      } else {
        if (!isLoadMore) {
          setActivities([]);
        }
        setHasMore(false);
      }
    } finally {
      if (showLoading) {
        setActivitiesLoading(false);
      }
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [selectedFilter, isLoggedIn, currentPage]);

  useEffect(() => {
    fetchActivities(true, selectedCategory, selectedFilter);
  }, [fetchActivities, selectedCategory, selectedFilter]);

  // 页面显示时刷新活动列表
  useEffect(() => {
    const refreshActivities = () => {
      setCurrentPage(0);
      setHasMore(true);
      fetchActivities(false, selectedCategory);
    };

    const handleShow = () => {
      refreshActivities();
    };

    Taro.eventCenter.on('__taro_page_show', handleShow);

    return () => {
      Taro.eventCenter.off('__taro_page_show', handleShow);
    };
  }, [fetchActivities, selectedCategory]);

  const handleRefresh = async () => {
    setCurrentPage(0);
    setHasMore(true);

    // 滚动到顶部
    if (scrollViewRef.current) {
      try {
        scrollViewRef.current.scrollTo({
          top: 0,
          animated: true
        });
      } catch (error) {
        // 兼容处理，如果scrollTo不可用，则忽略错误
      }
    }

    await fetchActivities(false, selectedCategory, selectedFilter);
  };

  // 触底加载更多
  const handleScrollToLower = useCallback(async () => {
    if (hasMore && !isLoadingMore && !activitiesLoading) {
      setIsLoadingMore(true);
      setCurrentPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchActivities(false, selectedCategory, selectedFilter, true);
        return nextPage;
      });
    }
  }, [hasMore, isLoadingMore, activitiesLoading, selectedCategory, selectedFilter, fetchActivities]);

  // 处理搜索输入
  const handleSearchInput = useCallback((e: any) => {
    const value = e.detail.value;
    setSearchKeyword(value);

    if (value.trim()) {
      const keywords = value.trim().split(/\s+/).filter(k => k.length > 0);
      setSearchKeywords(keywords);
    } else {
      setSearchKeywords([]);
    }
  }, []);

  // 处理搜索确认
  const handleSearchConfirm = useCallback(() => {
    if (searchKeyword.trim()) {
      setTimeout(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        const filtered = activities.filter(activityItem =>
          activityItem.title?.toLowerCase().includes(keyword) ||
          activityItem.description?.toLowerCase().includes(keyword) ||
          activityItem.location?.toLowerCase().includes(keyword) ||
          activityItem.category?.toLowerCase().includes(keyword) ||
          activityItem.organizer?.nickname?.toLowerCase().includes(keyword)
        );

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
    Taro.showToast({
      title: '已清空搜索',
      icon: 'success',
      duration: 1000
    });
  }, []);

  const handleActivityClick = (act: ActivityRead) => {
    Taro.navigateTo({
      url: `/pages/subpackage-discover/activity-detail/index?id=${act.id}`
    });
  };

  const handleJoinActivity = async (act: ActivityRead, event: any) => {
    event.stopPropagation();

    try {
      const token = Taro.getStorageSync('token');
      if (!token) {
        Taro.showModal({
          title: '提示',
          content: '请先登录后再报名活动',
          showCancel: false,
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
            }
          }
        });
        return;
      }

      // 检查用户是否为活动组织者
      if (currentUser?.id && act.organizer?.id === currentUser.id) {
        Taro.showToast({
          title: '不能报名自己发布的活动',
          icon: 'none'
        });
        return;
      }

      if (act.max_participants && act.current_participants >= act.max_participants) {
        Taro.showToast({
          title: '活动名额已满',
          icon: 'none'
        });
        return;
      }

      if (act.is_registered && act.registration_status !== "cancelled") {
        Taro.showToast({
          title: '您已经报名了这个活动',
          icon: 'none'
        });
        return;
      }

          const result = await Taro.showModal({
            title: '确认报名',
            content: `确定要报名参加"${act.title}"吗？`,
            confirmText: '确认',
            cancelText: '取消'
          });

      if (!result.confirm) {
        return;
      }

      Taro.showLoading({ title: '报名中...' });

      const response = await activityApi.joinActivity({
        activity_id: act.id
      });

      Taro.hideLoading();

      if (response.code === 0) {
        Taro.showToast({
          title: '报名成功！',
          icon: 'success'
        });

        if (isLoggedIn && currentUser?.id) {
          const participantNickname = currentUser.nickname || '用户';

          ActivityNotificationHelper.handleParticipantJoinSuccessNotification({
            activity: act,
            participantId: currentUser.id,
            participantNickname
          }).catch(_error => {
            // 通知发送失败不影响主流程
          });

          if (act.organizer?.id) {
            ActivityNotificationHelper.handleActivityJoinedNotification({
              activity: act,
              participantId: currentUser.id,
              participantNickname
            }).catch(_error => {
              // 通知发送失败不影响主流程
            });
          }
        }

        // 重新获取活动列表以更新状态
        await handleRefresh();
      } else {
        Taro.showToast({
          title: response.message || '报名失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    }
  };

  const handleCancelRegistration = async (act: ActivityRead, event: any) => {
    event.stopPropagation();

    try {
      const result = await Taro.showModal({
        title: '确认取消',
        content: `确定要取消报名"${act.title}"吗？`,
        confirmText: '确认取消',
        cancelText: '再想想'
      });

      if (!result.confirm) {
        return;
      }

      Taro.showLoading({ title: '取消中...' });

      const response = await activityApi.cancelActivityRegistration({
        activity_id: act.id
      });

      Taro.hideLoading();

      if (response.code === 0) {
        Taro.showToast({
          title: '取消成功！',
          icon: 'success'
        });

        if (isLoggedIn && currentUser?.id) {
          const participantNickname = currentUser.nickname || '用户';

          ActivityNotificationHelper.handleParticipantCancelSuccessNotification({
            activity: act,
            participantId: currentUser.id,
            participantNickname
          }).catch(_error => {
            // 通知发送失败不影响主流程
          });

          if (act.organizer?.id) {
            ActivityNotificationHelper.handleActivityCancelRegistrationNotification({
              activity: act,
              participantId: currentUser.id,
              participantNickname
            }).catch(_error => {
              // 通知发送失败不影响主流程
            });
          }
        }

        await handleRefresh();
      } else {
        Taro.showToast({
          title: response.message || '取消失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      Taro.hideLoading();
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
    event.stopPropagation();
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
    if ((category === '我报名的' || category === '我组织的') && !isLoggedIn) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再查看个人活动',
        showCancel: false,
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }

    setSelectedCategory(category);
    setShowCategoryBar(false);

    // 重置分页状态
    setCurrentPage(0);
    setHasMore(true);
    setActivities([]);

    fetchActivities(true, category, selectedFilter);
  };

  const handleFilterChange = (filter: string) => {
    if ((filter === '我报名的' || filter === '我发布的') && !isLoggedIn) {
      Taro.showModal({
        title: '提示',
        content: '请先登录后再查看个人活动',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/subpackage-profile/login/index'
            });
          }
        }
      });
      return;
    }

    setSelectedFilter(filter);

    if (selectedFilter === filter) {
      setShowCategoryBar(!showCategoryBar);
    } else {
      setShowCategoryBar(true);
    }

    // 重置分页状态
    setCurrentPage(0);
    setHasMore(true);
    setActivities([]);

    fetchActivities(true, selectedCategory, filter);
  };

  // 过滤活动列表
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    if (selectedCategory !== '全部' && !['我报名的', '我组织的'].includes(selectedCategory)) {
      filtered = filtered.filter(activityItem => activityItem.category === selectedCategory);
    }

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
        <SearchBar
          key='activity-square-search'
          keyword={searchKeyword}
          placeholder='搜索活动'
          onInput={handleSearchInput}
          onSearch={handleSearchConfirm}
          onClear={handleClearSearch}
        />

        {/* 活动筛选选项 - 分段选择器 */}
        <View className={styles.filterScrollContainer}>
          <View className={styles.filterContainer}>
            {filterOptions.map(filter => (
              <View
                key={filter}
                className={`${styles.filterItem} ${selectedFilter === filter ? styles.activeFilter : ''}`}
                onClick={() => handleFilterChange(filter)}
              >
                <Text className={styles.filterText}>{filter}</Text>
                {selectedFilter === filter && (
                  <Text className={`${styles.filterArrow} ${showCategoryBar ? styles.filterArrowUp : ''}`}>
                    ▼
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 活动分类 - 条件显示 */}
        {showCategoryBar && (
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
        )}
      </View>

      {/* 可滚动的活动列表 */}
      <ScrollView
        ref={scrollViewRef}
        scrollY
        className={styles.scrollView}
        refresherEnabled
        refresherTriggered={isRefreshing}
        onRefresherRefresh={handleRefresh}
        refresherBackground='#f8fafc'
        onScrollToLower={handleScrollToLower}
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
              const isOrganizer = currentUser?.id && act.organizer?.id === currentUser.id;
              const isCancelled = act.registration_status === RegistrationStatus.cancelled;
              const isRegistered = act.registration_status !== RegistrationStatus.cancelled && act.is_registered;
              const isFull = act.max_participants && act.current_participants >= act.max_participants;

              return (
                <View
                  key={act.id}
                  className={styles.activityCard}
                  onClick={() => handleActivityClick(act)}
                >
                  <View className={styles.activityContent}>
                    {/* 组织标签，仅在组织活动时显示 */}
                    {act.organizer_type === 'organization' && act.organization_name && (
                      <View className={styles.organizationTag}>
                        <Text className={styles.organizationTagText}>{act.organization_name}</Text>
                      </View>
                    )}
                    <View>
                      <Text className={styles.activityTitle}>
                        <HighlightText text={act.title || '无标题'} keywords={searchKeywords} />
                      </Text>
                    </View>
                    <View className={styles.activityDetails}>
                      <View className={styles.activityDetailItem}>
                        <Image src={require("@/assets/clock.svg")} className={styles.detailIcon} />
                        <Text className={styles.activityDetail}>
                          {act.start_time ? new Date(act.start_time).toLocaleString() : '待定'}
                        </Text>
                      </View>
                      <View className={styles.activityDetailItem}>
                        {/* 根据活动类型显示不同的图标和信息 */}
                        {act.activity_type === ActivityType.Online ? (
                          // 线上活动显示链接
                          <>
                            <Image src={require("@/assets/globe.svg")} className={styles.detailIcon} />
                            <Text className={styles.activityDetail}>{act.online_url || '线上活动'}</Text>
                          </>
                        ) : act.activity_type === ActivityType.Offline ? (
                          // 线下活动显示地点
                          <>
                            <Image src={require("@/assets/map-pin.svg")} className={styles.detailIcon} />
                            <Text className={styles.activityDetail}>{act.location || '待定'}</Text>
                          </>
                        ) : (
                          // 混合活动显示地点
                          <>
                            <Image src={require("@/assets/map-pin.svg")} className={styles.detailIcon} />
                            <Text className={styles.activityDetail}>{act.location || '待定'}</Text>
                          </>
                        )}
                      </View>
                      {/* 混合活动额外显示线上链接 */}
                      {act.activity_type === ActivityType.Hybrid && act.online_url && (
                        <View className={styles.activityDetailItem}>
                          <Image src={require("@/assets/globe.svg")} className={styles.detailIcon} />
                          <Text className={styles.activityDetail}>{act.online_url}</Text>
                        </View>
                      )}
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
                        className={`${styles.actionButton} ${
                          isOrganizer
                            ? styles.organizer
                            : isCancelled
                              ? styles.cancelled
                              : isRegistered
                                ? styles.registered
                                : isFull
                                  ? styles.disabled
                                  : ''
                        }`}
                        onClick={(e) => {
                          if (isOrganizer || isCancelled) {
                            e.stopPropagation();
                            return;
                          }
                          return isRegistered
                            ? handleCancelRegistration(act, e)
                            : handleJoinActivity(act, e);
                        }}
                      >
                        {isOrganizer
                          ? '我的活动'
                          : isCancelled
                            ? '已取消'
                            : isRegistered
                              ? '已报名'
                              : isFull
                                ? '名额已满'
                                : '立即报名'
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View className={styles.emptyState}>
              <Image src={require("@/assets/empty.svg")} className={styles.emptyIcon} />
              <Text className={styles.emptyText}>暂无活动</Text>
              <Text className={styles.emptySubText}>快来发布第一个活动吧</Text>
            </View>
          )}
        </View>

        {/* 加载更多提示 */}
        {isLoadingMore && (
          <View className={styles.loadingMore}>
            <Text>加载更多...</Text>
          </View>
        )}

        <View className={styles.bottomTip}>
          <Text>{hasMore ? '上拉加载更多' : '已经到底了'}</Text>
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
