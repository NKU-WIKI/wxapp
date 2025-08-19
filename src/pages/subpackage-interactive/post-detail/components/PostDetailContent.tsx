import React, { useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { useState, useRef } from 'react';
import Taro from '@tarojs/taro';
import styles from '../index.module.scss';
import { Post } from '@/types/api/post';
import { formatRelativeTime } from '@/utils/time';
import { normalizeImageUrl, normalizeImageUrls } from '@/utils/image';
import HeartIcon from '@/assets/heart-outline.svg';
import HeartActiveIcon from '@/assets/heart-bold.svg';
import StarOutlineIcon from '@/assets/star-outline.svg';
import StarFilledIcon from '@/assets/star-filled.svg';
import ShareIcon from '@/assets/share.svg';
import LocationIcon from '@/assets/map-pin.svg';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { toggleAction } from '@/store/slices/actionSlice';
import { PostsState } from '@/store/slices/postSlice';

interface PostDetailContentProps {
  post: Post;
}

const PostDetailContent: React.FC<PostDetailContentProps> = ({ post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const lastActionTimeRef = useRef<number>(0);
  const DEBOUNCE_DELAY = 500; // 500ms 防抖间隔
  const userState = useSelector((state: RootState) => state.user);
  const token = userState?.token || null;
  const isLoggedIn = userState?.isLoggedIn || false;
  
  const postState = useSelector((state: RootState) => state.post) as PostsState;
  const currentPost = postState?.currentPost || null;
  
  // 直接使用 Redux 中的状态，如果 Redux 中没有则使用 props 中的
  const displayPost = currentPost && currentPost.id === post.id ? currentPost : post;
  
  // 确保布尔值转换正确
  const isLiked = displayPost.is_liked === true;
  const isFavorited = displayPost.is_favorited === true;
  
  // 使用帖子的 like_count 和 favorite_count 属性，如果为 undefined 则显示 0
  // 如果用户已点赞/收藏但数量为0，则显示1
  const likeCount = isLiked && displayPost.like_count === 0 ? 1 : (displayPost.like_count || 0);
  const favoriteCount = isFavorited && displayPost.favorite_count === 0 ? 1 : (displayPost.favorite_count || 0);
  
  // 调试：显示当前状态
  useEffect(() => {
    // 移除调试日志，保持代码整洁
  }, [token, isLoggedIn, post.id, isLiked, likeCount, post.is_liked, post.like_count, currentPost]);
  
  // 检查登录状态
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
  
  // 处理点赞
  const handleLike = () => {
    if (!checkLogin()) return;

    // 增强的防抖动机制：检查时间间隔和加载状态
    const currentTime = Date.now();
    if (isActionLoading) {
      Taro.showToast({ title: '操作太快了，请稍等', icon: 'none' });
      return;
    }
    
    // 检查时间间隔
    if (currentTime - lastActionTimeRef.current < DEBOUNCE_DELAY) {
      Taro.showToast({ title: '操作太快了，请稍等', icon: 'none' });
      return;
    }
    
    // 更新最后操作时间
    lastActionTimeRef.current = currentTime;

    setIsActionLoading(true);
    
    // 调用API进行点赞/取消点赞
    dispatch(toggleAction({ 
      target_id: post.id,
      target_type: 'post' as const,
      action_type: 'like' as const,
      active: !isLiked
    })).then((result: any) => {
      if (result.payload && result.payload.is_active !== undefined) {
        const { is_active } = result.payload;
        
        // 显示提示
        Taro.showToast({
          title: is_active ? '点赞成功' : '已取消点赞',
          icon: 'none',
          duration: 1500
        });
      }
    }).catch(error => {
      console.error('点赞操作失败', error);
      
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
    }).finally(() => {
      setIsActionLoading(false);
    });
  };
  
  // 处理收藏
  const handleFavorite = () => {
    if (!checkLogin()) return;

    // 增强的防抖动机制：检查时间间隔和加载状态
    const currentTime = Date.now();
    if (isActionLoading) {
      Taro.showToast({ title: '操作太快了，请稍等', icon: 'none' });
      return;
    }
    
    // 检查时间间隔
    if (currentTime - lastActionTimeRef.current < DEBOUNCE_DELAY) {
      Taro.showToast({ title: '操作太快了，请稍等', icon: 'none' });
      return;
    }
    
    // 更新最后操作时间
    lastActionTimeRef.current = currentTime;

    setIsActionLoading(true);
    
    // 调用API进行收藏/取消收藏
    dispatch(toggleAction({ 
      target_id: post.id,
      target_type: 'post' as const,
      action_type: 'favorite' as const,
      active: !isFavorited
    })).then((result: any) => {
      if (result.payload && result.payload.is_active !== undefined) {
        const { is_active } = result.payload;
        
        // 显示提示
        Taro.showToast({
          title: is_active ? '收藏成功' : '已取消收藏',
          icon: 'none',
          duration: 1500
        });
      }
    }).catch(error => {
      console.error('收藏操作失败', error);
      
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
    }).finally(() => {
      setIsActionLoading(false);
    });
  };
  
  // 处理评论
  /* 暂时注释掉未使用的函数
  const scrollToComments = () => {
    // 滚动到评论区域
    Taro.createSelectorQuery()
      .select('.commentsSection')
      .boundingClientRect((rect: any) => {
        if (rect && rect.top) {
          Taro.pageScrollTo({
            scrollTop: rect.top,
            duration: 300
          });
        }
      })
      .exec();
  };
  */
  
  // 处理分享
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
    });
    
    // 显示自定义分享菜单
    Taro.showActionSheet({
      itemList: ['分享给朋友', '分享到朋友圈', '复制链接'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            // 分享给朋友
            break;
          case 1:
            // 分享到朋友圈
            break;
          case 2:
            // 复制链接
            Taro.setClipboardData({
              data: `https://nkuwiki.com/post/${post.id}`,
              success: () => {
                Taro.showToast({
                  title: '链接已复制',
                  icon: 'success'
                });
              }
            });
            break;
        }
      }
    });
  };
  
  // 处理标签数据
  const getTags = () => {
    // 如果标签是数组，直接使用
    if (post.tag && Array.isArray(post.tag)) {
      return post.tag;
    }
    
    // 如果标签是字符串，尝试解析
    if (post.tag && typeof post.tag === 'string') {
      try {
        return JSON.parse(post.tag);
      } catch (error) {
        console.error('解析标签失败:', error);
        return [];
      }
    }
    
    return [];
  };
  
  // 获取标签列表
  const tags = getTags();
  
  // 获取图片 - 优先使用 image_urls 字段，因为后端返回的是这个字段
  let images: string[] = [];
  if (post.image_urls && Array.isArray(post.image_urls)) {
    images = normalizeImageUrls(post.image_urls);
  } else if (post.image && Array.isArray(post.image)) {
    images = normalizeImageUrls(post.image);
  }
  
  // 解析位置信息
  let location = null;
  try {
    if (post.location && typeof post.location === 'string') {
      const locationObj = JSON.parse(post.location);
      location = locationObj.name;
    }
  } catch (error) {
    console.error('解析位置信息失败', error);
  }
  
  return (
    <View className={styles.postWrapper}>
      {/* 标题部分 */}
      <View className={styles.titleSection}>
        <Text className={styles.title}>{post.title}</Text>
      </View>
      
      {/* 用户信息 */}
      <View className={styles.userInfo}>
        <View className={styles.authorInfo}>
          <Image 
            src={normalizeImageUrl(post.author_info?.avatar || '')} 
            className={styles.avatar} 
          />
          <View className={styles.userMeta}>
            <View className={styles.nameWrapper}>
              <Text className={styles.authorName}>{post.author_info?.nickname || '匿名用户'}</Text>
              <View className={styles.levelTag}>
                <Text className={styles.levelText}>Lv.{post.author_info?.level || 0}</Text>
              </View>
            </View>
            <Text className={styles.meta}>{formatRelativeTime(post.create_time)}</Text>
          </View>
        </View>
        {post.author_info && (
          <View className={styles.followButton}>
            <Text>+关注</Text>
          </View>
        )}
      </View>
      
      {/* 帖子内容 */}
      <View className={styles.postContent}>
        <Text className={styles.text}>{post.content}</Text>
      </View>
      
      {/* 图片展示 */}
      {images && images.length > 0 && (
        <View 
          className={`${styles.imagesGrid} ${
            images.length === 1 
              ? styles.singleImage 
              : images.length === 2 
                ? styles.doubleImage 
                : styles.gridImage
          }`}
        >
          {images.map((img, index) => (
            <Image
              key={index}
              src={img}
              className={styles.postImage}
              mode="aspectFill"
              onClick={() => {
                Taro.previewImage({
                  current: img,
                  urls: images
                });
              }}
            />
          ))}
        </View>
      )}
      
      {/* 标签展示 */}
      {(tags && tags.length > 0) && (
        <View className={styles.tagsSection}>
          {tags.map((tag, index) => (
            <View key={index} className={styles.tag}>
              <Text className={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {location && (
            <View className={styles.locationTag}>
              <Image src={LocationIcon} className={styles.locationIcon} />
              <Text className={styles.tagText}>{location}</Text>
            </View>
          )}
        </View>
      )}
      
      {/* 底部操作栏 */}
      <View className={styles.actionBar}>
        <View className={styles.actionButton} onClick={handleLike}>
          <Image 
            src={isLiked ? HeartActiveIcon : HeartIcon} 
            className={styles.actionIcon}
          />
          <Text className={`${styles.actionCount} ${isLiked ? styles.active : ''}`}>{likeCount}</Text>
        </View>
        <View className={styles.actionButton} onClick={handleFavorite}>
          <Image 
            src={isFavorited ? StarFilledIcon : StarOutlineIcon} 
            className={styles.actionIcon}
          />
          <Text className={`${styles.actionCount} ${isFavorited ? styles.active : ''}`}>{favoriteCount}</Text>
        </View>
        <View className={styles.actionButton} onClick={handleShare}>
          <Image 
            src={ShareIcon} 
            className={styles.actionIcon}
          />
          <Text className={styles.actionCount}>分享</Text>
        </View>
      </View>
    </View>
  );
};

export default PostDetailContent;