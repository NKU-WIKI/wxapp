import { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchUnreadCounts } from '@/store/slices/notificationSlice';
import CustomHeader from '@/components/custom-header';
import { NotificationRead, NotificationType, NotificationStatus } from '@/types/api/notification.d';
import {
  getNotifications,
  markAllAsRead,
  markNotificationAsRead,
} from '@/services/api/notification';
import { getUserById } from '@/services/api/user';
import { User } from '@/types/api/user';
import moreIcon from '@/assets/more-horizontal.svg';
import checkSquareIcon from '@/assets/check-square.svg';
import NotificationItem from './components/NotificationItem';
import styles from './index.module.scss';

/**
 * 显示用通知项接口
 */
interface DisplayNotificationItem {
  id: string;
  user: string;
  user_id?: string;
  avatar: string;
  action: string;
  post: string;
  time: string;
  unread: boolean;
  originalNotification?: NotificationRead;
}

// 通知类型映射配置
const NOTIFICATION_TABS = [
  {
    key: NotificationType._Message,
    title: '互动消息',
    icon: '💬',
    description: '点赞、评论、关注等互动消息',
  },
  {
    key: NotificationType._Activity,
    title: '活动通知',
    icon: '🎉',
    description: '活动发布、报名等通知',
  },
  {
    key: NotificationType._System,
    title: '系统通知',
    icon: '🔔',
    description: '系统公告、安全提醒等',
  },
  {
    key: NotificationType._Announcement,
    title: '公告通知',
    icon: '📢',
    description: '官方公告、重要通知',
  },
] as const;

type TabKey = (typeof NOTIFICATION_TABS)[number]['key'];

// 安全的状态比较和设置函数
const isNotificationRead = (status: NotificationStatus | string | undefined): boolean => {
  // 支持多种已读状态表示
  const readStatuses = ['read', 'Read', 'READ', NotificationStatus._Read];
  return readStatuses.includes(status as string);
};

const getReadStatus = (): NotificationStatus => {
  return NotificationStatus._Read;
};

const NotificationPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const unreadCounts = useSelector((state: RootState) => state.notification.unreadCounts);
  const [currentTab, setCurrentTab] = useState<TabKey>(NotificationType._Message);
  const [notifications, setNotifications] = useState<NotificationRead[]>([]);
  const [displayNotifications, setDisplayNotifications] = useState<DisplayNotificationItem[]>([]); // 解析后的显示数据
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Map<string, User>>(new Map()); // 用户信息缓存

  const [initialized, setInitialized] = useState(false); // 初始化
  const renderHeaderRight = () => <Image src={moreIcon} className={styles.moreIcon} />;

  // 获取用户信息（带缓存）
  const fetchUserInfo = useCallback(
    async (userId: string): Promise<User | null> => {
      if (!userId) return null;

      // 检查缓存
      if (userCache.has(userId)) {
        return userCache.get(userId)!;
      }

      const response = await getUserById(userId);
      if (response.code === 0 && response.data) {
        const userInfo = response.data;
        // 更新缓存
        setUserCache((prev) => new Map(prev.set(userId, userInfo)));
        return userInfo;
      }

      return null;
    },
    [userCache],
  );

  // 刷新未读数量统计（使用Redux统一管理）
  const refreshUnreadCounts = useCallback(async () => {
    try {
      await dispatch(fetchUnreadCounts()).unwrap();
    } catch {
      //
    }
  }, [dispatch]);

  // 解析通知内容显示（异步获取用户信息）
  const parseNotificationDisplay = useCallback(
    async (notification: NotificationRead) => {
      let senderName = '系统';
      let senderAvatar = '/assets/profile.png'; // 默认头像
      const senderId = notification.sender_id || undefined;

      // 如果有sender_id，尝试获取用户信息
      if (senderId) {
        const userInfo = await fetchUserInfo(senderId);
        if (userInfo) {
          senderName = userInfo.nickname || '用户';
          senderAvatar = userInfo.avatar || '/assets/profile.png';
        } else {
          // Fallback到notification中的sender信息（兼容旧数据）
          senderName = notification.sender?.nickname || notification.sender?.name || '系统';
          senderAvatar = notification.sender?.avatar || '/assets/profile.png';
        }
      }

      let action = '';
      let postContent = '';

      // 根据业务类型解析动作
      if (notification.type === NotificationType._Message) {
        switch (notification.business_type) {
          case 'like':
            action = '赞了你的帖子';
            break;
          case 'comment':
            action = '评论了你';
            break;
          case 'follow':
            action = '关注了你';
            break;
          case 'mention':
            action = '在帖子中提及了你';
            break;
          default:
            action = '给你发来了消息';
        }

        // 对于非关注类型，显示相关内容
        if (notification.business_type !== 'follow' && notification.data?.post_title) {
          postContent = notification.data.post_title;
        }
      } else if (notification.type === NotificationType._Activity) {
        // 活动通知简化处理，和互动消息保持一致
        const activityTitle = notification.data?.activity_title || '未知活动';

        switch (notification.business_type) {
          case 'activity_published':
            senderName = '系统';
            senderAvatar = '/assets/profile.png'; // 系统通知使用默认头像
            action = '活动发布成功';
            postContent = activityTitle;
            break;
          case 'activity_registration':
          case 'activity_cancel_registration':
            // 保持用户信息，只修改动作文案为中
            action = '活动报名状态更新';
            postContent = activityTitle;
            break;
          case 'participant_join_success':
            senderName = '系统';
            senderAvatar = '/assets/profile.png'; // 系统通知使用默认头像
            action = '活动报名成功';
            postContent = activityTitle;
            break;
          case 'participant_cancel_success':
            senderName = '系统';
            senderAvatar = '/assets/profile.png'; // 系统通知使用默认头像
            action = '取消报名成功';
            postContent = activityTitle;
            break;
          case 'activity_cancelled':
            senderName = '系统';
            senderAvatar = '/assets/profile.png'; // 系统通知使用默认头像
            action = '活动已取消';
            postContent = activityTitle;
            break;
          case 'activity_updated':
            senderName = '系统';
            senderAvatar = '/assets/profile.png'; // 系统通知使用默认头像
            action = '活动信息已更新';
            postContent = activityTitle;
            break;
          default:
            action = notification.title || '活动通知';
            postContent = activityTitle;
        }
      } else {
        // 系统通知和公告通知
        senderName = '系统';
        senderAvatar = '/assets/profile.png'; // 系统通知使用默认头像
        action = notification.title || '系统通知';
      }

      return {
        user: senderName,
        user_id: senderId,
        avatar: senderAvatar,
        action,
        post: postContent,
        time: new Date(notification.created_at).toISOString(),
        unread: !isNotificationRead(notification.status),
      };
    },
    [fetchUserInfo],
  );

  // 处理通知显示数据（异步获取用户信息）
  const processNotificationDisplayData = useCallback(
    async (notificationItems: NotificationRead[]) => {
      try {
        const displayDataPromises = notificationItems.map(async (notification) => {
          const displayData = await parseNotificationDisplay(notification);
          return {
            ...displayData,
            id: notification.id,
            originalNotification: notification,
          };
        });

        const resolvedDisplayData = await Promise.all(displayDataPromises);

        setDisplayNotifications(resolvedDisplayData);
      } catch {
        // Fallback: 使用原始数据
        const fallbackData = notificationItems.map((notification) => ({
          id: notification.id,
          user: '系统',
          user_id: notification.sender_id,
          avatar: '/assets/profile.png',
          action: notification.title,
          post: '',
          time: new Date(notification.created_at).toISOString(),
          unread: !isNotificationRead(notification.status),
          originalNotification: notification,
        }));
        setDisplayNotifications(fallbackData);
      }
    },
    [parseNotificationDisplay],
  );

  // 获取通知列表
  const fetchNotifications = useCallback(
    async (type?: NotificationType, showLoading = true) => {
      const targetType = type || currentTab;

      try {
        if (showLoading) setLoading(true);
        setError(null);

        // 为了兼容错误分类的活动通知，我们需要同时查询多个type
        const requestParams: {
          page: number;
          page_size: number;
          type?: NotificationType;
        } = {
          page: 1,
          page_size: 50,
        };

        if (targetType === 'activity') {
          // 活动标页：查询所有类型并前端过滤（兼容旧数据
          // 不指定type，获取所有通知然后前端过滤
        } else {
          // 其他标签页：按正常type查询
          requestParams.type = targetType;
        }

        const res = await getNotifications(requestParams);

        if (res.code === 0 && res.data) {
          let items = res.data.items || [];

          // 根据business_type重新过滤通知，确保活动相关通知在正确的标签
          items = items.filter((item) => {
            const isActivityRelated = [
              'activity_published',
              'activity_joined',
              'activity_cancelled',
              'activity_updated',
              'activity_registration',
              'activity_cancel_registration',
              'participant_join_success',
              'participant_cancel_success',
            ].includes(item.business_type);

            if (targetType === 'activity') {
              // activity标签页：只显示活动相关的通知
              return isActivityRelated;
            } else {
              // 其他标签页：不显示活动相关的通知
              return !isActivityRelated;
            }
          });

          setNotifications(items);

          // 异步解析通知显示数据（获取用户信息）
          processNotificationDisplayData(items);
        } else {
          throw new Error(res.message || '获取通知失败');
        }
      } catch (e: unknown) {
        //   error: e,
        //   errorMessage: e?.message,
        //   targetType,
        //   currentTab
        // });
        setError(e?.message || '获取通知失败');
        if (e?.message !== '网络错误') {
          Taro.showToast({ title: e?.message || '获取通知失败', icon: 'none' });
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [currentTab, processNotificationDisplayData],
  );

  // 切换标签
  const handleTabChange = (tabKey: TabKey) => {
    if (tabKey !== currentTab) {
      setCurrentTab(tabKey);
      setNotifications([]);
      fetchNotifications(tabKey);
    }
  };

  // 处理通知项点击事
  const handleNotificationClick = async (_item: DisplayNotificationItem, originalNotification?: NotificationRead) => {
    try {
      if (!originalNotification) {
        return;
      }

      // 如果是未读通知，先标记为已
      const isUnread = !isNotificationRead(originalNotification.status);

      if (isUnread) {
        await markNotificationAsRead(originalNotification.id);

        // 更新本地状
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === originalNotification.id ? { ...n, status: getReadStatus() } : n,
          ),
        );

        // 立即更新显示通知的未读状
        setDisplayNotifications((prev) =>
          prev.map((n) => (n.id === originalNotification.id ? { ...n, unread: false } : n)),
        );

        // 刷新未读数量统计
        refreshUnreadCounts();
      }

      // 根据通知类型和业务类型进行页面跳
      await handleNotificationNavigation(originalNotification);
    } catch (_error: unknown) {
      Taro.showToast({
        title: _error?.message || '操作失败',
        icon: 'none',
      });
    }
  };

  // 处理通知跳转逻辑
  const handleNotificationNavigation = async (notification: NotificationRead) => {
    const { type, business_type, business_id, data, sender_id } = notification;

    try {
      // 互动消息类通知
      if (type === NotificationType._Message) {
        switch (business_type) {
          case 'like':
          case 'comment':
          case 'mention':
          case 'collect': {
            // 跳转到帖子详情页
            const postId = business_id || data?.post_id;
            if (postId) {
              await Taro.navigateTo({
                url: `/pages/subpackage-interactive/post-detail/index?id=${postId}`,
              });
            } else {
              Taro.showToast({
                title: '帖子信息不完全',
                icon: 'none',
              });
            }
            break;
          }

          case 'follow': {
            // 跳转到用户主?
            const userId = sender_id || data?.follower_id;
            if (userId) {
              await Taro.navigateTo({
                url: `/pages/profile/index?userId=${userId}`,
              });
            } else {
              Taro.showToast({
                title: '用户信息不完全',
                icon: 'none',
              });
            }
            break;
          }

          default:
            break;
        }
      }
      // 提及通知
      else if (type === NotificationType._Mention) {
        const postId = business_id || data?.post_id;
        if (postId) {
          await Taro.navigateTo({
            url: `/pages/subpackage-interactive/post-detail/index?id=${postId}`,
          });
        }
      }
      // 活动通知
      else if (type === NotificationType._Activity) {
        if (business_id) {
          await Taro.navigateTo({
            url: `/pages/subpackage-discover/activity-detail/index?id=${business_id}`,
          });
        } else {
          Taro.showToast({
            title: '活动信息不完全',
            icon: 'none',
          });
        }
      }
      // 系统通知和公告通知暂时不跳?
    } catch {
      Taro.showToast({
        title: '页面跳转失败',
        icon: 'none',
      });
    }
  };

  // 标记全部已读
  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !isNotificationRead(n.status));
      if (unreadNotifications.length === 0) {
        Taro.showToast({ title: '当前已无未读通知', icon: 'none' });
        return;
      }

      const res = await markAllAsRead(currentTab);
      if (res.code === 0) {
        Taro.showToast({ title: '已全部标记为已读', icon: 'success' });
        // 刷新当前页面和未读数
        await Promise.all([fetchNotifications(currentTab, false), refreshUnreadCounts()]);
      } else {
        throw new Error(res.message || '操作失败');
      }
    } catch (e: unknown) {
      Taro.showToast({ title: (e as Error)?.message || '操作失败', icon: 'none' });
    }
  };

  useEffect(() => {
    // 初始化加- 同时获取通知列表和未读数
    Promise.all([
      fetchNotifications(currentTab), // 使用当前标签页加
      refreshUnreadCounts(),
    ])
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setInitialized(true); // 标记为已初始
      });
  }, [currentTab, fetchNotifications, refreshUnreadCounts]); // 只在组件挂载时执行一次
  useEffect(() => {
    // 切换标签页时加载数据（只在已初始化后才执行）
    if (initialized) {
      fetchNotifications(currentTab);
    }
  }, [currentTab, initialized, fetchNotifications]);

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title='消息' renderRight={renderHeaderRight()} />

      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView
          scrollY
          style={{ height: '100%' }}
          refresherEnabled
          refresherTriggered={loading}
          onRefresherRefresh={() => {
            fetchNotifications(currentTab, true);
          }}
          refresherBackground='#f8f9fa'
        >
          {/* 自定义标签页导航 */}
          <View className={styles.tabsContainer}>
            <View className={styles.customTabs}>
              {NOTIFICATION_TABS.map((tab) => {
                const isActive = currentTab === tab.key;
                const unreadCount = unreadCounts[tab.key] || 0;

                return (
                  <View
                    key={tab.key}
                    className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
                    onClick={() => handleTabChange(tab.key)}
                  >
                    <Text className={styles.tabText}>{tab.title}</Text>
                    {unreadCount > 0 && (
                      <View className={styles.badge}>
                        <Text className={styles.badgeText}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* 通知内容区域 */}
          <View className={styles.contentContainer}>
            {loading ? (
              <View className={styles.loadingContainer}>
                <Text className={styles.loadingText}>加载..</Text>
              </View>
            ) : error ? (
              <View className={styles.errorState}>
                <View className={styles.errorIcon}>⚠️</View>
                <Text className={styles.errorText}>{error}</Text>
                <View className={styles.retryButton} onClick={() => fetchNotifications()}>
                  <Text className={styles.retryText}>点击重试</Text>
                </View>
              </View>
            ) : (
              <View className={styles.notificationList}>
                {displayNotifications.length > 0 ? (
                  displayNotifications.map((displayItem) => (
                    <NotificationItem
                      key={displayItem.id}
                      item={displayItem}
                      onItemClick={handleNotificationClick}
                    />
                  ))
                ) : (
                  <View className={styles.emptyState}>
                    <View className={styles.emptyIcon}>
                      {NOTIFICATION_TABS.find((tab) => tab.key === currentTab)?.icon || '💬'}
                    </View>
                    <Text className={styles.emptyText}>
                      暂无
                      {NOTIFICATION_TABS.find((tab) => tab.key === currentTab)?.title || '通知'}
                    </Text>
                    <Text className={styles.emptySubText}>
                      {NOTIFICATION_TABS.find((tab) => tab.key === currentTab)?.description ||
                        '当有新通知时，会在这里显示'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* 底部操作按钮 - 固定在底部*/}
        {notifications.filter((n) => !isNotificationRead(n.status)).length > 0 && (
          <View className={styles.footer}>
            <View className={styles.markAllReadButton} onClick={handleMarkAllRead}>
              <Image src={checkSquareIcon} className={styles.footerIcon} />
              <Text className={styles.buttonText}>全部标记为已读</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default NotificationPage;
