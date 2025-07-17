import React, { useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import Button from "@/components/button";
import Badge from "@/components/badge";
import styles from "../index.module.scss";
import ChevronDownIcon from "@/assets/chevron-down.svg";
import UserAvatar1 from "@/assets/avatar2.png";
import UserAvatar2 from "@/assets/avatar1.png";
import HeartIcon from "@/assets/heart.svg";

const CommentItem = ({ comment }) => (
  <View className={styles.commentItem}>
    <Image src={comment.avatar} className={styles.avatar} />
    <View className={styles.content}>
      <View className={styles.header}>
        <Text className={styles.name}>{comment.name}</Text>
        {comment.badge && (
          <Badge variant={comment.badge.variant}>{comment.badge.text}</Badge>
        )}
        <Text className={styles.time}>{comment.time}</Text>
      </View>
      <Text className={styles.text}>{comment.text}</Text>
      <View className={styles.actions}>
        <Button variant="ghost" size="sm" className={styles.likeButton}>
          <Image src={HeartIcon} className={styles.icon} />
          <Text>{comment.likes}</Text>
        </Button>
        <Button variant="ghost" size="sm">
          回复
        </Button>
      </View>
    </View>
  </View>
);

const CommentSection = () => {
  const comments = [
    {
      id: 1,
      name: "NKUWiki",
      avatar: UserAvatar1,
      badge: { text: "AI助手", variant: "secondary" },
      time: "1小时前",
      text: "南开大学的主楼建于1982年，是学校的标志性建筑之一。伯苓大讲堂则是为纪念南开创始人张伯苓先生而命名。“允公允能，日新月异”的校训出自张伯苓先生，寓意南开人要心怀天下、追求卓越。",
      likes: 89,
    },
    {
      id: 2,
      name: "南开数院小可爱",
      avatar: UserAvatar2,
      badge: { text: "Lv3", variant: "default" },
      time: "45分钟前",
      text: "南开的秋天最美了 主楼前的梧桐树开始变黄了吗？期待今年的落叶大道！",
      likes: 56,
    },
  ];

  return (
    <View className={styles.commentsSection}>
      <View className={styles.header}>
        <Text className={styles.title}>评论 (128)</Text>
        <Button variant="ghost" className={styles.sort}>
          <Text>时间</Text>
          <Image src={ChevronDownIcon} className={styles.icon} />
        </Button>
      </View>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </View>
  );
};

export default CommentSection;
