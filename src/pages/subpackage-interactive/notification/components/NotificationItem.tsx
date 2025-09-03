import { View, Image, Text } from '@tarojs/components'
import { normalizeImageUrl } from '@/utils/image'
import AuthorInfo from '@/components/author-info'

// Relative imports
import styles from './NotificationItem.module.scss'

// Define a more specific type for the notification item
interface Notification {
    id: string;
    user: string;
    user_id?: string;
    action: string;
    post?: string;
    time: string;
    avatar: string;
    unread: boolean;
}

interface NotificationItemProps {
  item: Notification;
}

const NotificationItem = ({ item }: NotificationItemProps) => {
  return (
    <View className={styles.notificationItem}>
      {item?.user_id ? (
        <View className={styles.userInfo}>
          <AuthorInfo
            userId={item.user_id}
            mode='compact'
            showBio={false}
            showFollowButton={false}
            showStats={false}
            showLevel={false}
            showLocation={false}
            showTime={true}
            createTime={item?.time}
            className={styles.authorInfo}
          />
          {item?.unread && <View className={styles.unreadDot} />}
        </View>
      ) : (
        <View className={styles.avatarContainer}>
          <Image src={normalizeImageUrl(item?.avatar) || ''} className={styles.avatar} />
          {item?.unread && <View className={styles.unreadDot} />}
        </View>
      )}
      <View className={styles.content}>
        <Text className={styles.text}>
          {item?.user_id ? (
            <>{item?.action}</>
          ) : (
            <>
              <Text className={styles.username}>{item?.user || '未知用户'}</Text> {item?.action}
            </>
          )}
        </Text>
        {item?.post && (
          <Text className={styles.postInfo}>「{item.post}」</Text>
        )}
        {!item?.user_id && (
          <Text className={styles.time}>{item?.time}</Text>
        )}
      </View>
    </View>
  );
};

export default NotificationItem;
