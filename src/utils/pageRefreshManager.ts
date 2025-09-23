// 页面刷新事件管理器
class PageRefreshManager {
  private listeners: Map<string, Set<() => void>> = new Map();

  // 添加页面刷新监听器
  addRefreshListener(pagePath: string, callback: () => void) {
    if (!this.listeners.has(pagePath)) {
      this.listeners.set(pagePath, new Set());
    }
    this.listeners.get(pagePath)?.add(callback);
  }

  // 移除页面刷新监听器
  removeRefreshListener(pagePath: string, callback: () => void) {
    this.listeners.get(pagePath)?.delete(callback);
  }

  // 触发页面刷新
  triggerPageRefresh(pagePath: string) {
    const callbacks = this.listeners.get(pagePath);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          // 静默处理错误
        }
      });
    }
  }

  // 清理指定页面的所有监听器
  clearPageListeners(pagePath: string) {
    this.listeners.delete(pagePath);
  }

  // 清理所有监听器
  clearAllListeners() {
    this.listeners.clear();
  }
}

// 创建全局实例
export const pageRefreshManager = new PageRefreshManager();

// 便捷的页面刷新钩子
export const usePageRefresh = (pagePath: string, refreshCallback: () => void) => {
  return {
    subscribe: () => pageRefreshManager.addRefreshListener(pagePath, refreshCallback),
    unsubscribe: () => pageRefreshManager.removeRefreshListener(pagePath, refreshCallback),
    triggerRefresh: () => pageRefreshManager.triggerPageRefresh(pagePath)
  };
};

// 常用页面路径常量
export const PAGE_PATHS = {
  DISCOVER: '/pages/discover/index',
  EXPLORE: '/pages/explore/index',
  PROFILE: '/pages/profile/index',
  HOME: '/pages/home/index'
} as const;