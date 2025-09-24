import { View, Image, Text } from '@tarojs/components'
import { normalizeImageUrl } from '@/utils/image'
import { NotificationRead } from '@/types/api/notification.d'

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
    originalNotification?: NotificationRead;
}

interface NotificationItemProps {
  item: Notification;
  onItemClick?: (_item: Notification, _originalNotification?: NotificationRead) => void;
}

const NotificationItem = ({ item, onItemClick }: NotificationItemProps) => {
  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item, item.originalNotification);
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;
      return date.toLocaleDateString();
    } catch {
      return timeStr;
    }
  };

  return (
    <View className={styles.notificationItem} onClick={handleClick}>
      {/* 未读标识 */}
      {item?.unread && <View className={styles.unreadDot} />}
      
      {/* 第一行：头像、昵称+动作、时间 */}
      <View className={styles.userRow}>
        <View className={styles.userLeft}>
          <Image 
            src={normalizeImageUrl(item?.avatar) || '/assets/profile.png'} 
            className={styles.avatar} 
          />
          <View className={styles.userActionContainer}>
            <Text className={styles.username}>{item?.user || '系统'}</Text>
            <Text className={styles.actionText}>{item?.action}</Text>
          </View>
        </View>
        <Text className={styles.time}>{formatTime(item?.time)}</Text>
      </View>

      {/* 第三行：帖子内容（如果有） */}
      {item?.post && (
        <View className={styles.postRow}>
          <Text className={styles.postContent}>「{item.post}」</Text>
        </View>
      )}
    </View>
  );
};

export default NotificationItem;
