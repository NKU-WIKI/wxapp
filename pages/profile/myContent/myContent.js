// 我的内容页面 - 整合了我的帖子、点赞、收藏和评论功能
const behaviors = require('../../../behaviors/index');

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.authBehavior
  ],

  data: {
    tabIndex: 0,
    tabTitles: ['帖子', '获赞', '收藏', '关注', '粉丝', '评论'],
  
    // 筛选条件
    postFilter: {}, // 帖子筛选条件
    likeFilter: {}, // 获赞筛选条件
    favoriteFilter: {}, // 收藏筛选条件
    followingFilter: {}, // 关注筛选条件
    followerFilter: {}, // 粉丝筛选条件
    commentFilter: {}, // 评论筛选条件
  },

  async onLoad(options) {
    await this._checkLogin();
    const userInfo = await this._getUserInfo();
    // 解析tab参数
    let tabIndex = 0; // 默认为0（我的帖子）
    if (options && options.tab) {
      tabIndex = parseInt(options.tab);
      // 确保有效范围
      if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= this.data.tabTitles.length) {
        tabIndex = 0;
      }
    }

    const filters = {
      postFilter: { openid: userInfo.openid }, // 我的帖子 - 显示当前用户发布的帖子
      likeFilter: { type: 'liked', openid: userInfo.openid }, // 我的获赞 - 显示当前用户获得点赞的帖子
      favoriteFilter: { favorite: 1, openid: userInfo.openid }, // 我的收藏 - 显示当前用户收藏的帖子
      followingFilter: { openid: userInfo.openid }, // 我的关注
      followerFilter: { openid: userInfo.openid }, // 我的粉丝
      commentFilter: { openid: userInfo.openid } // 我的评论
    };

    this.setData({
      tabIndex,
      ...filters
    });
  },

  onPullDownRefresh() {
    const postList = this.selectComponent('#postList');
    console.log('postList', postList);
    if (postList) {
      // 直接加载第一页最新数据，并强制刷新
      postList.loadInitialData(true).then(() => {
      }).catch(err => {
      }).finally(() => {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
  },

  onReachBottom() {
    const { tabIndex } = this.data;
    let componentId = '';
    
    // 根据当前标签选择对应的组件ID
    switch(tabIndex) {
      case 0:
        componentId = '#postList';
        break;
      case 1:
        componentId = '#likeList';
        break;
      case 2:
        componentId = '#favoriteList';
        break;
      case 3:
        componentId = '#followingList';
        break;
      case 4:
        componentId = '#followerList';
        break;
      case 5:
        componentId = '#commentList';
        break;
      default:
        return;
    }
    
    // 选择对应的组件并加载更多内容
    const component = this.selectComponent(componentId);
    console.debug('选中组件:', componentId, component);
    if (component && typeof component.loadMore === 'function') {
      component.loadMore();
    }
  },

  // 切换标签
  onSwitchTab(e) {
    const tabIndex = e.detail.index;
    if (tabIndex === this.data.tabIndex) return;
    
    this.setData({ tabIndex });
  },
}); 