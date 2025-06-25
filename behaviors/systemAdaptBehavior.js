/**
 * @file systemAdaptBehavior.js
 * @description 系统适配行为，用于获取全局设备信息并注入到页面/组件中
 * 提供统一的设备适配解决方案
 */

const { getSystemInfo, logger } = require('../utils/index');

module.exports = Behavior({
  data: {
    // 系统信息 - 默认值，将在attached生命周期中被覆盖
    statusBarHeight: 20,
    navBarHeight: 44,
    navBarTotalHeight: 64,
    
    // 布局辅助信息
    safeAreaTop: 0,        // 安全区域顶部
    safeAreaBottom: 0,     // 安全区域底部
    windowWidth: 375,      // 窗口宽度
    windowHeight: 667,     // 窗口高度
    
    // 计算属性（在attached中计算）
    contentTopOffset: 0,   // 内容区域顶部偏移（用于fixed导航栏下的内容定位）
  },
  
  lifetimes: {
    attached() {
      this.initSystemAdaptInfo();
    }
  },
  
  methods: {
    /**
     * 初始化系统适配信息
     */
    initSystemAdaptInfo() {
      // 从全局数据中获取已计算好的系统信息
      const systemInfo = getSystemInfo();
      
      if (systemInfo) {
        this.setData({
          statusBarHeight: systemInfo.statusBarHeight,
          navBarHeight: systemInfo.navBarHeight,
          navBarTotalHeight: systemInfo.navBarTotalHeight,
          safeAreaTop: systemInfo.safeArea?.top || systemInfo.statusBarHeight,
          safeAreaBottom: systemInfo.safeArea?.bottom || systemInfo.windowHeight,
          windowWidth: systemInfo.windowWidth,
          windowHeight: systemInfo.windowHeight,
          contentTopOffset: systemInfo.navBarTotalHeight, // 内容区域默认偏移量
        });
      } else {
        logger.warn('systemAdaptBehavior: Failed to get system info.');
      }
    },
    
    /**
     * 处理导航栏高度变化事件
     * @param {Object} e 事件对象
     */
    onNavBarHeightChange(e) {
      const { height, totalHeight } = e.detail;
      this.setData({
        contentTopOffset: totalHeight || height
      });
    },
    
    /**
     * 获取适配后的样式对象
     * @param {string} type 样式类型: 'content'|'fixed-bottom'|'popup'
     * @returns {Object} 样式对象
     */
    getAdaptedStyle(type = 'content') {
      const { statusBarHeight, navBarTotalHeight, safeAreaBottom, windowHeight } = this.data;
      
      switch (type) {
        case 'content':
          return {
            paddingTop: `${navBarTotalHeight}px`,
            minHeight: `${windowHeight - navBarTotalHeight}px`
          };
          
        case 'fixed-bottom':
          return {
            paddingBottom: `${windowHeight - safeAreaBottom + 10}px`
          };
          
        case 'popup':
          return {
            top: `${navBarTotalHeight}px`,
            maxHeight: `${windowHeight - navBarTotalHeight - 20}px`
          };
          
        case 'full-screen':
          return {
            paddingTop: `${statusBarHeight}px`,
            minHeight: `${windowHeight}px`
          };
          
        default:
          return {};
      }
    },
    
    /**
     * 计算元素相对于导航栏的位置
     * @param {number} elementHeight 元素高度
     * @param {number} spacing 间距，默认10px
     * @returns {Object} 位置信息
     */
    calculatePositionFromNavBar(elementHeight = 0, spacing = 10) {
      const { navBarTotalHeight } = this.data;
      return {
        top: navBarTotalHeight + spacing,
        maxHeight: this.data.windowHeight - navBarTotalHeight - elementHeight - spacing * 2
      };
    }
  }
}); 