import { View, Text, Image } from "@tarojs/components";
import Button from "@/components/button";
import Badge from "@/components/badge";
import styles from "../index.module.scss";
import { Comment } from "@/types/api/post.d";
import ChevronDownIcon from "@/assets/chevron-down.svg";
import HeartIcon from "@/assets/heart.svg";

const CommentItem = ({ comment }: { comment: Comment }) => (
  <View className={styles.commentItem}>
    <Image src={comment?.author?.avatar || ''} className={styles.avatar} />
    <View className={styles.content}>
      <View className={styles.header}>
        <Text className={styles.name}>{comment?.author?.nickname || '匿名用户'}</Text>
        {comment?.author?.level && <Badge>Lv{comment.author.level}</Badge>}
        <Text className={styles.time}>{comment?.time}</Text>
      </View>
      <Text className={styles.text}>{comment?.content}</Text>
      <View className={styles.actions}>
        <Button variant="ghost" size="sm" className={styles.likeButton}>
          <Image src={HeartIcon} className={styles.icon} />
          <Text>{comment?.likes || 0}</Text>
        </Button>
        <Button variant="ghost" size="sm">
          回复
        </Button>
      </View>
    </View>
  </View>
);

interface CommentSectionProps {
  comments: Comment[];
}

const CommentSection = ({ comments }: CommentSectionProps) => {
  return (
    <View className={styles.commentsSection}>
      <View className={styles.header}>
        <Text className={styles.title}>评论 ({comments.length})</Text>
        <Button variant="ghost" className={styles.sort}>
          <Text>时间</Text>
          <Image src={ChevronDownIcon} className={styles.icon} />
        </Button>
      </View>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      ) : (
        <Text className={styles.noComment}>暂无评论，快来抢沙发吧！</Text>
      )}
    </View>
  );
};

export default CommentSection;
