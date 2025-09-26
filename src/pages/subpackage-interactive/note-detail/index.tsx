import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, Swiper, SwiperItem, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { getNoteDetail } from '@/services/api/note';
import { getActionStatus } from '@/services/api/user';
import { getComments, createComment } from '@/services/api/comment';
import type { NoteDetail, NoteRead } from '@/types/api/note';
import { CommentTreeRead, CreateCommentRequest } from '@/types/api/comment';
import { normalizeImageUrl } from '@/utils/image';
import { convertLevelToRealm } from '@/utils/levelConverter';
import { formatPostDate } from '@/utils/time';
import CustomHeader from '@/components/custom-header';
import ActionBar from '@/components/action-bar';
import { useSharing } from '@/hooks/useSharing';
import heartIcon from '@/assets/heart-outline.svg';
import heartFilledIcon from '@/assets/heart-bold.svg';
import bookmarkIcon from '@/assets/star-outline.svg';
import bookmarkFilledIcon from '@/assets/star-filled.svg';
import shareIcon from '@/assets/share.svg';
import commentIcon from '@/assets/message-circle.svg';
import sendIcon from '@/assets/sendcomment.svg';
import styles from './index.module.scss';

export default function NoteDetailPage() {
  const router = useRouter();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');

  const [comments, setComments] = useState<CommentTreeRead[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  const noteId = router?.params?.id;
  const userId = router?.params?.userId;

  useSharing({
    title: note?.title || '笔记详情',
    path: `/pages/subpackage-interactive/note-detail/index?id=${noteId}${userId ? `&userId=${userId}` : ''}`,
    imageUrl: note?.images?.[0] ? normalizeImageUrl(note.images[0]) : undefined,
  });

  const loadComments = useCallback(async () => {
    if (!noteId) return;

    try {
      setCommentsLoading(true);
      const response = await getComments({
        resource_id: noteId,
        resource_type: 'note',
        skip: 0,
        limit: 50,
        sort_by: 'created_at',
        sort_desc: true,
      });

      if (response.code === 0 && Array.isArray(response.data)) {
        const commentTreeData = response.data.map((comment) => ({
          ...comment,
          tenant_id: comment.tenant_id || '',
          updated_at: comment.updated_at || comment.created_at,
          path: comment.path || '',
          depth: comment.depth || 0,
          children: comment.children || [],
          total_children_count: comment.children?.length || 0,
          tree_depth: comment.depth || 0,
          has_more_children: false,
          is_expanded: false,
        })) as CommentTreeRead[];
        setComments(commentTreeData);
      }
    } catch {
      // 静默处理评论加载错误
    } finally {
      setCommentsLoading(false);
    }
  }, [noteId]);

  const loadNoteDetail = useCallback(async () => {
    if (!noteId) {
      setError('id 不存在');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (userId) {
        const response = await getNoteDetail(noteId, userId);

        if (response.code === 0 && response.data) {
          const userNotes = response.data as unknown as NoteRead[];

          if (!Array.isArray(userNotes)) {
            setError('API返回数据格式错误');
            setLoading(false);
            return;
          }

          const noteData = userNotes.find((noteItem: NoteRead) => noteItem.id === noteId);

          if (!noteData) {
            setError('笔记不存在');
            setLoading(false);
            return;
          }

          const noteDetailData: NoteDetail = {
            id: noteData.id,
            title: noteData.title,
            content: noteData.content || '',
            images: noteData.images || [],
            tags: noteData.tags || [],
            location: noteData.location || null,
            visibility: (noteData.visibility || 'PUBLIC') as NoteDetail['visibility'],
            allow_comment: noteData.allow_comment ?? true,
            allow_share: noteData.allow_share ?? true,
            status: (noteData.status || 'published') as NoteDetail['status'],
            created_at:
              noteData.created_at instanceof Date
                ? noteData.created_at.toISOString()
                : new Date().toISOString(),
            updated_at:
              noteData.updated_at instanceof Date
                ? noteData.updated_at.toISOString()
                : new Date().toISOString(),
            published_at:
              noteData.published_at instanceof Date ? noteData.published_at.toISOString() : null,
            view_count: noteData.view_count || 0,
            like_count: noteData.like_count || 0,
            comment_count: noteData.comment_count || 0,
            share_count: noteData.share_count || 0,
            user: noteData.user
              ? {
                  id: noteData.user.id,
                  tenant_id: noteData.user.tenant_id,
                  created_at:
                    noteData.user.created_at instanceof Date
                      ? noteData.user.created_at.toISOString()
                      : new Date().toISOString(),
                  updated_at:
                    noteData.user.updated_at instanceof Date
                      ? noteData.user.updated_at.toISOString()
                      : new Date().toISOString(),
                  nickname: noteData.user.nickname,
                  avatar: noteData.user.avatar || '',
                  bio: noteData.user.bio || '',
                  birthday:
                    noteData.user.birthday instanceof Date
                      ? noteData.user.birthday.toISOString()
                      : null,
                  school: noteData.user.school || null,
                  college: noteData.user.college || null,
                  location: noteData.user.location || null,
                  wechat_id: noteData.user.qq_id || null,
                  qq_id: noteData.user.qq_id || null,
                  tel: noteData.user.tel || null,
                  status: noteData.user.status,
                }
              : undefined,
            author: noteData.user
              ? {
                  id: noteData.user.id,
                  nickname: noteData.user.nickname,
                  avatar: noteData.user.avatar || '',
                  level: noteData.user.level || 1,
                  bio: noteData.user.bio || '',
                }
              : undefined,
            is_liked: noteData.is_liked || false,
            is_favorited: noteData.is_favorited || false,
          };

          setNote(noteDetailData);
          setIsLiked(Boolean(noteData.is_liked));
          setIsBookmarked(Boolean(noteData.is_favorited));
          setLikeCount(Number(noteData.like_count || 0));
          setFavoriteCount(Number(noteData.favorite_count || 0));
          setShareCount(Number(noteData.share_count || 0));
        } else {
          setError(response.message || '获取笔记详情失败');
        }
      } else {
        const response = await getNoteDetail(noteId);

        if (response.code === 0 && response.data) {
          const noteData = response.data as unknown as NoteDetail;

          setNote(noteData);
          setIsLiked(noteData.is_liked || false);
          setIsBookmarked(noteData.is_favorited || false);
          setLikeCount(Number(noteData.like_count || 0));
          setFavoriteCount(Number(noteData.favorite_count || 0));
          setShareCount(Number(noteData.share_count || 0));
        } else {
          setError(response.message || '获取笔记详情失败');
        }
      }

      // 加载评论
      await loadComments();

      // 如果用户已登录，查询用户点赞状态
      if (isLoggedIn && noteId) {
        try {
          // 查询点赞状态
          const likeResponse = await getActionStatus(noteId, 'note', 'like');

          if (likeResponse.code === 0 && likeResponse.data) {
            setIsLiked(Boolean(likeResponse.data.is_active));
            setLikeCount(Number(likeResponse.data.count || 0));
          }
        } catch {
          // 静默处理点赞状态查询错误，保持原有状态
        }

        try {
          // 查询收藏状态
          const favoriteResponse = await getActionStatus(noteId, 'note', 'favorite');

          if (favoriteResponse.code === 0 && favoriteResponse.data) {
            setIsBookmarked(Boolean(favoriteResponse.data.is_active));
            setFavoriteCount(Number(favoriteResponse.data.count || 0));
          }
        } catch {
          // 静默处理收藏状态查询错误，保持原有状态
        }
      }
    } catch {
      // 静默处理笔记详情加载错误
      setError('网络错误或服务异常');
    } finally {
      setLoading(false);
    }
  }, [noteId, userId, isLoggedIn, loadComments]);

  // 页面显示时加载笔记详情
  useDidShow(() => {
    if (noteId) {
      loadNoteDetail();
    }
  });

  // 图片切换
  const handleImageChange = (e: { detail: { current: number } }) => {
    setCurrentImageIndex(e.detail.current);
  };

  // 图片预览
  const handleImagePreview = (_imageUrl: string, index: number) => {
    const images = note?.images || [];
    Taro.previewImage({
      urls: images,
      current: index, // 当前图片索引
      success: () => {},
      fail: (_err) => {},
    });
  };

  // 提交评论
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      Taro.showToast({
        title: '请输入评论',
        icon: 'none',
      });
      return;
    }

    if (!isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
      });
      return;
    }

    if (!noteId) {
      Taro.showToast({
        title: '笔记ID不存在',
        icon: 'none',
      });
      return;
    }

    try {
      setSubmittingComment(true);

      const commentData: CreateCommentRequest = {
        content: commentText.trim(),
        resource_id: noteId,
        resource_type: 'note',
      };

      const response = await createComment(commentData);

      if (response.code === 0) {
        Taro.showToast({
          title: '评论成功',
          icon: 'success',
        });
        setCommentText('');
        // 加载评论
        await loadComments();
      } else {
        throw new Error(response.message || '评论失败');
      }
    } catch (_error) {
      Taro.showToast({
        title: (_error as Error).message || '评论失败，请重试',
        icon: 'none',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

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

  const images: string[] = note.images || [];
  const hasImages = images.length > 0;

  return (
    <View className={styles.container}>
      <CustomHeader title='笔记详情' />

      <View className={styles.content}>
        <ScrollView scrollY className={styles.scrollView} enableBackToTop>
          {/* 笔记头信息 */}
          <View className={styles.noteHeader}>
            {/* 自动生成作者信息 */}
            {note.user && (
              <View className={styles.authorSection}>
                <View className={styles.customAuthorInfo}>
                  <Image
                    src={
                      note.user.avatar ? normalizeImageUrl(note.user.avatar) : '/assets/avatar1.png'
                    }
                    className={styles.authorAvatar}
                    mode='aspectFill'
                  />
                  <View className={styles.authorDetails}>
                    <View className={styles.nameAndLevel}>
                      <Text className={styles.authorName}>{note.user.nickname || '未知用户'}</Text>
                      <Text className={styles.authorLevel}>
                        {convertLevelToRealm(note.author?.level || 1)}
                      </Text>
                    </View>
                    {note.user.bio && <Text className={styles.authorBio}>{note.user.bio}</Text>}
                  </View>
                  <View className={styles.authorActions}>
                    {/* 只有当前用户是笔记作者时才显示关注按钮 */}
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

          {/* 图片展示 */}
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

              {/* 图片数量 */}
              <Text className={styles.imageCounter}>
                {currentImageIndex + 1}/{images.length}
              </Text>

              {/* 图片指示器 */}
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

          {/* 评论部分 */}
          <View className={styles.commentSection}>
            <View className={styles.commentHeader}>
              <Text className={styles.commentCount}>评论 {comments.length}</Text>
            </View>

            {/* 评论列表 */}
            {commentsLoading ? (
              <View className={styles.commentLoading}>
                <Text className={styles.loadingText}>加载中...</Text>
              </View>
            ) : comments.length > 0 ? (
              <View className={styles.commentList}>
                {comments.map((comment) => (
                  <View key={comment.id} className={styles.commentItem}>
                    <Image
                      className={styles.commentAvatar}
                      src={
                        comment.user?.avatar
                          ? normalizeImageUrl(comment.user.avatar)
                          : '/assets/avatar1.png'
                      }
                      mode='aspectFill'
                    />
                    <View className={styles.commentContent}>
                      <Text className={styles.commentAuthor}>
                        {comment.user?.nickname || '未知用户'}
                      </Text>
                      <Text className={styles.commentText}>{comment.content}</Text>
                      <Text className={styles.commentTime}>
                        {comment.created_at ? formatPostDate(comment.created_at) : '时间未知'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyComments}>
                <Text className={styles.emptyText}>暂无评论，欢迎发表你的看法</Text>
              </View>
            )}

            {/* 评论输入框 */}
            <View className={styles.commentInput}>
              <Input
                className={styles.inputField}
                value={commentText}
                onInput={(e) => setCommentText(e.detail.value)}
                placeholder='请输入评论...'
                maxlength={500}
                disabled={submittingComment}
              />
              <View
                className={`${styles.sendButton} ${submittingComment ? styles.sending : ''}`}
                onClick={handleCommentSubmit}
              >
                {submittingComment ? (
                  <Text className={styles.sendingText}>发送中...</Text>
                ) : (
                  <Image className={styles.sendIcon} src={sendIcon} />
                )}
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
            'share-3': { isActive: false, count: shareCount },
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
            },
          ]}
          onStateChange={(type, isActive, count) => {
            // ActionBar 已经处理了状态变化，这里不需要再处理
            if (type === 'like') {
              setIsLiked(isActive);
              setLikeCount(count);
            } else if (type === 'favorite') {
              setIsBookmarked(isActive);
              setFavoriteCount(count);
            } else if (type === 'comment') {
              // 评论数量更新逻辑（如果需要的话），目前没有用到
            } else if (type === 'share') {
              setShareCount((prev) => prev + 1);
            }
          }}
        />
      </View>
    </View>
  );
}
