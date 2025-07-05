import { useState, useEffect } from "react";
import Taro from '@tarojs/taro';
import {
  View,
  Text,
  Input,
  Textarea,
  Image,
  ScrollView,
  Switch,
} from "@tarojs/components";
import styles from "./index.module.scss";
import backIcon from "../../assets/back.png";

// 模拟图标，实际应替换为真实资源
const BOLD_ICON = "https://api.iconify.design/solar/bold-bold.svg?color=%23333";
const ITALIC_ICON =
  "https://api.iconify.design/solar/text-italic-bold.svg?color=%23333";
const IMG_ICON = "https://api.iconify.design/solar/gallery-bold.svg?color=%23333";
const AT_ICON = "https://api.iconify.design/solar/user-circle-bold.svg?color=%23333";
const WIKI_ICON = "https://api.iconify.design/solar/siderbar-bold-duotone.svg?color=%234a90e2";
const EYE_ICON = "https://api.iconify.design/solar/eye-bold.svg?color=%23888";
const COMMENT_ICON =
  "https://api.iconify.design/solar/chat-round-dots-bold.svg?color=%23888";

const mockData = {
  tags: ["#校园生活", "#学习交流", "#求助"],
  styles: ["正式", "轻松", "幽默", "专业"],
};

export default function PublishPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("正式");
  const [headerPaddingTop, setHeaderPaddingTop] = useState(20); // 默认值

  useEffect(() => {
    const { statusBarHeight } = Taro.getSystemInfoSync();
    setHeaderPaddingTop(statusBarHeight || 20); // 提供默认值以确保类型安全
  }, []);

  return (
    <View className={styles.page}>
      <View className={styles.pageHeader} style={{ paddingTop: `${headerPaddingTop}px` }}>
        <Image src={backIcon} className={styles.backIcon} />
        <Text className={styles.pageTitle}>发布帖子</Text>
        <View className={styles.publishButton}>
          <Text className={styles.publishButtonText}>发布</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.card}>
          <Input
            className={styles.titleInput}
            placeholder="请输入标题"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
          <Textarea
            className={styles.contentInput}
            placeholder="分享你的想法..."
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            autoHeight
          />
        </View>

        <View className={`${styles.card} ${styles.toolbarCard}`}>
          <View className={styles.toolbar}>
            <Image src={BOLD_ICON} className={styles.toolbarIcon} />
            <Image src={ITALIC_ICON} className={styles.toolbarIcon} />
            <Image src={IMG_ICON} className={styles.toolbarIcon} />
            <Image src={AT_ICON} className={styles.toolbarIcon} />
            <View className={styles.aiPolishButton}>
              <Image src={WIKI_ICON} className={styles.aiIcon} />
              <Text>Wiki润色</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>选择话题</Text>
          <View className={styles.tagsContainer}>
            {mockData.tags.map((tag) => (
              <Text key={tag} className={styles.tagItem}>
                {tag}
              </Text>
            ))}
            <Text className={`${styles.tagItem} ${styles.addTag}`}>
              #添加话题
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.suggestionHeader}>
            <Image src={WIKI_ICON} className={styles.aiIcon} />
            <Text className={styles.sectionTitle}>Wiki 润色建议</Text>
            <Text className={styles.applyButton}>应用</Text>
          </View>
          <Text className={styles.suggestionText}>
            建议调整：1. 增加段落间的过渡，使文章更加连贯 2.
            补充更多具体细节，增强文章说服力 3. 优化标点符号使用，提升可读性
          </Text>
        </View>

        <View className={styles.card}>
          <Text className={styles.sectionTitle}>文风选择</Text>
          <View className={styles.stylesContainer}>
            {mockData.styles.map((style) => (
              <Text
                key={style}
                className={`${styles.styleItem} ${
                  selectedStyle === style ? styles.selected : ""
                }`}
                onClick={() => setSelectedStyle(style)}
              >
                {style}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.optionItem}>
          <Image src={EYE_ICON} className={styles.optionIcon} />
          <Text>公开</Text>
        </View>
        <View className={styles.optionItem}>
          <Image src={COMMENT_ICON} className={styles.optionIcon} />
          <Text>允许评论</Text>
        </View>
        <View className={styles.optionItem}>
          <Image src={WIKI_ICON} className={styles.aiIcon} />
          <Text>wiki小知</Text>
          <Switch color="#4a90e2" style={{ marginLeft: "auto" }} />
        </View>
      </View>
    </View>
  );
} 