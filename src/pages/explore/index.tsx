import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Input, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useDispatch } from 'react-redux';
import CustomHeader from '@/components/custom-header';
import { AppDispatch } from '@/store';
import { clearSearchResults } from '@/store/slices/chatSlice';
// import { tabBarSyncManager } from '@/utils/tabBarSync';
import knowledgeApi from '@/services/api/knowledge';
import agentApi from '@/services/api/agent';
import { RagRequest } from '@/types/api/agent.d';

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

type SearchMode = 'wiki' | 'user' | 'post' | 'knowledge' | null;

const searchSkills = [
  { icon: messageCircleIcon, title: '@wiki', desc: '提问任何南开相关问题' },
  { icon: userIcon, title: '@user', desc: '查看和关注感兴趣的人' },
  { icon: fileTextIcon, title: '@post', desc: '查找帖子，发现校园热点内容' },
  { icon: bookOpenIcon, title: '@knowledge', desc: '搜索知识库，获取校园资讯' }
];

const contentSources = [
  { icon: websiteIcon, name: '网站' },
  { icon: wechatIcon, name: '微信' },
  { icon: marketIcon, name: '集市' },
  { icon: douyinIcon, name: '抖音' }
];

const masonryContent = [
  { id: 1, image: 'https://ai-public.mastergo.com/ai/img_res/d0cbe5bd6d77c83d610705d1f432556b.jpg', title: '二次选拔流程须知' },
  { id: 2, image: 'https://ai-public.mastergo.com/ai/img_res/6f8df3467172225dc952ba2620a2a330.jpg', title: '元和西饼新品测评' },
];

export default function ExplorePage() {
  const dispatch = useDispatch<AppDispatch>();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(null);
  const [suggestions, setSuggestions] = useState<typeof searchSkills>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [showDynamicSuggestions, setShowDynamicSuggestions] = useState(false);
  const [hotSearches, setHotSearches] = useState<string[]>([]);
  const [wxappResults, setWxappResults] = useState<any | null>(null);
  const [ragData, setRagData] = useState<any | null>(null);
  const [thinking, setThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generalResults, setGeneralResults] = useState<any[]>([]);
  const [autoFocus, setAutoFocus] = useState(false);

  // Use string path for icons to align with asset loading rules
  const searchIcon = '/assets/search.svg';

  useEffect(() => {
    // 进入页面时清空上次持久化的搜索错误/结果，避免误显示错误态
    dispatch(clearSearchResults());
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  // 初始化热门搜索
  useEffect(() => {
    (async () => {
      try {
        const res = await knowledgeApi.getHotSearches(10, 7);
        if (res.code === 200 && Array.isArray(res.data)) {
          setHotSearches(res.data.map((item: any) => item.search_query));
        }
      } catch (e) {}
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
    const value = e.detail.value;
    setSearchValue(value);

    // 1. Determine Search Mode for highlighting
    let newMode: SearchMode = null;
    for (const skill of searchSkills) {
      // Check if the input starts with a known skill command
      if (value.startsWith(skill.title)) {
        newMode = skill.title.substring(1) as SearchMode;
        break; // A mode is detected
      }
    }
    setSearchMode(newMode);

    // 2. Determine whether to show suggestions
    const suggestionMatch = value.match(/^@\w*$/);
    if (suggestionMatch) {
      const keyword = suggestionMatch[0];
      const filtered = searchSkills.filter(skill => skill.title.startsWith(keyword));
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    // 动态搜索建议（仅在 @knowledge 模式下）
    const knowledgePrefix = '@knowledge';
    const isKnowledgeMode = value.startsWith(knowledgePrefix);
    const knowledgeQuery = isKnowledgeMode ? value.slice(knowledgePrefix.length).trim() : '';
    if (isKnowledgeMode && knowledgeQuery.length > 0) {
      knowledgeApi.getSuggestions(knowledgeQuery, 5).then(res => {
        if (res.code === 200 && Array.isArray(res.data)) {
          setDynamicSuggestions(res.data);
          setShowDynamicSuggestions(true);
        } else {
          setShowDynamicSuggestions(false);
        }
      }).catch(() => setShowDynamicSuggestions(false));
    } else {
      setShowDynamicSuggestions(false);
    }
  };

  // 兜底处理：回车时若未识别模式但以 @user/@post 开头，强制设置 searchMode
  const ensureModeBeforeSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed.startsWith('@user')) setSearchMode('user');
    else if (trimmed.startsWith('@post')) setSearchMode('post');
    else if (trimmed.startsWith('@wiki')) setSearchMode('wiki');
    else if (trimmed.startsWith('@knowledge')) setSearchMode('knowledge');
  };
  
  const handleSuggestionClick = (suggestion: typeof searchSkills[0]) => {
    setSearchValue(`${suggestion.title} `);
    setSearchMode(suggestion.title.substring(1) as SearchMode);
    setShowSuggestions(false);
  };

  const handleDynamicSuggestionClick = (s: string) => {
    // 用 @knowledge 直接填充具体查询
    setSearchValue(`@knowledge ${s}`);
    setSearchMode('knowledge');
    setShowDynamicSuggestions(false);
  };

  const handleSearch = async () => {
    if (thinking) return;
    ensureModeBeforeSearch();
    setShowSuggestions(false);
    const query = searchValue.replace(/^@\w+\s*/, '').trim();
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
      try {
        const body: RagRequest = { query, format: 'markdown', stream: false };
        const res = await agentApi.rag(body);
        if (res.code === 200) {
          setRagData(res.data);
          setWxappResults(null);
          setGeneralResults([]);
        } else {
          Taro.showToast({ title: res.msg || res.message || 'RAG 搜索失败', icon: 'none' });
          setErrorMsg(res.msg || res.message || 'RAG 搜索失败');
        }
      } catch (e: any) {
        Taro.showToast({ title: e?.message || 'RAG 搜索失败', icon: 'none' });
        setErrorMsg(e?.message || 'RAG 搜索失败');
      } finally {
        setThinking(false);
      }
    } else if (searchMode === 'post' || searchMode === 'user') {
      setErrorMsg(null);
      setThinking(true);
      try {
        const res = await knowledgeApi.searchWxapp({ query, search_type: searchMode, page: 1, page_size: 20, sort_by: 'time' });
        if (res.code === 200) {
          setWxappResults(res.data);
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
      // @knowledge 或者无前缀默认分支：使用通用 ES 搜索
      setErrorMsg(null);
      setThinking(true);
      try {
        const q = searchMode === null ? searchValue.trim() : query;
        if (!q) { setThinking(false); return; }
        const res = await knowledgeApi.search({ query: q, page: 1, page_size: 20, max_content_length: 500 });
        if (res.code !== 200) {
          const m = res.msg || res.message || '搜索失败';
          Taro.showToast({ title: m, icon: 'none' });
          setErrorMsg(m);
        }
        setWxappResults(null);
        setRagData(null);
        setGeneralResults(Array.isArray(res.data) ? res.data : []);
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
    setSearchValue('');
    setSearchMode(null);
    setShowSuggestions(false);
    dispatch(clearSearchResults());
    setIsSearchActive(false);
  };
  
  const handleFocus = () => {
    // 清理持久化的上次错误，避免误显示错误页
    dispatch(clearSearchResults());
    setIsSearchActive(true);
    if (searchValue.startsWith('@')) {
      setShowSuggestions(true);
    }
  };
  
  const renderHighlightedInput = () => {
    if (!searchMode) {
      return <Text className={styles.inputText}>{searchValue}</Text>;
    }
    const prefix = `@${searchMode}`;
    const query = searchValue.substring(prefix.length);
    return (
      <View className={styles.highlightedText}>
        <Text className={styles.inputPrefix}>{prefix}</Text>
        <Text className={styles.inputText}>{query}</Text>
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
          <View key={index} className={styles.skillCard}>
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
      <View className={styles.masonryWrapper}>
         <View className={styles.masonryContainer}>
           {masonryContent.map(item => (
             <View key={item.id} className={styles.masonryItem}>
                <View className={styles.contentCard}>
                  <Image src={item.image} className={styles.contentImage} mode='aspectFill' />
                  <Text className={styles.contentTitle}>{item.title}</Text>
                </View>
             </View>
           ))}
         </View>
      </View>
    </View>
  );

  const renderBody = () => {
    // 搜索框应保持固定，Body 仅渲染内容区域
    if (!isSearchActive) return renderDefaultView();
    if (thinking) {
      return (
        <View className={`${styles.loadingState} ${styles.ragLoading}`}>
          <View className={styles.spinner} />
          <Text>正在检索与思考中…</Text>
        </View>
      );
    }
    if (errorMsg) return <View className={styles.errorState}>{errorMsg}</View>;
    if (ragData) {
      return <RagResult data={ragData} />
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
        </View>
      )
    }
    if (generalResults.length > 0) return renderGeneralResults();
    return renderInitialSearch();
  }

  return (
    <View className={styles.explorePage} onClick={() => setShowSuggestions(false)}>
      <CustomHeader title='探索' hideBack />
      <View style={{ flex: 1 }}>
        <View className={styles.pageContent}>
          <View className={styles.searchBarWrapper}>
            <View className={styles.searchContainer}>
              <Image src={searchIcon} className={styles.searchIcon} />
              <View className={styles.inputWrapper}>
                {renderHighlightedInput()}
                <Input
                  className={styles.searchInput}
                  placeholder='搜索校园知识'
                  value={searchValue}
                  onInput={handleInputChange}
                  confirmType='search'
                  onConfirm={handleSearch}
                  onFocus={handleFocus}
                  focus={autoFocus}
                />
              </View>
              {searchValue && (
                <Image src={xIcon} className={styles.clearIcon} onClick={handleClearInput} />
              )}
            </View>
            {renderSuggestions()}
          </View>
          <ScrollView scrollY className={styles.bodyScroll} enableFlex>
            {renderBody()}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
