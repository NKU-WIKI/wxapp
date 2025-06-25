const {init, nav, logger} = require('./utils/index');
const config = require('./utils/config');

App({
  async onLaunch() {
    this.updateEnvConfig();
    
    try {
      // 根据环境设置日志级别
      if (logger && typeof logger.setLevel === 'function') {
        // 使用新的API代替废弃的getSystemInfoSync
        const appBaseInfo = wx.getAppBaseInfo();
        if (appBaseInfo.platform === 'devtools' || config.API_CONFIG.branch === 'dev') {
          // 开发环境或dev分支 - 输出所有日志
          logger.setLevel(4); // DEBUG级别
        } else {
          // 生产环境 - 只输出警告和错误
          logger.setLevel(2); // WARN级别
        }
      } else {
        console.warn('日志工具未正确初始化，将使用默认日志行为');
      }
      
      // 使用一个函数完成所有初始化操作
      await init();
      // 强制先进一下登录页，展示logo和版本信息
      wx.reLaunch({
        url: '/pages/login/login'
      });
    } catch (err) {
      console.error('应用启动失败', err);
    }
  },

  updateEnvConfig() {
    try {
      const accountInfo = wx.getAccountInfoSync();
      const envVersion = accountInfo.miniProgram.envVersion;
      
      if (envVersion === 'release') {
        config.API_CONFIG.branch = 'main';
      } else { // 'develop' or 'trial'
        config.API_CONFIG.branch = 'dev';
      }
      logger.info('Current branch set to:', config.API_CONFIG.branch);
    } catch (e) {
      logger.error('Failed to get account info, defaulting to main branch.', e);
      config.API_CONFIG.branch = 'main';
    }
  },

  // 实际使用的配置在utils/config.js中，这里仅作展示
  globalData: {
    defaultAvatar: 'cloud://cloud1-7gu881ir0a233c29.636c-cloud1-7gu881ir0a233c29-1352978573/avatar1.png',
    cloudEnv: 'cloud1-7gu881ir0a233c29',
    version: '0.0.1',
    API_CONFIG: {
      base_url: config.API_CONFIG.base_url,
      api_prefix: config.API_CONFIG.api_prefix,
      prefixes: {wxapp: '/wxapp', agent: '/agent'},
      headers: {'Content-Type': 'application/json'}
    }
  }
});
