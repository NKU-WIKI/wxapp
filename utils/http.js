/**
 * HTTP请求工具
 */

const storage = require('./storage');
const logger = require('./logger');
const config = require('./config');

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {object} [params] - 请求参数
 * @returns {Promise<object>} - 响应数据
 */
const get = async (apiUrl, requestData = {}) => {
  const openid = storage.get('openid');
  if (!apiUrl) {
    return Promise.reject({ code: -1, message: '未指定API路径' });
  }
  
  let requestUrl = `${config.API_CONFIG.base_url}${apiUrl}`;
  if (Object.keys(requestData).length) {
    const queryParams = Object.entries(requestData)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    requestUrl += `${apiUrl.includes('?') ? '&' : '?'}${queryParams}`;
  }
  
  // 使用高级别日志，生产环境不会输出
  logger.debug('GET请求:', requestUrl);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: requestUrl,
      method: 'GET',
      header: {
        ...config.API_CONFIG.headers,
        'X-Branch': config.API_CONFIG.branch,
        ...(openid ? {'X-User-OpenID': openid} : {})
      },
      success(res) {
        // 使用高级别日志，生产环境不会输出
        logger.debug('GET响应:', res.data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject({
            code: res.data.code || res.statusCode,
            message: res.data.message || '请求失败'
          });
        }
      },
      fail(err) {
        // 使用警告级别，生产环境会输出
        logger.warn('GET请求失败:', err);
        reject({
          code: -1,
          message: err.errMsg || '网络请求失败'
        });
      }
    });
  });
};

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {object} [data] - 请求数据
 * @returns {Promise<object>} - 响应数据
 */
const post = async (url, data = {}) => {
  const openid = storage.get('openid');
  const finalUrl = url.startsWith('/') ? url : '/' + url;
  const apiUrl = finalUrl;
  const requestUrl = `${config.API_CONFIG.base_url}${apiUrl}`;
  
  const requestData = { ...data };
  if (openid && !requestData.openid) {
    requestData.openid = openid;
  }
  
  // 使用高级别日志，生产环境不会输出
  logger.debug('POST请求:', requestUrl, requestData);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: requestUrl,
      method: 'POST',
      data: requestData,
      header: {
        ...config.API_CONFIG.headers,
        'X-Branch': config.API_CONFIG.branch,
        ...(openid ? {'X-User-OpenID': openid} : {})
      },
      success(res) {
        // 使用高级别日志，生产环境不会输出
        logger.debug('POST响应:', res.data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject({
            code: res.data.code || res.statusCode,
            message: res.data.message || '请求失败'
          });
        }
      },
      fail(err) {
        // 使用警告级别，生产环境会输出
        logger.warn('POST请求失败:', err);
        reject({
          code: -1,
          message: err.errMsg || '网络请求失败'
        });
      }
    });
  });
};

module.exports = {
  get,
  post
}; 