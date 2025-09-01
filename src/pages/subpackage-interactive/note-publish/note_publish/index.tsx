import { useState, useEffect, useCallback } from "react";
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
import CustomHeader from "@/components/custom-header";
import { usePolish } from "@/hooks/usePolish";
import searchApi from "@/services/api/search";
import { getPostDetail, getMyDrafts, deleteDraft } from "@/services/api/post";
import { createNote } from '@/store/slices/noteSlice';
import { DraftPost } from "@/types/draft";

import { saveDraft, getDrafts } from "@/utils/draft";
import type { Post } from "@/types/api/post.d";

// Asset imports
import atSignIcon from "@/assets/at-sign.svg";
import boldIcon from "@/assets/bold.svg";
import defaultAvatar from "@/assets/profile.png";
import italicIcon from "@/assets/italic.svg";

import penToolIcon from "@/assets/pen-tool.svg";
import xCircleIcon from "@/assets/x-circle.svg";

import topicIcon from "@/assets/hash_topic.svg";
import settingIcon from "@/assets/cog.svg";
import switchOffIcon from "@/assets/switch-off.svg";
import switchOnIcon from "@/assets/switch-on.svg";

// Relative imports
import styles from "./index.module.scss";





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
  const [activeMenu, setActiveMenu] = useState<'topic' | 'settings' | 'comments' | null>(null);
  const [isQuickActionActive, setIsQuickActionActive] = useState(false);
  
  // 卡片图片相关状态
  const [cardImage, setCardImage] = useState<string>('');

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
  const userInfo = useSelector((state: RootState) => state.user?.currentUser || state.user?.userProfile);

  // 处理卡片图片参数
  useEffect(() => {
    const { cardImage: imageParam, cardText: textParam } = router?.params || {};
    if (imageParam) {
      const decodedImagePath = decodeURIComponent(imageParam);
      
      setCardImage(decodedImagePath);
      setImages([decodedImagePath]);
    }
    if (textParam) {
      // 如果有卡片文本，可以预填到内容中
      setTitle(decodeURIComponent(textParam));
    }
  }, [router?.params]);

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
                const payloadForDraft = {
                  title: title.trim(),
                  content: content.trim(),
                  status: 'draft' as const,
                  category_id: selectedCategory,
                  images: images,
                  tags: processedTags,
                  visibility: (isPublic ? 'PUBLIC' : 'PRIVATE') as 'PUBLIC' | 'PRIVATE',
                  allow_comment: allowComments,
                  allow_share: false,
                };
                await dispatch(createNote(payloadForDraft)).unwrap();
                setHasSavedDraft(true);
                Taro.showToast({ title: '笔记已保存到草稿箱', icon: 'success' });
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
            Taro.showToast({ title: '笔记已保存到草稿箱（本地）', icon: 'success' });
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
              const payloadForDraft = {
                title: title.trim(),
                content: content.trim(),
                status: 'draft' as const,
                category_id: selectedCategory,
                images: images,
                tags: processedTags,
                visibility: (isPublic ? 'PUBLIC' : 'PRIVATE') as 'PUBLIC' | 'PRIVATE',
                allow_comment: allowComments,
                allow_share: false,
              };
              await dispatch(createNote(payloadForDraft)).unwrap();
              Taro.showToast({ title: '笔记已保存到草稿箱', icon: 'success' });
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
          Taro.showToast({ title: '笔记已保存到草稿箱（本地）', icon: 'success' });
        }
        // 无论选择保存还是不保存，都标记为已处理，避免重复弹窗
        setHasSavedDraft(true);
      }
    });
  });




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
      // Taro.showToast({ title: "请输入话题", icon: "none" });
      setIsAddingTag(false);
      return;
    }

    // 格式化自定义标签
    let formattedTag = (customTag || '').replace(/[“”"']/g, '').trim();
    if (formattedTag && !formattedTag.startsWith('#')) {
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

    
    setSelectedTags([...selectedTags, formattedTag]);
    setCustomTag("");
    setIsAddingTag(false);

      // 添加成功反馈
    Taro.showToast({ 
      title: "话题添加成功", 
      icon: "none",
      duration: 1000 
    });
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Taro.showToast({
        title: "请输入笔记标题",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({
        title: "请输入笔记内容",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    try {
      // 处理标签，去掉#前缀
      const processedTags = selectedTags.map(tag => tag.startsWith('#') ? tag.substring(1) : tag);
      

      await dispatch(
        createNote({
          title,
          content,
          status: 'published',
          images: images,
          tags: processedTags, // 添加标签数据
          visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
          allow_comment: allowComments,
          allow_share: true,
          category_id: selectedCategory, // 添加分类ID
        })
      ).unwrap();

      Taro.showToast({
        title: "笔记发布成功",
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
        title: error || "笔记发布失败",
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
        Taro.showToast({ title: '已采纳笔记润色', icon: 'success' });
      }, 50);
    });
  };

  const handleRejectPolish = () => {
    rejectPolish();
    Taro.showToast({ title: '已拒绝笔记润色', icon: 'none' });
  };

  // AI润色笔记功能
  const handlePolish = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请先输入笔记内容', icon: 'none' });
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
      <CustomHeader title='发布笔记' onLeftClick={handleBack} />

      <View className={styles.contentWrapper}>
        <ScrollView 
          scrollY 
          className={styles.scrollView}
          onClick={(e) => {
            // 阻止事件冒泡，避免触发容器的点击事件
            e.stopPropagation();
          }}
        >
          {/* 卡片图片展示 */}
          {cardImage && (
            <View className={styles.cardImageContainer}>
              <Image 
                src={cardImage} 
                className={styles.cardImage}
                mode='widthFix'
              />
              <View 
                className={styles.deleteCardImage}
                onClick={() => setCardImage('')}
              >
                <Image src={xCircleIcon} className={styles.deleteIcon} />
              </View>
            </View>
          )}

          <View className={styles.publishCard}>
            <Input
              placeholder='请输入笔记标题'
              className={styles.titleInput}
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
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
                placeholder='记录你的想法和见解...'
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

            {/* Toolbar */}
            <View className={styles.toolbar}>
              <Image src={boldIcon} className={styles.toolbarIcon} />
              <Image src={italicIcon} className={styles.toolbarIcon} />
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
                      {['正式', '轻松', '幽默', '专业'].map((style) => (
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

              {/* 这里展示已经选择的话题 */}
              {selectedTags.length > 0 && (
              <View className={styles.selectedTagsContainer}>
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
            <View 
              className={styles.visibleAll}
              onClick={() => {
                setIsQuickActionActive(true);
                setActiveMenu(activeMenu === 'settings' ? null : 'settings');
              }}
            >
              <Text>{isPublic ? '所有人可见 ◑' : '仅对自己可见 ◐'}</Text>
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
              className={`${styles.quickActionItem} ${activeMenu === 'topic' ? styles.active : ''}`}
              onClick={() => {
                setIsQuickActionActive(true);
                setActiveMenu(activeMenu === 'topic' ? null : 'topic');
              }}
            >
              <Image src={topicIcon} className={styles.quickActionIcon} />
            </View>
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
            <View 
              className={styles.subMenuContainer}
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickActionActive(true);
              }}
            >
              {activeMenu === 'topic' && (
                <View className={styles.subMenu}>
                  <Text className={styles.sectionTitle}>选择话题 ({selectedTags.length}/3)</Text>
                  <View className={styles.tagsContainer}>
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
                        <Text 
                          className={styles.addTagBtn} 
                          onClick={() => {
                            setIsQuickActionActive(true);
                            handleAddCustomTag();
                          }}
                        >
                          确定
                        </Text>
                      </View>
                    ) : (
                      <View
                        className={`${styles.tagItem} ${styles.addTag}`}
                        onClick={() => {
                          setIsQuickActionActive(true);
                          setIsAddingTag(true);
                        }}
                      >
                        <Text>#添加话题</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              
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
              
              {activeMenu === 'comments' && (
                <View className={styles.subMenu}>
                  <Text className={styles.sectionTitle}>评论设置</Text>
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
        <Text>发布笔记</Text>
      </View>

      {showDraftPicker && (
        <View className={styles.draftOverlay}>
          <View className={styles.draftModal}>
            <Text className={styles.draftTitle}>从笔记草稿继续编辑</Text>
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
                  <Text className={styles.draftItemTitle}>{(item.title || '').trim() || '无标题笔记草稿'}</Text>
                </View>
                ))}
            </ScrollView>
            <View className={styles.newPostButton} onClick={() => setShowDraftPicker(false)}>
              <Text>不使用笔记草稿，新建笔记</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
