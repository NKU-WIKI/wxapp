const behaviors = require('../../behaviors/index');
const { storage, getAboutInfo, getOpenID, generatePageShareContent } = require('../../utils/index');
// 常量配置
const MENU_CONFIG = {
  SETTINGS: {
    items: [
      {
        id: 'about',
        icon: true,
        iconName: 'about',
        title: '关于我们',
        path: '/pages/about/about'
      },
      {
        id: 'setting',
        icon: true,
        iconName: 'setting',
        title: '设置',
        path: '/pages/profile/setting/setting'
      },
      {
        id: 'feedback',
        icon: true,
        iconName: 'feedback',
        title: '反馈',
        path: '/pages/profile/feedback/feedback'
      },
      {
        id: 'logout',
        icon: true,
        iconName: 'logout',
        title: '退出登录',
        path: '/pages/profile/profile'
      }
    ]
  }
};

Page({
  behaviors: [
    behaviors.baseBehavior,
    behaviors.authBehavior, 
    behaviors.userBehavior,
    behaviors.notificationBehavior,
    behaviors.weuiBehavior,
    behaviors.systemAdaptBehavior
  ],

  data: {
    userInfo: null,
    openid: '',
    stats: {
      posts: 0,
      likes: 0,
      favorites: 0,
      comments: 0
    },
    loading: false,
    error: false,
    errorMsg: '',
    refreshing: false,
    settingItems: [],
    hasUnreadNotification: false,
    // 状态栏高度
    statusBarHeight: 0,
    // 用户详情页相关数据
    otherUserInfo: null,
    isFromExternalView: false
  },

  async onLoad(options) {
    // 进入页面即弹窗判断登录
    const res = await this._checkLogin();
    if (!res) {
      return;
    }
    const targetOpenid = options.openid || options.id;
    const currentOpenid = storage.get('openid');
    const isFromExternalView = options.from === 'post' || options.from === 'card' || options.from === 'comment';
    this.setData({ 
      openid: currentOpenid || '',
      isFromExternalView: isFromExternalView
    });
    console.debug('Profile页面加载，目标openid:', targetOpenid, '当前用户openid:', currentOpenid, '来源:', options.from);
    if (targetOpenid && targetOpenid !== currentOpenid) {
      await this.syncUserAndInitPage(targetOpenid);
    } else {
      await this.syncUserAndInitPage();
    }
  },

  async onShow() {
    const res = await this._checkLogin();
    if (!res) {
      return;
    }
    console.log('profile onShow');
    if (this.data.isFromExternalView) {
      return;
    }
    try {
      const tempOpenid = this.getStorage('temp_profile_openid');
      const currentOpenid = storage.get('openid');
      if (tempOpenid && tempOpenid !== currentOpenid) {
        console.debug('检测到临时openid:', tempOpenid, '当前用户openid:', currentOpenid);
        this.setStorage('temp_profile_openid', null);
        await this.syncUserAndInitPage(tempOpenid);
        return;
      }
      const needRefresh = this.getStorage('needRefreshProfile');
      const profileUpdateTime = wx.getStorageSync('profileUpdateTime');
      const pages = getCurrentPages();
      const previousPage = pages.length > 1 ? pages[pages.length - 2] : null;
      const fromEditPage = previousPage && previousPage.route && previousPage.route.includes('/profile/edit/');
      if (needRefresh || profileUpdateTime || fromEditPage) {
        console.debug('检测到需要刷新个人资料, 来源:', 
          needRefresh ? 'needRefresh标记' : '', 
          profileUpdateTime ? 'profileUpdateTime标记' : '',
          fromEditPage ? '从编辑页面返回' : ''
        );
        this.setStorage('needRefreshProfile', null);
        wx.removeStorageSync('profileUpdateTime');
        await this.syncUserAndInitPage();
        return;
      }
    } catch (err) {
      console.debug('检查刷新状态失败:', err);
    }
    this.checkUnreadNotifications();
  },

  async onPullDownRefresh() {
    this.setData({ refreshing: true });
    
    // 获取当前显示的用户openid
    const currentUserInfo = this.data.userInfo;
    const targetOpenid = currentUserInfo ? currentUserInfo.openid : null;
    
    // 刷新用户资料
    await this.syncUserAndInitPage(targetOpenid);
    
    wx.stopPullDownRefresh();
    this.setData({ refreshing: false });
  },

  onUserCardRefresh() {
    this.syncUserAndInitPage();
  },

  // 同步用户并初始化页面
  async syncUserAndInitPage(targetOpenid) {
    this.setData({ loading: true, error: false });
    
    try {
      // 获取当前用户openid
      const currentOpenid = await getOpenID();
      this.setData({ openid: currentOpenid || '' });
      
      // 查看目标用户资料
      if (targetOpenid && targetOpenid !== currentOpenid) {
        console.debug('获取目标用户资料:', targetOpenid);
        const profileRes = await this._getUserProfile(targetOpenid, true);
        
        if (profileRes && profileRes.id) {
          // 关注状态已经包含在 profileRes 中，不需要单独获取
          
          // 更新页面数据
          this.setData({
            userInfo: profileRes,
            stats: {
              posts: profileRes.post_count || 0,
              likes: profileRes.like_count || 0,
              favorites: profileRes.favorite_count || 0,
              comments: profileRes.comment_count || 0
            },
            loading: false
          });
          
          // 处理菜单项 - 查看他人主页时不显示设置菜单
          // this.processMenuItems(); // 注释掉，不在查看他人资料时显示设置菜单
        } else {
          // 获取目标用户失败，显示错误信息
          this.setData({ 
            loading: false,
            error: true,
            errorMsg: '获取用户资料失败'
          });
        }
        return; // 直接返回，不再执行后续代码
      }
      
      // 以下代码只在查看自己的主页时执行
      if (!currentOpenid) {
        this.setData({ 
          userInfo: null, 
          loading: false 
        });
        return;
      }
      
      // 先验证登录状态
      await this._syncUserInfo();
      
      // 获取最新的用户资料（包含统计数据）
      const profileRes = await this._getMyProfile();
      
      if (profileRes && profileRes.id) {
        // 更新本地存储
        this.setStorage('userInfo', profileRes);
        
        // 更新全局数据
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.userInfo = profileRes;
        }
        
        // 更新页面数据
        this.setData({
          userInfo: profileRes,
          stats: {
            posts: profileRes.post_count || 0,
            likes: profileRes.like_count || 0,
            favorites: profileRes.favorite_count || 0,
            comments: profileRes.comment_count || 0
          },
          loading: false
        });
        
        // 处理菜单项 - 只在查看自己的主页时显示设置菜单
        this.processMenuItems();
        
        // 检查未读通知
        this.checkUnreadNotifications();
      } else {
        // 只有在确认是认证问题时才重置登录状态
        if (profileRes && (profileRes.code === 401 || profileRes.code === 403)) {
          this.setStorage('userInfo', null);
          this.setStorage('openid', null);
          this.setStorage('isLoggedIn', false);
          
          // 更新全局数据
          const app = getApp();
          if (app && app.globalData) {
            app.globalData.userInfo = null;
            app.globalData.openid = null;
          }
        }
        
        // 更新页面状态
        this.setData({ 
          userInfo: null, 
          loading: false 
        });
      }
    } catch (err) {
      console.debug('同步用户信息失败:', err);
      // 异常不清除登录状态，可能是网络问题
      this.setData({ 
        loading: false,
        error: true,
        errorMsg: '网络异常，请稍后再试'
      });
    }
  },

  // 检查是否有未读通知
  async checkUnreadNotifications() {
    try {
      const hasUnread = await this._checkUnreadNotification();
      
      // 更新通知红点状态和navButtons
      const navButtons = [...this.data.navButtons];
      for (let i = 0; i < navButtons.length; i++) {
        if (navButtons[i].type === "notification") {
          navButtons[i].hasUnread = hasUnread;
          break;
        }
      }
      
      this.setData({
        hasUnreadNotification: hasUnread,
        navButtons
      });
      
      return hasUnread;
    } catch (err) {
      return false;
    }
  },

  // 处理菜单项
  async processMenuItems() {
    console.debug('processMenuItems 开始执行');
    try {
      // 获取应用信息
      const appInfo = await getAboutInfo();
      const version = appInfo ? `版本 ${appInfo.version}` : '版本 1.0.0';
      console.debug('获取到版本信息:', version);
      
      // 设置菜单添加额外内容
      const settingItems = MENU_CONFIG.SETTINGS.items.map(item => {
        const newItem = { ...item };
        
        // 添加版本信息到"关于我们"
        if (item.id === 'about') {
          newItem.extraContent = version;
        }
        
        return newItem;
      });
      
      console.debug('设置 settingItems:', settingItems);
      this.setData({
        settingItems
      });
      console.debug('设置菜单完成，settingItems数量:', settingItems.length);
    } catch (err) {
      console.error('处理菜单项失败:', err);
      // 使用兜底菜单
      const settingItems = MENU_CONFIG.SETTINGS.items.map(item => {
        const newItem = { ...item };
        if (item.id === 'about') {
          newItem.extraContent = '版本 1.0.0';
        }
        return newItem;
      });
      
      console.debug('使用兜底 settingItems:', settingItems);
      this.setData({
        settingItems
      });
    }
  },

  // 设置菜单点击
  onSettingItemTap: async function(e) {
    const { item } = e.detail;
    if (item && item.id === 'logout') {
      this.setData({
        userInfo: null,
        openid: '',
        stats: { posts: 0, likes: 0, favorites: 0, comments: 0 },
        loading: false,
        error: false,
        errorMsg: '',
        refreshing: false,
        settingItems: [],
        hasUnreadNotification: false,
        otherUserInfo: null,
        isFromExternalView: false
      });
      this._logout();
      return;
    }
    this._routeMenuItem(item);
  },
  
  // 设置菜单重试
  onSettingRetry() {
    this.processMenuItems();
  },

  // 导航到编辑页面
  // navigateToEditProfile() {
  //   if (!this.data.userInfo) return;
    
  //   // 直接使用reLaunch跳转到编辑页面
  //   wx.reLaunch({
  //     url: '/pages/profile/edit/edit'
  //   });
  // },
  // 处理菜单项点击路由
  _routeMenuItem(item) {
    if (!item) return;
    
    const userInfo = this.data.userInfo;
    // 对于需要登录的菜单项，先检查登录状态
    if (item.requireLogin && !userInfo) {
      this.showToast('请先登录', 'error');
      return;
    }
    
    // 导航到指定路径
    if (item.path) {
      this.navigateTo(item.path);
    }
  },

  onLoginCardTap() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  // 自定义分享内容
  onShareAppMessage(res) {
    const { userInfo } = this.data;
    const currentOpenid = storage.get('openid');
    
    // 如果没有用户信息，分享应用首页
    if (!userInfo) {
      return generatePageShareContent({
        title: 'nkuwiki - 南开校园知识分享',
        path: '/pages/index/index',
        imageUrl: '/icons/logo.png',
        desc: '南开大学校园知识分享平台，汇聚学习交流、校园生活、就业创业等优质内容'
      });
    }
    
    const nickname = userInfo.nickname || '南开用户';
    const bio = userInfo.bio || '';
    
    // 如果是查看自己的资料
    if (userInfo.openid === currentOpenid || userInfo.id === currentOpenid) {
      const shareTitle = `我在nkuwiki分享校园知识 - ${nickname}`;
      const shareDesc = bio ? `${bio} | 欢迎关注我在nkuwiki的分享` : '欢迎关注我在nkuwiki的分享';
      
      return generatePageShareContent({
        title: shareTitle,
        path: `/pages/user/user?openid=${userInfo.openid || userInfo.id}`,
        imageUrl: userInfo.avatar || '/icons/logo.png',
        desc: shareDesc
      });
    } else {
      // 如果是查看他人的资料
      const shareTitle = `${nickname}的个人主页 - nkuwiki`;
      const shareDesc = bio ? `${bio} | 在nkuwiki分享校园知识` : '在nkuwiki分享校园知识的南开同学';
      
      return generatePageShareContent({
        title: shareTitle,
        path: `/pages/user/user?openid=${userInfo.openid || userInfo.id}`,
        imageUrl: userInfo.avatar || '/icons/logo.png',
        desc: shareDesc
      });
    }
  },

  // 自定义分享到朋友圈
  onShareTimeline() {
    const { userInfo } = this.data;
    const currentOpenid = storage.get('openid');
    
    if (!userInfo) {
      return {
        title: 'nkuwiki - 南开校园知识分享平台',
        query: '',
        imageUrl: '/icons/logo.png'
      };
    }
    
    const nickname = userInfo.nickname || '南开用户';
    const bio = userInfo.bio || '';
    
    let shareTitle;
    if (userInfo.openid === currentOpenid || userInfo.id === currentOpenid) {
      // 分享自己的资料
      shareTitle = bio ? `${nickname}：${bio} | 我在nkuwiki分享校园知识` : `${nickname} | 我在nkuwiki分享校园知识`;
    } else {
      // 分享他人的资料
      shareTitle = bio ? `${nickname}：${bio} | nkuwiki` : `${nickname}在nkuwiki分享校园知识`;
    }
    
    return {
      title: shareTitle,
      query: `openid=${userInfo.openid || userInfo.id}`,
      imageUrl: userInfo.avatar || '/icons/logo.png'
    };
  },
});