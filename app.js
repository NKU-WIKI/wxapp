const {init, storage, logger} = require('./utils/index');

App({
  async onLaunch() {
    try {
      // 根据环境设置日志级别
      if (logger && typeof logger.setLevel === 'function') {
        // 使用新的API代替废弃的getSystemInfoSync
        const appBaseInfo = wx.getAppBaseInfo();
        if (appBaseInfo.platform === 'devtools') {
          // 开发环境 - 输出所有日志
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
      // storage.set('isLoggedIn', false);
      
      // 在这里计算并存储全局设备信息
      this.initSystemInfo();

      wx.reLaunch({
        url: '/pages/index/index'
      });

     
    } catch (err) {
      console.error('应用启动失败', err);
    }
  },
  
  // 实际使用的配置在utils/util.js中，这里仅作展示
  globalData: {
    defaultAvatar: 'cloud://cloud1-7gu881ir0a233c29.636c-cloud1-7gu8881ir0a233c29-1352978573/avatar1.png',
    cloudEnv: 'cloud1-7gu881ir0a233c29',
    version: '0.0.1',
    API_CONFIG: {
      base_url: 'https://nkuwiki.com',
      api_prefix: '/api',
      prefixes: {wxapp: '/wxapp', agent: '/agent'},
      headers: {'Content-Type': 'application/json'}
    }
  },

  /**
   * 计算并存储全局设备与导航栏信息
   * 使用胶囊按钮位置精确计算导航栏高度，解决不同设备适配问题
   */
  initSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();

      // 状态栏高度
      const statusBarHeight = systemInfo.statusBarHeight || 20;
      
      // 胶囊按钮的位置信息
      const capsuleTop = menuButtonInfo.top || statusBarHeight;
      const capsuleHeight = menuButtonInfo.height || 32;
      
      // 导航栏主体高度 = (胶囊顶部 - 状态栏高度) * 2 + 胶囊高度
      // 这个公式确保导航栏内容在胶囊按钮上下居中对齐
      const navBarHeight = (capsuleTop - statusBarHeight) * 2 + capsuleHeight;
      
      // 导航栏总高度 = 状态栏高度 + 导航栏主体高度
      const navBarTotalHeight = statusBarHeight + navBarHeight;

      // 将所有信息存入globalData，提供给全应用使用
      this.globalData.systemInfo = {
        ...systemInfo,
        // 核心高度信息
        statusBarHeight,
        navBarHeight,
        navBarTotalHeight,
        
        // 胶囊按钮详细信息
        capsulePosition: {
          ...menuButtonInfo,
          // 添加计算属性便于使用
          leftSpace: menuButtonInfo.left || 0,
          rightSpace: systemInfo.windowWidth - (menuButtonInfo.right || systemInfo.windowWidth)
        },
        
        // 安全区域信息
        safeArea: systemInfo.safeArea || {
          top: statusBarHeight,
          bottom: systemInfo.windowHeight || 667,
          left: 0,
          right: systemInfo.windowWidth || 375
        },
        
        // 标记：非降级方案
        isFallback: false,
        
        // 计算时间戳，用于缓存和调试
        calculatedAt: Date.now()
      };
      
      console.debug('全局设备信息初始化完成:', {
        statusBarHeight,
        navBarHeight,
        navBarTotalHeight,
        windowSize: `${systemInfo.windowWidth}x${systemInfo.windowHeight}`,
        platform: systemInfo.platform,
        capsulePosition: this.globalData.systemInfo.capsulePosition
      });

    } catch (e) {
      console.error('获取系统信息失败，使用降级方案', e);
      
      // 提供一个合理的降级方案
      this.globalData.systemInfo = {
        statusBarHeight: 20,
        navBarHeight: 44,
        navBarTotalHeight: 64,
        windowWidth: 375,
        windowHeight: 667,
        platform: 'unknown',
        safeArea: {
          top: 20,
          bottom: 667,
          left: 0,
          right: 375
        },
        capsulePosition: {
          left: 281,
          right: 365,
          top: 24,
          bottom: 56,
          width: 84,
          height: 32,
          leftSpace: 281,
          rightSpace: 10
        },
        isFallback: true,
        calculatedAt: Date.now()
      };
      
      console.warn('使用降级系统信息:', this.globalData.systemInfo);
    }
  }
});
