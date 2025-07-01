const logger = require('./logger');
const { createApiClient } = require('./apiClient');

// 创建专用于敏感词的API客户端
const banwordsApi = createApiClient('/wxapp', {
  getLibrary: { method: 'GET', path: '/banwords/library' }
});

/**
 * 敏感词管理器
 * 负责从后端获取敏感词数据并提供缓存机制
 */
class BanwordManager {
  constructor() {
    this.library = null;
    this.lastUpdateTime = 0;
    this.cacheExpiryTime = 30 * 60 * 1000; // 30分钟缓存过期时间
    this.isUpdating = false;
    this.updatePromise = null;
  }

  /**
   * 获取敏感词库
   * @param {boolean} forceUpdate - 是否强制更新
   * @returns {Promise<Object>} 敏感词库
   */
  async getLibrary(forceUpdate = false) {
    const now = Date.now();
    const shouldUpdate = forceUpdate || 
                        !this.library || 
                        (now - this.lastUpdateTime) > this.cacheExpiryTime;

    if (shouldUpdate) {
      if (this.isUpdating) {
        // 如果正在更新，等待更新完成
        return this.updatePromise;
      }
      
      this.isUpdating = true;
      this.updatePromise = this.fetchFromServer();
      
      try {
        await this.updatePromise;
      } finally {
        this.isUpdating = false;
        this.updatePromise = null;
      }
    }

    return this.library || {};
  }

  /**
   * 从服务器获取敏感词数据
   * @returns {Promise<Object>} 敏感词库
   */
  async fetchFromServer() {
    try {
      const result = await banwordsApi.getLibrary();
      
      // apiClient已经处理了code和基础的data层，直接检查业务数据
      if (result && result.data && result.data.library) {
        this.library = result.data.library;
        this.lastUpdateTime = Date.now();
        logger.info('敏感词库更新成功');
        return this.library;
      } else {
        throw new Error('获取敏感词库数据格式错误');
      }
    } catch (error) {
      logger.error('获取敏感词库失败:', error);
      
      // 如果获取失败且没有缓存，使用默认敏感词
      if (!this.library) {
        this.library = this.getDefaultLibrary();
        logger.warn('使用默认敏感词库');
      }
      
      return this.library;
    }
  }

  /**
   * 获取默认敏感词库（作为后备方案）
   * @returns {Object} 默认敏感词库
   */
  getDefaultLibrary() {
    return {
      political: {
        defaultRisk: 5,
        words: ['敏感词1', '敏感词2'],
        patterns: []
      },
      violent: {
        defaultRisk: 4,
        words: ['暴力词1', '暴力词2'],
        patterns: []
      },
      pornographic: {
        defaultRisk: 5,
        words: ['色情词1', '色情词2'],
        patterns: []
      }
    };
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.library = null;
    this.lastUpdateTime = 0;
    logger.info('敏感词缓存已清除');
  }

  /**
   * 检查缓存是否过期
   * @returns {boolean} 是否过期
   */
  isCacheExpired() {
    const now = Date.now();
    return !this.library || (now - this.lastUpdateTime) > this.cacheExpiryTime;
  }

  /**
   * 设置缓存过期时间
   * @param {number} expiryTime 过期时间（毫秒）
   */
  setCacheExpiryTime(expiryTime) {
    this.cacheExpiryTime = expiryTime;
  }

  /**
   * 获取敏感词分类列表
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    const library = await this.getLibrary();
    return Object.keys(library);
  }

  /**
   * 获取指定分类的敏感词
   * @param {string} category 分类名称
   * @returns {Promise<Array>} 敏感词列表
   */
  async getCategoryWords(category) {
    const library = await this.getLibrary();
    const categoryData = library[category];
    return categoryData ? categoryData.words : [];
  }

  /**
   * 手动更新敏感词库
   * @returns {Promise<Object>} 更新后的敏感词库
   */
  async forceUpdate() {
    return this.getLibrary(true);
  }
}

// 创建单例实例
const banwordManager = new BanwordManager();

module.exports = banwordManager; 