import { View, Text, Image, ITouchEvent } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { showToast } from '@/utils/ui';
import { Post as PostData } from "@/types/api/post.d";

import { normalizeImageUrls } from '@/utils/image';
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { deletePost } from '@/store/slices/postSlice';
import { toggleAction } from '@/store/slices/actionSlice';
import { BBSNotificationHelper } from '@/utils/notificationHelper';
import AuthorInfo from '@/components/author-info';
import ActionBar from '@/components/action-bar';
import { ActionButtonProps } from '@/components/action-button';

// 引入所有需要的图标
import heartIcon from "@/assets/heart-outline.svg";
import heartActiveIcon from "@/assets/heart-bold.svg";
import commentIcon from "@/assets/message-circle.svg";
import starIcon from "@/assets/star-outline.svg";
import starActiveIcon from "@/assets/star-filled.svg";
import sendIcon from "@/assets/send.svg";
import shareIcon from "@/assets/share.svg";

import locationIcon from "@/assets/map-pin.svg";


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
  const userInfo = userState?.user || null;
  
  const getCurrentUserId = () => {
    if (!userInfo) return '';
    return (userInfo as any).id || '';
  };
  
  // 获取用户角色
  const getCurrentUserRole = () => {
    if (!userInfo) return null;
    return (userInfo as any).role || null;
  };
  const posts = postState?.list || [];
  const postFromList = posts.find(p => p.id === post.id);
  const displayPost = { ...(postFromList || {}), ...post } as PostData;
  const author = displayPost.user || displayPost.author_info;
  const isAnonymous = displayPost.is_public === false;

  if (!post) {
    return null;
  }

  const DEBOUNCE_DELAY = 500;
  // 直接从 displayPost 获取状态，不使用本地状态管理
  const isLiked = displayPost.is_liked === true;
  const isFavorited = displayPost.is_favorited === true;

  
  // 直接从 displayPost 获取计数，不使用本地状态管理
  const likeCount = Math.max(0, displayPost.like_count || 0);
  const favoriteCount = Math.max(0, displayPost.favorite_count || 0);
  const commentCount = Math.max(0, displayPost.comment_count || 0);
  
  // 解析图片
  const getImages = () => {
    if (Array.isArray((displayPost as any).images)) {
      return normalizeImageUrls((displayPost as any).images as string[]);
    }else return [];
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

    const tagsAny = (displayPost as any).tags;
    if (Array.isArray(tagsAny)) {
      const out = tagsAny.map(normalize).filter((t) => t.length > 0);
      return out;
    }else return [];
  };
  
  const tags = getTags();
  
  // 解析位置信息
  const getLocation = () => {
    if (displayPost.location && typeof displayPost.location === 'string') {
      try {
        const locationObj = JSON.parse(displayPost.location);
        return locationObj.name;
      } catch (error) {
        
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
            .catch((_error) => {
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
  const handleActionClick = (e, actionType: 'like' | 'favorite' | 'share' | 'comment') => {
    e.stopPropagation();
    
    // 防抖动机制
    const currentTime = Date.now();
    if (actionType === 'like' || actionType === 'favorite') {
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
            
            
            // 如果操作成功且状态变为激活（点赞/收藏），创建通知
            if (result.payload.is_active && getCurrentUserId() !== author?.id && !isAnonymous) {
              
              
              if (actionType === 'like') {
                BBSNotificationHelper.handleLikeNotification({
                  postId: displayPost.id,
                  postTitle: displayPost.title,
                  postAuthorId: author?.id || '',
                  currentUserId: getCurrentUserId(),
                  isLiked: result.payload.is_active
                }).then(() => {
                  // 点赞通知发送成功
                }).catch((_error) => {
                  // 忽略通知发送错误
                });
              } else if (actionType === 'favorite') {
                BBSNotificationHelper.handleCollectNotification({
                  postId: displayPost.id,
                  postTitle: displayPost.title,
                  postAuthorId: author?.id || '',
                  currentUserId: getCurrentUserId(),
                  isCollected: result.payload.is_active
                }).then(() => {
                  // 收藏通知发送成功
                }).catch((_error) => {
                  // 忽略通知发送错误
                });
              }
            } else {
              
            }
            // 移除本地状态更新，完全依赖Redux store更新
          }
        }).catch(error => {
          
          
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
    }
  };

  // 预览图片
  const previewImage = (currentImage: string) => {
    Taro.previewImage({
      current: currentImage,
      urls: images
    });
  };
  
  // 判断是否可以删除
  const canDelete = getCurrentUserId() === author?.id || getCurrentUserRole() === 'admin';

  const actionBarButtons: ActionButtonProps[] = [
    {
      icon: heartIcon,
      activeIcon: heartActiveIcon,
      text: likeCount,
      isActive: isLiked,
      onClick: (e) => handleActionClick(e, 'like'),
      className: isLiked ? styles.active : '',
    },
    {
      icon: commentIcon,
      text: commentCount,
      onClick: (e) => handleActionClick(e, 'comment'),
    },
    {
      icon: starIcon,
      activeIcon: starActiveIcon,
      text: favoriteCount,
      isActive: isFavorited,
      onClick: (e) => handleActionClick(e, 'favorite'),
      className: isFavorited ? styles.active : '',
    },
  ];

  return (
    <View className={`${styles.postContainer} ${styles[mode]} ${className}`}>


      {/* 用户信息区域 */}
      <View className={styles.userInfo}>
        <AuthorInfo
          userId={author?.id || ''}
          mode='compact'
          showBio={mode === 'list' && !isAnonymous}
          showFollowButton={getCurrentUserId() !== author?.id && !isAnonymous}
          showStats={false}
          showLevel
          showTime={mode === 'list'}
          createTime={mode === 'list' ? ((displayPost as any).created_at || displayPost.create_time) : undefined}
          showMoreButton={canDelete}
          onMoreClick={handleDeletePost}
        />
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
        <ActionBar buttons={actionBarButtons} className={styles.actions} />
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
