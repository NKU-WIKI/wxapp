import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import CustomHeader from '@/components/custom-header'
import NotificationItem from './components/NotificationItem' // Import the new component
import styles from './index.module.scss'
import moreIcon from '@/assets/more-horizontal.svg'
import checkSquareIcon from '@/assets/check-square.svg'
import avatar1 from '@/assets/avatar1.png';
import avatar2 from '@/assets/avatar2.png';


// Mock data for notifications
const mockNotifications = {
  likes: [
    { id: 1, user: '陈小雨', action: '赞了你的帖子', post: '分享一下今天的穿搭', time: '10 分钟前', avatar: avatar1, unread: true },
    { id: 2, user: '张小北', action: '赞了你的帖子', post: '分享下午茶时光', time: '2 天前', avatar: avatar2, unread: false },
  ],
  collections: [],
  comments: []
};

const NotificationPage = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const tabList = [{ title: '点赞' }, { title: '收藏' }, { title: '评论' }].map((item, index) => ({ ...item, id: index }));

  const renderHeaderRight = () => (
    <Image src={moreIcon} className={styles.moreIcon} />
  );

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
              {mockNotifications.likes.length > 0 ? (
                mockNotifications.likes.map(item => <NotificationItem key={item.id} item={item} />)
              ) : (
                <Text className={styles.emptyText}>暂无点赞通知</Text>
              )}
            </View>
          </AtTabsPane>
          <AtTabsPane current={currentTab} index={1}>
            <View className={styles.tabContent}>
               <Text className={styles.emptyText}>暂无收藏通知</Text>
            </View>
          </AtTabsPane>
          <AtTabsPane current={currentTab} index={2}>
            <View className={styles.tabContent}>
              <Text className={styles.emptyText}>暂无评论通知</Text>
            </View>
          </AtTabsPane>
        </AtTabs>
      </View>

      <View className={styles.footer}>
        <View className={styles.markAllReadButton}>
          <Image src={checkSquareIcon} className={styles.footerIcon} />
          <Text>全部标记为已读</Text>
        </View>
      </View>
    </View>
  );
};

export default NotificationPage;