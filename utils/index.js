/**
 * 统一导出工具函数
 */

// 导入各模块
const logger = require('./logger');
const storage = require('./storage');
const uiModule = require('./ui');
const http = require('./http');
const apiClient = require('./apiClient');
const datetime = require('./datetime');
const system = require('./system');
const error = require('./error');
const format = require('./format');
const contentSecurity = require('./contentSecurity');
const chunkUtil = require('./chunkUtil');

// 创建ui命名空间对象
const ui = {
  showToast: uiModule.showToast,
  hideToast: uiModule.hideToast,
  showModal: uiModule.showModal,
  showActionSheet: uiModule.showActionSheet,
  copyText: uiModule.copyText
};

// 合并导出
module.exports = {
  // 配置和初始化
  init: system.init,
  
  // 日志工具
  logger,
  
  // 存储操作
  storage,
  
  // UI操作
  ui,
  ToastType: uiModule.ToastType,
  
  // 错误处理
  error,
  ErrorType: error.ErrorType,
  
  // HTTP请求
  get: http.get,
  post: http.post,
  
  // API客户端工厂
  createApiClient: apiClient.createApiClient,
  createStreamApiClient: apiClient.createStreamApiClient,
  
  // 日期时间
  formatTime: datetime.formatTime,
  formatNumber: datetime.formatNumber,
  formatRelativeTime: datetime.formatRelativeTime,
  
  // 系统信息
  getSystemInfo: system.getSystemInfo,
  
  // 格式化工具
  parseUrl: format.parseUrl,
  parseImageUrl: format.parseImageUrl,
  parseJsonField: format.parseJsonField,
  isEmptyObject: format.isEmptyObject,
  isValidArray: format.isValidArray,
  debounce: format.debounce,
  throttle: format.throttle,
  
  // 用户信息
  getUserProfile: system.getUserProfile,
  getOpenID: system.getOpenID,
  getAboutInfo: system.getAboutInfo,
  getAppInfo: system.getAppInfo,
  
  // 内容安全
  msgSecCheck: contentSecurity.msgSecCheck,
  contentSecurity,
  
  // 流式数据处理
  createChunkRes: chunkUtil.createChunkRes
};