import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, Swiper, SwiperItem, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { getNoteDetail } from '@/services/api/note';
import { getActionStatus } from '@/services/api/user';
import { NoteDetail, NoteRead } from '@/types/api/note';
import { normalizeImageUrl } from '@/utils/image';
import { formatPostDate } from '@/utils/time';
import CustomHeader from '@/components/custom-header';
import ActionBar from '@/components/action-bar';
import { useSharing } from '@/hooks/useSharing';
import heartIcon from '@/assets/heart.svg';
import heartFilledIcon from '@/assets/heart-bold.svg';
import bookmarkIcon from '@/assets/star-outline.svg';
import bookmarkFilledIcon from '@/assets/star-filled.svg';
import shareIcon from '@/assets/share.svg';
import commentIcon from '@/assets/message-circle.svg';
import styles from './index.module.scss';

export default function NoteDetailPage() {
  const router = useRouter();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  
  // 状态管理
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  
  // 交互状态
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  
  // 获取笔记ID和用户ID
  const noteId = router?.params?.id;
  const userId = router?.params?.userId; // 发帖人的ID

  // 使用分享 Hook
  useSharing({
    title: note?.title || '分享笔记',
    path: `/pages/subpackage-interactive/note-detail/index?id=${noteId}${userId ? `&userId=${userId}` : ''}`,
    imageUrl: note?.images?.[0] ? normalizeImageUrl(note.images[0]) : undefined,
  });

  // 加载笔记详情
  const loadNoteDetail = useCallback(async () => {
    if (!noteId) {
      setError('笔记ID不存在');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (userId) {
        // 如果有userId，使用用户笔记列表接口获取该用户的笔记列表
        const response = await getNoteDetail(noteId, userId);

        if (response.code === 0 && response.data) {
          // 从用户笔记列表中筛选出特定笔记
          const userNotes = response.data as NoteRead[];

          if (!Array.isArray(userNotes)) {
            setError('API返回数据格式错误');
            setLoading(false);
            return;
          }

          const noteData = userNotes.find((noteItem: NoteRead) => noteItem.id === noteId);

          if (!noteData) {
            setError('笔记不存在或已被删除');
            setLoading(false);
            return;
          }

          // 将NoteRead转换为NoteDetail格式
          const noteDetailData: NoteDetail = {
            id: noteData.id,
            title: noteData.title,
            content: noteData.content || '',
            images: noteData.images || [],
            tags: noteData.tags || [],
            location: noteData.location || null,
            visibility: noteData.visibility || 'PUBLIC',
            allow_comment: noteData.allow_comment || true,
            allow_share: noteData.allow_share || true,
            status: noteData.status || 'published',
            created_at: noteData.created_at instanceof Date ? noteData.created_at.toISOString() : new Date().toISOString(),
            updated_at: noteData.updated_at instanceof Date ? noteData.updated_at.toISOString() : new Date().toISOString(),
            published_at: noteData.published_at instanceof Date ? noteData.published_at.toISOString() : null,
            view_count: noteData.view_count || 0,
            like_count: noteData.like_count || 0,
            comment_count: noteData.comment_count || 0,
            share_count: noteData.share_count || 0,
            user: noteData.user ? {
              id: noteData.user.id,
              tenant_id: noteData.user.tenant_id,
              created_at: noteData.user.created_at instanceof Date ? noteData.user.created_at.toISOString() : new Date().toISOString(),
              updated_at: noteData.user.updated_at instanceof Date ? noteData.user.updated_at.toISOString() : new Date().toISOString(),
              nickname: noteData.user.nickname,
              avatar: noteData.user.avatar || '',
              bio: noteData.user.bio || '',
              birthday: noteData.user.birthday instanceof Date ? noteData.user.birthday.toISOString() : null,
              school: noteData.user.school || null,
              college: noteData.user.college || null,
              location: noteData.user.location || null,
              wechat_id: noteData.user.qq_id || null,
              qq_id: noteData.user.qq_id || null,
              tel: noteData.user.tel || null,
              status: noteData.user.status
            } : undefined,
            author: noteData.user ? {
              id: noteData.user.id,
              nickname: noteData.user.nickname,
              avatar: noteData.user.avatar || '',
              level: noteData.user.level || 1,
              bio: noteData.user.bio || ''
            } : undefined,
            is_liked: noteData.is_liked || false,
            is_favorited: noteData.is_favorited || false
          };

          setNote(noteDetailData);
          // 设置交互状态和计数
          setIsLiked(Boolean(noteData.is_liked));
          setIsBookmarked(Boolean(noteData.is_favorited));
          setLikeCount(noteData.like_count || 0);
          setFavoriteCount(noteData.favorite_count || 0);
          setShareCount(noteData.share_count || 0);
        } else {
          setError(response.message || '加载失败');
        }
      } else {
        // 如果没有userId，直接使用noteId获取笔记详情（向后兼容）
        const response = await getNoteDetail(noteId);

        if (response.code === 0 && response.data) {
          const noteData = response.data as unknown as NoteDetail;

          setNote(noteData);
          // 检查是否已点赞和收藏
          setIsLiked(noteData.is_liked || false);
          setIsBookmarked(noteData.is_favorited || false);
          // 设置计数
          setLikeCount(noteData.like_count || 0);
          setFavoriteCount(noteData.favorite_count || 0);
          setShareCount(noteData.share_count || 0);
        } else {
          setError(response.message || '加载失败');
        }
      }

      // 如果用户已登录，主动查询用户的点赞收藏状态
      if (isLoggedIn && noteId) {
        try {
          // 查询点赞状态
          const likeResponse = await getActionStatus(noteId, 'note', 'like');
          
          if (likeResponse.code === 0 && likeResponse.data) {
            setIsLiked(likeResponse.data.is_active);
            setLikeCount(likeResponse.data.count || 0);
          }
        } catch (_error) {
          // 如果查询失败，保持原有状态
        }

        try {
          // 查询收藏状态
          const favoriteResponse = await getActionStatus(noteId, 'note', 'favorite');
          
          if (favoriteResponse.code === 0 && favoriteResponse.data) {
            setIsBookmarked(favoriteResponse.data.is_active);
            setFavoriteCount(favoriteResponse.data.count || 0);
          }
        } catch (_error) {
          // 如果查询失败，保持原有状态
        }
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [noteId, userId, isLoggedIn]);
  
  // 页面显示时加载数据
  useDidShow(() => {
    if (noteId) {
      loadNoteDetail();
    }
  });
  
  // 处理图片轮播变化
  const handleImageChange = (e: any) => {
    setCurrentImageIndex(e.detail.current);
  };

  // 处理图片预览
  const handleImagePreview = (imageUrl: string, index: number) => {
    const images = note?.images || [];
    Taro.previewImage({
      urls: images, // 传入所有图片URL数组
      current: index, // 当前图片索引
      success: () => {
        // console.log('图片预览成功');
      },
      fail: (_err) => {
        // console.error('图片预览失败:', _err);
      }
    });
  };

  // 处理评论提交
  const handleCommentSubmit = () => {
    if (!commentText.trim()) {
      Taro.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }
    
    if (!isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    // TODO: 调用评论API
    // console.log('提交评论:', commentText);
    setCommentText('');
    Taro.showToast({
      title: '评论成功',
      icon: 'success'
    });
  };

  // 渲染加载状态
  if (loading) {
    return (
      <View className={styles.container}>
        <CustomHeader title='笔记详情' />
        <View className={styles.content}>
          <View className={styles.loadingContainer}>
            <Text className={styles.loadingText}>加载中...</Text>
          </View>
        </View>
      </View>
    );
  }

  // 渲染错误状态
  if (error || !note) {
    return (
      <View className={styles.container}>
        <CustomHeader title='笔记详情' />
        <View className={styles.content}>
          <View className={styles.errorContainer}>
            <Text className={styles.errorText}>{error || '笔记不存在'}</Text>
            <View className={styles.retryButton} onClick={loadNoteDetail}>
              <Text>重新加载</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
  
  // 获取图片数组
  const images: string[] = note.images || [];
  const hasImages = images.length > 0;

  return (
    <View className={styles.container}>
      <CustomHeader title='笔记详情' />
      
      <View className={styles.content}>
        <ScrollView
          scrollY
          className={styles.scrollView}
          enableBackToTop
        >
          {/* 笔记头部信息 */}
          <View className={styles.noteHeader}>
            {/* 自定义作者信息布局 */}
            {note.user && (
              <View className={styles.authorSection}>
                <View className={styles.customAuthorInfo}>
                  <Image
                    src={note.user.avatar ? normalizeImageUrl(note.user.avatar) : '/assets/avatar1.png'}
                    className={styles.authorAvatar}
                    mode='aspectFill'
                  />
                  <View className={styles.authorDetails}>
                    <View className={styles.nameAndLevel}>
                      <Text className={styles.authorName}>{note.user.nickname || '匿名用户'}</Text>
                      <Text className={styles.authorLevel}>Lv.{note.author?.level || 1}</Text>
                    </View>
                    {note.user.bio && (
                      <Text className={styles.authorBio}>{note.user.bio}</Text>
                    )}
                  </View>
                  <View className={styles.authorActions}>
                    {/* 只有当前用户不是笔记作者时才显示关注按钮 */}
                    {note.user && note.user.id !== userId && (
                      <View className={styles.followButton}>
                        <Text className={styles.followText}>关注</Text>
                      </View>
                    )}
                    <Text className={styles.publicationTime}>
                      {note.created_at ? formatPostDate(note.created_at) : '时间未知'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            {/* 标签 */}
            {note.tags && note.tags.length > 0 && (
              <View className={styles.tagsContainer}>
                {note.tags.map((tag, index) => (
                  <View key={index} className={styles.tag}>
                    <Image className={styles.tagIcon} src='/assets/check-square.svg' />
                    <Text className={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          {/* 图片轮播 */}
          {hasImages && (
            <View className={styles.imageSection}>
              <Swiper
                className={styles.imageContainer}
                indicatorDots={false}
                autoplay={false}
                onChange={handleImageChange}
              >
                {images.map((image, index) => (
                  <SwiperItem key={index}>
                    <Image 
                      className={styles.image}
                      src={image}
                      mode='aspectFit'
                      onClick={() => handleImagePreview(image, index)}
                    />
                  </SwiperItem>
                ))}
              </Swiper>
              
              {/* 图片计数器 */}
              <Text className={styles.imageCounter}>
                {currentImageIndex + 1}/{images.length}
              </Text>
              
              {/* 图片指示点 */}
              <View className={styles.imageDots}>
                {images.map((_, index) => (
                  <View 
                    key={index} 
                    className={`${styles.dot} ${index === currentImageIndex ? styles.active : ''}`}
                  />
                ))}
              </View>
            </View>
          )}
          
          {/* 笔记内容 */}
          <View className={styles.noteContent}>
            <Text className={styles.noteTitle}>{note.title}</Text>
            <Text className={styles.contentText}>{note.content}</Text>
          </View>
          
          {/* 资源清单 */}
          <View className={styles.resourceSection}>
            <View className={styles.sectionTitle}>
              <Image className={styles.sectionIcon} src='/assets/book.svg' />
              <Text>资源清单</Text>
            </View>
            <View className={styles.resourceList}>
              <View className={styles.resourceItem}>
                <Image className={styles.resourceIcon} src='/assets/check-square.svg' />
                <View className={styles.resourceInfo}>
                  <Text className={styles.resourceName}>教材精讲笔记与重难点解析</Text>
                  <Text className={styles.resourceMeta}>包含核心知识点和重点难点</Text>
                </View>
              </View>
              <View className={styles.resourceItem}>
                <Image className={styles.resourceIcon} src='/assets/check-square.svg' />
                <View className={styles.resourceInfo}>
                  <Text className={styles.resourceName}>典型例题与习题详解</Text>
                  <Text className={styles.resourceMeta}>300+精选例题与详细解析</Text>
                </View>
              </View>
              <View className={styles.resourceItem}>
                <Image className={styles.resourceIcon} src='/assets/check-square.svg' />
                <View className={styles.resourceInfo}>
                  <Text className={styles.resourceName}>历年期中期末真题解析</Text>
                  <Text className={styles.resourceMeta}>20套历年真题配套答案</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* 下载地址 */}
          <View className={styles.resourceSection}>
            <View className={styles.sectionTitle}>
              <Image className={styles.sectionIcon} src='/assets/folder.svg' />
              <Text>下载地址</Text>
            </View>
            <View className={styles.resourceList}>
              <View className={styles.resourceItem}>
                <Image className={styles.resourceIcon} src='/assets/download.svg' />
                <View className={styles.resourceInfo}>
                  <Text className={styles.resourceName}>站内精简版</Text>
                  <Text className={styles.resourceMeta}>完备度 95% · 2025秋季版</Text>
                </View>
                <View className={styles.downloadButton}>
                  <Text>立即下载</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* 评论区域 */}
          <View className={styles.commentSection}>
            <View className={styles.commentHeader}>
              <Text className={styles.commentCount}>评论 {note.comment_count || 0}</Text>
            </View>
            
            <View className={styles.commentList}>
              <View className={styles.commentItem}>
                <Image 
                  className={styles.commentAvatar}
                  src='/assets/avatar1.png'
                  mode='aspectFill'
                />
                <View className={styles.commentContent}>
                  <Text className={styles.commentAuthor}>Sarah Chen</Text>
                  <Text className={styles.commentText}>习题解析很详细，感谢分享！</Text>
                  <Text className={styles.commentTime}>4分钟前</Text>
                </View>
              </View>
              
              <View className={styles.commentItem}>
                <Image 
                  className={styles.commentAvatar}
                  src='/assets/avatar2.png'
                  mode='aspectFill'
                />
                <View className={styles.commentContent}>
                  <Text className={styles.commentAuthor}>David Wang</Text>
                  <Text className={styles.commentText}>整理得很系统，建议积分部分多些例题</Text>
                  <Text className={styles.commentTime}>16分钟前</Text>
                </View>
              </View>
              
              <View className={styles.commentItem}>
                <Image 
                  className={styles.commentAvatar}
                  src='/assets/avatar1.png'
                  mode='aspectFill'
                />
                <View className={styles.commentContent}>
                  <Text className={styles.commentAuthor}>Emma Liu</Text>
                  <Text className={styles.commentText}>助教推荐，建议按学习路径使用</Text>
                  <Text className={styles.commentTime}>45分钟前</Text>
                </View>
              </View>
            </View>
            
            {/* 评论输入框 */}
            <View className={styles.commentInput}>
              <Textarea
                className={styles.inputField}
                value={commentText}
                onInput={(e) => setCommentText(e.detail.value)}
                placeholder='写下你的评论...'
                maxlength={500}
                autoHeight
              />
              <View className={styles.sendButton} onClick={handleCommentSubmit}>
                <Image className={styles.sendIcon} src={commentIcon} />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      
      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <ActionBar
          targetId={noteId || ''}
          targetType='note'
          initialStates={{
            'like-0': { isActive: isLiked, count: likeCount },
            'favorite-1': { isActive: isBookmarked, count: favoriteCount },
            'comment-2': { isActive: false, count: note.comment_count || 0 },
            'share-3': { isActive: false, count: shareCount }
          }}
          buttons={[
            {
              type: 'like',
              icon: heartIcon,
              activeIcon: heartFilledIcon,
            },
            {
              type: 'favorite',
              icon: bookmarkIcon,
              activeIcon: bookmarkFilledIcon,
            },
            {
              type: 'comment',
              icon: commentIcon,
            },
            {
              type: 'share',
              icon: shareIcon,
            }
          ]}
          onStateChange={(type, isActive, count) => {
            // ActionBar 已经处理了操作，这里可以添加额外的业务逻辑
            if (type === 'like') {
              setIsLiked(isActive);
              setLikeCount(count);
            } else if (type === 'favorite') {
              setIsBookmarked(isActive);
              setFavoriteCount(count);
            } else if (type === 'comment') {
              // 评论按钮被点击，聚焦到评论输入框
              // 这里可以实现滚动到评论区域并聚焦输入框的逻辑
            } else if (type === 'share') {
              // 分享操作完成后，增加分享计数
              setShareCount(prev => prev + 1);
            }
          }}
        />
      </View>
    </View>
  );
} 