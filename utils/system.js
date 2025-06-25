/**
 * 系统信息和初始化
 */

const storage = require('./storage');
const logger = require('./logger');
const config = require('./config');

/**
 * 初始化函数
 * @param {Object} systemInfo 系统信息
 * @returns {Promise<Object>} 初始化结果
 */
async function init(systemInfo) {
  storage.set('defaultAvatar', config.defaultAvatar);
  storage.set('cloudEnv', config.cloudEnv);
  storage.set('API_CONFIG', config.API_CONFIG);
  if (!wx.cloud) {
    logger.debug('请使用 2.2.3 或以上的基础库以使用云能力');
  } else {
    wx.cloud.init({
      env: storage.get('cloudEnv'),
      traceUser: true
    });
  }
  storage.set('API_CONFIG', storage.get('API_CONFIG'));
  storage.set('systemInfo', systemInfo);
  
  // 并行执行所有异步操作
  const results = await Promise.all([
    getAboutInfo().catch(err => {
      logger.debug('获取关于信息出错:', err);
      return null;
    }),
    getUserProfile().catch(err => {
      logger.debug('获取用户信息出错:', err);
      return null;
    }),
    getOpenID().catch(err => {
      logger.debug('获取OPENID出错:', err);
      return null;
    })
  ]);
  
  const [aboutInfo, userProfile, openid] = results;
  
  // 处理获取到的数据
  if (aboutInfo) {
    storage.set('aboutInfo', aboutInfo);
  }
  
  if (userProfile) {
    storage.set('userInfo', userProfile);
  }
  
  if (openid) {
    storage.set('openid', openid);
  }
  
  // 返回所有获取的信息
  return {
    aboutInfo,
    userProfile,
    openid
  };
}

/**
 * 初始化系统信息并缓存到全局
 * @param {Object} app App 实例
 */
function initSystemInfo(app) {
  if (!app) {
    logger.error('initSystemInfo failed: app instance is null or undefined.');
    return;
  }

  if (app.globalData && app.globalData.systemInfo) {
    return;
  }

  try {
    const windowInfo = wx.getWindowInfo();
    const capsule = wx.getMenuButtonBoundingClientRect();

    const statusBarHeight = windowInfo.statusBarHeight || 20;
    const navBarHeight = (capsule.top - statusBarHeight) * 2 + capsule.height;
    const navBarTotalHeight = statusBarHeight + navBarHeight;

    const systemInfo = {
      ...wx.getSystemInfoSync(),
      statusBarHeight,
      navBarHeight,
      navBarTotalHeight,
      capsule,
      windowInfo
    };
    
    if (!app.globalData) {
      app.globalData = {};
    }
    app.globalData.systemInfo = systemInfo;
    logger.debug('System info initialized and cached.', systemInfo);

  } catch (err) {
    logger.error('Failed to initialize system info', err);
    const fallbackSystemInfo = {
        statusBarHeight: 20,
        navBarHeight: 44,
        navBarTotalHeight: 64
    };
    if (!app.globalData) {
      app.globalData = {};
    }
    app.globalData.systemInfo = fallbackSystemInfo;
  }
}

/**
 * 获取系统信息
 * @returns {Object} 系统信息
 */
function getSystemInfo() {
  const app = getApp();
  // 确保在调用此函数时, initSystemInfo 已经执行过
  if (app.globalData && app.globalData.systemInfo) {
    return app.globalData.systemInfo;
  }
  
  // 如果globalData还没有准备好，提供一个回退方案
  logger.warn('getSystemInfo called before initialization, returning fallback.');
  return {
    statusBarHeight: 20,
    navBarHeight: 44,
    navBarTotalHeight: 64
  };
}

/**
 * 获取关于信息
 * @returns {Promise<Object>} 关于信息
 */
const getAboutInfo = async () => {
  const { createApiClient } = require('./apiClient');
  const aboutApi = createApiClient('/wxapp', {about: {method: 'GET', path: '/about'}});
  try {
    const res = await aboutApi.about();
    if (res.code === 200) {
      return res.data;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

/**
 * 获取App信息（兼容函数，同getAboutInfo）
 * @returns {Promise<Object>} App信息
 */
const getAppInfo = async () => {
  return getAboutInfo();
};

/**
 * 获取微信用户信息
 * @returns {Promise<Object>} 用户信息
 */
const getUserProfile = () => {
  return new Promise((resolve) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: res => {
        const { userInfo } = res;
        resolve({
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          gender: userInfo.gender,
          country: userInfo.country,
          province: userInfo.province,
          city: userInfo.city,
          language: userInfo.language
        });
      },
      fail: err => {
        resolve(null);
      }
    });
  });
};

/**
 * 获取openid
 * @returns {Promise<String>} openid
 */
const getOpenID = async () => {
  const openid = storage.get('openid');
  if (openid) {
    return openid; 
  }
  try {
    if (!wx.cloud) {
      return null;
    }
    // 添加await确保获取到结果
    const res = await wx.cloud.callFunction({ name: 'getOpenID' });
    if (res.result && res.result.code === 200) {
      const openid = res.result.data?.openid;
      if (openid) {
        return openid;
      }
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

module.exports = {
  init,
  initSystemInfo,
  getSystemInfo,
  getAboutInfo,
  getAppInfo,
  getUserProfile,
  getOpenID
}; 