import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import CustomHeader from '@/components/custom-header'
import {
  NotificationRead,
  NotificationType,
  NotificationStatus,
  UnreadCountResponse
} from '@/types/api/notification.d'
import {
  getNotifications,
  markAllAsRead,
  markNotificationAsRead
} from '@/services/api/notification'
import moreIcon from '@/assets/more-horizontal.svg'
import checkSquareIcon from '@/assets/check-square.svg'
import NotificationItem from './components/NotificationItem'
import styles from './index.module.scss'

// 通知类型映射配置
const NOTIFICATION_TABS = [
  {
    key: NotificationType._Message,
    title: '互动消息',
    icon: '💬',
    description: '点赞、评论、关注等互动消息'
  },
  {
    key: NotificationType._Activity,
    title: '活动通知',
    icon: '🎉',
    description: '活动发布、报名等通知'
  },
  {
    key: NotificationType._System,
    title: '系统通知',
    icon: '🔔',
    description: '系统公告、安全提醒等'
  },
  {
    key: NotificationType._Announcement,
    title: '公告通知',
    icon: '📢',
    description: '官方公告、重要通知'
  }
] as const

type TabKey = typeof NOTIFICATION_TABS[number]['key']

// 安全的状态比较和设置函数
const isNotificationRead = (status: any): boolean => {
  return status === 'read';
};

const getReadStatus = (): NotificationStatus => {
  return NotificationStatus._Read;
};

const NotificationPage = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>(NotificationType._Message)
  const [notifications, setNotifications] = useState<NotificationRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountResponse>({} as UnreadCountResponse)

  const [initialized, setInitialized] = useState(false) // 初始化标识

  const renderHeaderRight = () => (
    <Image src={moreIcon} className={styles.moreIcon} />
  );

  // 获取未读数量统计（通过分别查询各种类型的未读通知数量）
  const fetchUnreadCounts = useCallback(async () => {
    try {
      // 使用现有API获取各类型的未读通知数量
      const notificationTypes = [
        NotificationType._Message,
        NotificationType._Activity,
        NotificationType._System,
        NotificationType._Announcement
      ];
      
      const unreadCountData: Partial<UnreadCountResponse> = {};
      let totalUnread = 0;
      
      // 并发查询各类型的未读数量
      const promises = notificationTypes.map(async (type) => {
        try {
          const res = await getNotifications({
            type,
            page: 1,
            page_size: 50    // 获取足够数量进行前端过滤
          });
          
          if (res.code === 0 && res.data?.pagination) {
            // 后端过滤不可靠，在前端过滤只保留未读通知
            const actualUnreadItems = (res.data.items || []).filter(item => !isNotificationRead(item.status));
            const actualUnreadCount = actualUnreadItems.length;
            
            unreadCountData[type] = actualUnreadCount;
            totalUnread += actualUnreadCount;
            
            return actualUnreadCount;
          }
          return 0;
        } catch (_error) {
          return 0;
        }
      });
      
      await Promise.all(promises);
      
      // 设置未读数量统计
      const finalUnreadCounts = {
        ...unreadCountData,
        total: totalUnread
      } as UnreadCountResponse;
      
      setUnreadCounts(finalUnreadCounts);
      
    } catch (_e) {
      // 发生错误时设置为空的统计
      setUnreadCounts({} as UnreadCountResponse);
    }
  }, [])

  // 获取通知列表
  const fetchNotifications = useCallback(async (type?: NotificationType, showLoading = true) => {
    const targetType = type || currentTab;
    console.log('📋 [通知页面调试] 开始获取通知列表', {
      targetType,
      showLoading,
      currentTab,
      请求类型: targetType
    });

    try {
      if (showLoading) setLoading(true)
      setError(null)
      
      const requestParams: any = {
        type: targetType,
        page: 1,
        page_size: 50
      };
      
      console.log('📋 [通知页面调试] 请求参数', requestParams);
      
      const res = await getNotifications(requestParams)
      
      console.log('📋 [通知页面调试] API响应', {
        code: res.code,
        message: res.message,
        totalItems: res.data?.items?.length || 0,
        pagination: res.data?.pagination,
        items: res.data?.items?.map(item => ({
          id: item.id,
          type: item.type,
          business_type: item.business_type,
          status: item.status,
          title: item.title,
          created_at: item.created_at
        })) || []
      });
      
      if (res.code === 0 && res.data) {
        const items = res.data.items || [];
        console.log('📋 [通知页面调试] 设置通知列表', {
          设置的通知数量: items.length,
          通知类型分布: items.reduce((acc, item) => {
            acc[item.business_type || 'unknown'] = (acc[item.business_type || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          状态分布: items.reduce((acc, item) => {
            acc[item.status || 'unknown'] = (acc[item.status || 'unknown'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        });

        setNotifications(items);
      } else {
        throw new Error(res.message || '获取通知失败')
      }
    } catch (e: any) {
      console.error('❌ [通知页面调试] 获取通知失败', {
        error: e,
        errorMessage: e?.message,
        targetType,
        currentTab
      });
      setError(e?.message || '获取通知失败')
      if (e?.message !== '网络错误') {
        Taro.showToast({ title: e?.message || '获取通知失败', icon: 'none' })
      }
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [currentTab])

  // 切换标签页
  const handleTabChange = (tabKey: TabKey) => {
    console.log('📋 [通知页面调试] 切换标签页', {
      从: currentTab,
      到: tabKey,
      是否需要切换: tabKey !== currentTab
    });

    if (tabKey !== currentTab) {
      setCurrentTab(tabKey)
      setNotifications([])
      console.log('📋 [通知页面调试] 开始加载新标签页数据', { newTab: tabKey });
      fetchNotifications(tabKey)
    } else {
      console.log('📋 [通知页面调试] 点击相同标签，无需切换');
    }
  }



  // 处理通知项点击事件
  const handleNotificationClick = async (_item: any, originalNotification?: NotificationRead) => {
    try {
      if (!originalNotification) {
        return;
      }

      // 如果是未读通知，先标记为已读
      const isUnread = !isNotificationRead(originalNotification.status);

      if (isUnread) {
        await markNotificationAsRead(originalNotification.id);
        
        // 更新本地状态
        setNotifications(prev => 
          prev.map(n => 
            n.id === originalNotification.id 
              ? { ...n, status: getReadStatus() } 
              : n
          )
        );
        
        // 刷新未读数量统计
        fetchUnreadCounts();
      }

      // 根据通知类型和业务类型进行页面跳转
      await handleNotificationNavigation(originalNotification);
    } catch (error: any) {
      Taro.showToast({ 
        title: error?.message || '操作失败', 
        icon: 'none' 
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
          case 'collect':
            // 跳转到帖子详情页
            const postId = business_id || data?.post_id;
            if (postId) {
              await Taro.navigateTo({
                url: `/pages/subpackage-interactive/post-detail/index?id=${postId}`
              });
            } else {
              Taro.showToast({ title: '帖子信息不完整', icon: 'none' });
            }
            break;
          
          case 'follow':
            // 跳转到用户主页
            const userId = sender_id || data?.follower_id;
            if (userId) {
              await Taro.navigateTo({
                url: `/pages/profile/index?userId=${userId}`
              });
            } else {
              Taro.showToast({ title: '用户信息不完整', icon: 'none' });
            }
            break;
          
          default:
            break;
        }
      } 
      // 提及通知
      else if (type === NotificationType._Mention) {
        const postId = business_id || data?.post_id;
        if (postId) {
          await Taro.navigateTo({
            url: `/pages/subpackage-interactive/post-detail/index?id=${postId}`
          });
        }
      }
      // 活动通知
      else if (type === NotificationType._Activity) {
        if (business_id) {
          Taro.showToast({ title: '活动详情页面开发中', icon: 'none' });
        }
      }
      // 系统通知和公告通知暂时不跳转
    } catch (_navError) {
      Taro.showToast({ 
        title: '页面跳转失败', 
        icon: 'none' 
      });
    }
  };

  // 标记全部已读
  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !isNotificationRead(n.status))
      if (unreadNotifications.length === 0) {
        Taro.showToast({ title: '当前已无未读通知', icon: 'none' })
        return
      }

      const res = await markAllAsRead(currentTab)
      if (res.code === 0) {
        Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
        // 刷新当前页面和未读数量
        await Promise.all([
          fetchNotifications(currentTab, false),
          fetchUnreadCounts()
        ])
      } else {
        throw new Error(res.message || '操作失败')
      }
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '操作失败', icon: 'none' })
    }
  }

  // 解析通知内容显示
  const parseNotificationDisplay = (notification: NotificationRead) => {
    const senderName = notification.sender?.nickname || notification.sender?.name || '系统'
    const senderAvatar = notification.sender?.avatar || '/assets/profile.png'
    const senderId = notification.sender_id || undefined

    let action = ''
    let postContent = ''

    // 根据业务类型解析动作
    if (notification.type === NotificationType._Message) {
      switch (notification.business_type) {
        case 'like':
          action = '赞了你的帖子'
          break
        case 'comment':
          action = '评论了你'
          break
        case 'follow':
          action = '关注了你'
          break
        case 'mention':
          action = '在帖子中提及了你'
          break
        default:
          action = '给你发来了消息'
      }

      // 对于非关注类型，显示相关内容
      if (notification.business_type !== 'follow' && notification.data?.post_title) {
        postContent = notification.data.post_title
      }
    } else {
      action = notification.title
    }

    return {
      user: senderName,
      user_id: senderId,
      avatar: senderAvatar,
      action,
      post: postContent,
      time: new Date(notification.created_at).toISOString(),
      unread: !isNotificationRead(notification.status)
    }
  }

  useEffect(() => {
    // 初始化加载 - 同时获取通知列表和未读数量
    console.log('🚀 [通知页面调试] 页面初始化开始', {
      currentTab,
      initialized
    });

    Promise.all([
      fetchNotifications(currentTab),  // 使用当前标签页加载
      fetchUnreadCounts()
    ]).then(() => {
      console.log('✅ [通知页面调试] 页面初始化数据加载完成');
    }).catch((error) => {
      console.error('❌ [通知页面调试] 页面初始化失败', error);
    }).finally(() => {
      setInitialized(true); // 标记为已初始化
      console.log('🏁 [通知页面调试] 页面初始化完成');
    })
  }, [currentTab, fetchNotifications, fetchUnreadCounts])  // 只在组件挂载时执行一次

  useEffect(() => {
    // 切换标签页时加载数据（只在已初始化后才执行）
    if (initialized) {
      fetchNotifications(currentTab)
    }
  }, [currentTab, initialized, fetchNotifications])

  return (
    <View className={styles.notificationPage}>
      <CustomHeader 
        title='消息' 
        renderRight={renderHeaderRight()}
      />
      
      {/* 自定义标签页导航 */}
      <View className={styles.tabsContainer}>
        <View className={styles.customTabs}>
          {NOTIFICATION_TABS.map((tab) => {
            const isActive = currentTab === tab.key
            const unreadCount = unreadCounts[tab.key] || 0
            
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
            )
          })}
        </View>
      </View>

      {/* 通知内容区域 */}
      <View className={styles.contentContainer}>
        <ScrollView
          scrollY
          className={styles.scrollContainer}
        >
          <View className={styles.tabContent}>
          {loading ? (
            <View className={styles.loadingContainer}>
              <Text className={styles.loadingText}>加载中...</Text>
            </View>
          ) : error ? (
            <View className={styles.errorState}>
              <View className={styles.errorIcon}>⚠️</View>
              <Text className={styles.errorText}>{error}</Text>
              <View 
                className={styles.retryButton}
                onClick={() => fetchNotifications()}
              >
                <Text className={styles.retryText}>点击重试</Text>
              </View>
            </View>
          ) : (
            <View className={styles.notificationList}>
              {(() => {
                console.log('🎨 [通知页面调试] 开始渲染通知列表', {
                  总通知数: notifications.length,
                  当前标签: currentTab,
                  所有通知状态: notifications.map(n => ({ id: n.id, status: n.status, type: n.type, business_type: n.business_type }))
                });

                const unreadNotifications = notifications.filter(notification => {
                  const isRead = isNotificationRead(notification.status);
                  console.log('🔍 [通知页面调试] 通知过滤检查', {
                    notificationId: notification.id,
                    status: notification.status,
                    isRead: isRead,
                    willShow: !isRead,
                    business_type: notification.business_type,
                    title: notification.title,
                    是否收藏通知: notification.business_type === 'collect'
                  });
                  
                  // 专门针对收藏通知的调试
                  if (notification.business_type === 'collect') {
                    console.log('⭐ [收藏通知专项调试] 发现收藏通知', {
                      通知ID: notification.id,
                      标题: notification.title,
                      内容: notification.content,
                      状态: notification.status,
                      业务ID: notification.business_id,
                      发送者: notification.sender_id,
                      接收者: notification.recipient_id,
                      数据: notification.data,
                      创建时间: notification.created_at,
                      是否会显示: !isRead
                    });
                  }
                  return !isRead;
                });

                console.log('📊 [通知页面调试] 过滤结果', {
                  原始通知数: notifications.length,
                  过滤后未读数: unreadNotifications.length,
                  未读通知详情: unreadNotifications.map(n => ({
                    id: n.id,
                    type: n.type,
                    business_type: n.business_type,
                    status: n.status,
                    title: n.title
                  }))
                });

                return unreadNotifications.length > 0 ? (
                  unreadNotifications.map(notification => {
                    const displayData = parseNotificationDisplay(notification)
                    console.log('🎨 [通知页面调试] 渲染通知项', {
                      notificationId: notification.id,
                      displayData,
                      originalStatus: notification.status
                    });
                    return (
                      <NotificationItem
                        key={notification.id}
                        item={{
                          id: notification.id,
                          ...displayData,
                          originalNotification: notification
                        }}
                        onItemClick={handleNotificationClick}
                      />
                    )
                  })
                ) : (
                <View className={styles.emptyState}>
                  <View className={styles.emptyIcon}>
                    {NOTIFICATION_TABS.find(tab => tab.key === currentTab)?.icon || '💬'}
                  </View>
                  <Text className={styles.emptyText}>
                    暂无{NOTIFICATION_TABS.find(tab => tab.key === currentTab)?.title || '通知'}
                  </Text>
                  <Text className={styles.emptySubText}>
                    {NOTIFICATION_TABS.find(tab => tab.key === currentTab)?.description || '当有新通知时，会在这里显示'}
                  </Text>
                </View>
                );
              })()}
            </View>
          )}
          </View>
        </ScrollView>
      </View>

      {/* 底部操作按钮 */}
      {notifications.filter(n => !isNotificationRead(n.status)).length > 0 && (
        <View className={styles.footer}>
          <View
            className={styles.markAllReadButton}
            onClick={handleMarkAllRead}
          >
            <Image src={checkSquareIcon} className={styles.footerIcon} />
            <Text className={styles.buttonText}>全部标记为已读</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default NotificationPage;
