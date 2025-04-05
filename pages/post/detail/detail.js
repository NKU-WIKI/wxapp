// 帖子详情页
const app = getApp();
const behaviors = require('../../../behaviors/index');

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.authBehavior, 
    behaviors.userBehavior,
    behaviors.postBehavior
  ],

  data: {
    statusBarHeight: 0,
    isPostLoading: true,
    loadError: '',
    postDetail: null,
    postId: '',
    
    // 导航按钮配置
    navButtons: [
      {type: "back", icon: "back", show: true, delta: 1},
      {type: "home", show: false},
      {type: "logo", show: false},
      {type: "notification", show: false},
      {type: "avatar", show: false}
    ],
    
    // 顶部提示
    toptips: {
      show: false,
      msg: '',
      type: 'error'
    },
    
    // 对话框
    dialog: {
      show: false,
      title: '',
      buttons: []
    }
  },

  onLoad(options) {
    // 从页面参数中获取帖子ID
    const postId = options.id;
    
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      postId: postId
    });
    
    // 加载帖子详情
    this.loadPostDetail();
  },
  
  onReady() {
    // 初始化用户信息
    // this._syncUserInfo();
  },

  // 加载帖子详情
  loadPostDetail() {
    const { postId } = this.data;
    
    if (!postId) {
      this.setData({
        isPostLoading: false,
        loadError: '帖子ID为空'
      });
      return;
    }
    
    // 显示加载状态
    this.setData({ 
      isPostLoading: true,
      loadError: ''
    });
    
    // 使用postBehavior中的方法获取帖子详情
    this._getPostDetail(postId)
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            postDetail: res.data,
            isPostLoading: false
          });
        } else {
          this.setData({
            isPostLoading: false,
            loadError: res.message || '获取帖子失败'
          });
        }
      })
      .catch(err => {
        console.debug('[加载帖子详情失败]', err);
        this.setData({
          isPostLoading: false,
          loadError: err.message || '网络错误，请重试'
        });
      });
  },
  
  // 刷新帖子组件
  refreshPostItem() {
    const postItem = this.selectComponent('.post-detail');
    if (postItem) {
      postItem.init();
    }
  },
  
  // 导航返回
  navigateBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },
  
  // 显示顶部提示
  showToptips(msg, type = 'error') {
    this.setData({
      'toptips.show': true,
      'toptips.msg': msg,
      'toptips.type': type
    });
    
    setTimeout(() => {
      this.setData({ 'toptips.show': false });
    }, 3000);
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    // 重新加载帖子详情
    this.loadPostDetail();
    
    // 刷新帖子组件
    this.refreshPostItem();
    
    // 获取评论列表组件实例，刷新评论列表
    const commentList = this.selectComponent('#commentList');
    if (commentList) {
      commentList.refresh();
    }
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },
  
  // 帖子删除回调
  onPostDeleted() {
    // 显示成功提示
    this.showToptips('帖子已删除', 'success');
    
    // 延迟返回
    setTimeout(() => {
      this.navigateBack();
    }, 1500);
  },
  
  // 获取页面状态组件实例
  getPageStatus() {
    return this.selectComponent('#pageStatus');
  },
  
  // 显示全屏加载
  showFullscreenLoading(text = '加载中...') {
    const pageStatus = this.getPageStatus();
    if (pageStatus) {
      pageStatus.showLoading({
        text,
        type: 'fullscreen',
        mask: true
      });
    }
  },
  
  // 隐藏全屏加载
  hideFullscreenLoading() {
    const pageStatus = this.getPageStatus();
    if (pageStatus) {
      pageStatus.hideLoading();
    }
  },
  
  // 显示错误状态
  showError(message) {
    const pageStatus = this.getPageStatus();
    if (pageStatus) {
      pageStatus.showError(message);
    }
  },
  
  // 处理cell-status组件的重试事件
  onRetry() {
    console.debug('帖子详情-点击重试');
    this.loadPostDetail();
  },
  
  // 处理cell-status组件的关闭事件（如果需要）
  onClose() {
    console.debug('帖子详情-点击关闭');
    wx.navigateBack();
  },

  // 处理通知点击事件
  onNotificationClick() {
    wx.navigateTo({
      url: '/pages/notification/list/list'
    });
  },
  
  // 处理头像点击事件
  onAvatarTap() {
    this._navigateToUserProfile();
  }
}); 