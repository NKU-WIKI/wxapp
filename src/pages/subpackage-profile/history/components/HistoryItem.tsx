import { View, Image, Text } from '@tarojs/components';
import styles from './HistoryItem.module.scss';
import { HistoryItem as HistoryItemType } from '@/types/history';
import deleteIcon from '@/assets/x.svg';
import { formatRelativeTime } from '@/utils/time';
import Taro from '@tarojs/taro';

interface Props {
  item: HistoryItemType;
  onDelete: () => void;
}

const HistoryItem = ({ item, onDelete }: Props) => {
  const handleClick = () => {
    if (item.link) {
      Taro.navigateTo({ url: item.link });
    }
  };
  return (
    <View className={styles.item} onClick={handleClick}>
      <Image src={item.avatar} className={styles.avatar} />
      <View className={styles.content}>
        <Text className={styles.title}>{item.title}</Text>
        <Text className={styles.publishTime}>{formatRelativeTime(item.createdAt)}发布</Text>
      </View>
      {item.cover && <Image src={item.cover} className={styles.cover} />}
      <View className={styles.right}>
        <Text className={styles.viewTime}>{formatRelativeTime(item.viewedAt)}读过</Text>
        <Image
          src={deleteIcon}
          className={styles.deleteIcon}
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ '--icon-url': `url(${deleteIcon})` } as any }
        />
      </View>
    </View>
  );
};

export default HistoryItem; 