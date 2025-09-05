import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { normalizeImageUrl } from '@/utils/image';
import { NoteListItem } from '@/types/api/note';
import ActionButton from '@/components/action-button';
import heartIcon from '@/assets/heart-outline.svg';
import heartFilledIcon from '@/assets/heart-bold.svg';
import styles from './index.module.scss';

// 扩展的笔记类型，包含交互状态
interface NoteWithStatus extends NoteListItem {
  is_liked?: boolean;
  is_favorited?: boolean;
  interaction_loading?: boolean;
}

interface NoteCardProps {
  note: NoteWithStatus;
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
      // 构建导航URL，如果有用户信息则传递userId
      let url = `/pages/subpackage-interactive/note-detail/index?id=${note.id}`;
      
      // 如果有用户信息，添加userId参数
      if (note.user?.id) {
        url += `&userId=${note.user.id}`;
      } else if ((note as any).user_id) {
        url += `&userId=${(note as any).user_id}`;
      }

      Taro.navigateTo({ url });
    }
  };

  const authorAvatar = normalizeImageUrl(note.author_avatar || undefined) || '/assets/avatar1.png';

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
        {/* 使用AuthorInfo组件获取完整的用户信息 */}
        {note.user ? (
          <View className={styles.authorInfoWrapper}>
            <Image
              src={avatarImageError ? '/assets/avatar1.png' : normalizeImageUrl(note.user.avatar) || '/assets/avatar1.png'}
              className={styles.exploreAvatarSmall} // 使用note-card自己的小头像样式
              mode='aspectFill'
              onError={() => setAvatarImageError(true)}
            />
            <View className={styles.authorDetails}>
              <Text className={styles.authorName}>{note.user.nickname || '匿名用户'}</Text>
            </View>
          </View>
        ) : (
          <View className={styles.author}>
            <Image
              src={avatarImageError ? '/assets/avatar1.png' : authorAvatar}
              className={styles.avatar}
              mode='aspectFill'
              onError={() => setAvatarImageError(true)}
            />
            <Text className={styles.authorName}>{note.author_name || '匿名用户'}</Text>
          </View>
        )}
        <View className={styles.likeInfo}>
          <ActionButton
            icon={heartIcon}
            activeIcon={heartFilledIcon}
            text={note.like_count?.toString() || '0'}
            isActive={note.is_liked || false}
            disabled={note.interaction_loading || false}
            className={styles.likeButton}
          />
        </View>
      </View>
    </View>
  );
};

export default NoteCard;
