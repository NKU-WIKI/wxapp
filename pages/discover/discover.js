const behavior = require('../../behaviors/index');

Page({
  behaviors: [behavior.baseBehavior, behavior.knowledgeBehavior, behavior.systemAdaptBehavior],
  
  data: {
    officialInsights: [],
    communityInsights: [],
    marketInsights: []
  },

  onLoad: function() {
    // 页面加载时初始化数据
    this.loadDiscoverData();
  },
  
  // 加载发现页数据
  async loadDiscoverData() {
    console.debug('加载发现页数据');
    this.setData({
      officialInsights: [],
      communityInsights: [],
      marketInsights: [],
    });
    
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const year = yesterday.getFullYear();
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const day = String(yesterday.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const categories = [
        { key: 'officialInsights', name: '官方' },
        { key: 'communityInsights', name: '社区' },
        { key: 'marketInsights', name: '集市' },
      ];
      
      const insightPromises = categories.map(cat => 
        this._getInsight(formattedDate, { category: cat.name, pageSize: 3 })
      );
      
      const results = await Promise.all(insightPromises);
      
      const updates = {};
      results.forEach((res, index) => {
        const categoryKey = categories[index].key;
        if (res && res.data) {
          updates[categoryKey] = res.data;
        }
      });

      this.setData(updates);

    } catch (err) {
      console.error('加载发现页洞察失败', err);
    }
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