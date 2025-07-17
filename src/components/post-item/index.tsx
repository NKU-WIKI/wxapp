import { View, Image, Text, Button } from "@tarojs/components";
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

  const handleFollow = (e) => {
    e.stopPropagation();
    // 这里可以添加关注逻辑，比如请求接口或本地提示
    Taro.showToast({ title: "已关注", icon: "success", duration: 1000 });
  };

  const handleStar = (e) => {
    e.stopPropagation();
    Taro.showToast({ title: "已收藏", icon: "success", duration: 1000 });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    Taro.showToast({ title: "已分享", icon: "success", duration: 1000 });
  };

  if (!post || !post.author) {
    return null;
  }

  return (
    <View className={styles.postItem} onClick={handleNavigate}>
      <View className={styles.postHeader}>
        <Image src={post.author.avatar || ''} className={styles.avatar} />
        <View className={styles.authorInfo}>
          <View className={styles.authorRow}>
            <Text className={styles.authorName}>{post.author.name || '匿名'}</Text>
            {post.author.level && (
              <Text className={styles.levelBadge}>Lv.{post.author.level}</Text>
            )}
            <Button className={styles.followBtn} onClick={handleFollow}>关注</Button>
          </View>
          <Text className={styles.authorSchool}>{post.author.school || '未知学校'}</Text>
        </View>
        <Text className={styles.postTime}>{post.time || '时间未知'}</Text>
      </View>
      {/* 新增标题显示 */}
      {post.title && (
        <View className={styles.postTitle}>
          <Text className={styles.postTitleText}>{post.title}</Text>
        </View>
      )}
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
        <View className={styles.footerAction} onClick={handleStar}>
          <Text>⭐ {post.favorites || 0}</Text>
        </View>
        {/* 新增分享按钮 */}
        <View className={styles.footerAction + ' ' + styles.shareAction} onClick={handleShare}>
          <Text className={styles.shareIcon}>🔗</Text>
          <Text className={styles.shareText}>分享</Text>
        </View>
      </View>
    </View>
  );
}
