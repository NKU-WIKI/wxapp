import { View, Image, Text } from '@tarojs/components'
import styles from './NotificationItem.module.scss'
import { normalizeImageUrl } from '@/utils/image'

// Define a more specific type for the notification item
interface Notification {
    id: string;
    user: string;
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
      <View className={styles.avatarContainer}>
        <Image src={normalizeImageUrl(item?.avatar) || ''} className={styles.avatar} />
        {item?.unread && <View className={styles.unreadDot} />}
      </View>
      <View className={styles.content}>
        <Text className={styles.text}>
          <Text className={styles.username}>{item?.user || '未知用户'}</Text> {item?.action}
        </Text>
        {item?.post && (
          <Text className={styles.postInfo}>「{item.post}」</Text>
        )}
        <Text className={styles.time}>{item?.time}</Text>
      </View>
    </View>
  );
};

export default NotificationItem;