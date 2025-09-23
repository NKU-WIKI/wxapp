import { useState, useEffect, useCallback } from "react";
import Taro, { useRouter, useUnload } from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import { View, Text, Input, Textarea, Image, ScrollView } from "@tarojs/components";
// Absolute imports (alphabetical order)
import { AppDispatch, RootState } from "@/store";
import CustomHeader from "@/components/custom-header";
import { usePolish } from "@/hooks/usePolish";
import searchApi from "@/services/api/search";
import { uploadApi } from "@/services/api/upload";
import { getPostDetail, getMyDrafts, deleteDraft } from "@/services/api/post";
import { createPost } from "@/store/slices/postSlice";
import { normalizeImageUrl } from "@/utils/image";
import { checkFileUploadPermissionWithToast } from "@/utils/permissionChecker";
import { DraftPost } from "@/types/draft";
import { saveDraft, getDrafts } from "@/utils/draft";
import type { Post } from "@/types/api/post.d";

// Asset imports
import atSignIcon from "@/assets/at-sign.svg";
import bagIcon from "@/assets/bag.svg";
import boldIcon from "@/assets/bold.svg";
import cameraIcon from "@/assets/camera.svg";
import defaultAvatar from "@/assets/profile.png";
import hatIcon from "@/assets/hat.svg";
import imageIcon from "@/assets/image.svg";
import italicIcon from "@/assets/italic.svg";
import plusIcon from "@/assets/plus.svg";

import penToolIcon from "@/assets/pen-tool.svg";
import studyIcon from "@/assets/school.svg";
import starIcon from "@/assets/star2.svg";
import usersGroupIcon from "@/assets/p2p-fill.svg";
import xCircleIcon from "@/assets/x-circle.svg";

import settingIcon from "@/assets/cog.svg";
import switchOffIcon from "@/assets/switch-off.svg";
import switchOnIcon from "@/assets/switch-on.svg";

// Relative imports
import styles from "./index.module.scss";

const mockData = {
  styles: ["正式", "轻松", "幽默", "专业"],
};

// 分类数据，与首页保持一致
const categories = [
  { id: "c1a7e7e4-a5a6-4b1b-8c8d-9e9f9f9f9f9f", name: "学习交流", icon: studyIcon },
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("c1a7e7e4-a5a6-4b1b-8c8d-9e9f9f9f9f9f"); // 默认选择第一个分类
  // 标记是否已通过弹窗保存过草稿，避免 useUnload 再次保存
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [showRefPanel, setShowRefPanel] = useState(false);
  const [refSuggestions, setRefSuggestions] = useState<Array<{ type: 'history' | 'knowledge'; id?: string; title: string }>>([]);
  const [showDraftPicker, setShowDraftPicker] = useState(false);
  const [draftList, setDraftList] = useState<DraftPost[]>([]);
  const [serverDrafts, setServerDrafts] = useState<Post[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'settings' | null>(null);
  const [isQuickActionActive, setIsQuickActionActive] = useState(false);

  // 使用润色Hook
  const {
    loading: polishLoading,
    typingText,
    isTyping,
    showOptions,
    polishTextWithAnimation,
    acceptPolish,
    rejectPolish
  } = usePolish();

  // 文风选择状态
  const [showStyleSelector, setShowStyleSelector] = useState(false);

  // Tag helpers: normalize and format
  const normalizeTagText = useCallback((t: string): string => {
    if (!t) return '';
    let s = String(t);
    s = s.replace(/[“”"']/g, ''); // remove quotes
    s = s.trim();
    if (s.startsWith('#')) s = s.slice(1);
    return s;
  }, []);

  const formatTagForState = useCallback((t: string): string => {
    const s = normalizeTagText(t);
    return s ? `#${s}` : '';
  }, [normalizeTagText]);
  const formatTagsForPayload = (arr: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    (arr || []).forEach((t) => {
      const s = normalizeTagText(t);
      if (s && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    });
    return out;
  };

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const draftId = router?.params?.draftId;
  const postId = router?.params?.postId;
  const userInfo = useSelector((state: RootState) => state.user?.user);

  // 添加调试日志，查看当前选中的标签
  useEffect(() => {
    
  }, [selectedTags]);

  // 编辑草稿时初始化内容
  useEffect(() => {
    if (draftId) {
      const drafts = getDrafts();
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        setTitle(draft.title || '');
        setContent(draft.content || '');
        // 同步本地草稿的标签与分类
        try {
          const tagTexts = Array.isArray((draft as any).tags) ? (draft as any).tags : [];
          if (tagTexts.length > 0) {
            const withSharp = tagTexts.map((t: string) => (t && t.startsWith('#') ? t : `#${t}`));
            setSelectedTags(withSharp);
          }
        } catch {}
        if ((draft as any).category_id) {
          setSelectedCategory((draft as any).category_id);
        }
        // setImages(draft.images || []); // 如有图片字段可补充
      }
    }
  }, [draftId]);

  // 从服务端草稿加载预填（通过 postId 参数）
  useEffect(() => {
    const loadServerDraft = async () => {
      if (!postId) return;
      try {
        // 优先从临时缓存读取，避免因接口权限/路径导致的404
        const cached: any = Taro.getStorageSync('tmp_server_draft');
        let p: any = cached && cached.id === postId ? cached : null;
        if (!p) {
          try {
            const res = await getPostDetail(postId);
            p = res?.data;
          } catch {}
        }
        if (p) {
          setTitle(p?.title || '');
          setContent(p?.content || '');
          const imgs: string[] = Array.isArray(p?.images)
            ? p.images
            : Array.isArray(p?.image_urls)
            ? p.image_urls
            : (typeof p?.image === 'string' ? [p.image] : Array.isArray(p?.image) ? p.image : []);
          if (imgs?.length) setImages(imgs);
          // 同步草稿的标签与分类
          try {
            const rawTags: any[] = Array.isArray((p as any).tags) ? (p as any).tags : [];
            const tagTexts = rawTags.map((t: any) => (typeof t === 'string' ? t : (t?.name || ''))).filter((t: string) => !!t);
            if (tagTexts.length > 0) setSelectedTags(tagTexts.map(formatTagForState));
          } catch {}
          if ((p as any).category_id) setSelectedCategory((p as any).category_id);
          try { await deleteDraft(postId); } catch {}
          try { Taro.removeStorageSync('tmp_server_draft'); } catch {}
        }
      } catch (e) {
        // ignore
      }
    };
    loadServerDraft();
  }, [postId, formatTagForState]);

  // 初始化草稿列表（本地 + 服务端），若存在则弹出选择窗口
  useEffect(() => {
    const initDrafts = async () => {
      const localDrafts = getDrafts();
      setDraftList(localDrafts);
      try {
        const res = await getMyDrafts();
        const s = Array.isArray(res.data) ? res.data.filter((p: any) => p.status === 'draft') : [];
        setServerDrafts(s as Post[]);
        if (!draftId && !postId && (localDrafts.length > 0 || s.length > 0)) {
          setShowDraftPicker(true);
        }
      } catch {
        if (!draftId && !postId && localDrafts.length > 0) {
          setShowDraftPicker(true);
        }
      }
    };
    initDrafts();
  }, [draftId, postId]);

  // 点击外部关闭文风选择器
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (showStyleSelector && event.target) {
        const styleSelector = event.target.closest('.styleSelector');
        const styleButton = event.target.closest('.styleButton');
        if (!styleSelector && !styleButton) {
          setShowStyleSelector(false);
        }
      }
    };

    if (showStyleSelector) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showStyleSelector]);

  // 回退时弹窗询问是否保存草稿
  const handleBack = () => {
    if (title.trim() || content.trim()) {
      Taro.showModal({
        title: '是否保存为草稿？',
        content: '你有未发布的内容，是否保存为草稿？',
        confirmText: '保存',
        cancelText: '不保存',
        success: async (res) => {
          if (res.confirm) {
            // 优先保存到服务器草稿；若不满足后端必填或失败，则回退本地保存
            const canSaveServer = title.trim().length >= 1 && content.trim().length >= 1;
            if (canSaveServer) {
              try {
                const processedTags = formatTagsForPayload(selectedTags);
                const payloadForDraft: import('@/types/api/post.d').CreateForumPostRequest = {
                  title: title.trim(),
                  content: content.trim(),
                  status: 'draft' as const,
                  category_id: selectedCategory,
                  images: images,
                  tags: processedTags,
                  is_public: isPublic,
                  allow_comments: allowComments,
                };
                await dispatch(createPost(payloadForDraft)).unwrap();
                setHasSavedDraft(true);
                Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
                setTimeout(() => {
                  Taro.navigateBack();
                }, 500);
                return;
              } catch (e) {
                // fallthrough to local save
              }
            }

            const id = draftId || uuid();
            const processedTags = formatTagsForPayload(selectedTags);
            saveDraft({
              id,
              title,
              content,
              avatar: (userInfo as any)?.avatar || defaultAvatar,
              updatedAt: Date.now(),
              tags: processedTags,
              category_id: selectedCategory,
            });
            setHasSavedDraft(true);
            Taro.showToast({ title: '已保存到草稿箱（本地）', icon: 'success' });
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

  // 页面卸载时弹窗询问是否保存草稿（与左上角返回行为一致）
  useUnload(() => {
    // 如果已经通过左上角按钮保存过，或者没有内容，则不处理
    if (hasSavedDraft || (!title.trim() && !content.trim()) || draftId) {
      return;
    }

    // 弹窗询问是否保存草稿（与 handleBack 逻辑保持一致）
    Taro.showModal({
      title: '是否保存为草稿？',
      content: '你有未发布的内容，是否保存为草稿？',
      confirmText: '保存',
      cancelText: '不保存',
      success: async (res) => {
        if (res.confirm) {
          // 优先保存到服务器草稿；若不满足后端必填或失败，则回退本地保存
          const canSaveServer = title.trim().length >= 1 && content.trim().length >= 1;
          if (canSaveServer) {
            try {
              const processedTags = formatTagsForPayload(selectedTags);
              const payloadForDraft: import('@/types/api/post.d').CreateForumPostRequest = {
                title: title.trim(),
                content: content.trim(),
                status: 'draft' as const,
                category_id: selectedCategory,
                images: images,
                tags: processedTags,
                is_public: isPublic,
                allow_comments: allowComments,
              };
              await dispatch(createPost(payloadForDraft)).unwrap();
              Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
              return;
            } catch (e) {
              // fallthrough to local save
            }
          }

          // 如果服务器保存失败或不满足条件，则保存到本地
          const id = uuid();
          const processedTags = formatTagsForPayload(selectedTags);
          saveDraft({
            id,
            title,
            content,
            avatar: (userInfo as any)?.avatar || defaultAvatar,
            updatedAt: Date.now(),
            tags: processedTags,
            category_id: selectedCategory,
          });
          Taro.showToast({ title: '已保存到草稿箱（本地）', icon: 'success' });
        }
        // 无论选择保存还是不保存，都标记为已处理，避免重复弹窗
        setHasSavedDraft(true);
      }
    });
  });

  const handleChooseImage = () => {
  // 检查文件上传权限
  if (!checkFileUploadPermissionWithToast()) {
    return;
  }
  
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
      Taro.showLoading({ title: "上传中...", mask: true });
      try {
        const uploadPromises = res.tempFilePaths.map((path) =>
          uploadApi.uploadImage(path)
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...uploadedUrls]);
        Taro.showToast({ title: "上传成功", icon: "success" });
      } catch (error) {
        
        Taro.showToast({ title: "上传失败，请重试", icon: "none" });
      } finally {
        setIsUploading(false);
        Taro.hideLoading();
      }
    },
    fail: (err) => {
      // 用户取消选择是正常行为，不需要显示错误提示
      if (err.errMsg && err.errMsg.includes('cancel')) {
        return;
      }
      // 只有真正的错误才显示提示
      Taro.showToast({ 
        title: "选择图片失败", 
        icon: "none" 
      });
    }
  });
};

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTagToggle = (tag: string) => {
    const s = (tag || '').replace(/[“”"']/g, '').trim();
    const cleaned = s.startsWith('#') ? s : `#${s}`;
    if (!cleaned) return;

    

    if (selectedTags.includes(cleaned)) {
      const newTags = selectedTags.filter(t => t !== cleaned);
      
      setSelectedTags(newTags);
    } else {
      if (selectedTags.length < 3) {
        const newTags = [...selectedTags, cleaned];
        
        setSelectedTags(newTags);
      } else {
        Taro.showToast({ title: "最多选择3个话题", icon: "none" });
      }
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) {
      setIsAddingTag(false);
      setCustomTag('');
      return;
    }

    // 格式化自定义标签，确保有#前缀
    let formattedTag = (customTag || '').replace(/[""'"']/g, '').trim();
    if (formattedTag && !formattedTag.startsWith('#')) {
      formattedTag = `#${formattedTag}`;
    }

    // 检查是否已存在该标签
    if (selectedTags.includes(formattedTag)) {
      setIsAddingTag(false);
      setCustomTag('');
      return;
    }

    // 检查是否超过最大数量
    if (selectedTags.length >= 3) {
      setIsAddingTag(false);
      setCustomTag('');
      return;
    }

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
    if (title.trim().length < 4) {
      Taro.showToast({
        title: "标题至少需要4个字符",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    if (title.trim().length > 20) {
      Taro.showToast({
        title: "标题最多20个字符",
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
      

      await dispatch(
        createPost({
          title,
          content,
          status: 'published',
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

  const handleAcceptPolish = () => {
    acceptPolish((polishedText) => {
      // 先清空内容，然后重新设置，确保Textarea正确计算高度
      setContent('');
      setTimeout(() => {
        setContent(polishedText);
        Taro.showToast({ title: '已采纳润色', icon: 'success' });
      }, 50);
    });
  };

  const handleRejectPolish = () => {
    rejectPolish();
    Taro.showToast({ title: '已拒绝润色', icon: 'none' });
  };

  const handlePolish = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请先输入内容', icon: 'none' });
      return;
    }
    try {
      // 开启打字机动画，动画完成后会显示接受/拒绝选项
      await polishTextWithAnimation(content, selectedStyle);
      // 动画完成后会自动显示选项，不需要额外操作
    } catch (error) {
      // 错误已在hook中处理
    }
  };

  const handleLongPressDelete = (tag: string) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除话题 "${tag}" 吗？`,
      confirmText: '删除',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          const newTags = selectedTags.filter(t => t !== tag);
          setSelectedTags(newTags);
          Taro.showToast({ title: '话题已删除', icon: 'success' });
        }
      }
    });
  };


  return (
    <View 
      className={styles.pageContainer}
      onClick={() => {
        if (isQuickActionActive) {
          setIsQuickActionActive(false);
          setActiveMenu(null);
        }
      }}
    >
      {/* 顶部提示 */}
       {/*<View style={{ background: '#FFFBEA', color: '#B7791F', padding: '8px 16px', fontSize: 13, textAlign: 'center' }}>
        返回请用左上角按钮，否则自动保存草稿
      </View> 顶部存在的空白，注释后更美观     */}
      <CustomHeader title='发布帖子' onLeftClick={handleBack} />

      <View className={styles.contentWrapper}>
        <ScrollView 
          scrollY 
          className={styles.scrollView}
          onClick={(e) => {
            // 阻止事件冒泡，避免触发容器的点击事件
            e.stopPropagation();
          }}
        >
          <View className={styles.publishCard}>
            <View className={styles.titleSection}>
              <Input
                placeholder='请描述你的需求（4~20字）'
                className={styles.titleInput}
                value={title}
                maxlength={20}
                onInput={(e) => setTitle(e.detail.value)}
              />
              <Text className={styles.titleCount}>{title.length}/20</Text>
            </View>
            <View className={styles.separator} />
            {/* 润色打字机动画或普通输入框 */}
            {isTyping || typingText ? (
              <View className={styles.typingContainer}>
                <Text className={`${styles.typingText} ${isTyping ? styles.typing : ''}`}>
                  {typingText}
                  {isTyping && <Text className={styles.cursor}>|</Text>}
                </Text>
                {/* 接受/拒绝按钮 */}
                {showOptions && (
                  <View className={styles.polishActions}>
                    <View className={styles.rejectBtn} onClick={handleRejectPolish}>
                      <Text>拒绝</Text>
                    </View>
                    <View className={styles.acceptBtn} onClick={handleAcceptPolish}>
                      <Text>采纳</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Textarea
                placeholder='分享你的想法...'
                className={styles.contentInput}
                value={content}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => {
              setIsInputFocused(false);
              // 延迟关闭，给用户时间点击快捷操作栏
              setTimeout(() => {
                if (!isQuickActionActive) {
                  setActiveMenu(null);
                }
              }, 100);
            }}
                onInput={async (e) => {
                  const v = e.detail.value;
                  setContent(v);
                  const match = v.match(/(^|\s)@([^\s@]{0,30})$/);
                  if (match) {
                    const query = match[2] || '';
                    const isKnowledge = /^k:|^knowledge:/i.test(query);
                    if (isKnowledge) {
                      try {
                        // 使用热门搜索词作为知识建议的替代
                        const hotQueries = await searchApi.getHotQueriesSimple();
                        
                        const items = hotQueries.slice(0, 6);
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
              />
            )}
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

            {/* 话题标签直接显示在内容后面 */}
            {selectedTags.length > 0 && (
              <View className={styles.inlineTopics}>
                {selectedTags.map((tag) => (
                  <View 
                    key={tag} 
                    className={styles.inlineTopicWrapper}
                    onLongPress={() => handleLongPressDelete(tag)}
                  >
                    <Text className={styles.inlineTopic}>
                      {tag}
                    </Text>
                    <Text 
                      className={styles.inlineTopicDelete}
                      onClick={() => handleTagToggle(tag)}
                    >
                      ×
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View className={styles.imagePreviewContainer}>
              {/* 图片占位符 - 总是显示，但在达到9张时隐藏 */}
              {images.length < 9 && (
                <View 
                  className={styles.imagePlaceholder}
                  onClick={handleChooseImage}
                >
                  <View className={styles.placeholderContent}>
                    <Image 
                      src={cameraIcon} 
                      className={styles.placeholderCameraIcon}
                    />
                    <Image 
                      src={plusIcon} 
                      className={styles.placeholderPlusIcon}
                    />
                  </View>
                </View>
              )}
              
              {/* 已上传的图片 */}
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

              {/* 润色工具组 */}
              <View className={styles.polishGroup}>
                {/* 文风选择器 */}
                <View className={styles.styleSelector}>
                  <View
                    className={styles.styleButton}
                    onClick={() => setShowStyleSelector(!showStyleSelector)}
                  >
                    <Text className={styles.styleText}>{selectedStyle}</Text>
                    <View className={`${styles.arrow} ${showStyleSelector ? styles.arrowUp : styles.arrowDown}`} />
                  </View>

                  {/* 文风选择下拉菜单 */}
                  {showStyleSelector && (
                    <View className={styles.styleDropdown}>
                      {mockData.styles.map((style) => (
                        <View
                          key={style}
                          className={`${styles.styleOption} ${selectedStyle === style ? styles.selected : ''}`}
                          onClick={() => {
                            setSelectedStyle(style);
                            setShowStyleSelector(false);
                          }}
                        >
                          <Text>{style}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* 润色按钮 */}
                <View
                  className={`${styles.wikiBtn} ${polishLoading ? styles.loading : ''}`}
                  onClick={handlePolish}
                >
                  <Image src={penToolIcon} className={styles.wikiIcon} />
                  <Text>{polishLoading ? '润色中…' : '润色'}</Text>
                </View>
              </View>
            </View>



            {/* 添加话题和可见性设置在同一行 */}
            <View className={styles.topicAndVisibilityRow}>
              {/* 添加话题按钮 */}
              {selectedTags.length < 3 && !isAddingTag && (
                <View 
                  className={styles.addTopicButton}
                  onClick={() => {
                    if (selectedTags.length < 3) {
                      setIsAddingTag(true);
                      setCustomTag('');
                    }
                  }}
                >
                  <Text className={styles.addTopicText}>#添加话题</Text>
                </View>
              )}

              {/* 话题输入框 - 当正在添加话题时显示，直接替换按钮位置，不换行 */}
              {isAddingTag && (
                <View className={styles.topicInputContainer}>
                  <Text className={styles.topicInputPrefix}>#</Text>
                  <Input
                    className={styles.topicInput}
                    value={customTag}
                    onInput={(e) => setCustomTag(e.detail.value)}
                    placeholder='输入话题'
                    focus
                    onBlur={handleAddCustomTag}
                    onConfirm={handleAddCustomTag}
                  />
                </View>
              )}

              {/* 所有人可见选项 */}
              <View 
                className={styles.visibleAll}
                onClick={() => {
                  setIsQuickActionActive(true);
                  setActiveMenu(activeMenu === 'settings' ? null : 'settings');
                }}
              >
                <Text className={styles.visibleAllText}>{isPublic ? '所有人可见 ◑' : '仅对自己可见 ◐'}</Text>
              </View>
            </View>
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
                  {/* <Image src={category.icon} className={styles.categoryIcon} /> */}
                  <Text className={styles.categoryName}>{category.name}</Text>
                </View>
              ))}
            </View>
          </View>





        </ScrollView>
      </View>

      {/* 快捷操作栏 - 当输入框获得焦点或用户与快捷操作栏交互时显示 */}
      {(isInputFocused || isQuickActionActive) && (
        <>
            <View 
              className={styles.quickActionBar}
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickActionActive(true);
              }}
            >
            <View 
              className={`${styles.quickActionItem} ${activeMenu === 'settings' ? styles.active : ''}`}
              onClick={() => {
                setIsQuickActionActive(true);
                setActiveMenu(activeMenu === 'settings' ? null : 'settings');
              }}
            >
              <Image src={settingIcon} className={styles.quickActionIcon} />
            </View>

          </View>
          
          {/* 子菜单界面 */}
          {activeMenu && (
            <>
              {/* 页面遮罩层 */}
              <View 
                className={styles.pageOverlay}
                onClick={() => {
                  setActiveMenu(null);
                  setIsQuickActionActive(false);
                }}
              />
              
              <View 
                className={styles.subMenuContainer}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQuickActionActive(true);
                }}
              >
                {activeMenu === 'settings' && (
                  <View className={styles.subMenu}>
                    <View className={styles.settingItem}>
                      <Text className={styles.settingLabel}>是否公开</Text>
                      <Image 
                        src={isPublic ? switchOnIcon : switchOffIcon} 
                        className={styles.switchIcon}
                        onClick={() => {
                          setIsQuickActionActive(true);
                          setIsPublic(!isPublic);
                        }}
                      />
                    </View>
                    <View className={styles.settingItem}>
                      <Text className={styles.settingLabel}>允许评论</Text>
                      <Image 
                        src={allowComments ? switchOnIcon : switchOffIcon} 
                        className={styles.switchIcon}
                        onClick={() => {
                          setIsQuickActionActive(true);
                          setAllowComments(!allowComments);
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </>
          )}
        </>
      )}
      {/* 在发布按钮添加禁用状态 */}
      <View 
        className={styles.publishButton} 
        onClick={handlePublish}
        style={{ 
          opacity: (!title.trim() || !content.trim()) ? 0.7 : 1,
          pointerEvents: (!title.trim() || !content.trim()) ? 'none' : 'auto'
        }}
      >
        <Text>发布</Text>
      </View>

      {showDraftPicker && (
        <View className={styles.draftOverlay}>
          <View className={styles.draftModal}>
            <Text className={styles.draftTitle}>从草稿继续编辑</Text>
            <ScrollView scrollY className={styles.draftList}>
              {([...
                serverDrafts.map((p) => ({ id: p.id, title: p.title, source: 'server' as const })),
                ...draftList.map((d) => ({ id: d.id, title: d.title, source: 'local' as const }))
              ] as Array<{ id: string; title: string; source: 'server' | 'local' }>)
                .reduce((acc: any[], item) => {
                  const idx = acc.findIndex(x => x.id === item.id);
                  if (idx >= 0) {
                    if (item.source === 'server') acc[idx] = item;
                  } else acc.push(item);
                  return acc;
                }, [])
                .map((item) => (
                  <View key={item.id} className={styles.draftItem} onClick={async () => {
                    setShowDraftPicker(false);
                    if (item.source === 'server') {
                      try {
                        const draft = serverDrafts.find(p => p.id === item.id);
                        if (draft) Taro.setStorageSync('tmp_server_draft', draft);
                      } catch {}
                      Taro.redirectTo({ url: `/pages/subpackage-interactive/publish/index?postId=${item.id}&isEdit=true` });
                    } else {
                      try {
                        const { removeDraft } = await import('@/utils/draft');
                        removeDraft(item.id);
                      } catch {}
                      Taro.redirectTo({ url: `/pages/subpackage-interactive/publish/index?draftId=${item.id}` });
                    }
                }}>
                  <Text className={styles.draftItemTitle}>{(item.title || '').trim() || '无标题草稿'}</Text>
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
  )
}