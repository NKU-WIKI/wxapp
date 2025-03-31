const {
  getStorage,
  setStorage,
  removeStorage,
  getOpenID,
  formatTime,
  formatRelativeTime
} = require('../../utils/util');
const api = require('../../utils/api/index');

Page({
  data: {
    userInfo: null,
    totalLikes: 0
  },

  onLoad() {
    const userInfo = getStorage('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
      this.getUserProfile();
    }
  },

  async onShow() {
    console.debug('个人信息页面显示');
    await this.getUserProfile();
  },

  async getUserProfile() {
    if (!await this.checkLogin()) return;

    try {
      wx.showLoading({ title: '加载中...' });
      const result = await api.user.getProfile({ isSelf: true });
      wx.hideLoading();
      
      console.debug('获取用户信息:', result);
      
      if (result?.success && result.data) {
        const userData = result.data;
        
        // 处理头像
        userData.avatarUrl = userData.avatar || '/assets/icons/default-avatar.png';
        
        // 更新页面数据
        this.setData({
          userInfo: userData,
          totalLikes: userData.likes_count || 0
        });
        
        // 更新存储
        setStorage('userInfo', userData);
      }
    } catch (err) {
      console.debug('加载用户信息失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 检查登录状态
  async checkLogin() {
    const openid = await getOpenID();
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  // 页面跳转函数
  onFunctionTap(e) {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const type = e.currentTarget.dataset.type;
    const routes = {
      posts: '/pages/profile/myPosts/myPosts',
      likes: '/pages/profile/mylike_fav_comment/mylike_fav_comment?type=like',
      favorites: '/pages/profile/mylike_fav_comment/mylike_fav_comment?type=favorite',
      comments: '/pages/profile/mylike_fav_comment/mylike_fav_comment?type=comment',
      feedback: '/pages/profile/feedback/feedback',
      about: '/pages/profile/about/about'
    };

    const url = routes[type];
    if (url) {
      wx.navigateTo({
        url,
        fail: (err) => {
          console.debug('页面跳转失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 登录处理
  async handleLogin() {
    try {
      wx.showLoading({ title: '登录中...' });
      const result = await api.user.login();
      wx.hideLoading();

      if (result?.success && result.data) {
        this.setData({ userInfo: result.data });
        setStorage('userInfo', result.data);
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      } else {
        throw new Error(result?.message || '登录失败');
      }
    } catch (err) {
      console.debug('登录失败:', err);
      wx.hideLoading();
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      });
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          removeStorage('userInfo');
          removeStorage('openid');
          this.setData({
            userInfo: null,
            totalLikes: 0
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 编辑资料
  goToEdit() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/profile/edit/edit',
      fail: (err) => {
        console.debug('跳转编辑页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 更新头像
  async onChooseAvatar(e) {
    if (!this.data.userInfo) return;
    
    const { avatarUrl } = e.detail;
    if (!avatarUrl) return;

    try {
      wx.showLoading({ title: '更新中...' });
      
      const result = await api.user.updateProfile({
        avatar: avatarUrl
      });

      if (result?.success) {
        const userInfo = this.data.userInfo;
        userInfo.avatar = avatarUrl;
        userInfo.avatarUrl = avatarUrl;
        
        this.setData({ userInfo });
        setStorage('userInfo', userInfo);
        
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
      }
    } catch (err) {
      console.debug('更新头像失败:', err);
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
});