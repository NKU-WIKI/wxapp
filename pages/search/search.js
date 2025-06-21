const { storage, ui, ToastType } = require('../../utils/index');
const behaviors = require('../../behaviors/index');

Page({
  behaviors: [behaviors.baseBehavior, behaviors.knowledgeBehavior, behaviors.agentBehavior, behaviors.systemAdaptBehavior],

  data: {
    searchValue: '',
    searchHistory: [],
    searchResults: [],
    hotSearches: [],
    suggestions: [],
    loading: false,
    isSearching: false,
    hasSearched: false, // 标记是否已执行过搜索
    currentSearchType: '', // 添加当前搜索类型标记
    focus: false, // 添加搜索框焦点状态
    dropdownTopPosition: '170rpx', // 搜索历史下拉框位置
    // RAG相关数据
    showRagResults: false,
    ragQuery: '',
    ragResults: null,
    ragSources: [],
    ragSuggestions: [],
    pagination: {
      page: 1,
      page_size: 10,
      total: 0,
      total_pages: 0,
      has_more: false
    },
    // 搜索选项
    searchOptions: [
      {
        text: '知识库',
        value: '@knowledge',
        type: 'knowledge',
        icon: 'life'
      },
      {
        text: '南开小知',
        value: '@wiki',
        type: 'wiki',
        icon: 'robot'
      },
      {
        text: '帖子',
        value: '@post',
        type: 'post',
        icon: 'book'
      },
      {
        text: '用户',
        value: '@user',
        type: 'user',
        icon: 'profile'
      }
    ]
  },

  onLoad() {
    this.loadSearchHistory();
    this.loadHotSearches();
  },
  
  // 搜索方法
  search(e) {
    // 支持两种方式调用：1. 通过输入框的confirm事件 2. 通过按钮点击
    let keyword = '';
    
    if (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.value) {
      // 按钮点击方式
      keyword = e.currentTarget.dataset.value;
    } else if (e.detail && e.detail.value) {
      // 输入框confirm方式
      keyword = e.detail.value;
    } else {
      // 默认使用当前searchValue
      keyword = this.data.searchValue;
    }
    
    if (!keyword || !keyword.trim()) return;
    
    // 检查是否只有前缀没有内容
    if (keyword.trim() === '@wiki') {
      ui.showToast('请在@wiki后输入查询内容', { type: ToastType.INFO });
      return;
    } else if (keyword.trim() === '@knowledge') {
      ui.showToast('请在@knowledge后输入查询内容', { type: ToastType.INFO });
      return;
    } else if (keyword.trim() === '@user') {
      ui.showToast('请在@user后输入查询内容', { type: ToastType.INFO });
      return;
    } else if (keyword.trim() === '@post') {
      ui.showToast('请在@post后输入查询内容', { type: ToastType.INFO });
      return;
    }
    
    // 检查是否是Wiki RAG查询
    if (keyword.includes('@wiki')) {
      this.handleRagQuery(keyword);
      return;
    }
    
    // 处理其他特殊搜索类型
    let searchType = '';
    let searchKeyword = keyword;
    
    // 知识库搜索
    if (keyword.includes('@knowledge')) {
      searchType = 'knowledge';
      searchKeyword = keyword.replace(/@knowledge/, '').trim();
    } 
    // 用户搜索
    else if (keyword.includes('@user')) {
      searchType = 'user';
      searchKeyword = keyword.replace(/@user/, '').trim();
    }
    // 帖子搜索
    else if (keyword.includes('@post')) {
      searchType = 'post';
      searchKeyword = keyword.replace(/@post/, '').trim();
    }
    
    console.debug('执行普通搜索:', searchKeyword, '类型:', searchType || '全部');
    
    this.setData({ 
      searchValue: keyword,
      isSearching: true,
      suggestions: [],
      showRagResults: false,
      hasSearched: true, // 标记已执行过搜索
      'pagination.page': 1,
      currentSearchType: searchType,
      focus: false // 开始搜索时，隐藏历史/建议下拉框
    });
    
    // 保存搜索历史
    this.saveSearchHistory(keyword);
    
    // 执行搜索，传递搜索类型
    this.executeSearch(searchKeyword, searchType);
  },
  
  // 检查是否是RAG查询
  isRagQuery(keyword) {
    return keyword.includes('@wiki');
  },
  
  // 处理RAG查询
  async handleRagQuery(keyword) {
    // 提取实际查询内容
    const queryMatch = keyword.match(/@wiki(.*)/);
    let queryText = '';
    
    if (queryMatch && queryMatch[1]) {
      queryText = queryMatch[1].trim();
    }
    
    if (!queryText) {
      ui.showToast('请在@wiki后输入查询内容', { type: ToastType.INFO });
      return;
    }
    
    // 确保我们有openid
    const openid = storage.get('openid');
    if (!openid) {
      console.debug('缺少openid参数，无法发送RAG查询');
      ui.showToast('登录状态异常，请重新登录', { type: ToastType.ERROR });
      return;
    }
    
    this.saveSearchHistory(keyword);
    
    this.setData({
      ragQuery: queryText,
      isSearching: true,
      showRagResults: true,
      hasSearched: true, // 标记已执行过搜索
      suggestions: [],
      ragResults: '正在思考中...',
      ragSources: [],
      ragSuggestions: []
    });
    
    try {
      console.debug('发送RAG查询:', queryText);
      
      // 调用 agentBehavior 中的 _sendRagQuery 方法
      const resultData = await this._sendRagQuery(queryText, 'all', false, {
        max_results: 10
      });
      
      console.debug('RAG查询结果:', JSON.stringify(resultData));
      
      // 处理返回结果
      let response = '';
      let processedSources = [];
      let suggestions = [];
      
      if (resultData && resultData.response) {
        response = resultData.response;
        
        // 处理来源
        if (resultData.sources && Array.isArray(resultData.sources)) {
          processedSources = resultData.sources.map((source, index) => {
            return {
              ...source,
              id: source.id || source.knowledge_id || `source_${index + 1}`,
              knowledge_id: source.id || source.knowledge_id || `source_${index + 1}`,
              index: index + 1,
              type: 'knowledge' // 类型统一为knowledge，方便前端组件渲染
            };
          });
        }
        
        // 处理建议问题
        if (resultData.suggested_questions && Array.isArray(resultData.suggested_questions)) {
          suggestions = resultData.suggested_questions;
        }
      } else {
        response = '未能获取到有效回答，请稍后再试或换个问题。';
      }
      
      this.setData({
        ragQuery: resultData?.rewritten_query || queryText,
        ragResults: response,
        ragSources: processedSources,
        ragSuggestions: suggestions,
        isSearching: false
      });
        
    } catch (error) {
      console.error('RAG查询失败:', error);
      this.setData({
        ragResults: '查询失败，请检查网络或稍后再试。',
        isSearching: false
      });
      ui.showToast('查询失败，请稍后再试', { type: ToastType.ERROR });
    }
  },
  
  // 执行普通搜索
  async executeSearch(keyword, type = '') {
    this.setData({
      isSearching: true,
      'pagination.page': 1,
      hasSearched: true,
      searchResults: [],
      focus: false // 开始搜索时，隐藏历史/建议下拉框
    });

    try {
      let resultsData;
      if (type === 'post') {
        resultsData = await this._searchPost(keyword, 1, this.data.pagination.page_size);
      } else if (type === 'user') {
        resultsData = await this._searchUser(keyword, 1, this.data.pagination.page_size);
      } else { 
        // @knowledge 和 普通搜索 都使用ES搜索接口
        const searchOptions = {
          page: 1,
          page_size: this.data.pagination.page_size
        };
        
        // 根据搜索类型设置数据源
        if (type === 'knowledge') {
          // @knowledge 搜索全表（所有数据源）
          // 不设置 source 参数，默认搜索所有数据源
        }
        // 注意：@user 和 @post 不走ES搜索，它们有专门的搜索方法
        
        resultsData = await this._search(keyword, searchOptions);
        
        if (!resultsData) {
          // 处理无结果情况
          resultsData = {
            data: [],
            pagination: { total: 0, page: 1, page_size: 10, total_pages: 0, has_more: false }
          };
        }
      }
      
      this.setData({
        isSearching: false,
        searchResults: resultsData.data,
        pagination: resultsData.pagination
      });
      
    } catch (error) {
      console.error('搜索执行失败:', error);
      this.setData({
        isSearching: false
      });
      ui.showToast('搜索服务出错了', { type: 'error' });
    }
  },
  
  // 加载热门搜索
  async loadHotSearches() {
    try {
      const hotSearches = await this._getHotSearches(10);
      console.debug('热门搜索数据:', JSON.stringify(hotSearches));
      this.setData({ hotSearches });
    } catch (err) {
      console.debug('加载热门搜索失败:', err);
    }
  },
  
  // 获取搜索建议
  async getSuggestions(keyword) {
    if (!keyword || keyword.length < 2) {
      this.setData({ suggestions: [] });
      return;
    }
    
    try {
      const suggestions = await this._getSuggestions(keyword);
      this.setData({ suggestions });
    } catch (err) {
      console.debug('获取搜索建议失败:', err);
      this.setData({ suggestions: [] });
    }
  },
  
  // 加载更多
  async loadMore() {
    if (this.data.loading || !this.data.pagination.has_more) return;
    
    console.debug('触发加载更多, 当前类型:', this.data.currentSearchType, '当前页:', this.data.pagination.page);
    
    this.setData({
      loading: true
    });

    try {
      // 提取真正的搜索关键词（去除前缀）
      let searchKeyword = this.data.searchValue;
      if (this.data.currentSearchType) {
        searchKeyword = searchKeyword.replace(new RegExp(`@${this.data.currentSearchType}`), '').trim();
      } else {
        searchKeyword = searchKeyword.replace(/@(post|user|knowledge)/, '').trim();
      }
      
      const nextPage = this.data.pagination.page + 1;
      console.debug('执行搜索加载更多，关键词:', searchKeyword, '类型:', this.data.currentSearchType, '页码:', nextPage);
      
      let moreData;
      const type = this.data.currentSearchType;
      
      if (type === 'post') {
        moreData = await this._searchPost(searchKeyword, nextPage, this.data.pagination.page_size);
      } else if (type === 'user') {
        moreData = await this._searchUser(searchKeyword, nextPage, this.data.pagination.page_size);
      } else {
        // ES搜索
        const searchOptions = {
          page: nextPage,
          page_size: this.data.pagination.page_size
        };
        
        // @knowledge 和默认搜索都是全表搜索，不限制数据源
        
        moreData = await this._search(searchKeyword, searchOptions);
      }
      
      if (moreData && moreData.data) {
        // 合并数据
        const newResults = [...this.data.searchResults, ...moreData.data];
        this.setData({
          searchResults: newResults,
          pagination: moreData.pagination,
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
      
    } catch (err) {
      console.debug('加载更多失败:', err);
      this.setData({ loading: false });
      ui.showToast('加载失败，请重试', { type: ToastType.ERROR });
    }
  },
  
  // 输入变化
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchValue: keyword,
    });
    if (keyword) {
      this.getSuggestions(keyword);
    } else {
      this.setData({ suggestions: [] });
    }
  },
  
  // 处理搜索框选项选择
  onSearchSelect(e) {
    const { value } = e.currentTarget.dataset;
    
    console.debug('选择搜索选项:', value);
    
    // 检查值是否只有前缀
    const prefixOnly = value.trim().split(' ').length <= 1;
    
    // 更新搜索值但不立即搜索
    this.setData({
      searchValue: value,
      selectedSearchType: value
    });
    
    // 如果只有前缀，不执行搜索
    if (prefixOnly) {
      console.debug('只有前缀，不执行搜索');
      return;
    }
    
    // 如果有实际内容，则执行搜索
    const cleanValue = value.trim();
    if (cleanValue.length > value.length + 1) {
      console.debug('有实际内容，执行搜索:', cleanValue);
      this.search(e);
    }
  },
  
  // 处理前缀选项点击
  onPrefixTap(e) {
    const prefix = e.currentTarget.dataset.prefix;
    if (!prefix) return;
    
    // 从searchOptions中找到匹配的选项
    const option = this.data.searchOptions.find(opt => opt.value === prefix);
    console.debug('选择搜索前缀:', prefix, '对应选项:', option);
    
    if (option) {
      // 直接设置搜索值，确保带有空格
      const newValue = prefix + ' ';
      
      // 更新页面数据，设置焦点
      this.setData({
        searchValue: newValue,
        selectedSearchType: option.type,
        focus: true,
        // 重要：确保不自动搜索
        hasSearched: false
      });
      
      // 日志记录，便于调试
      console.debug('设置搜索前缀:', newValue, '类型:', option.type);
    }
  },
  
  // 清空搜索
  clearSearch() {
    this.setData({
      searchValue: '',
      searchResults: [],
      suggestions: [],
      showRagResults: false,
      ragResults: null,
      hasSearched: false, // 重置搜索状态
      isSearching: false, // 重置加载状态
      'pagination.page': 1,
      focus: false // 重置focus状态
    });
  },

  // 点击搜索建议
  onSuggestionTap(e) {
    this.setData({
      searchValue: e.currentTarget.dataset.value,
      suggestions: []
    });
    this.search(e);
  },

  // 点击热门搜索
  onHotSearchTap(e) {
    this.setData({
      searchValue: e.currentTarget.dataset.keyword
    });
    this.search(e);
  },

  // 点击历史记录
  onHistoryItemTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchValue: keyword, focus: false });
    this.search(e);
  },

  // 加载搜索历史
  async loadSearchHistory() {
    const history = await storage.get('searchHistory', []);
    
    // 过滤掉null值和空字符串
    const validHistory = Array.isArray(history) 
      ? history.filter(item => item && (
          (typeof item === 'string' && item.trim() !== '') || 
          (typeof item === 'object' && item.query && item.query.trim() !== '')
        )).map(item => typeof item === 'string' ? item : item.query) 
      : [];
    
    this.setData({ searchHistory: validHistory });
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return;
    }
    
    // 先从本地数据中处理
    let history = this.data.searchHistory.slice(0);
    
    // 过滤掉null值和空字符串
    history = history.filter(item => item && typeof item === 'string' && item.trim() !== '');
    
    const index = history.indexOf(keyword);
    
    // 如果已存在则删除旧的
    if (index > -1) {
      history.splice(index, 1);
    }
    
    // 添加到头部
    history.unshift(keyword);
    
    // 最多保留20条
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    this.setData({ searchHistory: history });
    
    // 保存到本地存储
    storage.set('searchHistory', history);
    
    // 如果有API方法，则尝试调用
    if (typeof this._saveSearchHistory === 'function') {
      this._saveSearchHistory(keyword).catch(err => {
        console.debug('保存搜索历史到服务器失败:', err);
      });
    }
  },

  // 清空搜索历史
  async clearSearchHistory() {
    await storage.remove('searchHistory');
    this.setData({
      searchHistory: []
    });
    ui.showToast('历史记录已清空', { type: ToastType.SUCCESS });
  },

  // 处理推荐问题点击
  handleRecommendedQuestion(e) {
    const question = e.currentTarget.dataset.question;
    if (!question) return;
    
    // 使用@wiki前缀
    const searchValue = '@wiki ' + question;
    
    // 检查是否与当前搜索值相同
    if (searchValue === this.data.searchValue) {
      // 如果相同，先清空，再在下一个时间片重新设置，确保界面刷新
      this.setData({ searchValue: '' }, () => {
        setTimeout(() => {
          this.setData({ searchValue: searchValue }, () => {
            this.search({ detail: { value: searchValue } });
          });
        }, 50);
      });
    } else {
      // 不同时直接设置
      this.setData({ searchValue: searchValue }, () => {
        this.search({ detail: { value: searchValue } });
      });
    }
  },

  // 新增方法
  onSearchBarFocus() {
    this.loadSearchHistory();
    this.setData({ focus: true });
  },

  onSearchBarBlur() {
    // 延迟以允许下拉框中的点击事件触发
    setTimeout(() => {
      this.setData({ focus: false });
    }, 200);
  },
  
  hideHistoryDropdown() {
    this.setData({ focus: false });
  },

  // 测试ES搜索功能（开发调试用）
  async testEsSearch() {
    console.debug('开始测试ES搜索功能...');
    
    try {
      // 测试基础搜索
      const basicResult = await this._search('南开大学', {
        page: 1,
        page_size: 5
      });
      console.debug('基础搜索结果:', basicResult);
      
      // 测试通配符搜索
      const wildcardResult = await this._wildcardSearch('南开*', '', 1, 3);
      console.debug('通配符搜索结果:', wildcardResult);
      
      // 测试官方内容搜索
      const officialResult = await this._searchOfficial('招生', 1, 3);
      console.debug('官方内容搜索结果:', officialResult);
      
      console.debug('ES搜索测试完成');
    } catch (err) {
      console.debug('ES搜索测试失败:', err);
    }
  },



});