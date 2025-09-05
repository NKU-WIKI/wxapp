import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { normalizeImageUrl } from '@/utils/image';
import { NoteListItem } from '@/services/api/note';
import ActionButton from '@/components/action-button';
import heartIcon from '@/assets/heart.svg';
import heartFilledIcon from '@/assets/heart-bold.svg';
import styles from './index.module.scss';

interface NoteCardProps {
  note: NoteListItem;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const NoteCard = ({ note, style, onClick }: NoteCardProps) => {
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // 使用笔记ID作为导航参数，不需要userId
      const url = `/pages/subpackage-interactive/note-detail/index?id=${note.id}`;
      

      Taro.navigateTo({ url });
    }
  };

  const authorAvatar = normalizeImageUrl(note.author_avatar) || '/assets/avatar1.png';

  // 获取封面图片：优先使用笔记的第一张图片，如果没有则使用默认图片

  const getCoverImage = () => {
    // 如果笔记有图片数组且不为空，使用第一张图片
    const noteWithImages = note as any;
    if (noteWithImages.images && noteWithImages.images.length > 0) {
      return normalizeImageUrl(noteWithImages.images[0]);
    }
    
    // 如果没有图片，使用占位图片URL（使用较小的高度比例）
    return 'https://via.placeholder.com/300x180/4F46E5/FFFFFF?text=笔记封面';
  };

  const coverImage = getCoverImage();

  const handleCoverImageError = () => {
    setCoverImageError(true);
  };

  // 如果图片加载失败或是占位图，使用默认样式
  const isPlaceholderImage = coverImageError || coverImage.includes('placeholder.com');

  return (
    <View className={styles.noteCard} style={style} onClick={handleClick}>
      <View className={`${styles.imageContainer} ${isPlaceholderImage ? styles.placeholderContainer : ''}`}>
        <Image
          src={coverImage}
          className={`${styles.coverImage} ${isPlaceholderImage ? styles.placeholderImage : ''}`}
          mode={isPlaceholderImage ? 'aspectFit' : 'widthFix'}
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
          <ActionButton
            icon={heartIcon}
            activeIcon={heartFilledIcon}
            text={note.like_count?.toString() || '0'}
            isActive={false}
            className={styles.likeButton}
          />
        </View>
      </View>
    </View>
  );
};

export default NoteCard;
