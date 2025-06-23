/**
 * 认证行为
 * 提供登录和权限相关操作
 */
const { ui, storage, createApiClient } = require('../utils/index');

// 创建用户API客户端
const userApi = createApiClient('/api/wxapp/user', {
  sync: { method: 'POST', path: '/sync', params: { openid: true } },
  profile: { method: 'GET', path: '/profile', params: { openid: true } }
});

module.exports = Behavior({
  lifetimes: {
    attached() {
      this._initOpenid();
    }
  },
  
  methods: {
    // 初始化openid的辅助方法
    async _initOpenid() {
      const openid = storage.get('openid');
      if (openid) {
        return; // 已有openid，不需要再获取
      }
      
      try {
        if (!wx.cloud) {
          return;
        }
        
        // 添加await确保获取到结果
        const res = await wx.cloud.callFunction({ name: 'getOpenID' });
        
        if (res.result && res.result.code === 200) {
          const openid = res.result.data?.openid;
          if (openid) {
            storage.set('openid', openid);
          }
        } else {
          const errMsg = res?.result?.message || res?.errMsg || '未知错误';
        }
      } catch (err) {
      }
    },
    /**
     * 同步用户信息 (验证登录状态) - 内部核心方法
     */
    async _syncUserInfo() {
      if(!storage.get('openid')){
        await this._initOpenid();
      }
      try {
        const res = await userApi.sync();
        if (res.code === 200 && res.data?.id) {
          // 存储用户信息
          storage.set('userInfo', res.data);
          storage.set('isLoggedIn', true);
          storage.set('lastSyncTime', Date.now());
          
          return res;
        } else {
          const errorMsg = res.message || '同步用户信息失败';
          throw new Error(errorMsg);
        }
      } catch (err) {
        throw err;
      }
    },
    /**
     * 检查用户是否已登录 (核心检查方法，强制同步验证)
     * @param {Boolean} showInteraction - 是否显示提示和交互弹窗
     * @returns {Promise<Boolean>} 返回 Promise<true> 表示已登录, Promise<false> 表示未登录或验证失败
     */
    async _checkLogin(showInteraction = true) {
      const isLoggedIn = storage.get('isLoggedIn');
      // 如果已登录直接返回true
      if (isLoggedIn) {
        return true;
      }
      // 如果需要显示交互，则显示登录提示
      if (showInteraction) {
        try {
          const res = await wx.showModal({
            content: '您尚未登录或登录已过期，是否前往登录页面？',
            confirmText: '去登录',
            cancelText: '返回首页',
            showCancel: true
          });
          console.log('showModal res:', res);
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          } else if (res.cancel) {
            wx.switchTab({ url: '/pages/index/index' });
          }
        } catch (modalErr) {
          throw modalErr;
        }
      }
      return false;
    },

    /**
     * 获取用户信息
     * @param {Boolean} forceRefresh - 是否强制从服务器获取
     */
    async _getUserInfo(forceRefresh = true) {
      const cachedUserInfo = storage.get('userInfo');
      if (!forceRefresh && cachedUserInfo?.id) {
        return cachedUserInfo;
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('获取用户信息失败: openid 不存在');
        return null;
      }
      
      try {
        const res = await userApi.profile({ openid });
        if (res.code === 200 && res.data?.id) {
          const userInfo = res.data;
          // 更新缓存
          storage.set('userInfo', userInfo);
          return userInfo;
        } else {
          return null;
        }
      } catch (err) {
        console.debug('获取用户信息失败:', err);
        throw err;
      }
    },

    /**
     * 退出登录
     */
    _logout() {
      ui.showToast({
        title: '已退出登录',
        icon: 'none',
        duration: 2000
      });
      storage.clear();
      wx.reLaunch({ url: '/pages/index/index' });
    }
  }
}); 