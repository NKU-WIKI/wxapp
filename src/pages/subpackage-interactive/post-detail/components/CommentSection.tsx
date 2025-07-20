import React, { useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import styles from "../index.module.scss";
import ChevronDownIcon from "@/assets/chevron-down.svg";
import HeartIcon from "@/assets/heart-outline.svg";
import HeartActiveIcon from "@/assets/heart.svg";
import { Comment } from "@/types/api/post";
import { formatRelativeTime } from "@/utils/time";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  
  return (
  <View className={styles.commentItem}>
      <Image src={comment.author.avatar || ''} className={styles.avatar} />
    <View className={styles.content}>
      <View className={styles.header}>
        <Text className={styles.name}>{comment?.author?.nickname || '匿名用户'}</Text>
        {comment?.author?.level && <Badge>Lv{comment.author.level}</Badge>}
        <Text className={styles.time}>{comment?.time}</Text>
          <Text className={styles.name}>{comment.author.nickname}</Text>
          {comment.isAIAssistant && (
            <View className={styles.aiTag}>AI助手</View>
        )}
          <Text className={styles.time}>{formatRelativeTime(comment.time)}</Text>
      </View>
        <Text className={styles.text}>{comment?.content}</Text>
      <View className={styles.actions}>
          <View className={styles.likeButton} onClick={handleLike}>
            <Image 
              src={isLiked ? HeartActiveIcon : HeartIcon} 
              className={styles.icon} 
            />
          <Text>{comment?.likes || 0}</Text>
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
  comments: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments }) => {
  const [sortBy, setSortBy] = useState<'time' | 'likes'>('time');
  
  // 根据排序方式对评论进行排序
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    } else {
      return b.likes - a.likes;
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
      {sortedComments.length > 0 ? (
        sortedComments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
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
