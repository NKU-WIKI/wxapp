import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import styles from "../index.module.scss";
import ChevronDownIcon from "@/assets/chevron-down.svg";
import HeartIcon from "@/assets/heart-outline.svg";
import HeartActiveIcon from "@/assets/heart-bold.svg";
import { CommentDetail } from "@/types/api/comment";
import { formatRelativeTime } from "@/utils/time";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { toggleAction } from "@/store/slices/postSlice";
import Taro from "@tarojs/taro";

interface CommentItemProps {
  comment: CommentDetail;
  postId: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = userState?.isLoggedIn || false;
  const token = userState?.token || null;
  
  const handleLike = () => {
    // 检查用户是否登录
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
      return;
    }
    
    // 派发点赞操作
    dispatch(toggleAction({
      postId,
      actionType: 'like'
    }));
  };
  
  return (
  <View className={styles.commentItem}>
      <Image src={comment.avatar || ''} className={styles.avatar} />
    <View className={styles.content}>
      <View className={styles.header}>
        <Text className={styles.name}>{comment?.nickname || '匿名用户'}</Text>
        <Text className={styles.time}>{formatRelativeTime(comment.create_time)}</Text>
      </View>
        <Text className={styles.text}>{comment?.content}</Text>
      <View className={styles.actions}>
          <View className={styles.likeButton} onClick={handleLike}>
            <Image 
              src={comment.is_liked ? HeartActiveIcon : HeartIcon} 
              className={styles.icon} 
            />
          <Text>{comment?.like_count || 0}</Text>
          </View>
          <View className={styles.replyButton}>
            <Text>回复</Text>
          </View>
      </View>
    </View>
  </View>
);
};

interface CommentSectionProps {
  comments: CommentDetail[];
  postId: number;
  loading?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, postId, loading = false }) => {
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time');
  
  // 添加调试日志
  useEffect(() => {
    console.log('评论数据:', comments);
  }, [comments]);
  
  // 根据排序方式对评论进行排序
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.create_time).getTime() - new Date(a.create_time).getTime();
    } else {
      return b.like_count - a.like_count;
    }
  });
  
  // 切换排序方式
  const toggleSort = () => {
    setSortBy(sortBy === 'time' ? 'likes' : 'time');
  };

  return (
    <View className={styles.commentsSection}>
      <View className={styles.header}>
        <Text className={styles.title}>评论 ({comments.length})</Text>
        <View className={styles.sort} onClick={toggleSort}>
          <Text>{sortBy === 'time' ? '时间' : '热度'}</Text>
          <Image src={ChevronDownIcon} className={styles.icon} />
        </View>
      </View>
      
      {loading ? (
        <View className={styles.loading}>加载评论中...</View>
      ) : sortedComments.length > 0 ? (
        sortedComments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))
      ) : (
        <View className={styles.emptyComments}>
          <Text>暂无评论，快来发表第一条评论吧</Text>
        </View>
      )}
    </View>
  );
};

export default CommentSection;
