const behavior = require('../../behaviors/index');
const { getAboutInfo} = require('../../utils/index');

Page({
  behaviors: [behavior.baseBehavior, behavior.authBehavior, behavior.systemAdaptBehavior],

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
    policyAgreed: false
  },
  async onLoad() {
    try {
      this.setData({
        aboutInfo: await getAboutInfo()
      });
      try {
        // const res = await this._syncUserInfo();
        // if(res && res.code === 200){
        //   this.setStorage('isLoggedIn', true);
        //   if(res.details && res.details.message === '用户已存在'){
        //     wx.reLaunch({
        //       url: '/pages/index/index'
        //     });
        //   }
        //   // 这里不直接进index页面单纯是为了让新用户点一下登录按钮qwq
        // }
      } catch (err) {
        console.warn('登录状态同步失败，需要用户手动登录', err);
      }
    } catch (err){
      console.error('加载页面数据失败', err);
    }
  },

  // 页面显示时检查协议同意状态
  onShow() {
    const loginCard = this.selectComponent('.login-card');
    loginCard.refreshAgreementState();
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
    const res = await this._syncUserInfo();
    if(res && res.code === 200){
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },
}); 