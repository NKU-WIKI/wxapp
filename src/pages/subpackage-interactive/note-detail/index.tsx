import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, Swiper, SwiperItem, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { getNoteDetail } from '@/services/api/note';
import { NoteDetail } from '@/services/api/note';
import CustomHeader from '@/components/custom-header';
import heartIcon from '@/assets/heart.svg';
import heartFilledIcon from '@/assets/heart-bold.svg';
import bookmarkIcon from '@/assets/star-outline.svg';
import bookmarkFilledIcon from '@/assets/star-filled.svg';
import commentIcon from '@/assets/message-circle.svg';
import shareIcon from '@/assets/share.svg';
import sendIcon from '@/assets/send.svg';
import styles from './index.module.scss';

export default function NoteDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  
  // 状态管理
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // 获取笔记ID
  const noteId = router?.params?.id;
  
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
      
      // 暂时先使用原来的API路径，等后端修复后再调整
      // TODO: 修复后使用正确的API路径: /users/{userId}/notes/{noteId}
      const response = await getNoteDetail(noteId);
      if (response.code === 200 && response.data) {
        setNote(response.data);
        // 检查是否已点赞和收藏
        setIsLiked(response.data.is_liked || false);
        setIsBookmarked(response.data.is_favorited || false);
      } else {
        setError(response.message || '加载失败');
      }
    } catch (err) {
      console.error('加载笔记详情失败:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [noteId]);
  
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
  
  // 处理点赞
  const handleLike = () => {
    if (!isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    setIsLiked(!isLiked);
    // TODO: 调用点赞API
  };
  
  // 处理收藏
  const handleBookmark = () => {
    if (!isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    setIsBookmarked(!isBookmarked);
    // TODO: 调用收藏API
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
    console.log('提交评论:', commentText);
    setCommentText('');
    Taro.showToast({
      title: '评论成功',
      icon: 'success'
    });
  };
  
  // 处理分享
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true
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
  
  // 获取图片数组（NoteDetail接口没有images属性，这里暂时使用空数组）
  const images: string[] = [];
  const hasImages = false;
  
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
            <Text className={styles.noteTitle}>{note.title}</Text>
            
            <View className={styles.authorSection}>
              <View className={styles.authorInfo}>
                <Image 
                  className={styles.authorAvatar}
                  src={note.author?.avatar || '/assets/avatar1.png'}
                  mode='aspectFill'
                />
                <View className={styles.authorDetails}>
                  <Text className={styles.authorName}>
                    {note.author?.name || '未知用户'}
                  </Text>
                  <Text className={styles.authorLevel}>
                    wiki Lv.1
                  </Text>
                  <Text className={styles.authorMotto}>
                    知识·与你分享
                  </Text>
                </View>
              </View>
              
              <View className={styles.authorActions}>
                <View 
                  className={isLiked ? styles.followedButton : styles.followButton}
                  onClick={handleLike}
                >
                  {isLiked ? '已关注' : '关注'}
                </View>
                <Text className={styles.publishTime}>
                  {note.created_at ? '8分钟前' : ''}
                </Text>
              </View>
            </View>
            
            {/* 标签 */}
            {note.tags && note.tags.length > 0 && (
              <View className={styles.tagsContainer}>
                {note.tags.map((tag, index) => (
                  <Text key={index} className={styles.tag}>
                    {tag}
                  </Text>
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
                      mode='aspectFill'
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
              <Text className={styles.commentCount}>评论 32</Text>
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
                <Image className={styles.sendIcon} src={sendIcon} />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      
      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.actionButton} onClick={handleLike}>
          <Image 
            className={styles.actionIcon} 
            src={isLiked ? heartFilledIcon : heartIcon} 
          />
          <Text className={`${styles.actionText} ${isLiked ? styles.liked : ''}`}>
            {isLiked ? '已点赞' : '点赞'}
          </Text>
          <Text className={styles.actionCount}>128</Text>
        </View>
        
        <View className={styles.actionButton} onClick={handleBookmark}>
          <Image 
            className={styles.actionIcon} 
            src={isBookmarked ? bookmarkFilledIcon : bookmarkIcon} 
          />
          <Text className={styles.actionText}>
            {isBookmarked ? '已收藏' : '收藏'}
          </Text>
          <Text className={styles.actionCount}>56</Text>
        </View>
        
        <View className={styles.actionButton}>
          <Image className={styles.actionIcon} src={commentIcon} />
          <Text className={styles.actionText}>评论</Text>
          <Text className={styles.actionCount}>32</Text>
        </View>
        
        <View className={styles.actionButton} onClick={handleShare}>
          <Image className={styles.actionIcon} src={shareIcon} />
          <Text className={styles.actionText}>分享</Text>
        </View>
      </View>
    </View>
  );
} 