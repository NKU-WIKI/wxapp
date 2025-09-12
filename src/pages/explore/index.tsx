import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/store';
import { clearSearchResults } from '@/store/slices/chatSlice';
import { fetchNoteFeed, loadMoreNotes, resetNotes, setRefreshing, fetchNotesInteractionStatus } from '@/store/slices/noteSlice';
import CustomHeader, { useCustomHeaderHeight } from '@/components/custom-header';
import MasonryLayout from '@/components/masonry-layout';
import SearchBar, { SearchSuggestion } from '@/components/search-bar';
import searchApi from '@/services/api/search';
import agentApi from '@/services/api/agent';
import GeminiReadingAnimation from '@/components/gemini-reading-animation';
import SearchResultRenderer from '@/components/search-result-renderer';
import { SearchResultItem, SearchMode } from '@/types/api/search';

// Icon imports need to be after component/logic imports if they are just paths
import messageCircleIcon from '@/assets/message-circle.svg';
import userIcon from '@/assets/user.svg';
import fileTextIcon from '@/assets/file-text.svg';
import bookOpenIcon from '@/assets/book-open.svg';

import RagResult from './components/RagResult';
import styles from './index.module.scss';


const searchSkills: SearchSuggestion[] = [
  { icon: messageCircleIcon, title: '@wiki', desc: 'RAG 智能问答' },
  { icon: messageCircleIcon, title: '@wiki-chat', desc: '通用对话' },
  { icon: userIcon, title: '@user', desc: '查看和关注感兴趣的人' },
  { icon: fileTextIcon, title: '@post', desc: '查找帖子，发现校园热点内容' },
  { icon: bookOpenIcon, title: '@note', desc: '搜索笔记，获取学习资料' }
];

export default function ExplorePage() {
  const dispatch = useDispatch<AppDispatch>();
  const headerHeight = useCustomHeaderHeight();

  // Redux state
  const { notes, loading, refreshing, hasMore } = useSelector((state: RootState) => state.note);
  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  // Local state for search functionality
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(null);
  const [searchModeDesc, setSearchModeDesc] = useState<string>(''); // 新增：存储当前模式的描述
  const [suggestions, setSuggestions] = useState<typeof searchSkills>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [ragData, setRagData] = useState<any | null>(null);
  const [thinking, setThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generalResults, setGeneralResults] = useState<SearchResultItem[]>([]);


  const [searchSources, setSearchSources] = useState<any[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [ragResponseReady, setRagResponseReady] = useState(false); // 跟踪RAG响应是否准备好



  // 初始化时获取笔记动态 - 无论是否登录都应该能看到笔记
  useEffect(() => {
    if (!isSearchActive) {
      dispatch(fetchNoteFeed({ skip: 0, limit: 20 })).then((result) => {
        // 如果获取笔记成功，批量查询交互状态
        if (result.type === 'note/fetchNoteFeed/fulfilled' && result.payload && typeof result.payload === 'object' && result.payload !== null && 'data' in result.payload) {
          const payload = result.payload as any;
          if (payload.data && Array.isArray(payload.data)) {
            const noteIds = payload.data.map((note: any) => note.id).filter(Boolean);
            if (noteIds.length > 0) {
              dispatch(fetchNotesInteractionStatus(noteIds));
            }
          }
        }
      });
    }
  }, [dispatch, isSearchActive]);



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
    dispatch(fetchNoteFeed({ skip: 0, limit: 20 })).then((result) => {
      // 如果获取笔记成功，批量查询交互状态
      if (result.type === 'note/fetchNoteFeed/fulfilled' && result.payload && typeof result.payload === 'object' && result.payload !== null && 'data' in result.payload) {
        const payload = result.payload as any;
        if (payload.data && Array.isArray(payload.data)) {
          const noteIds = payload.data.map((note: any) => note.id).filter(Boolean);
          if (noteIds.length > 0) {
            dispatch(fetchNotesInteractionStatus(noteIds));
          }
        }
      }
    });
  };

  // 进入页面时清空上次持久化的搜索错误/结果，避免误显示错误态
  useEffect(() => {
    // 进入页面时清空上次持久化的搜索错误/结果，避免误显示错误态
    dispatch(clearSearchResults());
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);



  // If navigated with focus=true, auto focus and open search mode
  useDidShow(() => {
    try {
      const focusFlag = Taro.getStorageSync('explore_focus');
      if (focusFlag === 'true') {
        setIsSearchActive(true);
        Taro.removeStorageSync('explore_focus');
      }
    } catch {}
  });

  // SearchBar的focus处理
  const handleSearchBarFocus = () => {
    dispatch(clearSearchResults());
    setIsSearchActive(true);
  };

  // 处理SearchBar的输入变化
  const handleSearchBarInput = (value: string) => {
    // 更新search-bar的keyword
    setKeyword(value);
    // 保持原有的rawValue用于兼容性
    setRawValue(value);

    // 解析搜索模式和查询部分
    let mode: SearchMode = null;
    let modeDesc = '';
    let queryPart = value;

    const m = value.match(/^@(wiki-chat|wiki|user|post|note)\s*/);
    if (m) {
      const key = m[1];
      mode = key === 'wiki-chat' ? 'wiki' : (key as SearchMode);
      queryPart = value.slice(m[0].length);

      // 根据模式设置描述
      const skill = searchSkills.find(s => s.title === `@${mode}` || (key === 'wiki-chat' && s.title === '@wiki-chat'));
      if (skill) {
        modeDesc = skill.desc || '';
      }
    }

    setSearchMode(mode);
    setSearchModeDesc(modeDesc);
    setInputQuery(queryPart);

    // 前缀建议
    if (/^@\w*$/.test(value)) {
      const filtered = searchSkills.filter((s) => s.title.startsWith(value));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
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
    const newValue = `${suggestion.title} `;

    setSearchMode(mode);
    setSearchModeDesc(suggestion.desc || '');
    setKeyword(newValue);
    setRawValue(newValue);
    setInputQuery('');
    setShowSuggestions(false);
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
      setGeneralResults([]);
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
          setGeneralResults(convertedResults);
          setRagData(null);
        } else {
          Taro.showToast({ title: '搜索失败', icon: 'none' });
          setErrorMsg('搜索失败');
        }
      } catch (e) {
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
    setRagData(null);
    setGeneralResults([]);
    setErrorMsg(null);
    setRagResponseReady(false);
    dispatch(clearSearchResults());
    setIsSearchActive(false);
  };







  // 前端状态管理反馈按钮的激活状态
  const [feedbackStates, setFeedbackStates] = useState<Record<string, 'up' | 'down' | null>>({});

  const renderGeneralResults = () => {
    const handleThumbUp = (result: SearchResultItem) => {
      const resultId = result.id || `${result.resource_type}-${result.resource_id}`;
      const currentState = feedbackStates[resultId];

      if (currentState === 'up') {
        // 如果已经点赞，取消点赞
        setFeedbackStates(prev => ({ ...prev, [resultId]: null }));
      } else {
        // 设置为点赞状态
        setFeedbackStates(prev => ({ ...prev, [resultId]: 'up' }));
        Taro.showToast({ title: '已点赞', icon: 'success' });
      }
    };

    const handleThumbDown = (result: SearchResultItem) => {
      const resultId = result.id || `${result.resource_type}-${result.resource_id}`;
      const currentState = feedbackStates[resultId];

      if (currentState === 'down') {
        // 如果已经踩，取消踩
        setFeedbackStates(prev => ({ ...prev, [resultId]: null }));
      } else {
        // 设置为踩状态
        setFeedbackStates(prev => ({ ...prev, [resultId]: 'down' }));
        Taro.showToast({ title: '已踩', icon: 'success' });
      }
    };

    // 对搜索结果进行去重处理
    const uniqueResults = generalResults.filter((result, index, array) => {
      // 如果有ID，则根据ID去重
      if (result.id) {
        return array.findIndex(item => item.id === result.id) === index;
      }
      // 如果没有ID，则根据title和content组合去重
      const key = `${result.title || ''}-${result.content || ''}`;
      return array.findIndex(item => {
        const itemKey = `${item.title || ''}-${item.content || ''}`;
        return itemKey === key;
      }) === index;
    });

    return (
      <View className={styles.resultsContainer}>
        {uniqueResults.map((result: SearchResultItem, idx: number) => {
          const resultId = result.id || `${result.resource_type}-${result.resource_id}`;
          const currentFeedbackState = feedbackStates[resultId] || null;

          return (
            <SearchResultRenderer
              key={result?.id ? `${result.id}-${result.resource_type || 'unknown'}` : `result-${idx}-${result.title?.slice(0, 10) || 'untitled'}`}
              result={result}
              onThumbUp={handleThumbUp}
              onThumbDown={handleThumbDown}
              feedbackState={currentFeedbackState}
            />
          );
        })}
      </View>
    );
  };

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
              <Image src={skill.icon || ''} className={styles.skillIcon} />
            </View>
            <Text className={styles.skillTitle}>{skill.title}</Text>
            <Text className={styles.skillDesc}>{skill.desc || ''}</Text>
          </View>
        ))}
      </View>

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
    if (generalResults.length > 0) return renderGeneralResults();
    return renderInitialSearch();
  }



  return (
    <View className={styles.explorePage} onClick={() => setShowSuggestions(false)}>
      <CustomHeader title='探索' hideBack />

      {/* 固定搜索区域 - 位于导航栏下方 */}
      <View className={styles.fixedSearchArea} style={{ top: `${headerHeight}px` }}>
        <View className={styles.searchBarWrapper}>
          <SearchBar
            keyword={keyword}
            placeholder={searchMode && searchModeDesc ? searchModeDesc : (searchMode ? '' : '搜索校园知识')}
            mode={searchMode}
            modeDesc={searchModeDesc}
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            onInput={(e) => handleSearchBarInput(e.detail?.value || '')}
            onSearch={handleSearch}
            onClear={handleClearInput}
            onFocus={handleSearchBarFocus}
            onSuggestionClick={handleSuggestionClick}
            confirmType='search'
            adjustPosition
          />
        </View>

      </View>

      {/* 内容滚动区域 */}
      <View
        className={styles.contentScrollContainer}
        style={{
          paddingTop: `60px`  // header + search bar area height + small gap
        }}
      >
        <ScrollView scrollY className={styles.contentScrollView} enableFlex>
          <View className={styles.contentArea}>
            {renderBody()}
            {/* 底部占位元素，防止内容被tab bar遮挡 */}
            <View className={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </View>


    </View>
  );
}
