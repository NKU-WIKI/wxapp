import { View, Text, Image, ITouchEvent } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useRef, useEffect } from 'react';
import { Post as PostData } from "@/types/api/post.d";
import styles from "./index.module.scss";
import { formatRelativeTime } from "@/utils/time";
import { normalizeImageUrl, normalizeImageUrls } from '@/utils/image';
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { deletePost } from '@/store/slices/postSlice';
import { toggleAction } from '@/store/slices/actionSlice';
import { showToast } from '@/utils/ui';

// 引入所有需要的图标
import heartIcon from "@/assets/heart-outline.svg";
import heartActiveIcon from "@/assets/heart-bold.svg";
import commentIcon from "@/assets/message-circle.svg";
import starIcon from "@/assets/star-outline.svg";
import starActiveIcon from "@/assets/star-filled.svg";
import sendIcon from "@/assets/send.svg";
import shareIcon from "@/assets/share.svg";
import moreIcon from "@/assets/more-horizontal.svg";
import locationIcon from "@/assets/map-pin.svg";

export type PostMode = 'list' | 'detail';

interface PostProps {
  post: PostData;
  className?: string;
  mode?: PostMode;
  enableNavigation?: boolean;
}

/**
 * 统一的Post组件，支持列表态和详情态
 * 
 * @param post - 帖子数据
 * @param className - 额外的样式类名
 * @param mode - 显示模式：'list' | 'detail'，默认为 'list'
 * @param enableNavigation - 是否启用点击跳转，默认为 true
 */
const Post = ({ post, className = "", mode = "list", enableNavigation = true }: PostProps) => {
  if (!post) {
    return null;
  }

  const dispatch = useDispatch<AppDispatch>();
  const { checkAuth } = useAuthGuard();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const lastActionTimeRef = useRef<number>(0);
  const userState = useSelector((state: RootState) => state.user);
  const postState = useSelector((state: RootState) => state.post);
  const DEBOUNCE_DELAY = 500;
  const DEFAULT_AVATAR = '/assets/avatar1.png';
  
  // 获取当前用户信息
  const userInfo = (userState as any)?.userProfile || null;
  
  // 从 Redux 中获取最新的帖子状态
  const posts = postState?.list || [];
  const currentPostFromRedux = posts.find(p => p.id === post.id);
  
  // 使用 Redux 中的状态，如果 Redux 中没有则使用 props 中的
  const displayPost = currentPostFromRedux || post;
  
  // 统一字段处理：优先使用 user 字段，兼容 author_info
  const author = displayPost.user || displayPost.author_info;
  
  // 直接从 displayPost 获取状态，不使用本地状态管理
  const isLiked = displayPost.is_liked === true;
  const isFavorited = displayPost.is_favorited === true;
  const isFollowing = displayPost.is_following_author === true;
  
  // 直接从 displayPost 获取计数，不使用本地状态管理
  const likeCount = Math.max(0, displayPost.like_count || 0);
  const favoriteCount = Math.max(0, displayPost.favorite_count || 0);
  
  // 解析图片
  const getImages = () => {
    // 优先使用 image_urls 字段
    if (displayPost.image_urls && Array.isArray(displayPost.image_urls)) {
      return normalizeImageUrls(displayPost.image_urls);
    }
    
    // 兼容 image 字段
    if (displayPost.image) {
      if (typeof displayPost.image === 'string') {
        try {
          const parsed = JSON.parse(displayPost.image);
          return Array.isArray(parsed) ? normalizeImageUrls(parsed) : [];
        } catch (error) {
          console.error('解析图片失败:', error);
          return [];
        }
      } else if (Array.isArray(displayPost.image)) {
        return normalizeImageUrls(displayPost.image);
      }
    }
    
    return [];
  };
  
  const images = getImages();
  
  // 处理标签数据
  const getTags = () => {
    if (Array.isArray(displayPost.tag)) {
      return displayPost.tag;
    }
    
    if (displayPost.tag && typeof displayPost.tag === 'string') {
      try {
        const parsed = JSON.parse(displayPost.tag);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('解析标签失败:', error);
        return [];
      }
    }
    
    return [];
  };
  
  const tags = getTags();
  
  // 解析位置信息
  const getLocation = () => {
    if (displayPost.location && typeof displayPost.location === 'string') {
      try {
        const locationObj = JSON.parse(displayPost.location);
        return locationObj.name;
      } catch (error) {
        console.error('解析位置信息失败', error);
        return null;
      }
    }
    return null;
  };
  
  const location = getLocation();
  
  // 作者等级处理
  const currentUserId = (userState as any)?.currentUser?.user_id;
  const fallbackLevel = (userState as any)?.userProfile?.level ?? 0;
  const authorLevel: number = (typeof author?.level === 'number' && !Number.isNaN(author.level))
    ? (author.level as number)
    : (author?.id === currentUserId ? (fallbackLevel as number) : 0);
  
  // 头像状态管理
  const [avatarSrc, setAvatarSrc] = useState<string>(normalizeImageUrl(author?.avatar || '') || DEFAULT_AVATAR);
  
  useEffect(() => {
    setAvatarSrc(normalizeImageUrl(author?.avatar || '') || DEFAULT_AVATAR);
  }, [author?.avatar]);
  
  // 跳转到详情页
  const navigateToDetail = (e) => {
    e.stopPropagation();
    if (enableNavigation && mode === 'list') {
      Taro.navigateTo({ url: `/pages/subpackage-interactive/post-detail/index?id=${displayPost.id}` });
    }
  };
  
  // 跳转到用户资料页
  const navigateToProfile = (e) => {
    e.stopPropagation();
    if (!author) return;
    
    if (author.id === userInfo?.id) {
      Taro.switchTab({ url: '/pages/profile/index' });
    } else {
      Taro.navigateTo({ url: `/pages/subpackage-profile/user-detail/index?userId=${author.id}` });
    }
  };
  
  // 处理关注按钮点击
  const handleFollowClick = (e: any) => {
    e.stopPropagation();
    if (!checkAuth() || !author) return;
    
    dispatch(toggleAction({
      target_id: author.id,
      target_type: 'user',
      action_type: 'follow'
    })).then((result: any) => {
      if (result.payload && result.payload.is_active !== undefined) {
        const { is_active } = result.payload;
        // 移除本地关注状态设置，完全依赖 Redux store 更新
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
  
  // 删除帖子逻辑
  const handleDeletePost = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条帖子吗？',
      success: (res) => {
        if (res.confirm) {
          dispatch(deletePost(displayPost.id));
        }
      }
    });
  };
  
  // 处理点赞、收藏、关注等动作
  const handleActionClick = (e, actionType: 'like' | 'favorite' | 'follow' | 'share' | 'delete' | 'comment') => {
    e.stopPropagation();
    
    // 防抖动机制
    const currentTime = Date.now();
    if (actionType === 'like' || actionType === 'favorite' || actionType === 'follow') {
      if (isActionLoading) {
        Taro.showToast({ title: '操作太快了，请稍等', icon: 'none' });
        return;
      }
      
      if (currentTime - lastActionTimeRef.current < DEBOUNCE_DELAY) {
        Taro.showToast({ title: '操作太快了，请稍等', icon: 'none' });
        return;
      }
      
      lastActionTimeRef.current = currentTime;
    }
    
    if (actionType === 'share') {
      showToast('分享功能需要在页面中实现', { type: 'info' });
      return;
    }
    
    if (actionType === 'comment') {
      if (mode === 'list') {
        navigateToDetail(e);
      }
      return;
    }
    
    if (!checkAuth()) return;
    
    switch (actionType) {
      case 'like':
      case 'favorite':
        setIsActionLoading(true);
        dispatch(toggleAction({
          target_id: displayPost.id,
          target_type: 'post',
          action_type: actionType
        })).then((result: any) => {
          if (result.payload && result.payload.is_active !== undefined) {
            const { is_active } = result.payload;
            // 移除本地状态更新，完全依赖Redux store更新
            
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
        }).finally(() => {
          setIsActionLoading(false);
        });
        break;
      case 'follow':
        // 使用独立的 handleFollowClick 处理关注逻辑，避免重复代码
        handleFollowClick(e);
        break;
      case 'delete':
        handleDeletePost();
        break;
    }
  };
  
  // 渲染动作按钮
  const ActionButton = ({ icon, activeIcon, count, isActive, action, showText = false }) => {
    let iconSrc = icon;
    if (isActive && activeIcon) {
      iconSrc = activeIcon;
    }
    
    return (
      <View className={styles.actionButton} onClick={(e) => handleActionClick(e, action)}>
        <Image
          src={iconSrc}
          className={`${styles.actionIcon} ${isActive ? styles.activeIcon : ''}`}
        />
        <Text className={`${styles.actionCount} ${isActive ? styles.active : ''}`}>
          {showText && action === 'share' ? '分享' : count}
        </Text>
      </View>
    );
  };
  
  // 预览图片
  const previewImage = (currentImage: string) => {
    Taro.previewImage({
      current: currentImage,
      urls: images
    });
  };
  
  // 判断是否可以删除
  const canDelete = userInfo?.id === author?.id || userInfo?.role === 'admin';
  
  return (
    <View className={`${styles.postContainer} ${styles[mode]} ${className}`}>
      {/* 标题部分 - 仅详情态显示 */}
      {mode === 'detail' && (
        <View className={styles.titleSection}>
          <Text className={styles.title}>{displayPost.title}</Text>
        </View>
      )}
      
      {/* 用户信息区域 */}
      <View className={styles.userInfo}>
        <View className={styles.authorInfo} onClick={navigateToProfile}>
          <Image
            src={avatarSrc}
            className={styles.avatar}
            mode='aspectFill'
            onError={() => setAvatarSrc(DEFAULT_AVATAR)}
          />
          <View className={styles.authorDetails}>
            <View className={styles.authorMainRow}>
              <Text className={styles.authorName}>{author?.nickname || '匿名'}</Text>
              <View className={styles.levelBadge}>
                <Text>Lv.{authorLevel || 0}</Text>
              </View>
              {userInfo?.id !== author?.id && mode === 'detail' && (
                <View
                  className={`${styles.followButton} ${isFollowing ? styles.followed : ''}`}
                  onClick={handleFollowClick}
                >
                  <Text>{isFollowing ? '已关注' : '+关注'}</Text>
                </View>
              )}
            </View>
            {mode === 'list' && <Text className={styles.authorBio}>{author?.bio || ''}</Text>}
            {mode === 'detail' && (
              <Text className={styles.meta}>
                {formatRelativeTime((displayPost as any).created_at || displayPost.create_time)}
              </Text>
            )}
          </View>
        </View>
        
        <View className={styles.headerActions}>
          {mode === 'list' && userInfo?.id !== author?.id && (
            <View
              className={`${styles.followButton} ${isFollowing ? styles.followed : ''}`}
              onClick={handleFollowClick}
            >
              <Text>{isFollowing ? '已关注' : '关注'}</Text>
            </View>
          )}
          {mode === 'list' && (
            <Text className={styles.postTime}>
              {formatRelativeTime((displayPost as any).created_at || displayPost.create_time)}
            </Text>
          )}
          {canDelete && (
            <View className={styles.moreButton} onClick={(e: ITouchEvent) => handleActionClick(e, 'delete')}>
              <Image src={moreIcon} className={styles.moreIcon} />
            </View>
          )}
        </View>
      </View>
      
      {/* 帖子内容 */}
      {mode === 'list' && (
        <View className={styles.content} onClick={navigateToDetail}>
          <Text className={styles.contentTitle}>{displayPost.title}</Text>
          <Text className={styles.contentText} numberOfLines={3}>
            {displayPost.content}
          </Text>
        </View>
      )}
      
      {mode === 'detail' && (
        <View className={styles.postContent}>
          <Text className={styles.text}>{displayPost.content}</Text>
        </View>
      )}
      
      {/* 图片展示 */}
      {images && images.length > 0 && (
        <View
          className={`${styles.images} ${
            images.length === 1
              ? styles.singleImage
              : images.length === 2
                ? styles.doubleImage
                : styles.gridImage
          }`}
        >
          {images.slice(0, mode === 'detail' ? images.length : 3).map((url, index) => (
            <Image
              key={index}
              src={url || ''}
              className={styles.postImage}
              mode="aspectFill"
              onClick={() => mode === 'detail' ? previewImage(url) : navigateToDetail(null)}
            />
          ))}
        </View>
      )}
      
      {/* 标签展示 */}
      {(tags && Array.isArray(tags) && tags.length > 0) && (
        <View className={styles.tagsSection}>
          {tags.slice(0, mode === 'detail' ? tags.length : 3).map((tag, index) => (
            <View key={index} className={styles.tag}>
              <Text className={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {location && mode === 'detail' && (
            <View className={styles.locationTag}>
              <Image src={locationIcon} className={styles.locationIcon} />
              <Text className={styles.tagText}>{location}</Text>
            </View>
          )}
        </View>
      )}
      
      {/* 底部操作栏 */}
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
            count={displayPost.comment_count}
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
          <Image src={mode === 'detail' ? shareIcon : sendIcon} style={{ width: '100%', height: '100%' }} />
        </View>
      </View>
    </View>
  );
};

export default Post;