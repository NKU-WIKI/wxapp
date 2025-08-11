import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.scss';
import CustomHeader from '@/components/custom-header';
import { AppDispatch, RootState } from '@/store';
import { searchByRag, clearSearchResults } from '@/store/slices/chatSlice';
import { tabBarSyncManager } from '@/utils/tabBarSync';

// Icon imports
import plusIcon from '@/assets/plus.png';
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
  const { searchResults, searchLoading, searchError } = useSelector((state: RootState) => state.chat);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>(null);
  const [suggestions, setSuggestions] = useState<typeof searchSkills>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

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
  };
  
  const handleSuggestionClick = (suggestion: typeof searchSkills[0]) => {
    setSearchValue(`${suggestion.title} `);
    setSearchMode(suggestion.title.substring(1) as SearchMode);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (searchLoading) return;
    setShowSuggestions(false);
    const query = searchValue.replace(/^@\w+\s*/, '').trim();
    if (!query) return;

    if (searchMode === 'wiki') {
      dispatch(searchByRag({ query, openid: 'user_openid_string' }));
    } else {
      Taro.showToast({ title: '该搜索模式暂未实现', icon: 'none' });
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
      </View>
    )
  }

  const renderSearchResults = () => (
    <View className={styles.resultsContainer}>
       {(searchResults || []).map((result) => (
         <View key={result.id} className={styles.resultItem}>
           <Image src={robotIcon} className={styles.resultIcon} />
           <View className={styles.resultTextContainer}>
             <Text className={styles.resultTitle}>{result.metadata.title}</Text>
             <Text className={styles.resultContent}>{result.text}</Text>
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
    </View>
  );

  const renderDefaultView = () => (
    <ScrollView scrollY className={styles.scrollView}>
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
                  <Image src={item.image} className={styles.contentImage} mode="aspectFill" />
                  <Text className={styles.contentTitle}>{item.title}</Text>
                </View>
             </View>
           ))}
         </View>
      </View>
    </ScrollView>
  );

  const renderBody = () => {
    if (!isSearchActive) return renderDefaultView();
    if (searchLoading) return <View className={styles.loadingState}>正在思考中...</View>;
    if (searchError) return <View className={styles.errorState}>{searchError}</View>;
    if (searchResults && searchResults.length > 0) return renderSearchResults();
    return renderInitialSearch();
  }

  return (
    <View className={styles.explorePage} onClick={() => setShowSuggestions(false)}>
      <CustomHeader title="发现" hideBack={true} />
      <View style={{ flex: 1, overflow: 'hidden' }}>
      <View className={styles.pageContent}>
        <View className={styles.searchBarWrapper}>
          <View className={styles.searchContainer}>
            <Image src={plusIcon} className={styles.searchIcon} />
              <View className={styles.inputWrapper}>
                {renderHighlightedInput()}
            <Input
              className={styles.searchInput}
                  placeholder="输入 @wiki 体验RAG搜索"
                  value={searchValue}
                  onInput={handleInputChange}
                  onConfirm={handleSearch}
                  onFocus={handleFocus}
                />
              </View>
              {searchValue && (
              <Image
                src={xIcon}
                  className={styles.clearIcon}
                  onClick={handleClearInput}
              />
            )}
          </View>
            {renderSuggestions()}
        </View>
          <ScrollView scrollY style={{ height: '100%' }}>
            {renderBody()}
        </ScrollView>
        </View>
      </View>
    </View>
  );
}
