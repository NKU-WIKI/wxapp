import { View, Text, Image } from "@tarojs/components";
import { Post } from "../../types/post";
import styles from "./index.module.scss";
import likedIcon from "../../assets/liked.png";
import starIcon from "../../assets/star.png";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <View className={styles.postContainer}>
      {/* 作者信息 */}
      <View className={styles.authorInfo}>
        <Image src={post.author.avatar} className={styles.authorAvatar} />
        <View className={styles.authorText}>
          <Text className={styles.authorName}>{post.author.name}</Text>
          <Text className={styles.postMeta}>
            {post.time} · {post.author.school}
          </Text>
        </View>
        <View className={styles.followButton}>
          <Text className={styles.followButtonText}>关注</Text>
        </View>
      </View>

      {/* 帖子文本 */}
      <Text className={styles.postText}>{post.content}</Text>

      {/* 帖子图片 */}
      {post.images && (
        <View className={styles.imageGrid}>
          {post.images.map((img, index) => (
            <Image
              key={index}
              src={img}
              className={styles.postImage}
              mode="aspectFill"
            />
          ))}
        </View>
      )}

      {/* 标签和地点 */}
      <View className={styles.metaContainer}>
        <View className={styles.tags}>
          {post.tags.map((tag) => (
            <Text key={tag} className={styles.tagItem}>
              {tag}
            </Text>
          ))}
        </View>
        {post.location && (
          <View className={styles.location}>
            <Text className={styles.locationText}>{post.location}</Text>
          </View>
        )}
      </View>

      {/* 点赞和收藏 */}
      <View className={styles.actions}>
        <View className={styles.actionItem}>
          <Image src={likedIcon} className={styles.actionIcon} />
          <Text>{post.likes}</Text>
        </View>
        <View className={styles.actionItem}>
          <Image src={starIcon} className={styles.actionIcon} />
          <Text>{post.stars}</Text>
        </View>
      </View>
    </View>
  );
} 