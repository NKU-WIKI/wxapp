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
import starActiveIcon from "@/assets/star-filled.svg"; // 实心
import sendIcon from "@/assets/send.svg"; 
import moreIcon from "@/assets/more-horizontal.svg";
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
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
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
    if (e && e.target && e.target.className && 
        (typeof e.target.className === 'string') && 
        (e.target.className.includes('action') || e.target.className.includes('Icon'))) {
      return;
    }
    Taro.navigateTo({ url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}` });
  };

  // 处理点赞、收藏、关注等动作
  const handleActionClick = (e, actionType: 'like' | 'favorite' | 'follow' | 'share' | 'delete') => {
    e.stopPropagation(); // 阻止事件冒泡到父容器的 navigateToDetail

    if (actionType === 'share') {
      // 微信分享逻辑，Taro 目前不支持在组件中直接调用 onShareAppMessage
      // 需要在页面级别处理，或者通过事件通知页面
      showToast('分享功能需要在页面中实现', { type: 'info' });
      return;
    }

    if (!checkLogin()) return;
    
    switch (actionType) {
      case 'like':
      case 'favorite':
        // 创建一个本地副本，用于乐观更新UI
        const updatedPost = { ...post };
        
        if (actionType === 'like') {
          // 立即在UI上反转点赞状态
          updatedPost.is_liked = !updatedPost.is_liked;
          // 更新点赞数
          updatedPost.like_count += updatedPost.is_liked ? 1 : -1;
          // 确保点赞数不小于0
          updatedPost.like_count = Math.max(0, updatedPost.like_count);
        } else if (actionType === 'favorite') {
          // 立即在UI上反转收藏状态
          updatedPost.is_favorited = !updatedPost.is_favorited;
          // 更新收藏数
          updatedPost.favorite_count += updatedPost.is_favorited ? 1 : -1;
          // 确保收藏数不小于0
          updatedPost.favorite_count = Math.max(0, updatedPost.favorite_count);
        }
        
        // 派发action到Redux，后端会返回真实状态
        dispatch(toggleAction({ postId: post.id, actionType }))
          .catch(error => {
            console.error(`${actionType}操作失败`, error);
            Taro.showToast({
              title: '操作失败，请重试',
              icon: 'none'
            });
          });
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

  // 使用与 post_detail 相同的处理方式
  const ActionButton = ({ icon, activeIcon, count, isActive, action }) => {
    // 根据action类型和激活状态选择正确的图标
    let iconSrc = icon;
    if (isActive && activeIcon) {
      iconSrc = activeIcon;
    } else if (action === 'like') {
      iconSrc = heartIcon;
    } else if (action === 'favorite') {
      iconSrc = isActive ? starActiveIcon : starIcon;
    } else if (action === 'comment') {
      iconSrc = commentIcon;
    }
    
    return (
      <View className={styles.actionButton} onClick={(e) => handleActionClick(e, action)}>
        <Image 
          src={iconSrc}
          className={styles.actionIcon}
        />
        <Text className={`${styles.actionCount} ${isActive ? styles.active : ''}`}>{count}</Text>
      </View>
    );
  };

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
              <Image src={moreIcon} className={styles.moreIcon} />
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
          onClick={(e) => handleActionClick(e, "share")}
        >
          <Image src={sendIcon} style={{ width: '100%', height: '100%' }} />
        </View>
      </View>
    </View>
  );
};

export default PostItem;
