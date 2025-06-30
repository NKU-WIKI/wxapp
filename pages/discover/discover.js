const behavior = require('../../behaviors/index');

Page({
  behaviors: [behavior.baseBehavior, behavior.knowledgeBehavior, behavior.systemAdaptBehavior],
  
  data: {
    officialInsights: [],
    communityInsights: [],
    marketInsights: [],
    loading: false,
    hasData: false,
    currentDate: ''
  },

  onLoad: function() {
    // 页面加载时初始化数据
    this.loadDiscoverData();
  },
  
  // 加载发现页数据
  async loadDiscoverData() {
    console.debug('加载发现页数据');
    this.setData({
      loading: true,
      officialInsights: [],
      communityInsights: [],
      marketInsights: [],
      hasData: false,
      currentDate: ''
    });
    
    try {
      // 寻找最近有数据的日期
      const availableDate = await this.findLatestAvailableDate();
      
      if (!availableDate) {
        console.debug('未找到有数据的日期');
        this.setData({
          loading: false,
          hasData: false
        });
        return;
      }
      
      console.debug('使用日期:', availableDate);
      
      const categories = [
        { key: 'officialInsights', name: '官方' },
        { key: 'communityInsights', name: '社区' },
        { key: 'marketInsights', name: '集市' },
      ];
      
      const insightPromises = categories.map(cat => 
        this._getInsight(availableDate, { category: cat.name, pageSize: 5 })
      );
      
      const results = await Promise.all(insightPromises);
      
      const updates = { 
        loading: false,
        currentDate: availableDate
      };
      let totalCount = 0;
      
      results.forEach((res, index) => {
        const categoryKey = categories[index].key;
        if (res && res.data) {
          updates[categoryKey] = res.data;
          totalCount += res.data.length;
        }
      });

      updates.hasData = totalCount > 0;
      this.setData(updates);

    } catch (err) {
      console.error('加载发现页洞察失败', err);
      this.setData({
        loading: false,
        hasData: false
      });
    }
  },

  // 寻找最近有数据的日期
  async findLatestAvailableDate() {
    const today = new Date();
    
    // 从昨天开始往前查找，最多查找7天
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.debug(`检查日期 ${formattedDate} 是否有数据`);
      
      try {
        // 先检查是否有任何类别的数据
        const testResult = await this._getInsight(formattedDate, { pageSize: 1 });
        
        if (testResult && testResult.data && testResult.data.length > 0) {
          console.debug(`找到有数据的日期: ${formattedDate}`);
          return formattedDate;
        }
      } catch (err) {
        console.debug(`日期 ${formattedDate} 查询失败:`, err);
        // 继续检查下一个日期
      }
    }
    
    console.debug('未找到有数据的日期');
    return null;
  },
  
  // 热点话题点击
  onTopicTap(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent('#' + tag)}`
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadDiscoverData();
    wx.stopPullDownRefresh();
  }
});