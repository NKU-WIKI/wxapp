import { View, Image, Text } from '@tarojs/components';
import styles from './MyPostItem.module.scss';
import { Post } from '@/types/api/post.d';
import deleteIcon from '@/assets/x.svg';
import { formatRelativeTime } from '@/utils/time';
import Taro from '@tarojs/taro';

interface Props {
  post: Post;
  onDelete: () => void;
}

const MyPostItem = ({ post, onDelete }: Props) => {
  const handleClick = () => {
    // 跳转到帖子详情页面
    Taro.navigateTo({ 
      url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}` 
    }).catch(() => {
      Taro.showToast({
        title: '帖子不存在',
        icon: 'none'
      });
    });
  };

  // 解析图片
  const getImages = () => {
    if (post.image && typeof post.image === 'string') {
      try {
        const parsed = JSON.parse(post.image);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('解析图片失败:', error);
        return [];
      }
    }
    return [];
  };

  const imageUrls = getImages();
  const coverImage = imageUrls.length > 0 ? imageUrls[0] : null;
  
  return (
    <View className={styles.item} onClick={handleClick}>
      <View className={styles.content}>
        <Text className={styles.title}>{post.title}</Text>
        <Text className={styles.publishTime}>
          {formatRelativeTime(post.create_time)}发布
        </Text>
        <Text className={styles.excerpt} numberOfLines={2}>
          {post.content}
        </Text>
      </View>
      {coverImage && (
        <Image src={coverImage} className={styles.cover} mode="aspectFill" />
      )}
      <View className={styles.right}>
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

export default MyPostItem; 