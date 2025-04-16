const { storage, ui, error, ToastType } = require('../../utils/util');
const { baseBehavior, knowledgeBehavior, agentBehavior } = require('../../behaviors/index');

Page({
  behaviors: [baseBehavior, knowledgeBehavior, agentBehavior],

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
      currentSearchType: searchType
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
    
    this.setData({
      ragQuery: queryText,
      isSearching: true,
      showRagResults: true,
      suggestions: [],
      ragResults: '正在查询改写',
      ragSources: [],
      ragSuggestions: []
    });
    
    try {
      console.debug('发送RAG查询:', queryText);
      
      // 添加分阶段的提示动画
      setTimeout(() => {
        if (this.data.isSearching) {
          this.setData({ ragResults: '正在检索知识库' });
        }
      }, 1000);
      
      setTimeout(() => {
        if (this.data.isSearching) {
          this.setData({ ragResults: '正在思考中' });
        }
      }, 3000);
      
      // 调用RAG接口
      const resultData = await this._sendRagQuery(
        queryText,                // 查询内容
        'website,wechat,wxapp',   // 平台参数（必须是逗号分隔的字符串）
        false,                    // 非流式返回
        {
          tag: 'wiki'             // 查询类型：默认wiki
        }
      );
      
      console.debug('RAG查询结果:', JSON.stringify(resultData));
      
      // 处理返回结果
      let response = '';
      let processedSources = [];
      let suggestions = [];
      
      if (resultData && resultData.data) {
        const data = resultData.data;
        console.debug('处理RAG数据:', JSON.stringify(data));
        
        // 提取回答内容
        response = data.response || '';
        console.debug('提取的回答内容:', response);
        
        // 处理回答内容，去除多余空行和所有冒号
        response = response
          .split('\n')
          .filter(line => line.trim() !== '') // 移除空行
          .join('\n')
          .replace(/[:：]/g, ''); // 移除所有中英文冒号
        
        // 处理来源
        if (data.sources && Array.isArray(data.sources)) {
          processedSources = data.sources.map((source, index) => {
            // 处理平台信息
            let platform = source.platform
            
            // 确保有时间信息
            let createTime = source.create_time || source.update_time
            
            // 处理相关度
            let relevance = source.relevance
            
            // 确保有ID字段，这对于导航到知识详情页面是必须的
            const sourceId = source.id || source.knowledge_id || source.article_id || `source_${index + 1}`;
            
            // 处理一些可能缺失的字段
            return {
              ...source,
              id: sourceId, // 确保有id
              knowledge_id: sourceId, // 添加knowledge_id以兼容知识详情页面
              index: index + 1, // 添加序号，从1开始
              title: source.title || '',
              content: source.content || '',
              summary: source.content || '',
              author: source.author || '',
              platform: platform,
              original_url: source.original_url || '',
              create_time: createTime,
              update_time: source.update_time || createTime,
              publish_time: source.create_time || createTime,
              relevance: relevance,
              is_official: source.is_official !== undefined ? source.is_official : false,
              // 添加类型标记，帮助source-list组件判断跳转目标
              type: 'knowledge' 
            };
          });
        }
        
        // 处理建议问题
        if (data.suggested_questions && Array.isArray(data.suggested_questions)) {
          suggestions = data.suggested_questions;
        }
      } else {
        response = '未能获取到有效回答，请稍后再试。';
      }
      
      console.debug('处理后的回答:', response);
      console.debug('处理后的来源数量:', processedSources.length);
      console.debug('处理后的建议问题:', suggestions);
      // 在data中更新数据，确保字段名与wxml中一致
      this.setData({
        ragQuery: resultData.data?.original_query || queryText,
        ragResults: response,
        ragSources: processedSources,
        ragSuggestions: suggestions,
        isSearching: false
      });
    } catch (error) {
      console.error('RAG查询失败:', error);
      this.setData({
        ragResults: '查询失败，请稍后再试',
        isSearching: false
      });
      ui.showToast('查询失败，请稍后再试', { type: ToastType.ERROR });
    }
  },
  
  // 执行搜索
  async executeSearch(keyword, type = '') {
    if (!keyword) return;
    
    console.debug('执行搜索:', keyword, '类型:', type, '页码:', this.data.pagination.page);
    
    this.setData({ 
      loading: true,
      currentSearchType: type // 设置当前搜索类型
    });
    
    try {
      // 准备搜索参数
      const searchParams = {
        page: this.data.pagination.page,
        page_size: this.data.pagination.page_size,
        sort_by: 'relevance' // 默认按相关度排序
      };
      
      let result;
      
      // 根据搜索类型使用不同的搜索函数
      if (type === 'post') {
        result = await this._searchPost(
          keyword,
          searchParams.page,
          searchParams.page_size,
          searchParams.sort_by
        );
      } else if (type === 'user') {
        result = await this._searchUser(
          keyword,
          searchParams.page,
          searchParams.page_size,
          searchParams.sort_by
        );
      } else {
        // 其他类型使用通用搜索
        result = await this._search(keyword, {
          ...searchParams,
          platform: 'wxapp,wechat,website'
        });
      }
      
      console.debug('搜索结果数据:', JSON.stringify(result));
      
      if (result && result.data) {
        // 直接使用API返回的原始数据，不做处理
        const searchResults = result.data;
        
        // 更新分页信息
        const pagination = result.pagination || {};
        
        // 如果是第一页，直接替换结果，否则追加
        const newResults = this.data.pagination.page === 1 
          ? searchResults 
          : [...this.data.searchResults, ...searchResults];
        
        // 判断是否有更多数据
        const hasMore = pagination.has_more !== undefined 
          ? pagination.has_more 
          : (pagination.total_pages 
              ? this.data.pagination.page < pagination.total_pages 
              : searchResults.length >= searchParams.page_size);
        
        console.debug('更新搜索结果, 总数:', newResults.length, 'has_more:', hasMore);
        
        this.setData({
          searchResults: newResults,
          pagination: {
            page: this.data.pagination.page,
            page_size: this.data.pagination.page_size,
            total: pagination.total || 0,
            total_pages: pagination.total_pages || 0,
            has_more: hasMore
          },
          isSearching: false,
          hasSearched: true
        });
      } else {
        throw new Error('搜索失败');
      }
    } catch (err) {
      console.debug('搜索失败:', err);
      wx.showToast({
        title: '搜索失败: ' + (err.message || '未知错误'),
        icon: 'none'
      });
      
      // 确保在出错时也设置hasSearched为true
      this.setData({
        hasSearched: true,
        searchResults: []
      });
    } finally {
      this.setData({ 
        loading: false,
        isSearching: false
      });
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
  loadMore() {
    if (this.data.loading || !this.data.pagination.has_more) {
      console.debug('不需要加载更多：loading=', this.data.loading, 'has_more=', this.data.pagination.has_more);
      return;
    }
    
    console.debug('触发加载更多, 当前类型:', this.data.currentSearchType, '当前页:', this.data.pagination.page);
    
    this.setData({
      'pagination.page': this.data.pagination.page + 1,
      loading: true
    }, () => {
      // 提取真正的搜索关键词（去除前缀）
      let searchKeyword = this.data.searchValue;
      if (this.data.currentSearchType) {
        searchKeyword = searchKeyword.replace(new RegExp(`@${this.data.currentSearchType}`), '').trim();
      } else {
        searchKeyword = searchKeyword.replace(/@(post|user|knowledge)/, '').trim();
      }
      
      console.debug('执行搜索加载更多，关键词:', searchKeyword, '类型:', this.data.currentSearchType, '页码:', this.data.pagination.page);
      
      // 执行搜索获取更多数据
      this.executeSearch(searchKeyword, this.data.currentSearchType);
    });
  },
  
  // 输入变化
  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
    
    // 获取搜索建议
    if (value && value.length >= 2 && !value.includes('@')) {
      this.getSuggestions(value);
    } else {
      this.setData({ suggestions: [] });
    }
  },
  
  // 处理搜索框选项选择
  onSearchSelect(e) {
    const { option, value } = e.detail;
    
    console.debug('选择搜索选项:', option.text, '值:', value);
    
    // 更新搜索值但不立即搜索
    this.setData({
      searchValue: value,
      selectedSearchType: option.type
    });
    
    // 不要立即触发搜索，让用户输入内容
  },
  
  // 处理前缀选项点击
  onPrefixTap(e) {
    const prefix = e.currentTarget.dataset.prefix;
    if (!prefix) return;
    
    // 设置搜索前缀，但不直接触发搜索
    // 从searchOptions中找到匹配的选项
    // const option = this.data.searchOptions.find(opt => opt.value === prefix);
    // console.debug('option:', option);
    // if (option) {
    //   // 触发select事件，让search-bar组件处理前缀高亮
    //   const detail = {
    //     detail: {
    //       option: option,
    //       value: prefix + ' '
    //     }
    //   };
    //   this.onSearchSelect(detail);
      
      // 设置焦点，方便用户输入
      // this.setData({ focus: true });
      
      // 提示用户输入搜索内容
    //   wx.showToast({
    //     title: '请输入搜索内容',
    //     icon: 'none',
    //     duration: 1500
    //   });
    // }
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
      'pagination.page': 1,
      focus: false // 重置focus状态
    });
  },

  // 点击搜索建议
  onSuggestionTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchValue: keyword });
    this.search({ detail: { value: keyword } });
  },

  // 点击热门搜索
  onHotSearchTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchValue: keyword });
    this.search({ detail: { value: keyword } });
  },

  // 点击历史记录
  onHistoryItemTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchValue: keyword });
    this.search({ detail: { value: keyword } });
  },

  // 加载搜索历史
  async loadSearchHistory() {
    try {
      let history = [];
      
      // 尝试从API获取搜索历史
      if (typeof this._getSearchHistory === 'function') {
        try {
          history = await this._getSearchHistory();
        } catch (apiErr) {
          console.debug('从API加载搜索历史失败:', apiErr);
          // 如果API调用失败，尝试从本地存储加载
          history = storage.get('searchHistory') || [];
        }
      } else {
        // 如果API方法不存在，从本地存储加载
        history = storage.get('searchHistory') || [];
      }
      
      // 过滤掉null值和空字符串
      const validHistory = Array.isArray(history) 
        ? history.filter(item => item && (
            (typeof item === 'string' && item.trim() !== '') || 
            (typeof item === 'object' && item.query && item.query.trim() !== '')
          )).map(item => typeof item === 'string' ? item : item.query) 
        : [];
      
      this.setData({ searchHistory: validHistory });
    } catch (err) {
      console.debug('加载搜索历史失败:', err);
      this.setData({ searchHistory: [] });
    }
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
    // 清空本地数据
    this.setData({ searchHistory: [] });
    storage.set('searchHistory', []);
    
    // 尝试清空服务器数据
    if (typeof this._clearSearchHistory === 'function') {
      try {
        await this._clearSearchHistory();
      } catch (err) {
        console.debug('清空服务器搜索历史失败:', err);
      }
    }
    
    wx.showToast({
      title: '搜索历史已清空',
      icon: 'success'
    });
  },

  // 处理推荐问题点击
  handleRecommendedQuestion(e) {
    const { question } = e.currentTarget.dataset;
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

});