import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Post } from "@/types/api/post.d";
import styles from "./index.module.scss";
import { formatRelativeTime } from "@/utils/time";

// 引入所有需要的图标
import heartIcon from "@/assets/heart.svg"; // 空心
import heartActiveIcon from "@/assets/heart-bold.svg"; // 实心
import commentIcon from "@/assets/message-circle.svg";
import starIcon from "@/assets/star-outline.svg"; // 空心
import starActiveIcon from "@/assets/star.svg"; // 实心
import sendIcon from "@/assets/send.svg";
import Button from "../button";

interface PostItemProps {
  post: Post;
  className?: string;
}

const PostItem = ({ post, className = "" }: PostItemProps) => {
  const navigateToDetail = () => {
    Taro.navigateTo({
      url: `/pages/post-detail/index?id=${post.id}`,
    });
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    console.log(`Action: ${action}, Post ID: ${post.id}`);
    // TODO: 调用API处理点赞、收藏、关注等
  };

  const ActionButton = ({ icon, activeIcon, count, isActive, action }) => (
    <View
      className={`${styles.actionButton} ${isActive ? styles.active : ""}`}
      onClick={(e) => handleActionClick(e, action)}
    >
      <View
        className={styles.actionIcon}
        style={{
          "--icon-url": `url(${isActive ? activeIcon : icon})`,
        } as React.CSSProperties}
      />
      <Text className={styles.actionCount}>{count}</Text>
    </View>
  );

  return (
    <View className={`${styles.postCard} ${className}`} onClick={navigateToDetail}>
      <View className={styles.header}>
        <Image src={post.author_info.avatar} className={styles.avatar} />
        <View className={styles.authorInfo}>
          <Text className={styles.authorName}>{post.author_info.nickname}</Text>
          <Text className={styles.postTime}>
            {formatRelativeTime(post.create_time)}
          </Text>
        </View>
        <Button
          size="sm"
          className={styles.followButton}
          onClick={(e) => handleActionClick(e, "follow")}
        >
          关注
        </Button>
      </View>

      <View className={styles.content}>
        <Text className={styles.title}>{post.title}</Text>
        <Text className={styles.text} numberOfLines={3}>
          {post.content}
        </Text>
      </View>

      {post.image_urls && post.image_urls.length > 0 && (
        <View className={styles.images}>
          {post.image_urls.slice(0, 3).map((url, index) => (
            <Image key={index} src={url} className={styles.postImage} />
          ))}
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.actions}>
          <ActionButton
            icon={heartIcon}
            activeIcon={heartActiveIcon}
            count={post.like_count}
            isActive={post.is_liked}
            action="like"
          />
          <ActionButton
            icon={commentIcon}
            activeIcon={commentIcon}
            count={post.comment_count}
            isActive={false} // 评论按钮通常没有激活状态
            action="comment"
          />
          <ActionButton
            icon={starIcon}
            activeIcon={starActiveIcon}
            count={post.favorite_count}
            isActive={post.is_favorited}
            action="favorite"
          />
        </View>
        <View
          className={styles.shareIcon}
          style={
            { "--icon-url": `url(${sendIcon})` } as React.CSSProperties
          }
          onClick={(e) => handleActionClick(e, "share")}
        />
      </View>
    </View>
  );
};

export default PostItem;
