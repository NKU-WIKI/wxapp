/**
 * 全局配置
 */

const config = {
  defaultAvatar: 'cloud://cloud1-7gu881ir0a233c29.636c-cloud1-7gu881ir0a233c29-1352978573/avatar1.png',
  cloudEnv: 'cloud1-7gu881ir0a233c29',
  API_CONFIG: {
    base_url: 'https://nkuwiki.com/api',
    prefixes: {wxapp: '/wxapp', agent: '/agent', knowledge: '/knowledge'},
    headers: {'Content-Type': 'application/json'},
    branch: 'dev' // 'main' or 'dev'
  },
  // 日志级别配置
  LOG_LEVEL: {
    DEBUG: 4,
    INFO: 3, 
    WARN: 2,
    ERROR: 1,
    NONE: 0
  },
  // 当前日志级别 - 生产环境可以设置为INFO或更低
  currentLogLevel: 2  // WARN级别，只输出警告和错误
};

module.exports = config; 