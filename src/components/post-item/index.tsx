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
  if (!post || !post.author_info) {
    // 如果 post 或 post.author_info 数据不存在，可以渲染一个骨架屏或直接返回 null
    return null; // 或者返回一个加载状态的组件
  }
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user);
  const userInfo = userState?.userInfo || null;
  const token = userState?.token || null;
  const isLoggedIn = userState?.isLoggedIn || false;
  
  // 从 Redux 中获取最新的帖子状态
  const postState = useSelector((state: RootState) => state.post);
  const posts = postState?.list || [];
  const currentPostFromRedux = posts.find(p => p.id === post.id);
  
  // 使用 Redux 中的状态，如果 Redux 中没有则使用 props 中的
  const displayPost = currentPostFromRedux || post;
  
  // 使用后端返回的状态，确保布尔值转换正确
  const isLiked = displayPost.is_liked === true;
  const isFavorited = displayPost.is_favorited === true;
  
  // 使用帖子的 like_count 和 favorite_count 属性，如果为 undefined 则显示 0
  // 如果用户已点赞/收藏但数量为0，则显示1
  const likeCount = isLiked && displayPost.like_count === 0 ? 1 : (displayPost.like_count || 0);
  const favoriteCount = isFavorited && displayPost.favorite_count === 0 ? 1 : (displayPost.favorite_count || 0);

  // 检查是否登录
  const checkLogin = () => {
    if (!isLoggedIn || !token) {
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
    e.stopPropagation();
    Taro.navigateTo({ url: `/pages/subpackage-interactive/post-detail/index?id=${post.id}` });
  };

  // 跳转到用户资料页
  const navigateToProfile = (e) => {
    e.stopPropagation();
    // 如果是当前用户，直接跳转到 profile tabbar 页面
    if (post.author_info.id === userInfo?.id) {
      Taro.switchTab({ url: '/pages/profile/index' });
    } else {
      // 如果是其他用户，跳转到用户详情页（需要创建新页面）
      Taro.navigateTo({ url: `/pages/subpackage-profile/user-detail/index?userId=${post.author_info.id}` });
    }
  };

  // 处理关注按钮点击
  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (!checkLogin()) return;
    
    // 调用关注API
    dispatch(toggleAction({ 
      postId: post.author_info.id, 
      actionType: 'follow' 
    })).then((result: any) => {
      if (result.payload && result.payload.response) {
        const { is_active } = result.payload.response;
        Taro.showToast({
          title: is_active ? '关注成功' : '已取消关注',
          icon: 'none',
          duration: 1500
        });
      }
    }).catch(error => {
      console.error('关注操作失败', error);
      if (error.statusCode === 401) {
        Taro.showModal({
          title: '登录已过期',
          content: '请重新登录后重试',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
            }
          }
        });
      } else {
        Taro.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    });
  };

  // 处理点赞、收藏、关注等动作
  const handleActionClick = (e, actionType: 'like' | 'favorite' | 'follow' | 'share' | 'delete' | 'comment') => {
    e.stopPropagation(); // 阻止事件冒泡到父容器的 navigateToDetail

    if (actionType === 'share') {
      // 微信分享逻辑，Taro 目前不支持在组件中直接调用 onShareAppMessage
      // 需要在页面级别处理，或者通过事件通知页面
      showToast('分享功能需要在页面中实现', { type: 'info' });
      return;
    }
    
    if (actionType === 'comment') {
      // 跳转到详情页并聚焦评论区
      navigateToDetail(e);
      return;
    }

    if (!checkLogin()) return;
    
    switch (actionType) {
      case 'like':
      case 'favorite':
        // 直接派发 action 到 Redux，让 Redux 处理状态更新
        dispatch(toggleAction({ 
          postId: post.id, 
          actionType 
        })).then((result: any) => {
          if (result.payload && result.payload.response) {
            const { is_active } = result.payload.response;
            
            // 显示提示
            Taro.showToast({
              title: actionType === 'like' 
                ? (is_active ? '点赞成功' : '已取消点赞') 
                : (is_active ? '收藏成功' : '已取消收藏'),
              icon: 'none',
              duration: 1500
            });
          }
        }).catch(error => {
          console.error(`${actionType}操作失败`, error);
          
          // 如果是401错误，提示用户重新登录
          if (error.statusCode === 401) {
            Taro.showModal({
              title: '登录已过期',
              content: '请重新登录后重试',
              success: (res) => {
                if (res.confirm) {
                  Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
                }
              }
            });
          } else {
            Taro.showToast({
              title: '操作失败，请重试',
              icon: 'none'
            });
          }
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
      iconSrc = isActive ? heartActiveIcon : heartIcon;
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
    <View className={`${styles.postCard} ${className}`}>
      <View className={styles.cardHeader}>
        <View className={styles.authorInfo} onClick={navigateToProfile}>
          <Image src={post.author_info.avatar || ''} className={styles.avatar} />
          <View className={styles.authorDetails}>
            <View className={styles.authorMainRow}>
              <Text className={styles.authorName}>{post.author_info.nickname || '匿名'}</Text>
              <View className={styles.levelBadge}><Text>Lv.{post.author_info.level || 0}</Text></View>
              <View className={styles.followButton} onClick={handleFollowClick}><Text>关注</Text></View>
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
      <View className={styles.content} onClick={navigateToDetail}>
        <Text className={styles.title}>{post.title}</Text>
        <Text className={styles.text} numberOfLines={3}>
          {post.content}
        </Text>
      </View>

      {post.image_urls && post.image_urls.length > 0 && (
        <View className={styles.images} onClick={navigateToDetail}>
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
            count={likeCount}
            isActive={isLiked}
            action="like"
          />
          <ActionButton
            icon={commentIcon}
            activeIcon={commentIcon}
            count={post.comment_count}
            isActive={false}
            action="comment"
          />
          <ActionButton
            icon={starIcon}
            activeIcon={starActiveIcon}
            count={favoriteCount}
            isActive={isFavorited}
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
