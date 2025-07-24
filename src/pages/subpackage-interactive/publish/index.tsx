import { useState, useEffect } from "react";
import Taro, { useRouter, useUnload } from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
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
import { saveDraft, getDrafts } from '@/utils/draft';
import defaultAvatar from '@/assets/profile.png';

const mockData = {
  tags: ["#校园生活", "#学习交流", "#求助", "#资源分享", "#活动通知"],
  styles: ["正式", "轻松", "幽默", "专业"],
};

// 简单 uuid 生成
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function PublishPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("正式");
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [useWikiAssistant, setUseWikiAssistant] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  // 标记是否已通过弹窗保存过草稿，避免 useUnload 再次保存
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const draftId = router?.params?.draftId;
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // 添加调试日志，查看当前选中的标签
  useEffect(() => {
    console.log('当前选中的标签:', selectedTags);
  }, [selectedTags]);

  // 编辑草稿时初始化内容
  useEffect(() => {
    if (draftId) {
      const drafts = getDrafts();
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        setTitle(draft.title || '');
        setContent(draft.content || '');
        // setImages(draft.images || []); // 如有图片字段可补充
      }
    }
  }, [draftId]);

  // 回退时弹窗询问是否保存草稿
  const handleBack = () => {
    if (title.trim() || content.trim()) {
      Taro.showModal({
        title: '是否保存为草稿？',
        content: '你有未发布的内容，是否保存为草稿？',
        confirmText: '保存',
        cancelText: '不保存',
        success: (res) => {
          if (res.confirm) {
            const id = draftId || uuid();
            saveDraft({
              id,
              title,
              content,
              avatar: userInfo?.avatar || defaultAvatar,
              updatedAt: Date.now(),
            });
            setHasSavedDraft(true);
            Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
            setTimeout(() => {
              Taro.navigateBack();
            }, 500);
          } else {
            setHasSavedDraft(true);
            Taro.navigateBack();
          }
        }
      });
    } else {
      setHasSavedDraft(true);
      Taro.navigateBack();
    }
  };

  // 页面卸载时自动保存草稿（仅在未弹窗保存时自动保存一次）
  useUnload(() => {
    if (!hasSavedDraft && (title.trim() || content.trim()) && !draftId) {
      const id = uuid();
      saveDraft({
        id,
        title,
        content,
        avatar: userInfo?.avatar || defaultAvatar,
        updatedAt: Date.now(),
      });
    }
  });

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

  const handleTagToggle = (tag: string) => {
    console.log('点击标签:', tag, '当前选中状态:', selectedTags.includes(tag));
    
    // 如果标签已经被选中，则取消选中
    if (selectedTags.includes(tag)) {
      const newTags = selectedTags.filter(t => t !== tag);
      console.log('取消选中后的标签:', newTags);
      setSelectedTags(newTags);
    } else {
      // 如果标签未被选中，且选中数量小于3，则选中
      if (selectedTags.length < 3) {
        const newTags = [...selectedTags, tag];
        console.log('选中后的标签:', newTags);
        setSelectedTags(newTags);
      } else {
        Taro.showToast({ title: "最多选择3个话题", icon: "none" });
      }
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) {
      Taro.showToast({ title: "请输入话题", icon: "none" });
      return;
    }

    // 格式化自定义标签，确保以#开头
    let formattedTag = customTag.trim();
    if (!formattedTag.startsWith('#')) {
      formattedTag = `#${formattedTag}`;
    }

    // 检查是否已存在该标签
    if (selectedTags.includes(formattedTag)) {
      Taro.showToast({ title: "该话题已添加", icon: "none" });
      return;
    }

    // 检查是否超过最大数量
    if (selectedTags.length >= 3) {
      Taro.showToast({ title: "最多选择3个话题", icon: "none" });
      return;
    }

    console.log('添加自定义标签:', formattedTag);
    setSelectedTags([...selectedTags, formattedTag]);
    setCustomTag("");
    setIsAddingTag(false);
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
      // 处理标签，去掉#前缀
      const processedTags = selectedTags.map(tag => tag.startsWith('#') ? tag.substring(1) : tag);
      console.log('发布帖子，处理后的标签:', processedTags);
      
      await dispatch(
        createPost({
          title,
          content,
          image_urls: images,
          tag: processedTags, // 添加标签数据
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

  // 检查标签是否被选中的辅助函数
  const isTagSelected = (tag: string): boolean => {
    return selectedTags.includes(tag);
  };

  return (
    <View className={styles.pageContainer}>
      {/* 顶部提示 */}
      <View style={{ background: '#FFFBEA', color: '#B7791F', padding: '8px 16px', fontSize: 13, textAlign: 'center' }}>
        返回请用左上角按钮，否则自动保存草稿
      </View>
      <CustomHeader title="发布帖子" onLeftClick={handleBack} />

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
            <Text className={styles.sectionTitle}>选择话题 ({selectedTags.length}/3)</Text>
            <View className={styles.tagsContainer}>
              {mockData.tags.map((tag) => {
                const selected = isTagSelected(tag);
                return (
                  <View 
                    key={tag} 
                    className={`${styles.tagItem} ${selected ? styles.selected : ''}`}
                    onClick={() => handleTagToggle(tag)}
                    style={{ backgroundColor: selected ? '#4F46E5' : undefined, color: selected ? '#FFFFFF' : undefined }}
                  >
                  <Text>{tag}</Text>
                  </View>
                );
              })}
              
              {isAddingTag ? (
                <View className={`${styles.tagInputContainer}`}>
                  <Input
                    className={styles.tagInput}
                    value={customTag}
                    onInput={(e) => setCustomTag(e.detail.value)}
                    placeholder="输入话题"
                    focus
                    onBlur={handleAddCustomTag}
                    onConfirm={handleAddCustomTag}
                  />
                  <Text className={styles.addTagBtn} onClick={handleAddCustomTag}>确定</Text>
                </View>
              ) : (
                <View 
                  className={`${styles.tagItem} ${styles.addTag}`}
                  onClick={() => setIsAddingTag(true)}
                >
                <Text>#添加话题</Text>
              </View>
              )}
            </View>
            
            {selectedTags.length > 0 && (
              <View className={styles.selectedTagsContainer}>
                <Text className={styles.selectedTagsTitle}>已选话题：</Text>
                <View className={styles.selectedTagsList}>
                  {selectedTags.map((tag) => (
                    <View key={tag} className={styles.selectedTag}>
                      <Text>{tag}</Text>
                      <Text 
                        className={styles.removeTag}
                        onClick={() => handleTagToggle(tag)}
                      >
                        ×
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
