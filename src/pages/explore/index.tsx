import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Input, Image, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { clearSearchResults } from '@/store/slices/chatSlice';
import { fetchNoteFeed, loadMoreNotes, resetNotes, setRefreshing } from '@/store/slices/noteSlice';
import CustomHeader, { useCustomHeaderHeight } from '@/components/custom-header';
import MasonryLayout from '@/components/masonry-layout';
import searchApi from '@/services/api/search';
import agentApi from '@/services/api/agent';
import feedbackApi from '@/services/api/feedback';
import GeminiReadingAnimation from '@/components/gemini-reading-animation';
import { SearchMode } from '@/types/api/search';

// Icon imports
import xIcon from '@/assets/x.svg';
import messageCircleIcon from '@/assets/message-circle.svg';
import userIcon from '@/assets/user.svg';
import fileTextIcon from '@/assets/file-text.svg';
import bookOpenIcon from '@/assets/book-open.svg';
import websiteIcon from '@/assets/website.png';
import wechatIcon from '@/assets/wechat.png';
import marketIcon from '@/assets/market.png';
import douyinIcon from '@/assets/douyin.png';
import robotIcon from '@/assets/robot.svg';

import RagResult from './components/RagResult';
import styles from './index.module.scss';

const searchSkills = [
  { icon: messageCircleIcon, title: '@wiki', desc: 'RAG 智能问答' },
  { icon: messageCircleIcon, title: '@wiki-chat', desc: '通用对话' },
  { icon: userIcon, title: '@user', desc: '查看和关注感兴趣的人' },
  { icon: fileTextIcon, title: '@post', desc: '查找帖子，发现校园热点内容' },
  { icon: bookOpenIcon, title: '@note', desc: '搜索笔记，获取学习资料' }
];

const contentSources = [
  { icon: websiteIcon, name: '网站' },
  { icon: wechatIcon, name: '微信' },
  { icon: marketIcon, name: '集市' },
  { icon: douyinIcon, name: '抖音' }
];

export default function ExplorePage() {
  const dispatch = useDispatch<AppDispatch>();
  const headerHeight = useCustomHeaderHeight();
  
  // Redux state
  const { notes, loading, refreshing, hasMore } = useSelector((state: RootState) => state.note);
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  
  // Local state for search functionality
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [rawValue, setRawValue] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(null);
  const [searchModeDesc, setSearchModeDesc] = useState<string>(''); // 新增：存储当前模式的描述
  const [suggestions, setSuggestions] = useState<typeof searchSkills>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [showDynamicSuggestions, setShowDynamicSuggestions] = useState(false);
  const [hotSearches, setHotSearches] = useState<string[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [wxappResults, setWxappResults] = useState<any | null>(null);
  const [ragData, setRagData] = useState<any | null>(null);
  const [thinking, setThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generalResults, setGeneralResults] = useState<any[]>([]);
  const [autoFocus, setAutoFocus] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [searchSources, setSearchSources] = useState<any[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [ragResponseReady, setRagResponseReady] = useState(false); // 跟踪RAG响应是否准备好

  // Use string path for icons to align with asset loading rules
  const searchIcon = '/assets/search.svg';

  // 初始化时获取笔记动态 - 无论是否登录都应该能看到笔记
  useEffect(() => {
    if (!isSearchActive) {
      
      dispatch(fetchNoteFeed({ skip: 0, limit: 20 }));
    }
  }, [dispatch, isSearchActive, isLoggedIn]);

  // 调试信息
  useEffect(() => {
    // console.log('Explore页面状态:', {
    //   isSearchActive, 
    //   isLoggedIn, 
    //   notesCount: notes.length, 
    //   loading, 
    //   hasMore 
    // });
  }, [isSearchActive, isLoggedIn, notes.length, loading, hasMore]);

  // 处理加载更多笔记
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const skip = notes.length;
      dispatch(loadMoreNotes({ skip, limit: 20 }));
    }
  };

  // 处理刷新笔记
  const handleRefresh = () => {
    dispatch(setRefreshing(true));
    dispatch(resetNotes());
    dispatch(fetchNoteFeed({ skip: 0, limit: 20 }));
  };

  // 进入页面时清空上次持久化的搜索错误/结果，避免误显示错误态
  useEffect(() => {
    // 进入页面时清空上次持久化的搜索错误/结果，避免误显示错误态
    dispatch(clearSearchResults());
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  // 初始化热门搜索词
  useEffect(() => {
    (async () => {
      try {
        const hotQueries = await searchApi.getHotQueriesSimple();
        
        if (hotQueries.length > 0) {
          setHotSearches(hotQueries);
        }
      } catch (e) {
        
      }
    })();
  }, []);

  // If navigated with focus=true, auto focus and open search mode
  useDidShow(() => {
    try {
      const focusFlag = Taro.getStorageSync('explore_focus');
      if (focusFlag === 'true') {
        setIsSearchActive(true);
        setAutoFocus(true);
        Taro.removeStorageSync('explore_focus');
      } else {
        setAutoFocus(false);
      }
    } catch {}
  });

  const handleInputChange = (e) => {
    const raw = (e.detail.value || '') as string;

    // 已锁定模式：Input 仅承载查询部分
    if (searchMode) {
      setInputQuery(raw);
      setRawValue(`@${searchMode} ${raw}`);

      // 如果用户删除了所有内容，重置搜索模式
      if (raw === '') {
        setSearchMode(null);
        setSearchModeDesc('');
        setRawValue('');
        setShowDynamicSuggestions(false);
        return;
      }

      // 动态建议（暂时使用热门搜索词作为建议）
      if (raw.trim().length > 0) {
        // 过滤热门搜索词作为动态建议
        const filtered = hotSearches.filter(hot =>
          hot.toLowerCase().includes(raw.toLowerCase())
        );
        setDynamicSuggestions(filtered.slice(0, 5));
        setShowDynamicSuggestions(filtered.length > 0);
      } else {
        setShowDynamicSuggestions(false);
      }
      return;
    }

    // 未锁定模式：输入可能以 @ 前缀开头
    setRawValue(raw);

    let mode: SearchMode = null;
    let modeDesc = '';
    let queryPart = raw;
    const m = raw.match(/^@(wiki-chat|wiki|user|post|note)\s*/);
    if (m) {
      const key = m[1];
      mode = key === 'wiki-chat' ? 'wiki' : (key as SearchMode);
      queryPart = raw.slice(m[0].length);

      // 根据模式设置描述
      const skill = searchSkills.find(s => s.title === `@${mode}` || (key === 'wiki-chat' && s.title === '@wiki-chat'));
      if (skill) {
        modeDesc = skill.desc;
      }
    }
    setSearchMode(mode);
    setSearchModeDesc(modeDesc);
    setInputQuery(queryPart);

    // 前缀建议
    if (/^@\w*$/.test(raw)) {
      const filtered = searchSkills.filter((s) => s.title.startsWith(raw));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }

    // 动态建议（暂时使用热门搜索词作为建议）
    if (queryPart.trim().length > 0) {
      // 过滤热门搜索词作为动态建议
      const filtered = hotSearches.filter(hot =>
        hot.toLowerCase().includes(queryPart.toLowerCase())
      );
      setDynamicSuggestions(filtered.slice(0, 5));
      setShowDynamicSuggestions(filtered.length > 0);
    } else {
      setShowDynamicSuggestions(false);
    }
  };

  // 兜底处理：回车时若未识别模式但以 @user/@post/@note 开头，强制设置 searchMode
  const ensureModeBeforeSearch = () => {
    const trimmed = (`@${searchMode || ''} ${inputQuery}`).trim();
    if (trimmed.startsWith('@user')) setSearchMode('user');
    else if (trimmed.startsWith('@post')) setSearchMode('post');
    else if (trimmed.startsWith('@note')) setSearchMode('note');
    else if (trimmed.startsWith('@wiki-chat')) setSearchMode('wiki');
    else if (trimmed.startsWith('@wiki')) setSearchMode('wiki');
  };
  
  const handleSuggestionClick = (suggestion: typeof searchSkills[0]) => {
    const mode = suggestion.title.substring(1) as SearchMode;
    setSearchMode(mode);
    setSearchModeDesc(suggestion.desc);
    setRawValue(`${suggestion.title} `);
    setInputQuery('');
    setShowSuggestions(false);
  };

  const handleDynamicSuggestionClick = (s: string) => {
    // 直接填充查询，不使用@前缀
    setSearchMode(null);
    setSearchModeDesc('');
    setRawValue(s);
    setInputQuery(s);
    setShowDynamicSuggestions(false);
  };

  const handleSearch = async () => {
    if (thinking) return;
    ensureModeBeforeSearch();
    setShowSuggestions(false);
    const query = inputQuery.trim();
    if (!query && searchMode !== null) return;

    // 映射关系（按你的要求）：
    // @wiki -> /agent/rag
    // @user / @post -> /knowledge/search-wxapp
    // @knowledge -> /knowledge/search-general
    // 默认(无@前缀) -> /knowledge/search-general

    if (searchMode === 'wiki') {
      setRagData(null);
      setWxappResults(null);
      setErrorMsg(null);
      setThinking(true);
      setGeneralResults([]);
      setRagResponseReady(false); // 重置RAG响应准备状态

      try {
        if (rawValue.startsWith('@wiki-chat')) {
          const resp = await agentApi.chatCompletions({ query, stream: false });
          if (resp.code === 0) {
            setRagData({ response: (resp.data as any)?.content || '', sources: [] });
            setRagResponseReady(true); // 聊天模式直接标记为准备好
            setWxappResults(null);
            setGeneralResults([]);
          } else {
            const m = resp.msg || resp.message || '对话失败';
            Taro.showToast({ title: m, icon: 'none' });
            setErrorMsg(m);
            setRagResponseReady(false);
          }
        } else {
          // RAG 搜索流程
          const performRagSearch = async () => {
            try {
              // 阶段 1: 获取数据源，并立即开始播放动画
              const sourcesResponse = await agentApi.ragSources({ q: query, size: 10 });
              const sources = sourcesResponse.data?.sources || [];
              setSearchSources(sources);

              if (sources.length > 0) {
                setIsReading(true);
              }

              // 阶段 2: 在后台获取RAG答案
              const ragResponse = await agentApi.rag({ q: query, size: 10 });
              if (ragResponse.code === 0 && ragResponse.data) {
                setRagData(ragResponse.data);
                setRagResponseReady(true); // 标记RAG响应准备好
              } else {
                const errorMessage = ragResponse.msg || 'RAG搜索失败';
                Taro.showToast({ title: errorMessage, icon: 'none' });
                setErrorMsg(errorMessage);
                setIsReading(false); // 如果获取答案失败，也应停止动画
                setRagResponseReady(false);
              }

            } catch (e: any) {
              const errorMessage = e?.message || '搜索失败';
              Taro.showToast({ title: errorMessage, icon: 'none' });
              setErrorMsg(errorMessage);
              setIsReading(false); // 异常时停止动画
            }
          };

          performRagSearch();
        }
      } catch (e: any) {
        Taro.showToast({ title: e?.message || '搜索失败', icon: 'none' });
        setErrorMsg(e?.message || '搜索失败');
      } finally {
        setThinking(false);
      }
    } else if (searchMode === 'post' || searchMode === 'user' || searchMode === 'note') {
      setErrorMsg(null);
      setThinking(true);
      try {
        const searchParams = {
          q: query,
          type: searchMode as 'post' | 'user' | 'note',
          size: 20,
          offset: 0,
          sort_field: 'time' as const,
          sort_order: 'desc' as const,
        };
        const res = await searchApi.search(searchParams);
        if (res && res.data) {
          // 转换数据格式以兼容现有组件
          const convertedResults = res.data.items.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            nickname: item.nickname,
            bio: item.bio,
            // 保留其他字段
            ...item
          }));
          setWxappResults({
            posts: searchMode === 'post' ? { data: convertedResults, pagination: { page: 1, page_size: 20, has_more: false, total: res.data.total } } : { data: [], pagination: { page: 1, page_size: 20, has_more: false, total: 0 } },
            users: searchMode === 'user' ? { data: convertedResults, pagination: { page: 1, page_size: 20, has_more: false, total: res.data.total } } : { data: [], pagination: { page: 1, page_size: 20, has_more: false, total: 0 } },
            notes: searchMode === 'note' ? { data: convertedResults, pagination: { page: 1, page_size: 20, has_more: false, total: res.data.total } } : { data: [], pagination: { page: 1, page_size: 20, has_more: false, total: 0 } }
          });
          setRagData(null);
          setGeneralResults([]);
        } else {
          setWxappResults(null);
          Taro.showToast({ title: '搜索失败', icon: 'none' });
          setErrorMsg('搜索失败');
        }
      } catch (e) {
        setWxappResults(null);
        Taro.showToast({ title: '搜索失败', icon: 'none' });
        setErrorMsg('搜索失败');
      } finally {
        setThinking(false);
      }
    } else {
      // 默认搜索分支：使用通用搜索API
      setErrorMsg(null);
      setThinking(true);
      try {
        const q = searchMode === null ? inputQuery.trim() : query;
        if (!q) { setThinking(false); return; }
        const searchParams = {
          q,
          size: 20,
          offset: 0,
          sort_field: 'relevance' as const,
          sort_order: 'desc' as const,
        };
        const res = await searchApi.search(searchParams);
        if (res && res.data) {
          setWxappResults(null);
          setRagData(null);
          setGeneralResults(res.data.items);
        } else {
          const m = '搜索失败';
          Taro.showToast({ title: m, icon: 'none' });
          setErrorMsg(m);
        }
      } catch (e: any) {
        const m = e?.message || '搜索失败';
        Taro.showToast({ title: m, icon: 'none' });
        setErrorMsg(m);
      } finally {
        setThinking(false);
      }
    }
  };

  const handleClearInput = () => {
    setRawValue('');
    setInputQuery('');
    setSearchMode(null);
    setSearchModeDesc('');
    setShowSuggestions(false);
    setSearchSources([]);
    setIsReading(false);
    dispatch(clearSearchResults());
    setIsSearchActive(false);
  };


  
  const handleFocus = () => {
    // 清理持久化的上次错误，避免误显示错误页
    dispatch(clearSearchResults());
    setIsSearchActive(true);
    // 防止受控 focus 导致的二次渲染失焦，仅在自动聚焦场景使用一次
    if (autoFocus) setAutoFocus(false);
    if (rawValue.startsWith('@')) {
      setShowSuggestions(true);
    }
  };
  
  const renderPrefixLabel = () => {
    if (!searchMode) return null;
    return (
      <View className={styles.prefixLabelContainer}>
        <Text className={styles.prefixLabel}>@{searchMode}</Text>
      </View>
    );
  };
  
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;
    return (
      <View className={styles.suggestionsContainer}>
        {suggestions.map(skill => (
          <View key={skill.title} className={styles.suggestionItem} onClick={() => handleSuggestionClick(skill)}>
            <Image src={skill.icon} className={styles.suggestionIcon} />
            <View className={styles.suggestionText}>
              <Text className={styles.suggestionTitle}>{skill.title}</Text>
              <Text className={styles.suggestionDesc}>{skill.desc}</Text>
            </View>
          </View>
        ))}
        {showDynamicSuggestions && dynamicSuggestions.length > 0 && (
          <View className={styles.dynamicSuggestions}>
            {dynamicSuggestions.map((s, i) => (
              <View key={`${s}-${i}`} className={styles.dynamicSuggestionItem} onClick={() => handleDynamicSuggestionClick(s)}>
                <Text className={styles.dynamicSuggestionText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  const renderGeneralResults = () => (
    <View className={styles.resultsContainer}>
      {generalResults.map((result: any, idx: number) => (
        <View key={result?.id || idx} className={styles.resultItem}>
          <Image src={robotIcon} className={styles.resultIcon} />
          <View className={styles.resultTextContainer}>
            <Text className={styles.resultTitle}>{result?.title || ''}</Text>
            <Text className={styles.resultContent}>{result?.content || ''}</Text>
            <View className={styles.thumbRow}>
              <Text
                className={styles.thumbUp}
                onClick={async () => {
                  try {
                    await feedbackApi.sendThumbFeedback({ scope: 'search_result', action: 'up', title: result?.title, extra: { id: result?.id } });
                    Taro.showToast({ title: '已反馈', icon: 'success' });
                  } catch {}
                }}
              >👍 有用</Text>
              <Text
                className={styles.thumbDown}
                onClick={async () => {
                  try {
                    await feedbackApi.sendThumbFeedback({ scope: 'search_result', action: 'down', title: result?.title, extra: { id: result?.id } });
                    Taro.showToast({ title: '已反馈', icon: 'success' });
                  } catch {}
                }}
              >👎 不相关</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderInitialSearch = () => (
    <View className={styles.searchSkillsContainer}>
      <View className={styles.skillsHeader}>
        <View className={styles.skillsTitleDecorator} />
        <Text className={styles.skillsTitle}>搜索技巧</Text>
      </View>
      <View className={styles.skillsGrid}>
        {searchSkills.map((skill, index) => (
          <View key={index} className={styles.skillCard} onClick={() => handleSuggestionClick(skill)}>
            <View className={styles.skillIconContainer}>
              <Image src={skill.icon} className={styles.skillIcon} />
            </View>
            <Text className={styles.skillTitle}>{skill.title}</Text>
            <Text className={styles.skillDesc}>{skill.desc}</Text>
          </View>
        ))}
      </View>
      {hotSearches.length > 0 && (
        <View className={styles.hotSearchSection}>
          <Text className={styles.hotTitle}>热门搜索</Text>
          <View className={styles.hotTags}>
            {hotSearches.map((q) => (
              <View key={q} className={styles.hotTag} onClick={() => handleDynamicSuggestionClick(q)}>
                <Text className={styles.hotTagText}>{q}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderDefaultView = () => (
    <View>      
      {/* 瀑布流笔记展示 - 登录和未登录用户都能看到 */}
      <MasonryLayout
        notes={notes}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      
      {/* 未登录用户显示登录提示（浮动） */}
      {!isLoggedIn && (
        <View className={styles.loginHint}>
          <Text className={styles.loginHintText}>登录后解锁更多个性化推荐</Text>
          <View 
            className={styles.loginHintButton}
            onClick={() => {
              Taro.switchTab({ url: '/pages/profile/index' });
            }}
          >
            <Text className={styles.loginHintButtonText}>立即登录</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderBody = () => {
    // 搜索框应保持固定，Body 仅渲染内容区域
    if (!isSearchActive) return renderDefaultView();

    // 优先级 1: 如果有RAG数据并且响应已准备好，显示最终结果
    if (ragData && ragResponseReady) {
      return <RagResult data={ragData} />
    }

    // 优先级 2: 如果正在阅读(播放动画)，则显示动画
    if (isReading && searchSources.length > 0) {
      return (
        <GeminiReadingAnimation
          sources={searchSources}
          onComplete={() => {
            setIsReading(false); // 动画结束
            setRagResponseReady(false); // 重置状态
          }}
          duration={Math.min(searchSources.length * 1000, 5000)} // 每篇1秒，最长5秒
          shouldStop={ragResponseReady} // 当RAG响应准备好时停止动画
        />
      );
    }
    
    // 优先级 3: 显示错误信息
    if (errorMsg) return <View className={styles.errorState}>{errorMsg}</View>;

    // 优先级 4: 显示加载状态 (例如，在获取sources时)
    if (thinking) {
      return (
        <View className={`${styles.loadingState} ${styles.ragLoading}`}>
          <View className={styles.spinner} />
          <Text>正在检索与思考中…</Text>
        </View>
      );
    }
    if (wxappResults) {
      return (
        <View className={styles.resultsContainer}>
          {searchMode === 'post' && (wxappResults.posts?.data || []).map((p, idx) => (
            <View key={p.id || idx} className={styles.resultItem}>
              <Text className={styles.resultTitle}>{p.title || '帖子'}</Text>
              <Text className={styles.resultContent}>{p.content || ''}</Text>
            </View>
          ))}
          {searchMode === 'user' && (wxappResults.users?.data || []).map((u, idx) => (
            <View key={u.id || idx} className={styles.resultItem}>
              <Text className={styles.resultTitle}>{u.nickname || '用户'}</Text>
              <Text className={styles.resultContent}>{u.bio || ''}</Text>
            </View>
          ))}
          {searchMode === 'note' && (wxappResults.notes?.data || []).map((n, idx) => (
            <View key={n.id || idx} className={styles.resultItem}>
              <Text className={styles.resultTitle}>{n.title || '笔记'}</Text>
              <Text className={styles.resultContent}>{n.content || ''}</Text>
            </View>
          ))}
        </View>
      )
    }
    if (generalResults.length > 0) return renderGeneralResults();
    return renderInitialSearch();
  }

  const getDisplayValue = () => (searchMode ? inputQuery : rawValue);

  // 仅在需要时控制小程序的 focus，避免渲染时强制失焦
  const inputFocusProps = autoFocus ? { focus: true as const } : {};

  return (
    <View className={styles.explorePage} onClick={() => setShowSuggestions(false)}>
      <CustomHeader title='探索' hideBack />

      {/* 固定搜索区域 - 位于导航栏下方 */}
      <View className={styles.fixedSearchArea} style={{ top: `${headerHeight}px` }}>
        <View className={styles.searchBarWrapper}>
          <View className={styles.searchContainer}>
            <Image src={searchIcon} className={styles.searchIcon} />
            <View className={styles.inputWrapper}>
              {renderPrefixLabel()}
              <Input
                className={styles.searchInput}
                placeholder={searchMode && searchModeDesc ? searchModeDesc : (searchMode ? '' : '搜索校园知识')}
                value={getDisplayValue()}
                onInput={handleInputChange}
                confirmType='search'
                onConfirm={handleSearch}
                onFocus={handleFocus}
                {...inputFocusProps}
              />
            </View>
            {rawValue && (
              <Image src={xIcon} className={styles.clearIcon} onClick={handleClearInput} />
            )}
          </View>
          {renderSuggestions()}
        </View>
        
        {/* 内容源导航栏 - 仅在非搜索状态下显示 */}
        {!isSearchActive && (
          <View className={styles.sourceNav}>
            <View className={styles.sourceGrid}>
              {contentSources.map((source) => (
                <View key={source.name} className={styles.sourceItem}>
                  <Image src={source.icon} className={styles.sourceIcon} />
                  <Text className={styles.sourceName}>{source.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 内容滚动区域 */}
      <View 
        className={styles.contentScrollContainer} 
        style={{ 
          paddingTop: isSearchActive 
            ? `${headerHeight + 48}px`  // 搜索状态：header + 搜索框
            : `${headerHeight + 48 + 28}px`  // 默认状态：header + 搜索框 + sourceNav(减少间距)
        }}
      >
        <ScrollView scrollY className={styles.contentScrollView} enableFlex>
          <View className={styles.contentArea}>
            {renderBody()}
          </View>
        </ScrollView>
      </View>

      {/* 浮动上传知识按钮 */}
      <View className={styles.fab} onClick={() => setShowUploadModal(true)}>
        <Text className={styles.fabPlus}>＋</Text>
      </View>
      {showUploadModal && (
        <View className={styles.uploadOverlay} onClick={() => setShowUploadModal(false)}>
          <View className={styles.uploadModal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.uploadTitle}>上传知识（链接或文本）</Text>
            <Textarea
              className={styles.uploadTextarea}
              placeholder='粘贴链接或输入文本摘要...'
              value={uploadText}
              onInput={(e) => setUploadText(e.detail.value)}
              autoHeight
            />
            <View className={styles.uploadActions}>
              <Text className={styles.cancelBtn} onClick={() => setShowUploadModal(false)}>取消</Text>
              <Text
                className={styles.submitBtn}
                onClick={async () => {
                  if (!uploadText.trim()) { Taro.showToast({ title: '请输入内容', icon: 'none' }); return; }
                  try {
                    await feedbackApi.createFeedback({ content: `[knowledge_upload] ${uploadText.trim()}`, type: 'suggest' });
                    setShowUploadModal(false);
                    setUploadText('');
                    Taro.showToast({ title: '上传成功，奖励1枚知识令牌', icon: 'success' });
                    try {
                      const old = Number(Taro.getStorageSync('contrib_tokens') || 0);
                      Taro.setStorageSync('contrib_tokens', String(old + 1));
                    } catch {}
                  } catch (e: any) {
                    Taro.showToast({ title: e?.message || '上传失败', icon: 'none' });
                  }
                }}
              >提交</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
