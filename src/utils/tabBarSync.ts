import Taro from '@tarojs/taro';

// 定义 tabBar 页面路径
export const TAB_BAR_PAGES = [
  '/pages/home/index',
  '/pages/explore/index',
  '/pages/discover/index',
  '/pages/profile/index'
];

// 全局状态管理
class TabBarSyncManager {
  private listeners: Set<(index: number) => void> = new Set();
  private currentSelectedIndex: number = 0;

  // 添加监听器
  addListener(callback: (index: number) => void) {
    this.listeners.add(callback);
    // 立即调用一次，同步当前状态
    callback(this.getCurrentSelectedIndex());
  }

  // 移除监听器
  removeListener(callback: (index: number) => void) {
    this.listeners.delete(callback);
  }

  // 通知所有监听器
  private notifyListeners(index: number) {
    this.currentSelectedIndex = index;
    this.listeners.forEach(callback => {
      try {
        callback(index);
      } catch (error) {
        console.error('TabBar listener error:', error);
      }
    });
  }

  // 获取当前选中的索引
  getCurrentSelectedIndex(): number {
    try {
      const pages = Taro.getCurrentPages();
      if (pages.length === 0) return 0;
      
      const currentPage = pages[pages.length - 1];
      const currentPath = `/${currentPage.route}`;
      
      const index = TAB_BAR_PAGES.findIndex(path => path === currentPath);
      return index >= 0 ? index : this.currentSelectedIndex;
    } catch (error) {
      console.error('获取当前页面索引失败:', error);
      return this.currentSelectedIndex;
    }
  }

  // 更新选中状态
  updateSelectedIndex() {
    const newIndex = this.getCurrentSelectedIndex();
    if (newIndex !== this.currentSelectedIndex) {
      this.notifyListeners(newIndex);
    }
  }

  // 手动设置选中状态（用于导航栏点击）
  setSelectedIndex(index: number) {
    this.notifyListeners(index);
  }

  // 检查是否为 tabBar 页面
  isTabBarPage(path: string): boolean {
    return TAB_BAR_PAGES.includes(path);
  }

  // 安全的页面跳转方法
  navigateToPage(url: string) {
    // 提取页面路径（去除查询参数）
    const pagePath = url.split('?')[0];
    
    if (this.isTabBarPage(pagePath)) {
      // 如果是 tabBar 页面，使用 switchTab
      console.log('使用 switchTab 跳转到:', pagePath);
      Taro.switchTab({ url: pagePath });
      
      // 更新选中状态
      const index = TAB_BAR_PAGES.findIndex(path => path === pagePath);
      if (index >= 0) {
        this.setSelectedIndex(index);
      }
    } else {
      // 如果不是 tabBar 页面，使用 navigateTo
      console.log('使用 navigateTo 跳转到:', url);
      Taro.navigateTo({ url });
    }
  }
}

// 创建全局实例
export const tabBarSyncManager = new TabBarSyncManager();

// 初始化页面监听
export const initTabBarSync = () => {
  // 监听应用显示事件
  Taro.onAppShow(() => {
    setTimeout(() => {
      tabBarSyncManager.updateSelectedIndex();
    }, 100);
  });

  // 监听页面切换（如果支持的话）
  if (typeof Taro.onPageNotFound !== 'undefined') {
    // 某些情况下可以监听页面变化
  }

  // 定期检查状态（作为备用方案）
  setInterval(() => {
    tabBarSyncManager.updateSelectedIndex();
  }, 2000);
};

// 导出便捷方法
export const useTabBarSync = (callback: (index: number) => void) => {
  return {
    subscribe: () => tabBarSyncManager.addListener(callback),
    unsubscribe: () => tabBarSyncManager.removeListener(callback),
    getCurrentIndex: () => tabBarSyncManager.getCurrentSelectedIndex(),
    navigateTo: (url: string) => tabBarSyncManager.navigateToPage(url)
  };
};