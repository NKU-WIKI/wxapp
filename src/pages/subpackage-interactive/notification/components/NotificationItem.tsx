import { View, Image, Text } from '@tarojs/components'
import styles from './NotificationItem.module.scss'

// Define a more specific type for the notification item
interface Notification {
    id: number;
    user: string;
    action: string;
    post: string;
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
        <Image src={item.avatar} className={styles.avatar} />
        {item.unread && <View className={styles.unreadDot} />}
      </View>
      <View className={styles.content}>
        <Text className={styles.text}>
          <Text className={styles.username}>{item.user}</Text> {item.action}
        </Text>
        <Text className={styles.postInfo}>在「{item.post}」这条帖子</Text>
        <Text className={styles.time}>{item.time}</Text>
      </View>
    </View>
  );
};

export default NotificationItem; 