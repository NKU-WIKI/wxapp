import { View, Image, Text } from '@tarojs/components';
import { DraftPost } from '@/types/draft';
import editIcon from '@/assets/pen-tool.svg';
import deleteIcon from '@/assets/x.svg';
import styles from './DraftItem.module.scss';

interface Props {
  draft: DraftPost;
  onEdit: () => void;
  onDelete: () => void;
}

const DraftItem = ({ draft, onEdit, onDelete }: Props) => {
  return (
    <View className={styles.item}>
      <Image src={draft.avatar} className={styles.avatar} />
      <View className={styles.content}>
        <Text className={styles.title}>{draft.title}</Text>
        <Text className={styles.time}>{formatTime(draft.updatedAt)}</Text>
      </View>
      <View className={styles.actions}>
        <Image
          src={editIcon}
          className={styles.editIcon}
          onClick={onEdit}
          style={{ '--icon-url': `url(${editIcon})`, backgroundColor: '#1B82D6' } as React.CSSProperties}
        />
        <Image
          src={deleteIcon}
          className={styles.deleteIcon}
          onClick={onDelete}
          style={{ '--icon-url': `url(${deleteIcon})`, backgroundColor: '#D0021B' } as React.CSSProperties}
        />
      </View>
    </View>
  );
};

function formatTime(ts: number) {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
  return `${Math.floor(diff / (24 * 3600000))} 天前`;
}

export default DraftItem; 
