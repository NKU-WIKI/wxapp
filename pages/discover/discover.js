const behavior = require('../../behaviors/index');

Page({
  behaviors: [behavior.baseBehavior],
  
  data: {
    recommendQuestions: [
      {
        question: '校园跑步打卡活动规则?',
        icon: 'footprint',
        count: 756
      },
      {
        question: '如何加入校园社团?',
        icon: 'group',
        count: 543
      }
    ],
    wikiTopics: [
      {
        title: '科研突破：化学学院在《自然》发表新型纳米材料研究，相关成果获央视报道。',
        tag: '南开纳米新材料'
      },
      {
        title: '招生争议：如乎热帖讨论"强基计划面试公平性"，校方官微两小时内回应称"全程录像可复核"。',
        tag: '强基计划面试公平性'
      }
    ],
    hotTopics: [
      {
        id: 1,
        title: '期末考试时间调整通知：12 月 20 日起陆续开始',
        count: '2.8 万',
        isHot: true
      },
      {
        id: 2,
        title: '新图书馆开放时间延长至晚上 11 点',
        count: '1.5 万',
        isHot: true
      },
      {
        id: 3,
        title: '校园跑步打卡活动正式启动',
        count: '9,826',
        isHot: true
      }
    ]
  },

  onLoad: function() {
    // 页面加载时初始化数据
    this.loadDiscoverData();
  },
  
  // 加载发现页数据
  loadDiscoverData() {
    // 这里将来可以从服务器获取实时数据
    console.debug('加载发现页数据');
  },
  
  // 推荐问题点击
  onQuestionTap(e) {
    const question = e.currentTarget.dataset.question;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent('@wiki ' + question)}`
    });
  },
  
  // 热点话题点击
  onTopicTap(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent('#' + tag)}`
    });
  },
  
  // 刷新热点话题
  refreshHotTopics() {
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    });
    // 这里可以添加刷新热点的逻辑
  },
  
  // 热榜项目点击
  onHotTopicTap(e) {
    const id = e.currentTarget.dataset.id;
    const topic = this.data.hotTopics.find(item => item.id === id);
    if (topic) {
      wx.navigateTo({
        url: `/pages/post/detail/detail?id=${id}&title=${encodeURIComponent(topic.title)}`
      });
    }
  },
  
  // 查看更多热门话题
  viewMoreHotTopics() {
    wx.navigateTo({
      url: '/pages/hot/hot'
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadDiscoverData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
});