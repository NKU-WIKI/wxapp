import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { normalizeImageUrl } from '@/utils/image';
import { NoteListItem } from '@/services/api/note';
import AuthorInfo from '@/components/author-info';
import ActionBar from '@/components/action-bar';
import { ActionButtonProps } from '@/components/action-button';
import styles from './index.module.scss';

interface NoteCardProps {
  note: NoteListItem;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const NoteCard = ({ note, style, onClick }: NoteCardProps) => {
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const authorAvatar = normalizeImageUrl(note.author_avatar) || '/assets/avatar1.png';

  const generateCoverImage = (noteId: string, attempt: number) => {
    const imageConfigs = [
        { width: 300, height: 200 }, { width: 300, height: 250 },
        { width: 300, height: 180 }, { width: 300, height: 320 },
        { width: 300, height: 160 }, { width: 300, height: 280 },
        { width: 300, height: 220 }, { width: 300, height: 300 },
        { width: 300, height: 240 }, { width: 300, height: 190 },
    ];

    const hash = noteId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const configIndex = hash % imageConfigs.length;
    const config = imageConfigs[configIndex];
    const seed = (hash + attempt) % 1000;

    return `https://picsum.photos/${config.width}/${config.height}?random=${seed}`;
  };

  const coverImage = retryCount >= maxRetries
    ? '/assets/placeholder.jpg'
    : generateCoverImage(note.id, retryCount);

  const handleCoverImageError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  };

  return (
    <View className={styles.noteCard} style={style} onClick={handleClick}>
      <View className={styles.imageContainer}>
        <Image
          src={coverImage}
          className={styles.coverImage}
          mode='aspectFill'
          onError={handleCoverImageError}
        />
      </View>

      <View className={styles.content}>
        <Text className={styles.title}>{note.title}</Text>
      </View>

      <View className={styles.footer}>
        <View className={styles.author}>
          <Image
            src={avatarImageError ? '/assets/avatar1.png' : authorAvatar}
            className={styles.avatar}
            mode='aspectFill'
            onError={() => setAvatarImageError(true)}
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
