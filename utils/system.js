/**
 * 系统信息和初始化
 */

const storage = require('./storage');
const logger = require('./logger');
const config = require('./config');

/**
 * 初始化函数
 * @returns {Promise<Object>} 初始化结果
 */
async function init() {
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
  const systemInfo = getSystemInfo();
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
 * 获取系统信息
 * @returns {Object} 系统信息
 */
function getSystemInfo() {
  try {
    // 使用新的API替代弃用的wx.getSystemInfoSync
    const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {};
    const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {};
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {};
    const systemSetting = wx.getSystemSetting ? wx.getSystemSetting() : {};
    const appAuthorizeSetting = wx.getAppAuthorizeSetting ? wx.getAppAuthorizeSetting() : {};
    
    // 如果新API不可用，尝试使用旧API
    if (!appBaseInfo.SDKVersion) {
      try {
        const legacyInfo = wx.getSystemInfoSync();
        return legacyInfo || {};
      } catch (e) {
        console.error('获取系统信息失败', e);
        return {};
      }
    }
    
    return {
      // 基础信息
      platform: appBaseInfo.platform,
      language: appBaseInfo.language,
      version: appBaseInfo.version,
      SDKVersion: appBaseInfo.SDKVersion,
      theme: appBaseInfo.theme,
      enableDebug: appBaseInfo.enableDebug,
      host: appBaseInfo.host,
      
      // 设备信息
      brand: deviceInfo.brand,
      model: deviceInfo.model,
      system: deviceInfo.system,
      devicePlatform: deviceInfo.platform,
      
      // 窗口信息
      screenWidth: windowInfo.screenWidth,
      screenHeight: windowInfo.screenHeight,
      windowWidth: windowInfo.windowWidth,
      windowHeight: windowInfo.windowHeight,
      statusBarHeight: windowInfo.statusBarHeight,
      safeArea: windowInfo.safeArea,
      pixelRatio: windowInfo.pixelRatio,
      
      // 系统设置
      bluetoothEnabled: systemSetting.bluetoothEnabled,
      locationEnabled: systemSetting.locationEnabled,
      wifiEnabled: systemSetting.wifiEnabled,
      deviceOrientation: systemSetting.deviceOrientation,
      
      // 授权设置
      albumAuthorized: appAuthorizeSetting.albumAuthorized,
      bluetoothAuthorized: appAuthorizeSetting.bluetoothAuthorized,
      cameraAuthorized: appAuthorizeSetting.cameraAuthorized,
      locationAuthorized: appAuthorizeSetting.locationAuthorized,
      locationReducedAccuracy: appAuthorizeSetting.locationReducedAccuracy,
      microphoneAuthorized: appAuthorizeSetting.microphoneAuthorized,
      notificationAuthorized: appAuthorizeSetting.notificationAuthorized,
      notificationAlertAuthorized: appAuthorizeSetting.notificationAlertAuthorized,
      notificationBadgeAuthorized: appAuthorizeSetting.notificationBadgeAuthorized,
      notificationSoundAuthorized: appAuthorizeSetting.notificationSoundAuthorized
    };
  } catch (err) {
    console.error('获取系统信息失败:', err);
    return {};
  }
}

/**
 * 获取关于信息
 * @returns {Promise<Object>} 关于信息
 */
const getAboutInfo = async () => {
  const { createApiClient } = require('./apiClient');
  const aboutApi = createApiClient('/api/wxapp', {about: {method: 'GET', path: '/about'}});
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
  getSystemInfo,
  getAboutInfo,
  getAppInfo,
  getUserProfile,
  getOpenID
}; 