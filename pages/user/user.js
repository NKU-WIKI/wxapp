const behaviors = require('../../behaviors/index');
const { storage } = require('../../utils/index');
// 常量配置

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
    const targetOpenid = options.openid || options.id;
    
    const currentOpenid = storage.get('openid');
    const isFromExternalView = options.from === 'post' || options.from === 'card' || options.from === 'comment';
    
    this.setData({ 
      openid: targetOpenid || '',
      isFromExternalView: isFromExternalView
    });

    console.debug('Profile页面加载，目标openid:', targetOpenid, '当前用户openid:', currentOpenid, '来源:', options.from);

    if (targetOpenid !== currentOpenid) {
      // 查看其他用户的个人资料
      await this.syncUserAndInitPage(targetOpenid);
    } 
  },

  async onShow() {
    // 如果是从外部视图进入（如点击他人头像），则不通过temp_profile_openid改变当前页面
    if (this.data.isFromExternalView) {
      return;
    }
    
    // 检查是否有从其他页面传入的临时openid
    try {
      const tempOpenid = this.getStorage('temp_profile_openid');
      const currentOpenid = storage.get('openid');
      
      if (tempOpenid && tempOpenid !== currentOpenid) {
        console.debug('检测到临时openid:', tempOpenid, '当前用户openid:', currentOpenid);
        
        // 清除临时openid，避免反复加载
        this.setStorage('temp_profile_openid', null);
        
        // 加载目标用户资料
        await this.syncUserAndInitPage(tempOpenid);
        return;
      }
    } catch (err) {
      console.debug('检查刷新状态失败:', err);
    }
  },

  async onPullDownRefresh() {
    this.setData({ refreshing: true });
    
    await this.syncUserAndInitPage(this.data.openid);
    
    wx.stopPullDownRefresh();

    this.setData({ refreshing: false });
  },

  async syncUserAndInitPage(targetOpenid) {
    this.setData({ loading: true, error: false });
    if(!targetOpenid){
      return;
    }
    
    // 确保 targetOpenid 是一个字符串
    const openidStr = (typeof targetOpenid === 'object' && targetOpenid.openid) ? targetOpenid.openid : targetOpenid;

    console.debug('获取目标用户资料:', openidStr);
    const profileRes = await this._getUserProfile(openidStr, true);
    
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
});