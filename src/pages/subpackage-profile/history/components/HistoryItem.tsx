import { View, Image, Text } from '@tarojs/components';
import styles from './HistoryItem.module.scss';
import { HistoryItem as HistoryItemType } from '@/types/history';
import deleteIcon from '@/assets/x.svg';
import { formatRelativeTime } from '@/utils/time';

interface Props {
  item: HistoryItemType;
  onDelete: () => void;
}

const HistoryItem = ({ item, onDelete }: Props) => {
  return (
    <View className={styles.item}>
      <Image src={item.avatar} className={styles.avatar} />
      <Image src={item.cover} className={styles.cover} />
      <View className={styles.content}>
        <Text className={styles.title}>{item.title}</Text>
        <Text className={styles.publishTime}>{formatRelativeTime(item.createdAt)}发布</Text>
      </View>
      <View className={styles.right}>
        <Text className={styles.viewTime}>{formatRelativeTime(item.viewedAt)}读过</Text>
        <Image
          src={deleteIcon}
          className={styles.deleteIcon}
          onClick={onDelete}
          style={{ '--icon-url': `url(${deleteIcon})` } as any }
        />
      </View>
    </View>
  );
};

export default HistoryItem; 