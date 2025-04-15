// 我的内容页面 - 整合了我的帖子、点赞、收藏和评论功能
const behaviors = require('../../../behaviors/index');

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.authBehavior
  ],

  data: {
    tabIndex: 0,
    tabTitles: ['帖子', '收藏', '关注', '粉丝'],
  
    // 筛选条件
    postFilter: {}, // 帖子筛选条件
    favoriteFilter: {}, // 收藏筛选条件
    followingFilter: {}, // 关注筛选条件
    followerFilter: {}, // 粉丝筛选条件
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
      favoriteFilter: { favorite: true, openid: userInfo.openid }, // 我的收藏 - 显示当前用户收藏的帖子
      followingFilter: { type: 'following', openid: userInfo.openid }, // 我的关注 - 显示当前用户关注的用户
      followerFilter: { type: 'follower', openid: userInfo.openid }, // 我的粉丝 - 显示关注当前用户的用户
    };

    this.setData({
      tabIndex,
      ...filters
    });
  },

  onPullDownRefresh() {
    const { tabIndex } = this.data;
    let componentId = '';
    
    // 根据当前标签选择对应的组件ID
    switch(tabIndex) {
      case 0:
        componentId = '#postList';
        break;
      case 1:
        componentId = '#favoriteList';
        break;
      case 2:
        componentId = '#followingList';
        break;
      case 3:
        componentId = '#followerList';
        break;
      default:
        return;
    }
    
    const component = this.selectComponent(componentId);
    if (component) {
      // 直接加载第一页最新数据，并强制刷新
      component.loadInitialData(true).then(() => {
      }).catch(err => {
        console.debug('下拉刷新失败:', err);
      }).finally(() => {
        wx.stopPullDownRefresh();
      });
    } else {
      console.debug('找不到组件:', componentId);
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
        componentId = '#favoriteList';
        break;
      case 2:
        componentId = '#followingList';
        break;
      case 3:
        componentId = '#followerList';
        break;
      default:
        return;
    }
    
    // 选择对应的组件并加载更多内容
    const component = this.selectComponent(componentId);
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
  
  // 处理用户关注事件
  onUserFollow(e) {
    const { user_id, is_followed } = e.detail;
    
    // 刷新关注列表和粉丝列表
    const followingList = this.selectComponent('#followingList');
    const followerList = this.selectComponent('#followerList');
    
    // 延迟一点时间再刷新，确保API操作完成
    setTimeout(() => {
      if (followingList) followingList.refresh();
      if (followerList) followerList.refresh();
    }, 500);
    
    // 显示操作结果提示
    wx.showToast({
      title: is_followed ? '关注成功' : '已取消关注',
      icon: 'none'
    });
  }
}); 