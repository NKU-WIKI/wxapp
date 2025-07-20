import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Post } from "@/types/api/post.d";
import styles from "./index.module.scss";

// 引入所有需要的图标
import heartIcon from "@/assets/heart.svg"; // 空心
import heartActiveIcon from "@/assets/heart-bold.svg"; // 实心
import commentIcon from "@/assets/message-circle.svg";
import starIcon from "@/assets/star-outline.svg"; // 空心
import starActiveIcon from "@/assets/star.svg"; // 实心
import sendIcon from "@/assets/send.svg";
import moreIcon from "@/assets/more-horizontal.svg";

interface PostCardProps {
  post: Post;
  className?: string;
}

const PostCard = ({ post, className = "" }: PostCardProps) => {
  const navigateToDetail = () => {
    Taro.navigateTo({
      url: `/pages/post-detail/index?id=${post.id}`,
    });
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    console.log(`Action: ${action}, Post ID: ${post.id}`);
    // TODO: 调用API处理点赞、收藏等
  };

  const handleMoreAction = (e) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    Taro.showActionSheet({
      itemList: ['删除', '编辑', '举报'],
      success: function (res) {
        console.log(`选择了第${res.tapIndex}个按钮`);
        const actions = ['delete', 'edit', 'report'];
        const selectedAction = actions[res.tapIndex];

        if (selectedAction === 'delete') {
          Taro.showModal({
            title: '确认删除',
            content: '确定要删除这条帖子吗？',
            success: function (res) {
              if (res.confirm) {
                console.log('确认删除帖子', post.id);
                // TODO: 调用删除API
              }
            }
          });
        } else if (selectedAction === 'edit') {
          console.log('编辑帖子', post.id);
          // TODO: 跳转到编辑页面
        } else if (selectedAction === 'report') {
          console.log('举报帖子', post.id);
          // TODO: 调用举报API
        }
      },
      fail: function (res) {
        console.log(res.errMsg);
      }
    });
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
      {/* 作者信息 */}
      <View className={styles.authorInfo}>
        <Image src={post.author_info.avatar} className={styles.avatar} />
        <View className={styles.authorText}>
          <Text className={styles.authorName}>{post.author_info.nickname}</Text>
          <Text className={styles.postTime}>{post.create_time}</Text>
        </View>
        <View
          className={styles.moreButton}
          style={
            { "--icon-url": `url(${moreIcon})` } as React.CSSProperties
          }
          onClick={handleMoreAction}
        />
        {/*
          这里可以根据 is_following_author 状态来显示关注按钮
          <Button className={styles.followButton}>关注</Button>
        */}
      </View>

      {/* 帖子内容 */}
      <View className={styles.content}>
        <Text className={styles.title}>{post.title}</Text>
        <Text className={styles.text} numberOfLines={3}>
          {post.content}
        </Text>
      </View>

      {/* 图片展示 */}
      {post.image_urls && post.image_urls.length > 0 && (
        <View className={styles.images}>
          {post.image_urls.map((url, index) => (
            <Image key={index} src={url} className={styles.postImage} />
          ))}
        </View>
      )}

      {/* 标签 */}
      {post.tag && (
        <View className={styles.tags}>
          {post.tag.split(',').map(tag => (
            <Text key={tag} className={styles.tag}>#{tag.trim()}</Text>
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

export default PostCard;
