import { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import CustomHeader from '@/components/custom-header'
import NotificationItem from './components/NotificationItem'
import styles from './index.module.scss'
import moreIcon from '@/assets/more-horizontal.svg'
import checkSquareIcon from '@/assets/check-square.svg'
import Taro from '@tarojs/taro'
import { 
  getNotifications, 
  getUnreadCount, 
  markAllAsRead 
} from '@/services/api/notification'
import { 
  NotificationRead, 
  NotificationType, 
  UnreadCountResponse 
} from '@/types/api/notification.d'

// 通知类型映射配置
const NOTIFICATION_TABS = [
  { 
    key: NotificationType.Message, 
    title: '互动消息',
    icon: '💬',
    description: '点赞、评论、关注等互动消息'
  },
  { 
    key: NotificationType.Activity, 
    title: '活动通知',
    icon: '🎉',
    description: '活动发布、报名等通知'
  },
  { 
    key: NotificationType.System, 
    title: '系统通知',
    icon: '🔔',
    description: '系统公告、安全提醒等'
  },
  { 
    key: NotificationType.Announcement, 
    title: '公告通知',
    icon: '📢',
    description: '官方公告、重要通知'
  }
] as const

type TabKey = typeof NOTIFICATION_TABS[number]['key']

const NotificationPage = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>(NotificationType.Message)
  const [notifications, setNotifications] = useState<NotificationRead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountResponse>({} as UnreadCountResponse)
  const [refreshing, setRefreshing] = useState(false)
  const [initialized, setInitialized] = useState(false) // 初始化标识

  const renderHeaderRight = () => (
    <Image src={moreIcon} className={styles.moreIcon} />
  );

  // 获取未读数量统计（通过分别查询各种类型的未读通知数量）
  const fetchUnreadCounts = async () => {
    console.log('📊 [Notification] 开始获取未读数量统计...');
    try {
      // 使用现有API获取各类型的未读通知数量
      const notificationTypes = [
        NotificationType.Message,
        NotificationType.Activity,
        NotificationType.System,
        NotificationType.Announcement
      ];
      
      const unreadCountData: Partial<UnreadCountResponse> = {};
      let totalUnread = 0;
      
      // 并发查询各类型的未读数量
      const promises = notificationTypes.map(async (type) => {
        try {
          const res = await getNotifications({
            type,
            is_read: false,  // 只获取未读的
            page: 1,
            page_size: 1    // 只需要总数，不需要具体数据
          });
          
          if (res.code === 0 && res.data?.pagination) {
            const count = res.data.pagination.total || 0;
            unreadCountData[type] = count;
            totalUnread += count;
            return count;
          }
          return 0;
        } catch (error) {
          console.warn(`获取 ${type} 类型未读数量失败:`, error);
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
      console.log('✅ [Notification] 未读数量计算完成:', finalUnreadCounts);
      
    } catch (e: any) {
      console.error('❌ [Notification] 获取未读数量失败:', e);
      // 发生错误时设置为空的统计
      setUnreadCounts({} as UnreadCountResponse);
    }
  }

  // 获取通知列表
  const fetchNotifications = async (type?: NotificationType, showLoading = true) => {
    console.log('📝 [Notification] 开始获取通知列表, type:', type || currentTab);
    try {
      if (showLoading) setLoading(true)
      setError(null)
      
      const requestParams: any = {
        type: type || currentTab,
        page: 1,
        page_size: 50
      };
      
      console.log('📤 [Notification] 请求参数:', requestParams);
      
      const res = await getNotifications(requestParams)
      
      console.log('📝 [Notification] 通知列表响应:', res);
      
      if (res.code === 0 && res.data) {
        setNotifications(res.data.items || [])
        console.log('✅ [Notification] 通知列表设置成功, 数量:', res.data.items?.length || 0);
      } else {
        throw new Error(res.message || '获取通知失败')
      }
    } catch (e: any) {
      console.error('❌ [Notification] 获取通知列表失败:', e);
      setError(e?.message || '获取通知失败')
      if (e?.message !== '网络错误') {
        Taro.showToast({ title: e?.message || '获取通知失败', icon: 'none' })
      }
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }

  // 切换标签页
  const handleTabChange = (tabKey: TabKey) => {
    if (tabKey !== currentTab) {
      setCurrentTab(tabKey)
      setNotifications([])
      fetchNotifications(tabKey)
    }
  }

  // 刷新通知
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchNotifications(currentTab, false),
      fetchUnreadCounts()
    ])
  }

  // 标记全部已读
  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status !== 'read')
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
    
    let action = ''
    let postContent = ''
    
    // 根据业务类型解析动作
    if (notification.type === NotificationType.Message) {
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
      avatar: senderAvatar,
      action,
      post: postContent,
      time: new Date(notification.created_at).toISOString(),
      unread: notification.status !== 'read'
    }
  }

  useEffect(() => {
    // 初始化加载 - 同时获取通知列表和未读数量
    console.log('🚀 [Notification] 组件初始化加载...');
    Promise.all([
      fetchNotifications(currentTab),  // 使用当前标签页加载
      fetchUnreadCounts()
    ]).finally(() => {
      setInitialized(true); // 标记为已初始化
    })
  }, [])  // 只在组件挂载时执行一次

  useEffect(() => {
    // 切换标签页时加载数据（只在已初始化后才执行）
    if (initialized) {
      console.log('🔄 [Notification] 标签页变化，加载新数据:', currentTab);
      fetchNotifications(currentTab)
    }
  }, [currentTab, initialized])

  return (
    <View className={styles.notificationPage}>
      <CustomHeader 
        title="消息" 
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
              {notifications.length > 0 ? (
                notifications.map(notification => {
                  const displayData = parseNotificationDisplay(notification)
                  return (
                    <NotificationItem
                      key={notification.id}
                      item={{
                        id: notification.id,
                        ...displayData
                      }}
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
              )}
            </View>
          )}
        </View>
      </View>

      {/* 底部操作按钮 */}
      {notifications.filter(n => n.status !== 'read').length > 0 && (
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