/**
 * 通用检测器模块
 * 提供模式注册和基础检测功能
 */

const logger = require('./logger');

// 模式注册表
class PatternsRegistry {
  constructor() {
    this.patterns = {};
    this.factories = {};
  }
  
  // 注册新模式
  register(config) {
    if (!config || !config.name) {
      logger.error('注册模式失败：缺少必要参数');
      return;
    }
    
    this.patterns[config.name] = config;
    
    if (config.factory) {
      this.factories[config.name] = config.factory;
    }
    
    logger.debug(`注册检测模式: ${config.name}`);
  }
  
  // 创建检测器实例
  create(name, options = {}) {
    if (!this.factories[name]) {
      logger.error(`未找到检测器工厂: ${name}`);
      return null;
    }
    
    try {
      return this.factories[name](options);
    } catch (err) {
      logger.error(`创建检测器失败[${name}]:`, err);
      return null;
    }
  }
  
  // 执行模式匹配
  match(name, content, options = {}) {
    if (!this.patterns[name]) {
      logger.error(`未找到检测模式: ${name}`);
      return { matches: [], evidence: '' };
    }
    
    try {
      if (typeof this.patterns[name].match === 'function') {
        return this.patterns[name].match(content, options);
      }
      
      return { matches: [], evidence: '' };
    } catch (err) {
      logger.error(`执行检测模式失败[${name}]:`, err);
      return { matches: [], evidence: '' };
    }
  }
  
  // 获取所有模式名称
  getPatternNames() {
    return Object.keys(this.patterns);
  }
}

// 基础检测器类
class BaseDetector {
  constructor(opts = {}) {
    this.options = opts;
    this.patterns = opts.patterns || [];
    this.threshold = opts.threshold || 0.5;
    this.name = opts.name || 'base';
  }
  
  // 提取特征
  extractFeatures(content) {
    if (!content) return { content };
    
    return {
      content,
      length: content.length,
      words: content.split(/\s+/)
    };
  }
  
  // 基础匹配
  match(features) {
    if (!features || !features.content) return [];
    
    const content = features.content;
    const matches = [];
    
    for (const pattern of this.patterns) {
      try {
        if (pattern.test(content)) {
          const match = content.match(pattern);
          matches.push(match ? match[0] : pattern.toString());
        }
      } catch (err) {
        logger.error(`模式匹配出错[${this.name}]:`, err);
      }
    }
    
    return matches;
  }
  
  // 判断是否超过阈值
  isAboveThreshold(matches) {
    return matches.length > 0;
  }
  
  // 执行检测
  detect(content) {
    const features = this.extractFeatures(content);
    const matches = this.match(features);
    
    return {
      matches,
      isRisky: this.isAboveThreshold(matches)
    };
  }
}

// 创建单例模式注册表
const patternsRegistry = new PatternsRegistry();

module.exports = {
  patternsRegistry,
  BaseDetector
}; 