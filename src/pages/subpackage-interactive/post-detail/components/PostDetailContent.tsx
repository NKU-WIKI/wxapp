import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from '../index.module.scss';
import { Post } from '@/types/api/post';
import { formatRelativeTime } from '@/utils/time';
import HeartIcon from '@/assets/heart-outline.svg';
import HeartActiveIcon from '@/assets/heart.svg';
import StarIcon from '@/assets/star.svg';
import ShareIcon from '@/assets/share.svg';
import LocationIcon from '@/assets/map-pin.svg';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { toggleAction } from '@/store/slices/postSlice';

interface PostDetailContentProps {
  post: Post;
}

const PostDetailContent: React.FC<PostDetailContentProps> = ({ post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isLoggedIn } = useSelector((state: RootState) => state.user);
  const currentPost = useSelector((state: RootState) => state.post.currentPost);
  
  // 直接使用 Redux 中的状态，如果 Redux 中没有则使用 props 中的
  const displayPost = currentPost && currentPost.id === post.id ? currentPost : post;
  const isLiked = displayPost.is_liked || false;
  const likeCount = displayPost.like_count || 0;
  
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
    
    // 调用API进行点赞/取消点赞
    dispatch(toggleAction({ 
      postId: post.id, 
      actionType: 'like' 
    })).then((result: any) => {
      if (result.payload && result.payload.response) {
        const { is_active } = result.payload.response;
        
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
    });
  };
  
  // 处理收藏
  const handleFavorite = () => {
    if (!checkLogin()) return;
    
    // 调用API进行收藏/取消收藏
    dispatch(toggleAction({ 
      postId: post.id, 
      actionType: 'favorite' 
    })).then((result: any) => {
      if (result.payload && result.payload.response) {
        const { is_active } = result.payload.response;
        
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
    });
  };
  
  // 处理评论
  const handleComment = () => {
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
  
  // 解析标签
  let tags = [];
  try {
    if (post.tag && typeof post.tag === 'string') {
      tags = JSON.parse(post.tag);
    }
  } catch (error) {
    console.error('解析标签失败:', error);
    tags = [];
  }
  
  // 获取图片 - 优先使用 image_urls 字段，因为后端返回的是这个字段
  let images: string[] = [];
  if (post.image_urls && Array.isArray(post.image_urls)) {
    images = post.image_urls;
  } else if (post.image && Array.isArray(post.image)) {
    images = post.image;
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
            src={post.author_info?.avatar || ''} 
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
      
      {/* 帖子图片 */}
      {images && images.length > 0 && (
        <View className={`${styles.imagesGrid} ${
          images.length === 1 ? styles.singleImage : 
          images.length === 2 ? styles.doubleImage : 
          styles.gridImage
        }`}>
          {images.map((url, index) => (
            <Image key={index} src={url} className={styles.postImage} mode="aspectFill" />
          ))}
        </View>
      )}
      
      {/* 标签和位置 */}
      {(tags.length > 0 || location) && (
        <View className={styles.tagsSection}>
          {tags.map((tag, index) => (
            <View key={index} className={styles.tag}>
              <Text className={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {location && (
            <View className={styles.locationTag}>
              <Image src={LocationIcon} className={styles.locationIcon} />
              <Text className={styles.locationText}>{location}</Text>
            </View>
          )}
        </View>
      )}
      
      {/* 操作栏 */}
      <View className={styles.actionBar}>
        <View className={styles.actionButton} onClick={handleLike}>
          <View 
            className={`${styles.actionIcon} ${isLiked ? styles.active : ''}`}
            style={{ "--icon-url": `url(${HeartIcon})` } as any}
          />
          <Text className={`${styles.actionCount} ${isLiked ? styles.active : ''}`}>{likeCount}</Text>
        </View>
        <View className={styles.actionButton} onClick={handleFavorite}>
          <View 
            className={styles.actionIcon}
            style={{ "--icon-url": `url(${StarIcon})` } as any}
          />
          <Text className={styles.actionCount}>{post.favorite_count || 0}</Text>
        </View>
        <View className={styles.actionButton} onClick={handleShare}>
          <View 
            className={styles.actionIcon}
            style={{ "--icon-url": `url(${ShareIcon})` } as any}
          />
          <Text className={styles.actionCount}>分享</Text>
        </View>
      </View>
    </View>
  );
};

export default PostDetailContent;

