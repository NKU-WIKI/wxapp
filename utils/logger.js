/**
 * 日志模块
 */

// 日志级别
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 99
};

// 默认配置
let config = {
  level: LogLevel.DEBUG,  // 默认日志级别
  prefix: '[nkuwiki]',    // 日志前缀
  showTime: true,         // 是否显示时间
  timeFormat: 'HH:mm:ss', // 时间格式
  showInProduction: false // 生产环境是否显示日志
};

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {String} format 格式化模板
 * @returns {String} 格式化后的时间字符串
 */
function formatTime(date, format) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  
  return format
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
    .replace('SSS', milliseconds);
}

/**
 * 获取环境信息
 * @returns {Object} 环境信息对象
 */
function getEnv() {
  if (typeof wx !== 'undefined') {
    const accountInfo = wx.getAccountInfoSync();
    return {
      isProduction: accountInfo.miniProgram.envVersion === 'release',
      platform: 'miniprogram',
      version: accountInfo.miniProgram.version || 'unknown',
      envVersion: accountInfo.miniProgram.envVersion || 'unknown'
    };
  }
  return {
    isProduction: false,
    platform: 'unknown',
    version: 'unknown',
    envVersion: 'unknown'
  };
}

/**
 * 配置日志模块
 * @param {Object} options 配置选项
 */
function configure(options = {}) {
  config = { ...config, ...options };
}

/**
 * 内部日志输出函数
 * @param {Number} level 日志级别
 * @param {String} type 日志类型
 * @param {Array} args 日志参数
 */
function log(level, type, ...args) {
  if (level < config.level) {
    return;
  }
  
  const env = getEnv();
  
  // 生产环境且配置不显示日志时，不输出
  if (env.isProduction && !config.showInProduction) {
    return;
  }
  
  let prefix = config.prefix;
  
  // 添加时间信息
  if (config.showTime) {
    const timeStr = formatTime(new Date(), config.timeFormat);
    prefix = `${prefix} ${timeStr}`;
  }
  
  // 添加日志类型
  prefix = `${prefix} [${type}]`;
  
  // 输出日志
  console.log(prefix, ...args);
}

/**
 * 输出调试级别日志
 * @param  {...any} args 日志参数
 */
function debug(...args) {
  log(LogLevel.DEBUG, 'DEBUG', ...args);
}

/**
 * 输出信息级别日志
 * @param  {...any} args 日志参数
 */
function info(...args) {
  log(LogLevel.INFO, 'INFO', ...args);
}

/**
 * 输出警告级别日志
 * @param  {...any} args 日志参数
 */
function warn(...args) {
  log(LogLevel.WARN, 'WARN', ...args);
}

/**
 * 输出错误级别日志
 * @param  {...any} args 日志参数
 */
function error(...args) {
  log(LogLevel.ERROR, 'ERROR', ...args);
}

/**
 * 记录函数执行时间
 * @param {Function} fn 要执行的函数
 * @param {String} name 函数名称
 * @param  {...any} args 函数参数
 * @returns {any} 函数执行结果
 */
function time(fn, name, ...args) {
  const start = Date.now();
  try {
    return fn(...args);
  } finally {
    const duration = Date.now() - start;
    debug(`${name} 执行耗时: ${duration}ms`);
  }
}

/**
 * 记录异步函数执行时间
 * @param {Function} fn 要执行的异步函数
 * @param {String} name 函数名称
 * @param  {...any} args 函数参数
 * @returns {Promise<any>} 函数执行结果Promise
 */
async function timeAsync(fn, name, ...args) {
  const start = Date.now();
  try {
    return await fn(...args);
  } finally {
    const duration = Date.now() - start;
    debug(`${name} 异步执行耗时: ${duration}ms`);
  }
}

module.exports = {
  LogLevel,
  configure,
  debug,
  info,
  warn,
  error,
  time,
  timeAsync
}; 