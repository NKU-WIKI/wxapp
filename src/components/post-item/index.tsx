import { View, Image, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Post } from "../../types/api/post";
import styles from "./index.module.scss";

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  const handleNavigate = () => {
    Taro.navigateTo({
      url: `/pages/post-detail/index?id=${post.id}`,
    });
  };

  if (!post || !post.author) {
    return null;
  }

  return (
    <View className={styles.postItem} onClick={handleNavigate}>
      <View className={styles.postHeader}>
        <Image src={post.author.avatar || ''} className={styles.avatar} />
        <View className={styles.authorInfo}>
          <Text className={styles.authorName}>{post.author.name || '匿名'}</Text>
          <Text className={styles.authorSchool}>{post.author.school || '未知学校'}</Text>
        </View>
        <Text className={styles.postTime}>{post.time || '时间未知'}</Text>
      </View>
      <View className={styles.postContent}>
        <Text>{post.content || '内容为空'}</Text>
        {post.image && (
          <Image
            src={post.image}
            className={styles.postImage}
            mode="aspectFill"
          />
        )}
      </View>
      <View className={styles.postTags}>
        {(post.tags || []).map((tag) => (
          <Text key={tag} className={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>
      <View className={styles.postFooter}>
        <View className={styles.footerAction}>
          <Text>👍 {post.likes || 0}</Text>
        </View>
        <View className={styles.footerAction}>
          <Text>💬 {post.commentsCount || 0}</Text>
        </View>
      </View>
    </View>
  );
}
