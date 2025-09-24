import { View, Text, Image, ITouchEvent } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Post as PostData } from "@/types/api/post.d";

import { normalizeImageUrls } from '@/utils/image';
import { deletePost } from '@/store/slices/postSlice';
import AuthorInfo from '@/components/author-info';
import ActionBar, { ActionButtonConfig } from '@/components/action-bar';

// 引入所有需要的图标
import heartIcon from "@/assets/heart-outline.svg";
import heartActiveIcon from "@/assets/heart-bold.svg";
import commentIcon from "@/assets/message-circle.svg";
import starIcon from "@/assets/star-outline.svg";
import starActiveIcon from "@/assets/star-filled.svg";
import shareIcon from "@/assets/share.svg";

import locationIcon from "@/assets/map-pin.svg";


import styles from "./index.module.scss";

export type PostMode = 'list' | 'detail';

interface PostProps {
  post: PostData;
  className?: string;
  mode?: PostMode;
  enableNavigation?: boolean;
  onMoreClick?: (_postId: string) => void; // 自定义的三个点点击处理
}

/**
 * 统一的Post组件，支持列表态和详情态
 * 
 * @param post - 帖子数据
 * @param className - 额外的样式类名
 * @param mode - 显示模式：'list' | 'detail'，默认为 'list'
 * @param enableNavigation - 是否启用点击跳转，默认为 true
 */
const Post = ({ post, className = "", mode = "list", enableNavigation = true, onMoreClick }: PostProps) => {
  const dispatch = useDispatch<AppDispatch>();
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
    } else return [];
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
    } else return [];
  };

  const tags = getTags();

  // 解析位置信息
  const getLocation = () => {
    if (displayPost.location && typeof displayPost.location === 'string') {
      try {
        const locationObj = JSON.parse(displayPost.location);
        return locationObj.name;
      } catch {

        return null;
      }
    }
    return null;
  };

  const location = getLocation();

  // 跳转到详情页
  const navigateToDetail = (e?: ITouchEvent | null) => {
    // 安全检查：确保事件对象存在 stopPropagation 方法
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (enableNavigation && mode === 'list') {
      Taro.navigateTo({ url: `/pages/subpackage-interactive/post-detail/index?id=${displayPost.id}` });
    }
  };

  // 跳转到用户详情页
  const navigateToUserDetail = () => {
    if (author?.id) {
      // 构造用户参数（不包含userId，因为它会作为路由参数传递）
      const userParams = {
        nickname: encodeURIComponent(author.nickname || '未知用户'),
        avatar: author.avatar || '',
        bio: encodeURIComponent(author.bio || ''),
        level: author.level || 1
      };

      // 构建查询字符串
      const queryString = Object.entries(userParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      Taro.navigateTo({
        url: `/pages/subpackage-profile/user-detail/index?userId=${author.id}&${queryString}`
      }).catch(() => {
        Taro.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      });
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

  // ActionBar 已经完全处理了点赞、收藏、评论、分享等操作

  // 预览图片
  const previewImage = (currentImage: string) => {
    Taro.previewImage({
      current: currentImage,
      urls: images
    });
  };

  // 判断是否可以删除
  const canDelete = getCurrentUserId() === author?.id || getCurrentUserRole() === 'admin';

  // 创建包装函数来处理onMoreClick
  const handleMoreClickWrapper = () => {
    if (onMoreClick) {
      onMoreClick(displayPost.id);
    } else {
      handleDeletePost();
    }
  };

  const actionBarButtons: ActionButtonConfig[] = [
    {
      type: 'like',
      icon: heartIcon,
      activeIcon: heartActiveIcon,
    },
    {
      type: 'comment',
      icon: commentIcon,
    },
    {
      type: 'favorite',
      icon: starIcon,
      activeIcon: starActiveIcon,
    },
    {
      type: 'share',
      icon: shareIcon,
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
          onMoreClick={handleMoreClickWrapper}
          onClick={navigateToUserDetail}
          disableNameTruncate={mode === 'detail'}
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
          className={`${styles.images} ${images.length === 1
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
        <ActionBar
          targetId={post.id}
          targetType='post'
          postInfo={{
            title: post.title,
            authorId: author?.id || ''
          }}
          initialStates={{
            'like-0': { isActive: isLiked, count: likeCount },
            'comment-1': { isActive: false, count: commentCount },
            'favorite-2': { isActive: isFavorited, count: favoriteCount },
            'share-3': { isActive: false, count: post.share_count || 0 }
          }}
          buttons={actionBarButtons}
          className={styles.actions}
          // 增强的登录鉴权配置
          authConfig={{
            disabledWhenNotLoggedIn: false, // 未登录时不禁用按钮，点击时显示登录提示
            loginPrompt: '登录后才能点赞和收藏哦' // 自定义提示消息
          }}
          onStateChange={(_type, _isActive, _count) => {
            // ActionBar 已经处理了操作，这里可以添加额外的逻辑
            // 例如：更新本地状态、发送统计数据等
          }}
        />
      </View>
    </View>
  );
};

export default Post;
