import { View, Text, Image, ITouchEvent } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { showToast } from '@/utils/ui';
import { Post as PostData } from "@/types/api/post.d";
import { formatRelativeTime } from "@/utils/time";
import { normalizeImageUrl, normalizeImageUrls } from '@/utils/image';
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { deletePost } from '@/store/slices/postSlice';
import { toggleAction } from '@/store/slices/actionSlice';

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
import profileIcon from "@/assets/profile.svg"; // 匿名用户头像

import styles from "./index.module.scss";

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
  const dispatch = useDispatch<AppDispatch>();
  const { checkAuth } = useAuthGuard();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const lastActionTimeRef = useRef<number>(0);
  const userState = useSelector((state: RootState) => state.user);
  const postState = useSelector((state: RootState) => state.post);
  const [localFollowStatus, setLocalFollowStatus] = useState<boolean | null>(null);
  
  // 获取登录状态
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  // 提前声明avatar相关的状态，避免条件调用
  const [avatarSrc, setAvatarSrc] = useState<string>('');
  const [authorLevel, setAuthorLevel] = useState<number | null>(null);

  // 提前声明currentUser相关的变量，用于useEffect
  const userInfo = (userState as any)?.userProfile || null;
  const posts = postState?.list || [];
  const postFromList = posts.find(p => p.id === post.id);
  const displayPost = { ...(postFromList || {}), ...post } as PostData;
  const author = displayPost.user || displayPost.author_info;
  const isAnonymous = displayPost.is_public === false;
  const anonymousUser = {
    nickname: '匿名用户',
    avatar: profileIcon,
    bio: '',
    level: displayPost.user?.level || 0
  };
  const currentUser = isAnonymous ? anonymousUser : author;

  useEffect(() => {
    if (post) {
      setAvatarSrc(normalizeImageUrl(currentUser?.avatar || '') || DEFAULT_AVATAR);
    }
  }, [currentUser?.avatar, setAvatarSrc, post]);

  // 获取发帖人的等级信息
  useEffect(() => {
    // 由于后端没有提供获取其他用户详细信息的API，我们使用帖子数据中的用户信息
    // 如果帖子数据中没有等级信息，使用默认等级1
    if (!isAnonymous && author) {
      setAuthorLevel(author.level || 1);
    } else {
      // 匿名用户使用默认等级
      setAuthorLevel(1);
    }
  }, [author, isAnonymous]);

  if (!post) {
    return null;
  }

    const DEBOUNCE_DELAY = 500;
  const DEFAULT_AVATAR = '/assets/avatar1.png';

  // 初始化avatar状态
  if (avatarSrc === '') {
    setAvatarSrc(normalizeImageUrl(currentUser?.avatar || '') || DEFAULT_AVATAR);
  }
  
  // 直接从 displayPost 获取状态，不使用本地状态管理
  const isLiked = displayPost.is_liked === true;
  const isFavorited = displayPost.is_favorited === true;
  // 关注状态：优先使用本地状态，其次使用传入的状态
  const isFollowing = localFollowStatus !== null ? localFollowStatus : (displayPost.is_following_author === true);
  
  // 直接从 displayPost 获取计数，不使用本地状态管理
  const likeCount = Math.max(0, displayPost.like_count || 0);
  const favoriteCount = Math.max(0, displayPost.favorite_count || 0);
  const commentCount = Math.max(0, displayPost.comment_count || 0);
  
  // 解析图片
  const getImages = () => {
    // 优先使用新版字段 images: string[]
    if (Array.isArray((displayPost as any).images)) {
      return normalizeImageUrls((displayPost as any).images as string[]);
    }
    // 其次兼容 image_urls: string[]
    if (Array.isArray((displayPost as any).image_urls)) {
      return normalizeImageUrls((displayPost as any).image_urls as string[]);
    }
    // 兼容旧版 image: string | string[] | json-string
    const legacy = (displayPost as any).image;
    if (legacy) {
      if (typeof legacy === 'string') {
        try {
          const parsed = JSON.parse(legacy);
          return Array.isArray(parsed) ? normalizeImageUrls(parsed) : [];
        } catch {
          return [];
        }
      }
      if (Array.isArray(legacy)) {
        return normalizeImageUrls(legacy);
      }
    }
    return [];
  };
  
  const images = getImages();
  
  // 处理标签数据（清洗引号/空白/前导#）
  const getTags = () => {
    const normalize = (val: any): string => {
      let s = typeof val === 'string' ? val : (val?.name || '');
      s = String(s).replace(/[“”"']/g, '').trim();
      if (s.startsWith('#')) s = s.slice(1);
      return s;
    };

    // 新版字段 tags: string[] | TagRead[]
    const tagsAny = (displayPost as any).tags;
    if (Array.isArray(tagsAny)) {
      const out = tagsAny.map(normalize).filter((t) => t.length > 0);
      return out;
    }

    // 兼容旧版字段 tag: string | string[] | json-string
    const legacy = (displayPost as any).tag;
    if (Array.isArray(legacy)) {
      return legacy.map(normalize).filter((t: string) => t.length > 0);
    }
    if (legacy && typeof legacy === 'string') {
      try {
        const parsed = JSON.parse(legacy);
        return Array.isArray(parsed)
          ? parsed.map(normalize).filter((t: string) => t.length > 0)
          : [];
      } catch {
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
  
  // 跳转到详情页
  const navigateToDetail = (e?: ITouchEvent | null) => {
    if (e) {
      e.stopPropagation();
    }
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
      // 传递用户信息到用户详情页
      const userParams = {
        userId: author.id,
        nickname: encodeURIComponent(author.nickname || '未知用户'),
        avatar: author.avatar || '',
        bio: encodeURIComponent(author.bio || ''),
        level: author.level || 1,
        follower_count: author.follower_count || 0,
        following_count: author.following_count || 0,
        post_count: author.post_count || 0,
      };
      
      const queryString = Object.entries(userParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
        
      Taro.navigateTo({ 
        url: `/pages/subpackage-profile/user-detail/index?${queryString}` 
      });
    }
  };
  
  // 处理关注按钮点击
  const handleFollowClick = (e: any) => {
    e.stopPropagation();
    
    // 如果未登录，弹出登录提示
    if (!isLoggedIn) {
      Taro.showModal({
        title: '需要登录',
        content: '请先登录后再关注用户',
        confirmText: '去登录',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' });
          }
        }
      });
      return;
    }
    
    if (!checkAuth() || !author) return;
    
    dispatch(toggleAction({
      target_id: author.id,
      target_type: 'user',
      action_type: 'follow'
    })).then((result: any) => {
      if (result.payload && result.payload.is_active !== undefined) {
        // 更新本地关注状态
        setLocalFollowStatus(result.payload.is_active);
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
          dispatch(deletePost(displayPost.id))
            .then(() => {
              // 删除成功后显示提示
              Taro.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });

              // 如果在详情页，删除后返回上一页
              if (mode === 'detail') {
                setTimeout(() => {
                  Taro.navigateBack();
                }, 1500);
              }
            })
            .catch((error) => {
              console.error('删除失败:', error);
              Taro.showToast({
                title: '删除失败，请重试',
                icon: 'none',
                duration: 2000
              });
            });
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
            // 移除本地状态更新，完全依赖Redux store更新
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

      
      {/* 用户信息区域 */}
      <View className={styles.userInfo}>
        <View className={styles.authorInfo} onClick={isAnonymous ? undefined : navigateToProfile}>
          <Image
            src={avatarSrc}
            className={styles.avatar}
            mode='aspectFill'
            onError={() => setAvatarSrc(DEFAULT_AVATAR)}
          />
          <View className={styles.authorDetails}>
            <View className={styles.authorMainRow}>
              <Text className={styles.authorName}>{currentUser?.nickname || '匿名'}</Text>
              <View className={styles.levelBadge}>
                <Text>Lv.{authorLevel || currentUser?.level || 1}</Text>
              </View>
              {userInfo?.id !== author?.id && mode === 'detail' && !isAnonymous && (
                <View
                  className={`${styles.followButton} ${isLoggedIn && isFollowing ? styles.followed : ''}`}
                  onClick={handleFollowClick}
                >
                  <Text>{isLoggedIn && isFollowing ? '已关注' : '+关注'}</Text>
                </View>
              )}
            </View>
            {mode === 'list' && !isAnonymous && <Text className={styles.authorBio}>{currentUser?.bio || ''}</Text>}
            {mode === 'detail' && (
              <Text className={styles.meta}>
                {formatRelativeTime((displayPost as any).created_at || displayPost.create_time)}
              </Text>
            )}
          </View>
        </View>
        
        <View className={styles.headerActions}>
          {mode === 'list' && userInfo?.id !== author?.id && !isAnonymous && (
            <View
              className={`${styles.followButton} ${isLoggedIn && isFollowing ? styles.followed : ''}`}
              onClick={handleFollowClick}
            >
              <Text>{isLoggedIn && isFollowing ? '已关注' : '关注'}</Text>
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

      {/* 标题部分 - 仅详情态显示 */}
      {mode === 'detail' && (
        <View className={styles.titleSection}>
          <Text className={styles.title}>{displayPost.title}</Text>
        </View>
      )}
      
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
              mode='aspectFill'
              onClick={(e) => mode === 'detail' ? previewImage(url) : navigateToDetail(e)}
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
            action='like'
          />
          <ActionButton
            icon={commentIcon}
            activeIcon={commentIcon}
            count={commentCount}
            isActive={false}
            action='comment'
          />
          <ActionButton
            icon={starIcon}
            activeIcon={starActiveIcon}
            count={favoriteCount}
            isActive={isFavorited}
            action='favorite'
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