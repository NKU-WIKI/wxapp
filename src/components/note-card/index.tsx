import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { normalizeImageUrl } from '@/utils/image';
import { NoteListItem } from '@/services/api/note';
import AuthorInfo from '@/components/author-info';
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
      const userId = note.user?.id;
      const url = userId 
        ? `/pages/subpackage-interactive/note-detail/index?id=${note.id}&userId=${userId}`
        : `/pages/subpackage-interactive/note-detail/index?id=${note.id}`;
      

      Taro.navigateTo({ url });
    }
  };

  const authorAvatar = normalizeImageUrl(note.author_avatar) || '/assets/avatar1.png';

  // 获取封面图片：优先使用笔记的第一张图片，如果没有则使用默认图片
  const getCoverImage = () => {
    // 如果笔记有图片数组且不为空，使用第一张图片
    // 注意：NoteListItem接口可能没有images属性，这里使用类型断言
    const noteWithImages = note as any;
    if (noteWithImages.images && noteWithImages.images.length > 0) {
      return normalizeImageUrl(noteWithImages.images[0]);
    }
    
    // 如果没有图片，使用占位图片URL
    return 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=笔记封面';
  };

  const coverImage = getCoverImage();

  const handleCoverImageError = () => {
    setCoverImageError(true);
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
        {/* 使用AuthorInfo组件获取完整的用户信息 */}
        {note.user ? (
          <View className={styles.authorInfoWrapper}>
            <Image
              src={normalizeImageUrl(note.user.avatar) || '/assets/avatar1.png'}
              className={styles.exploreAvatarSmall} // 使用note-card自己的小头像样式
              mode='aspectFill'
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
            isActive={false}
            actionType="like"
            className={styles.likeButton}
          />
        </View>
      </View>
    </View>
  );
};

export default NoteCard;
