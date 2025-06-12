/**
 * 存储操作工具
 */

const logger = require('./logger');

const storage = {
  get: key => {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      logger.debug(`获取Storage失败[${key}]:`, e);
      return null;
    }
  },
  
  set: (key, data) => {
    try {
      wx.setStorageSync(key, data);
      return true;
    } catch (e) {
      logger.debug(`设置Storage失败[${key}]:`, e);
      return false;
    }
  },
  
  remove: key => {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      logger.debug(`移除Storage失败[${key}]:`, e);
      return false;
    }
  },
  
  clear: () => {
    try {
      wx.setStorageSync('userInfo', null);
      wx.setStorageSync('openid', null);
      wx.setStorageSync('isLoggedIn', false);
      wx.setStorageSync('temp_profile_openid', null);
      wx.setStorageSync('needRefreshProfile', false);
      wx.setStorageSync('profileUpdateTime', null);
      return true;
    } catch (e) {
      logger.debug('清空Storage失败:', e);
      return false;
    }
  }
};

module.exports = storage; 