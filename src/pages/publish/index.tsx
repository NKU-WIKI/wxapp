import { useState } from "react";
import Taro from "@tarojs/taro";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { createPost } from '@/store/slices/postSlice';
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
import CustomHeader from "@/components/custom-header";
import imageIcon from "@/assets/image.png";
import robotIcon from "@/assets/robot.png";
import wikiIcon from "@/assets/wiki.png";
import eyeIcon from "@/assets/eye.png";
import commentIcon from "@/assets/comment.png";

const mockData = {
  tags: ["#校园生活", "#学习交流", "#求助"],
  styles: ["正式", "轻松", "幽默", "专业"],
};

export default function PublishPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("正式");
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [enableWikiAssist, setEnableWikiAssist] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const handlePublish = async () => {
    if (!title.trim()) {
      Taro.showToast({
        title: "请输入标题",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({
        title: "请输入内容",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    try {
      await dispatch(createPost({ 
        title, 
        content,
        is_public: isPublic,
        allow_comment: allowComments,
      })).unwrap();

      Taro.showToast({
        title: "发布成功",
        icon: "success",
        duration: 1500,
      });

      // 1.5秒后返回上一页
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);

    } catch (error: any) {
      Taro.showToast({
        title: error || "发布失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  return (
    <View className={styles.pageContainer}>
      <CustomHeader title="发布帖子" />

      <View className={styles.contentWrapper}>
        <ScrollView scrollY className={styles.scrollView}>
          {/* 主要编辑区 */}
          <View className={styles.editorCard}>
            <Input
              className={styles.titleInput}
              placeholder="请输入标题"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
            <View className={styles.divider} />
            <Textarea
              className={styles.contentInput}
              placeholder="分享你的想法..."
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={2000}
              autoHeight
            />
          </View>

          {/* 工具栏 */}
          <View className={styles.toolbarCard}>
            <View className={styles.toolbar}>
              <View className={styles.toolbarLeft}>
                <Text className={`${styles.toolbarBtn} ${styles.boldBtn}`}>B</Text>
                <Text className={`${styles.toolbarBtn} ${styles.italicBtn}`}>I</Text>
                <Image src={imageIcon} className={styles.toolbarIcon} />
                <Text className={styles.toolbarBtn}>@</Text>
              </View>
              <View className={styles.wikiBtn}>
                <Image src={wikiIcon} className={styles.wikiIcon} />
                <Text className={styles.wikiBtnText}>Wiki润色</Text>
              </View>
            </View>
          </View>

          {/* 选择话题 */}
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

          {/* Wiki 润色建议 */}
          <View className={styles.card}>
            <View className={styles.suggestionHeader}>
              <View className={styles.suggestionTitle}>
                <Image src={robotIcon} className={styles.suggestionIcon} />
                <Text className={styles.sectionTitle}>Wiki 润色建议</Text>
              </View>
              <Text className={styles.applyBtn}>应用</Text>
            </View>
            <Text className={styles.suggestionText}>
              建议调整：1. 增加段落间的过渡，使文章更加连贯 2. 
              补充更多具体细节，增强文章说服力 3. 优化标点符号使用，提升可读性
            </Text>
          </View>

          {/* 文风选择 */}
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

          {/* 发布设置 - 紧凑水平布局 */}
          <View className={styles.settingsCard}>
            <View className={styles.settingBtn}>
              <Image src={eyeIcon} className={styles.settingBtnIcon} />
              <Text className={styles.settingBtnText}>公开</Text>
            </View>
            
            <View className={styles.settingBtn}>
              <Image src={commentIcon} className={styles.settingBtnIcon} />
              <Text className={styles.settingBtnText}>允许评论</Text>
            </View>
            
            <View className={styles.settingBtnWithSwitch}>
              <View className={styles.settingBtnContent}>
                <Image src={wikiIcon} className={styles.settingBtnIcon} />
                <Text className={styles.settingBtnText}>wiki小知</Text>
              </View>
              <Switch
                checked={enableWikiAssist}
                color="#4a90e2"
                onChange={(e) => setEnableWikiAssist(e.detail.value)}
              />
            </View>
          </View>

          {/* 底部安全距离 */}
          <View className={styles.bottomSafeArea}></View>
        </ScrollView>

        {/* 底部发布按钮 */}
        <View className={styles.publishFooter}>
          <View className={styles.publishButton} onClick={handlePublish}>
            <Text className={styles.publishButtonText}>发布</Text>
          </View>
        </View>
      </View>
    </View>
  );
} 