import { useState } from "react";
import Taro from "@tarojs/taro";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createPost } from "@/store/slices/postSlice";
import {
  View,
  Text,
  Input,
  Textarea,
  Image,
  ScrollView,
  Switch, // Keep Switch for PublishSettings if it's not passed down
} from "@tarojs/components";
import styles from "./index.module.scss";
import CustomHeader from "@/components/custom-header";
import PublishSettings from "./components/PublishSettings";
import { uploadApi } from "@/services/api/upload";

// Import new SVG icons
import imageIcon from "@/assets/image.svg"; // Assuming this remains, or replace with SVG
import boldIcon from "@/assets/bold.svg";
import italicIcon from "@/assets/italic.svg";
import atSignIcon from "@/assets/at-sign.svg";
import penToolIcon from "@/assets/pen-tool.svg";
import lightbulbIcon from "@/assets/lightbulb.svg";
import xCircleIcon from "@/assets/x-circle.svg"; // for deleting images

const mockData = {
  tags: ["#校园生活", "#学习交流", "#求助"],
  styles: ["正式", "轻松", "幽默", "专业"],
};

export default function PublishPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("正式");
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [useWikiAssistant, setUseWikiAssistant] = useState(false); // Changed from enableWikiAssist
  const dispatch = useDispatch<AppDispatch>();

  const handleChooseImage = () => {
    if (isUploading) return;
    const count = 9 - images.length;
    if (count <= 0) {
      Taro.showToast({ title: "最多上传9张图片", icon: "none" });
      return;
    }
    Taro.chooseImage({
      count,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: async (res) => {
        setIsUploading(true);
        Taro.showLoading({ title: "上传中..." });
        try {
          const uploadPromises = res.tempFilePaths.map((path) =>
            uploadApi.uploadImage(path)
          );
          const uploadedUrls = await Promise.all(uploadPromises);
          setImages((prev) => [...prev, ...uploadedUrls]);
        } catch (error) {
          console.error("上传图片失败:", error);
          Taro.showToast({ title: "上传失败，请重试", icon: "none" });
        } finally {
          setIsUploading(false);
          Taro.hideLoading();
        }
      },
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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
      await dispatch(
        createPost({
          title,
          content,
          image_urls: images, // Add images to the payload
          is_public: isPublic,
          allow_comment: allowComments,
        })
      ).unwrap();

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
          <Input
            placeholder="请输入标题"
            className={`${styles.titleInput} ${styles.card}`}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
          <Textarea
            placeholder="分享你的想法..."
            className={`${styles.contentInput} ${styles.card}`}
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={2000}
            autoHeight
          />

          <View className={styles.imagePreviewContainer}>
            {images.map((url, index) => (
              <View key={index} className={styles.imageWrapper}>
                <Image
                  src={url}
                  className={styles.previewImage}
                  mode="aspectFill"
                />
                <Image
                  src={xCircleIcon}
                  className={styles.deleteIcon}
                  onClick={() => handleRemoveImage(index)}
                />
              </View>
            ))}
          </View>

          {/* Toolbar */}
          <View className={`${styles.toolbar} ${styles.card}`}>
            <Image src={boldIcon} className={styles.toolbarIcon} />
            <Image src={italicIcon} className={styles.toolbarIcon} />
            <Image
              src={imageIcon}
              className={styles.toolbarIcon}
              onClick={handleChooseImage}
            />
            <Image src={atSignIcon} className={styles.toolbarIcon} />
            <View className={styles.wikiBtn}>
              <Image src={penToolIcon} className={styles.wikiIcon} />
              <Text>Wiki 润色</Text>
            </View>
          </View>

          {/* Select Topic */}
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>选择话题</Text>
            <View className={styles.tagsContainer}>
              {mockData.tags.map((tag) => (
                <View key={tag} className={styles.tagItem}>
                  <Text>{tag}</Text>
                </View>
              ))}
              <View className={`${styles.tagItem} ${styles.addTag}`}>
                <Text>#添加话题</Text>
              </View>
            </View>
          </View>

          {/* Wiki Polish Suggestion */}
          <View className={`${styles.suggestionCard} ${styles.card}`}>
            <Image src={lightbulbIcon} className={styles.suggestionIcon} />
            <View className={styles.suggestionContent}>
              <View className={styles.suggestionHeader}>
                <Text className={styles.sectionTitle}>Wiki 润色建议</Text>
                <Text className={styles.applyBtn}>应用</Text>
              </View>
              <Text className={styles.suggestionText}>
                建议调整：1. 增加段落间的过渡...
              </Text>
            </View>
          </View>

          {/* Writing Style Selection */}
          <View className={styles.card}>
            <Text className={styles.sectionTitle}>文风选择</Text>
            <View className={styles.stylesContainer}>
              {mockData.styles.map((style) => (
                <View
                  key={style}
                  className={`${styles.styleItem} ${
                    selectedStyle === style ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedStyle(style)}
                >
                  <Text>{style}</Text>
                </View>
              ))}
            </View>
          </View>

          <PublishSettings
            isPublic={isPublic}
            onPublicChange={setIsPublic}
            allowComments={allowComments}
            onAllowCommentsChange={setAllowComments}
            useWikiAssistant={useWikiAssistant}
            onWikiAssistantChange={setUseWikiAssistant}
          />
        </ScrollView>
      </View>

      <View className={styles.footer}>
        <View className={styles.publishButton} onClick={handlePublish}>
          <Text>发布</Text>
        </View>
      </View>
    </View>
  );
}
