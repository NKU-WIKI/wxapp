/**
 * 格式化工具
 */

const logger = require('./logger');

const debounce = (fn, delay = 500) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

const throttle = (fn, delay = 500) => {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last > delay) {
      last = now;
      fn.apply(this, args);
    }
  };
};

const isEmptyObject = obj => 
  obj && Object.keys(obj).length === 0 && obj.constructor === Object;

const isValidArray = arr => 
  Array.isArray(arr) && arr.length > 0;

const parseJsonField = (field, defaultValue = []) => {
  try {
    return field ? JSON.parse(field) : defaultValue;
  } catch (e) {
    logger.debug('JSON解析失败:', e);
    return defaultValue;
  }
};

/**
 * 解析各种类型的URL
 * @param {string} url - 原始URL
 * @returns {string} - 处理后的可用URL
 */
const parseUrl = url => {
  if (!url) return '';
  
  // 已经是完整的http/https链接
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  
  // 处理云存储链接
  if (/^cloud:\/\//.test(url)) {
    logger.debug('解析云存储链接:', url);
    
    try {
      // 示例: cloud://nkuwiki-xxxx.6e6b-nkuwiki-xxxx-1234567890/path/to/file.jpg
      // 转换为: https://6e6b-nkuwiki-xxxx-1234567890.tcb.qcloud.la/path/to/file.jpg
      const cloudRegex = /^cloud:\/\/([^\/]+)\/(.+)$/;
      const match = url.match(cloudRegex);
      
      if (!match) {
        logger.debug('云存储链接格式不匹配:', url);
        return url;
      }
      
      // 提取环境ID和文件路径
      const cloudEnvInfo = match[1]; // nkuwiki-xxxx.6e6b-nkuwiki-xxxx-1234567890
      const filePath = match[2]; // path/to/file.jpg
      
      // 分解环境信息以获取完整的环境ID部分
      const parts = cloudEnvInfo.split('.');
      let envId = cloudEnvInfo;
      
      if (parts.length > 1) {
        // 如果包含.，取第二部分作为环境ID
        envId = parts[1];
      }
      
      // 构建https访问链接
      const result = `https://${envId}.tcb.qcloud.la/${filePath}`;
      logger.debug('解析后的云存储链接:', result);
      return result;
    } catch (err) {
      logger.debug('解析云存储链接出错:', err);
      return url;
    }
  }
  
  // 对于相对路径，添加基础URL
  if (url.startsWith('/')) {
    const config = require('./config');
    return `${config.API_CONFIG.base_url}${url}`;
  }
  
  return url;
};

/**
 * 解析图片URL数组
 * @param {Array|string} url - 图片URL数组或JSON字符串
 * @returns {Array} - 处理后的图片URL数组
 */
const parseImageUrl = url => {
  let imageArray = [];
  
  // 尝试解析JSON字符串
  if (typeof url === 'string') {
    try {
      imageArray = JSON.parse(url);
    } catch (e) {
      logger.debug('解析图片URL失败:', e);
      return [];
    }
  } else if (Array.isArray(url)) {
    imageArray = url;
  }
  
  // 处理每个URL
  return imageArray.map(u => parseUrl(u)).filter(Boolean);
};

module.exports = {
  debounce,
  throttle,
  isEmptyObject,
  isValidArray,
  parseJsonField,
  parseUrl,
  parseImageUrl
}; 