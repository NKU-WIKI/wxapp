import { View, Text, Image } from '@tarojs/components';
import { normalizeImageUrl } from '@/utils/image';
import { NoteListItem } from '@/services/api/note';
import styles from './index.module.scss';

interface NoteCardProps {
  note: NoteListItem;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const NoteCard = ({ note, style, onClick }: NoteCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // 只提供点击效果，不进行跳转
  };

  const authorAvatar = normalizeImageUrl(note.author_avatar) || '/assets/avatar1.png';
  
  // 生成随机图片作为笔记封面
  const generateCoverImage = (noteId: string) => {
    const imageConfigs = [
      { width: 300, height: 200 },  // 3:2 比例
      { width: 300, height: 250 },  // 6:5 比例
      { width: 300, height: 180 },  // 5:3 比例
      { width: 300, height: 320 },  // 15:16 比例 - 较高
      { width: 300, height: 160 },  // 15:8 比例 - 较矮
      { width: 300, height: 280 },  // 15:14 比例
      { width: 300, height: 220 },  // 15:11 比例
      { width: 300, height: 300 },  // 1:1 正方形
      { width: 300, height: 240 },  // 5:4 比例
      { width: 300, height: 190 },  // 30:19 比例
    ];
    
    // 根据noteId生成固定的索引，确保图片稳定
    const hash = noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const configIndex = hash % imageConfigs.length;
    const config = imageConfigs[configIndex];
    
    // 生成随机种子，但对同一个note保持稳定
    const seed = hash % 1000;
    
    return `https://picsum.photos/${config.width}/${config.height}?random=${seed}`;
  };

  const coverImage = generateCoverImage(note.id);

  return (
    <View className={styles.noteCard} style={style} onClick={handleClick}>
      {/* 笔记封面图片 - 占据上2/3空间 */}
      <View className={styles.imageContainer}>
        <Image
          src={coverImage}
          className={styles.coverImage}
          mode='aspectFill'
        />
      </View>

      {/* 下1/3部分：标题 */}
      <View className={styles.content}>
        <Text className={styles.title}>{note.title}</Text>
      </View>

      {/* 最下面一行：作者和点赞数 */}
      <View className={styles.footer}>
        <View className={styles.author}>
          <Image
            src={authorAvatar}
            className={styles.avatar}
            mode='aspectFill'
          />
          <Text className={styles.authorName}>{note.author_name || '匿名用户'}</Text>
        </View>
        <View className={styles.likeInfo}>
          <Text className={styles.likeCount}>{note.like_count}</Text>
          <Text className={styles.likeIcon}>♥</Text>
        </View>
      </View>
    </View>
  );
};

export default NoteCard;
