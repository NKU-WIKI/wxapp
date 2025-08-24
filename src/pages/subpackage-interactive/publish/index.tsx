import { useState, useEffect } from "react";
import Taro, { useRouter, useUnload } from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  Text,
  Input,
  Textarea,
  Image,
  ScrollView,
} from "@tarojs/components";

// Absolute imports (alphabetical order)
import { AppDispatch, RootState } from "@/store";
import agentApi from "@/services/api/agent";

import knowledgeApi from "@/services/api/knowledge";
import { uploadApi } from "@/services/api/upload";
import { createPost } from "@/store/slices/postSlice";
import CustomHeader from "@/components/custom-header";
import { DraftPost } from "@/types/draft";
import { normalizeImageUrl } from "@/utils/image";
import { saveDraft, getDrafts } from "@/utils/draft";

// Asset imports
import atSignIcon from "@/assets/at-sign.svg";
import bagIcon from "@/assets/bag.svg";
import boldIcon from "@/assets/bold.svg";
import defaultAvatar from "@/assets/profile.png";
import hatIcon from "@/assets/hat.svg";
import imageIcon from "@/assets/image.svg";
import italicIcon from "@/assets/italic.svg";
import lightbulbIcon from "@/assets/lightbulb.svg";
import penToolIcon from "@/assets/pen-tool.svg";
import school from "@/assets/school.svg";
import starIcon from "@/assets/star2.svg";
import usersGroupIcon from "@/assets/p2p-fill.svg";
import xCircleIcon from "@/assets/x-circle.svg";

// Relative imports
import PublishSettings from "./components/PublishSettings";
import styles from "./index.module.scss";

const mockData = {
  tags: ["#校园生活", "#学习交流", "#求助", "#资源分享", "#活动通知"],
  styles: ["正式", "轻松", "幽默", "专业"],
};

// 分类数据，与首页保持一致
const categories = [
  { id: "c1a7e7e4-a5a6-4b1b-8c8d-9e9f9f9f9f9f", name: "学习交流", icon: school },
  { id: "c2b8f8f5-b6b7-4c2c-9d9e-1f1f1f1f1f1f", name: "校园生活", icon: hatIcon },
  { id: "c3c9a9a6-c7c8-4d3d-aeaf-2a2b2c2d2e2f", name: "就业创业", icon: starIcon },
  { id: "d4d1a1a7-d8d9-4e4e-bfbf-3a3b3c3d3e3f", name: "社团活动", icon: usersGroupIcon },
  { id: "e5e2b2b8-e9ea-4f5f-cfdf-4a4b4c4d4e4f", name: "失物招领", icon: bagIcon },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string>("c1a7e7e4-a5a6-4b1b-8c8d-9e9f9f9f9f9f"); // 默认选择第一个分类
  // 标记是否已通过弹窗保存过草稿，避免 useUnload 再次保存
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishSuggestion, setPolishSuggestion] = useState<string>('建议调整：1. 增加段落间的过渡...');
  const [showRefPanel, setShowRefPanel] = useState(false);
  const [refSuggestions, setRefSuggestions] = useState<Array<{ type: 'history' | 'knowledge'; id?: string; title: string }>>([]);

  const [showDraftPicker, setShowDraftPicker] = useState(false);
  const [draftList, setDraftList] = useState<DraftPost[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const draftId = router?.params?.draftId;
  const userInfo = useSelector((state: RootState) => state.user?.currentUser || state.user?.userProfile);

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

  // 初始化草稿列表
  useEffect(() => {
    const drafts = getDrafts();
    setDraftList(drafts);
  }, []);

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
          images: images,
          tags: processedTags, // 添加标签数据
          is_public: isPublic,
          allow_comments: allowComments,
          category_id: selectedCategory, // 添加分类ID
        })
      ).unwrap();

      Taro.showToast({
        title: "发布成功",
        icon: "success",
        duration: 1500,
      });



      // 1.5秒后跳转到首页并强制刷新
      setTimeout(() => {
        Taro.reLaunch({
          url: '/pages/home/index?refresh=true',
        });
      }, 1500);
    } catch (error: any) {
      Taro.showToast({
        title: error || "发布失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  const handlePolish = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请先输入内容', icon: 'none' });
      return;
    }
    setPolishLoading(true);
    try {
      const res = await agentApi.textPolish({ text: content, mode: 'professional', stream: false });
      if (res.code === 200) {
        setPolishSuggestion((res.data as any)?.content || '');
      } else {
        const m = res.msg || res.message || '润色失败';
        Taro.showToast({ title: m, icon: 'none' });
      }
    } catch (e: any) {
      Taro.showToast({ title: e?.message || '润色失败', icon: 'none' });
    } finally {
      setPolishLoading(false);
    }
  };

  const applyPolish = () => {
    if (!polishSuggestion) return;
    setContent(polishSuggestion);
    Taro.showToast({ title: '已应用润色', icon: 'success' });
  };

  // 检查标签是否被选中的辅助函数
  const isTagSelected = (tag: string): boolean => {
    return selectedTags.includes(tag);
  };

  return (
    <View className={styles.pageContainer} >
      {/* 顶部提示 */}
       {/*<View style={{ background: '#FFFBEA', color: '#B7791F', padding: '8px 16px', fontSize: 13, textAlign: 'center' }}>
        返回请用左上角按钮，否则自动保存草稿
      </View> 顶部存在的空白，注释后更美观     */}
      <CustomHeader title='发布帖子' onLeftClick={handleBack} />

      <View className={styles.contentWrapper}>
        <ScrollView scrollY className={styles.scrollView}>
          <View className={styles.publishCard}>
            <Input
              placeholder='请输入标题'
              className={styles.titleInput}
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
            <View className={styles.separator} />
            <Textarea
              placeholder='分享你的想法...'
              className={styles.contentInput}
              value={content}
              onInput={async (e) => {
                const v = e.detail.value;
                setContent(v);
                const match = v.match(/(^|\s)@([^\s@]{0,30})$/);
                if (match) {
                  const query = match[2] || '';
                  const isKnowledge = /^k:|^knowledge:/i.test(query);
                  const pure = query.replace(/^k:|^knowledge:/i, '').trim();
                  if (isKnowledge) {
                    try {
                      const res = await knowledgeApi.getSuggestions(pure || '', 6);
                      const items = Array.isArray(res.data) ? res.data.slice(0, 6) : [];
                      setRefSuggestions(items.map((t: string) => ({ type: 'knowledge', title: t })));
                      setShowRefPanel(true);
                    } catch {
                      setShowRefPanel(false);
                    }
                  } else {
                    try {
                      const { getHistory } = await import('@/utils/history');
                      const list = getHistory(1, 50) || [];
                      const filtered = list.filter((h) => h.title.toLowerCase().includes((query || '').toLowerCase()));
                      setRefSuggestions(filtered.slice(0, 6).map((h) => ({ type: 'history', id: h.id, title: h.title })));
                      setShowRefPanel(true);
                    } catch {
                      setShowRefPanel(false);
                    }
                  }
                } else {
                  setShowRefPanel(false);
                }
              }}
              maxlength={2000}
              autoHeight
            />
            {showRefPanel && refSuggestions.length > 0 && (
              <View className={styles.refPanel}>
                {refSuggestions.map((s, i) => (
                  <View
                    key={`${s.type}-${s.id || s.title}-${i}`}
                    className={styles.refItem}
                    onClick={() => {
                      const replaced = content.replace(/(^|\s)@([^\s@]{0,30})$/, (m) => {
                        if (s.type === 'history') return `${m.startsWith(' ') ? ' ' : ''}[ref:post:${s.id}|${s.title}] `;
                        return `${m.startsWith(' ') ? ' ' : ''}[ref:knowledge:${s.title}] `;
                      });
                      setContent(replaced);
                      setShowRefPanel(false);
                    }}
                  >
                    <Text className={styles.refType}>{s.type === 'history' ? '历史' : '知识'}</Text>
                    <Text className={styles.refTitle}>{s.title}</Text>
                  </View>
                ))}
              </View>
            )}

            <View className={styles.imagePreviewContainer}>
              {images.map((url, index) => (
                <View key={index} className={styles.imageWrapper}>
                  <Image
                    src={normalizeImageUrl(url)}
                    className={styles.previewImage}
                    mode='aspectFill'
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
            <View className={styles.toolbar}>
              <Image src={boldIcon} className={styles.toolbarIcon} />
              <Image src={italicIcon} className={styles.toolbarIcon} />
              <Image
                src={imageIcon}
                className={styles.toolbarIcon}
                onClick={handleChooseImage}
              />
              <Image src={atSignIcon} className={styles.toolbarIcon} />
              <View className={styles.wikiBtn} onClick={handlePolish}>
                <Image src={penToolIcon} className={styles.wikiIcon} />
                <Text>{polishLoading ? '润色中…' : 'Wiki 润色'}</Text>
              </View>
            </View>
          </View>

          {/* Select Topic */}
          <View className={styles.publishCard}>
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
                    placeholder='输入话题'
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

          {/* Category Selection */}
          <View className={styles.publishCard}>
            <Text className={styles.sectionTitle}>选择分类</Text>
            <View className={styles.categoriesContainer}>
              {categories.map((category) => (
                <View
                  key={category.id}
                  className={`${styles.categoryItem} ${
                    selectedCategory === category.id ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Image src={category.icon} className={styles.categoryIcon} />
                  <Text className={styles.categoryName}>{category.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Wiki Polish Suggestion */}
          <View className={`${styles.suggestionCard} ${styles.publishCard}`}>
            <Image src={lightbulbIcon} className={styles.suggestionIcon} />
            <View className={styles.suggestionContent}>
              <View className={styles.suggestionHeader}>
                <Text className={styles.sectionTitle}>Wiki 润色建议</Text>
                <Text className={styles.applyBtn} onClick={applyPolish}>应用</Text>
              </View>
              <Text className={styles.suggestionText}>
                {polishSuggestion}
              </Text>
            </View>
          </View>

          {/* Writing Style Selection */}
          <View className={styles.publishCard}>
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

      {showDraftPicker && (
        <View className={styles.draftOverlay}>
          <View className={styles.draftModal}>
            <Text className={styles.draftTitle}>从草稿继续编辑</Text>
            <ScrollView scrollY className={styles.draftList}>
              {draftList.map((d) => (
                <View key={d.id} className={styles.draftItem} onClick={() => {
                  setShowDraftPicker(false);
                  console.log('[publish] 选择草稿并跳转:', d.id);
                  Taro.redirectTo({ url: `/pages/subpackage-interactive/publish/index?draftId=${d.id}` });
                }}
                >
                  <Text className={styles.draftItemTitle}>{d.title?.trim() || '无标题草稿'}</Text>
                </View>
              ))}
            </ScrollView>
            <View className={styles.newPostButton} onClick={() => setShowDraftPicker(false)}>
              <Text>不使用草稿，新建帖子</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
