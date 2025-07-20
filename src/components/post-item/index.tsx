import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { Post } from "@/types/api/post.d";
import styles from "./index.module.scss";
import { formatRelativeTime } from "@/utils/time";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { toggleAction, deletePost } from '@/store/slices/postSlice';
import { showToast } from '@/utils/ui';

// 引入所有需要的图标
import heartIcon from "@/assets/heart-outline.svg"; // 空心
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
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo, token } = useSelector((state: RootState) => state.user);

  // 检查是否登录
  const checkLogin = () => {
    if (!token) {
      Taro.showModal({
        title: '提示',
        content: '您尚未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/login/index' });
          }
        }
      });
      return false;
    }
    return true;
  };

  // 跳转到详情页
  const navigateToDetail = (e) => {
    // 防止点击按钮时触发
    if (e.target.className.includes('action') || e.target.className.includes('Icon')) {
      return;
    }
    Taro.navigateTo({ url: `/pages/post-detail/index?id=${post.id}` });
  };

  // 处理点赞、收藏、关注等动作
  const handleActionClick = (e, actionType: 'like' | 'favorite' | 'follow' | 'share' | 'delete') => {
    e.stopPropagation(); // 阻止事件冒泡到父容器的 navigateToDetail

    console.log(actionType, post.id);

    if (actionType === 'share') {
      // 微信分享逻辑，Taro 目前不支持在组件中直接调用 onShareAppMessage
      // 需要在页面级别处理，或者通过事件通知页面
      showToast('分享功能需要在页面中实现', { type: 'info' });
      return;
    }

    if (!checkLogin()) return;

    switch (actionType) {
      case 'like':
        dispatch(toggleAction({ postId: post.id, actionType }));
        break;
      case 'favorite':
        dispatch(toggleAction({ postId: post.id, actionType }));
        break;
      case 'follow':
        // 关注用户
        dispatch(toggleAction({ postId: post.author_info.id, actionType: 'follow' }));
        break;
      case 'delete':
        handleDeletePost();
        break;
    }
  };

  // 删除帖子逻辑
  const handleDeletePost = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条帖子吗？',
      success: (res) => {
        if (res.confirm) {
          dispatch(deletePost({ postId: post.id }));
        }
      }
    });
  };

  const ActionButton = ({ icon, activeIcon, count, isActive, action }) => (
    <View className={styles.actionButton} onClick={(e) => handleActionClick(e, action)}>
      <View
        className={`${styles.actionIcon} ${isActive ? styles.active : ''}`}
        style={{ "--icon-url": `url(${isActive ? activeIcon : icon})` } as any}
      />
      <Text className={styles.actionCount}>{count}</Text>
    </View>
  );

  // 判断是否可以删除
  const canDelete = userInfo?.id === post.author_info.id || userInfo?.role === 'admin';

  return (
    <View className={`${styles.postCard} ${className}`} onClick={navigateToDetail}>
      <View className={styles.cardHeader}>
        <View className={styles.authorInfo}>
          <Image src={post.author_info.avatar || ''} className={styles.avatar} />
          <View className={styles.authorDetails}>
            <View className={styles.authorMainRow}>
              <Text className={styles.authorName}>{post.author_info.nickname || '匿名'}</Text>
              <View className={styles.levelBadge}><Text>Lv.{post.author_info.level || 0}</Text></View>
              <View className={styles.followButton}><Text>关注</Text></View>
            </View>
            <Text className={styles.authorBio}>{post.author_info.bio || ''}</Text>
          </View>
        </View>
        <View className={styles.headerActions}>
          <Text className={styles.postTime}>{formatRelativeTime(post.create_time)}</Text>
          {canDelete && (
            <View className={styles.moreButton} onClick={(e) => handleActionClick(e, 'delete')}>
              <View
                className={styles.moreIcon}
                style={{ "--icon-url": `url(${require('@/assets/more-horizontal.svg')})` } as any}
              />
            </View>
          )}
        </View>
      </View>

      {/* Post Content */}
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
            isActive={false}
            action="comment" // 点击评论也是跳转详情页
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
          style={{ "--icon-url": `url(${sendIcon})` } as any}
          onClick={(e) => handleActionClick(e, "share")}
        />
      </View>
    </View>
  );
};

export default PostItem;
