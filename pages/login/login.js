const baseBehavior = require('../../behaviors/baseBehavior');
const authBehavior = require('../../behaviors/authBehavior');
const { getAboutInfo } = require('../../utils/util');
Page({
  behaviors: [baseBehavior, authBehavior],

  data: {
    aboutInfo: {
      app_name: '',
      version: '',
      description: '',
      company: '',
      email: '',
      github: '',
      website: '',
      copyright: ''
    },
  },
  async onLoad() {
    try {
      this.setData({
        aboutInfo: await getAboutInfo()
      });
      try {
        const res = await this._syncUserInfo();
        if(res && res.code === 200){
          this.setStorage('isLoggedIn', true);
          if(res.details && res.details.message === '用户已存在'){
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }
          // 这里不直接进index页面单纯是为了让新用户点一下登录按钮qwq
        }
      } catch (err) {
        console.warn('登录状态同步失败，需要用户手动登录', err);
      }
    } catch (err){
      console.error('加载页面数据失败', err);
    }
  },

  async onPullDownRefresh() {
    this.refreshPage();
    wx.stopPullDownRefresh();
  },
  // 刷新页面
  async refreshPage() {
    try {
      this.setData({
        aboutInfo: await getAboutInfo()
      })
    } catch (err) {
      console.error('刷新页面失败', err);
    }
  },

  async handleLogin() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  async onAgreementTap(e) {
    const type = e.detail?.type || e.currentTarget.dataset.type;
    const title = type === 'user' ? '用户协议' : '隐私政策';
    this.showModal({
      title,
      content: `您正在查看${title}，该功能正在开发中`,
      showCancel: false,
      confirmText: '知道了'
    });
  }
}); 