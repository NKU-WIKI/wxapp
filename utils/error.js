/**
 * 错误处理工具
 */

// 引入UI模块
const { ui, ToastType } = require('./ui');

const ErrorType = {
  NETWORK: 'NETWORK_ERROR',    // 网络错误
  API: 'API_ERROR',           // 接口错误
  PARAMS: 'PARAMS_ERROR',     // 参数错误
  VALIDATION: 'VALIDATION_ERROR', // 验证错误
  AUTH: 'AUTH_ERROR',         // 认证错误
  PERMISSION: 'PERMISSION_ERROR', // 权限错误
  DATA: 'DATA_ERROR',         // 数据错误
  FILE: 'FILE_ERROR',         // 文件错误
  UNKNOWN: 'UNKNOWN_ERROR'    // 未知错误
};

const error = {
  create: (message, code = 400, details = null) => {
    const err = new Error(message);
    err.code = code;
    err.details = details;
    return err;
  },
  
  report: (err) => {
    console.debug('错误上报:', err);
    // 可以在这里添加错误上报逻辑，如发送到服务器
  },
  
  handle: (err, defaultMsg = '操作失败') => {
    const message = err?.message || (typeof err === 'string' ? err : defaultMsg);
    ui.showToast(message, { type: ToastType.ERROR });
    console.debug('错误详情:', err);
    return { error: true, message };
  }
};

module.exports = {
  error,
  ErrorType
}; 