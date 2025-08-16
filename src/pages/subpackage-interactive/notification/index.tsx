import { useEffect, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import CustomHeader from '@/components/custom-header'
import NotificationItem from './components/NotificationItem' // Import the new component
import styles from './index.module.scss'
import moreIcon from '@/assets/more-horizontal.svg'
import checkSquareIcon from '@/assets/check-square.svg'
import Taro from '@tarojs/taro'
import http from '@/services/request'


interface NotificationDTO {
  id: number;
  title: string;
  content: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  is_read: boolean;
  target_id?: string | null;
  target_type?: string | null;
  create_time: string;
  sender_nickname?: string | null;
  sender_avatar?: string | null;
}

const NotificationPage = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tabList = [{ title: '点赞' }, { title: '收藏' }, { title: '评论' }].map((item, index) => ({ ...item, id: index }));

  const renderHeaderRight = () => (
    <Image src={moreIcon} className={styles.moreIcon} />
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      // 注意：原API路径 /wxapp/notification/list 不在官方文档中
      // 暂时保留原路径，但添加注释说明需要后端支持
      const res = await http.get<{ data: NotificationDTO[] }>(
        '/wxapp/notification/list',
        { page: 1, page_size: 20 },
        { header: { 'X-Show-Loading': true } }
      )
      if (res.code === 200) {
        setNotifications((res as any).data || [])
      } else {
        throw new Error((res as any).msg || (res as any).message || '获取通知失败')
      }
    } catch (e: any) {
      setError(e?.message || '获取通知失败')
      Taro.showToast({ title: e?.message || '获取通知失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <View className={styles.notificationPage}>
      <CustomHeader title="消息" />
      
      <View className={styles.tabsContainer}>
        <AtTabs
          current={currentTab}
          tabList={tabList}
          onClick={setCurrentTab}
          className={styles.tabs}
        >
          <AtTabsPane current={currentTab} index={0}>
            <View className={styles.tabContent}>
              {notifications.filter(n => n.type === 'like').length > 0 ? (
                notifications
                  .filter(n => n.type === 'like')
                  .map(n => (
                    <NotificationItem
                      key={n.id}
                      item={{
                        id: n.id,
                        user: n.sender_nickname || '系统',
                        action: '赞了你的帖子',
                        post: n.content,
                        time: n.create_time,
                        avatar: n.sender_avatar || '/assets/profile.png',
                        unread: !n.is_read,
                      }}
                    />
                  ))
              ) : (
                <Text className={styles.emptyText}>暂无点赞通知</Text>
              )}
            </View>
          </AtTabsPane>
          <AtTabsPane current={currentTab} index={1}>
            <View className={styles.tabContent}>
              {notifications.filter(n => n.type === 'follow').length > 0 ? (
                notifications
                  .filter(n => n.type === 'follow')
                  .map(n => (
                    <NotificationItem
                      key={n.id}
                      item={{
                        id: n.id,
                        user: n.sender_nickname || '系统',
                        action: '关注了你',
                        time: n.create_time,
                        avatar: n.sender_avatar || '/assets/profile.png',
                        unread: !n.is_read,
                      } as any}
                    />
                  ))
              ) : (
                <Text className={styles.emptyText}>暂无关注通知</Text>
              )}
            </View>
          </AtTabsPane>
          <AtTabsPane current={currentTab} index={2}>
            <View className={styles.tabContent}>
              {notifications.filter(n => n.type === 'comment').length > 0 ? (
                notifications
                  .filter(n => n.type === 'comment')
                  .map(n => (
                    <NotificationItem
                      key={n.id}
                      item={{
                        id: n.id,
                        user: n.sender_nickname || '系统',
                        action: '评论了你',
                        post: n.content,
                        time: n.create_time,
                        avatar: n.sender_avatar || '/assets/profile.png',
                        unread: !n.is_read,
                      }}
                    />
                  ))
              ) : (
                <Text className={styles.emptyText}>暂无评论通知</Text>
              )}
            </View>
          </AtTabsPane>
        </AtTabs>
      </View>

      <View className={styles.footer}>
        <View
          className={styles.markAllReadButton}
          onClick={async () => {
            try {
              // 注意：原API路径 /wxapp/notification/read-all 不在官方文档中
              // 暂时保留原路径，但添加注释说明需要后端支持
              const res = await http.post('/wxapp/notification/read-all', {})
              if ((res as any).code === 200) {
                Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
                fetchNotifications()
              } else {
                throw new Error((res as any).msg || (res as any).message || '操作失败')
              }
            } catch (e: any) {
              Taro.showToast({ title: e?.message || '操作失败', icon: 'none' })
            }
          }}
        >
          <Image src={checkSquareIcon} className={styles.footerIcon} />
          <Text>全部标记为已读</Text>
        </View>
      </View>
    </View>
  );
};

export default NotificationPage;