import { View, Text, Image, ScrollView, Input } from "@tarojs/components";
import { useRouter } from "@tarojs/taro";
import { useEffect, useState } from "react";
import PostCard from "../../components/post-card";
import { Post } from "../../types/post";
import { getPostById } from "../../services/mock";
import styles from "./index.module.scss";
import CustomHeader from "../../components/custom-header";

// --- 导入图标 ---
import likeIcon from "../../assets/like.png";
import sendIcon from "../../assets/send.png";

export default function PostDetail() {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const { id } = router.params;
    if (id) {
      const postData = getPostById(Number(id));
      setPost(postData || null);
    }
  }, [router.params]);

  if (!post) {
    return (
      <View className={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const comments = post.comments || [];

  return (
    <View className={styles.page}>
      <CustomHeader title="帖子详情" />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY className={styles.content}>
          <PostCard post={post} />

          {/* --- 评论区 --- */}
          {comments.length > 0 && (
            <View className={styles.commentsSection}>
              <Text className={styles.commentsTitle}>评论</Text>
              {comments.map((comment) => (
                <View key={comment.id} className={styles.commentItem}>
                  <Image
                    src={comment.author.avatar}
                    className={styles.commentAvatar}
                  />
                  <View className={styles.commentContent}>
                    <View className={styles.commentHeader}>
                      <Text className={styles.commentAuthor}>
                        {comment.author.name}
                      </Text>
                      {comment.isAIAssistant && (
                        <Text className={styles.aiTag}>AI助手</Text>
                      )}
                      <Text className={styles.commentTime}>{comment.time}</Text>
                    </View>
                    <Text className={styles.commentText}>{comment.content}</Text>
                    <View className={styles.commentFooter}>
                      <View className={styles.commentLike}>
                        <Image
                          src={likeIcon}
                          className={styles.commentLikeIcon}
                        />
                        <Text>{comment.likes}</Text>
                      </View>
                      <Text className={styles.replyButton}>回复</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* --- 底部输入框 --- */}
      <View className={styles.inputBar}>
        <Input className={styles.commentInput} placeholder="说点什么..." />
        <Image src={sendIcon} className={styles.sendIcon} />
      </View>
    </View>
  );
} 