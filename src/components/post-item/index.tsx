import { View, Image, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Post } from "../../types/api/post";
import styles from "./index.module.scss";
import heartIcon from '@/assets/heart.svg';
import messageSquareIcon from '@/assets/message-square.svg';
import starIcon from '@/assets/star.svg';
import sendIcon from '@/assets/send.svg';
import { formatRelativeTime } from "@/utils/time";

interface PostItemProps {
  post: Post;
  className?: string;
}

export default function PostItem({ post, className }: PostItemProps) {
  const handleNavigate = () => {
    Taro.navigateTo({
      url: `/pages/post-detail/index?id=${post.id}`,
    });
  };

  if (!post || !post.author_info) {
    return null;
  }

  return (
    <View className={`${styles.postCard} ${className || ''}`} onClick={handleNavigate}>
      {/* Card Header */}
      <View className={styles.cardHeader}>
        <View className={styles.authorInfo}>
          <Image src={post.author_info.avatar || ''} className={styles.avatar} />
          <View className={styles.authorDetails}>
            <View className={styles.authorNameRow}>
              <Text className={styles.authorName}>{post.author_info.nickname || '匿名'}</Text>
              {/* {post.author.level && (
                <View className={styles.levelBadge}>
                  <Text>Lv.{post.author.level}</Text>
                </View>
              )} */}
            </View>
            <Text className={styles.postTime}>{formatRelativeTime(post.create_time)}</Text>
          </View>
        </View>
        <View className={styles.headerActions}>
           <View className={styles.followButton}>
            <Text>关注</Text>
           </View>
           {/* You can add logic for 'New' or 'Hot' badges here */}
           {/* <View className={styles.badgeNew}><Text>New</Text></View> */}
        </View>
      </View>

      {/* Post Content */}
      <View className={styles.postContent}>
        <Text className={styles.postTitle}>{post.title}</Text>
        <Text className={styles.postExcerpt}>{post.content}</Text>
        {post.image_urls && post.image_urls[0] && (
          <Image
            src={post.image_urls[0]}
            className={styles.postImage}
            mode="aspectFill"
          />
        )}
      </View>

      {/* Card Footer */}
      <View className={styles.cardFooter}>
        <View className={styles.actions}>
          <View className={styles.actionItem}>
            <Image src={heartIcon} className={styles.actionIcon} />
            <Text>{post.like_count || 0}</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={messageSquareIcon} className={styles.actionIcon} />
            <Text>{post.comment_count || 0}</Text>
          </View>
          <View className={styles.actionItem}>
            <Image src={starIcon} className={styles.actionIcon} />
            <Text>{post.favorite_count || 0}</Text>
          </View>
        </View>
        <View className={styles.chatButton}>
            <Image src={sendIcon} className={styles.actionIcon} />
        </View>
      </View>
    </View>
  );
}
