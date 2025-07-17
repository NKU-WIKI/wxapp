import React from "react";
import { View, Text, Image } from "@tarojs/components";
import Button from "@/components/button";
import Badge from "@/components/badge";
import styles from "../index.module.scss";

// Import local assets
import UserAvatar from "@/assets/avatar1.png";
import PostImage1 from "@/assets/placeholder.jpg";
import PostImage2 from "@/assets/placeholder.jpg";
import MapPinIcon from "@/assets/map-pin.svg";
import HeartIcon from "@/assets/liked.svg";
import CommentIcon from "@/assets/comment.svg";
import ShareIcon from "@/assets/share.svg";

const PostDetailContent = () => {
  return (
    <View className={styles.postWrapper}>
      {/* User Info */}
      <View className={styles.userInfo}>
        <View className={styles.authorInfo}>
          <Image src={UserAvatar} className={styles.avatar} />
          <View>
            <View style={{ display: "flex", alignItems: "center" }}>
              <Text className={styles.authorName}>南开艺术学院的小艺</Text>
              <Badge>Lv3</Badge>
            </View>
            <Text className={styles.meta}>2小时前 · 在校学生</Text>
          </View>
        </View>
        <Button variant="outline" size="sm">
          关注
        </Button>
      </View>

      {/* Post Content */}
      <View className={styles.postContent}>
        <Text className={styles.title}>巍巍南开，百年日新</Text>
        <Text className={styles.text}>
          今天漫步南开大学校园，感受到了百年学府的厚重与活力。阳光透过梧桐树叶洒在主楼前，学子们穿梭其中，构成一幅生机勃勃的画面。站在伯苓大讲堂前，仿佛能听到“允公允能，日新月异”的校训回响。分享一组照片，希望能带给大家一份学术氛围与青春活力。
        </Text>
      </View>

      {/* Post Images */}
      <View className={styles.images}>
        <Image src={PostImage1} className={styles.image} mode="aspectFill" />
        <Image src={PostImage2} className={styles.image} mode="aspectFill" />
      </View>

      {/* Tags */}
      <View className={styles.tags}>
        <Badge variant="secondary">#南开大学</Badge>
        <Badge variant="secondary">#大学生活</Badge>
        <View className={styles.location}>
          <Image src={MapPinIcon} className={styles.icon} />
          <Text>南开大学八里台校区</Text>
        </View>
      </View>

      {/* Action Bar */}
      <View className={styles.actionBar}>
        <Button variant="ghost" className={styles.actionButton}>
          <Image src={HeartIcon} className={styles.icon} />
          <Text className={styles.count}>2.8k</Text>
        </Button>
        <Button variant="ghost" className={styles.actionButton}>
          <Image src={CommentIcon} className={styles.icon} />
          <Text className={styles.count}>128</Text>
        </Button>
        <Button variant="ghost" className={styles.actionButton}>
          <Image src={ShareIcon} className={styles.icon} />
          <Text className={styles.count}>128</Text>
        </Button>
      </View>
    </View>
  );
};

export default PostDetailContent;
