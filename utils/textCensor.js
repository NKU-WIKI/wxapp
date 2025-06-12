const logger = require('./logger');
const pinyin = require('./pinyin');
const banwordManager = require('./banwordManager');

// 敏感词库将从后端动态获取

const INTERFERE_CHARS = '[\\s*_\\.·　*/\\\\,，|+~:：;；!\\?\\(\\)\\[\\]\\{\\}（）【】\'\"“”‘’…\\-]'; // 干扰字符集合
const ABBR_INTERFERE_CHARS = '[^a-zA-Z]*'; // 缩写检测专用：所有非字母都视为干扰符号
// 优化：不允许以正则元字符开头
const SAFE_START = /^[\u4e00-\u9fa5a-zA-Z0-9@#￥$%&（）()\[\]【】_.·、，。？！：；""''《》-]/;
const INVALID_START = /^[+*?|{[()^$.\\]/;
console.debug('SAFE_START 正则内容:', SAFE_START);

/**
 * 文本审核类
 */
class TextCensor {
  constructor(customWords = []) {
    this.customWords = new Set(customWords);
    this.library = null;
    this.flattenedDefinitions = [];
    this.patterns = [];
    this.pinyinPatterns = [];
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * 异步初始化敏感词库
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    await this.initPromise;
  }

  /**
   * 执行初始化
   * @private
   */
  async _doInitialize() {
    try {
      this.library = await banwordManager.getLibrary();
      this.flattenedDefinitions = this.flattenDefinitions();
      this.initializePatterns();
      this.isInitialized = true;
      logger.info('TextCensor 初始化完成');
    } catch (error) {
      logger.error('TextCensor 初始化失败:', error);
      // 使用空库继续运行
      this.library = {};
      this.flattenedDefinitions = [];
      this.initializePatterns();
      this.isInitialized = true;
    }
  }

  /**
   * 初始化模式
   */
  initializePatterns() {
    // 为每个敏感词生成正则对象数组，遇到非法正则自动跳过
    this.patterns = this.flattenedDefinitions.map(def => {
      try {
        const pattern = this.generateFuzzyPattern(def.word);
        if (!pattern) return null;
        return {
          word: def.word,
          category: def.category,
          risk: def.risk,
          regex: new RegExp(pattern, 'ig')
        };
      } catch (e) {
        if (logger && logger.debug) logger.debug(`敏感词正则生成失败: ${def.word}`, e);
        return null;
      }
    }).filter(Boolean);
    this.pinyinPatterns = this.flattenedDefinitions.map(def => {
      try {
        const pattern = this.generateFuzzyPinyinPattern(def.word);
        if (!pattern) return null;
        return {
          word: def.word,
          category: def.category,
          risk: def.risk,
          regex: new RegExp(pattern, 'ig')
        };
      } catch (e) {
        if (logger && logger.debug) logger.debug(`敏感词拼音正则生成失败: ${def.word}`, e);
        return null;
      }
    })
    // 只保留拼音长度大于3的
    .filter(obj => obj && obj.word && pinyin.textToPinyin(obj.word, ' ').replace(/ /g, '').length > 3);
    // 不再生成拼音缩写正则
  }

  /**
   * 将分类词库转换为统一格式的词条列表
   */
  flattenDefinitions() {
    const flattened = [];
    if (!this.library) {
      return flattened;
    }
    Object.entries(this.library).forEach(([category, config]) => {
      const { defaultRisk, words, patterns } = config;
      // 普通词
      if (Array.isArray(words)) {
        words.forEach(word => {
          const w = typeof word === 'string' ? word.trim() : '';
          if (w) {
            flattened.push({
              word: w,
              category,
              risk: defaultRisk,
              type: 'text'
            });
            // 生成首字母缩写及正则
            const abbr = pinyin.textToPinyin(w, ' ').split(' ').map(py => py[0]).join('');
            if (abbr.length > 2 && /^[a-zA-Z]+$/.test(abbr)) {
              flattened.push({
                word: abbr.toLowerCase(),
                category,
                risk: defaultRisk,
                type: 'abbr',
                abbrPattern: this.abbrToPattern(abbr.toLowerCase())
              });
            }
          }
        });
      }
      // 组合词
      if (Array.isArray(patterns)) {
        patterns.forEach(patternArr => {
          if (Array.isArray(patternArr) && patternArr.length > 0) {
            const combo = patternArr.join('');
            if (combo) {
              flattened.push({
                word: combo,
                category,
                risk: defaultRisk,
                type: 'text'
              });
            }
          }
        });
      }
    });
    // 自定义词
    this.customWords.forEach(word => {
      const w = typeof word === 'string' ? word.trim() : '';
      if (w) {
        flattened.push({
          word: w,
          category: 'custom',
          risk: 3,
          type: 'text'
        });
        // 自定义词也生成缩写
        const abbr = pinyin.textToPinyin(w, ' ').split(' ').map(py => py[0]).join('');
        if (abbr.length > 2 && /^[a-zA-Z]+$/.test(abbr)) {
          flattened.push({
            word: abbr.toLowerCase(),
            category: 'custom',
            risk: 3,
            type: 'abbr',
            abbrPattern: this.abbrToPattern(abbr.toLowerCase())
          });
        }
      }
    });
    return flattened;
  }

  /**
   * 正则转义工具函数
   */
  escapeRegExp(str) {
    // 更彻底转义所有正则元字符
    return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  }

  /**
   * 生成带干扰字符的正则
   */
  generateFuzzyPattern(word) {
    if (!SAFE_START.test(word) || INVALID_START.test(word)) {
      return null; // 跳过非法首字符敏感词
    }
    return word
      .split('')
      .map(char => this.escapeRegExp(char))
      .join(`${INTERFERE_CHARS}*`);
  }

  /**
   * 生成带干扰字符的拼音正则
   */
  generateFuzzyPinyinPattern(word) {
    const pyArr = pinyin.textToPinyin(word, ' ');
    if (!/^[a-zA-Z0-9]/.test(pyArr)) {
      return null; // 彻底跳过非法拼音首字符
    }
    return pyArr
      .split(' ')
      .map(py => this.escapeRegExp(py))
      .join(`${INTERFERE_CHARS}*`);
  }

  // 生成缩写正则，允许任意数量干扰符号，统一用ABBR_INTERFERE_CHARS
  abbrToPattern(abbr) {
    return abbr.split('').map(ch => ch + ABBR_INTERFERE_CHARS).join('');
  }

  /**
   * 检测文本（支持拼音和原文）
   */
  async check(text) {
    // 确保已初始化
    await this.initialize();
    
    if (!text) {
      return {
        risk: false,
        matches: [],
        reason: null
      };
    }
    // 判断是否为微信小程序环境
    const isMiniProgram = typeof wx !== 'undefined'
      && wx.cloud
      && typeof wx.cloud.callFunction === 'function';
    let cloudResult = null;
    let cloudRisk = false;
    if (isMiniProgram) {
      try {
        const res = await wx.cloud.callFunction({
          name: 'msgSecCheck',
          data: { content: text }
        });
        if (res && res.result && res.result.code === 200 && res.result.data && res.result.data.result) {
          cloudResult = res.result.data.result;
          cloudRisk = !!cloudResult.isRisky;
        } else {
          cloudResult = { error: '云函数返回格式异常' };
        }
      } catch (e) {
        cloudResult = { error: '云函数调用失败' };
      }
    }
    if (cloudRisk) {
      return {
        risk: true,
        matches: [],
        reason: '包含' + cloudResult.labelText + '，请修改后再试'
      };
    }

    // 本地原文检测
    const localMatches = this.findAllMatchesFuzzy(text, this.patterns);
    // 拼音检测：无论输入是汉字还是拼音，都转为拼音后检测
    let pyText = pinyin.textToPinyin(text, ' ');
    if (/^[a-zA-Z\s]+$/.test(text)) {
      pyText = text;
    }
    const pinyinMatches = this.findAllMatchesFuzzy(pyText, this.pinyinPatterns, true);
    // 缩写正则检测
    const abbrMatches = this.flattenedDefinitions
      .filter(def => def.type === 'abbr')
      .map(def => {
        const regex = new RegExp(def.abbrPattern, 'i');
        const match = regex.exec(text.toLowerCase());
        if (match) {
          return {
            match: match[0],
            index: match.index,
            original: def.word,
            category: def.category,
            risk: def.risk,
            type: 'abbr'
          };
        }
        return null;
      })
      .filter(Boolean);
    // 合并本地结果
    const allMatches = [...localMatches, ...pinyinMatches, ...abbrMatches];
    const localRisk = allMatches.length > 0;
    // 总体风险
    const risk = cloudRisk || localRisk;

    // 只取第一个敏感词分类，或固定提示
    let reason = null;
    if (risk && allMatches.length > 0) {
      const firstCategory = allMatches[0].category;
      // 分类中文映射
      const categoryMap = {
        politics: '政治',
        porn: '色情',
        gambling: '赌博',
        violence: '暴力',
        illegal: '违法',
        abuse: '辱骂',
        ad: '广告',
        spam: '垃圾',
        custom: '自定义'
      };
      const categoryText = categoryMap[firstCategory] || '敏感';
      reason = `包含${categoryText}内容，请修改后再试`;
    } else if (risk) {
      reason = '包含敏感内容，请修改后再试';
    }
    logger.debug('本地检测',allMatches[0]);
    return {
      risk,
      matches: allMatches,
      reason
    };
  }

  // 遍历所有正则，返回所有命中
  findAllMatchesFuzzy(text, patternObjs, isPinyin = false) {
    if (!text || typeof text !== 'string') return [];
    const matches = [];
    patternObjs.forEach((obj) => {
      let match;
      obj.regex.lastIndex = 0;
      while ((match = obj.regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          original: obj.word,
          category: obj.category,
          risk: obj.risk,
          type: isPinyin ? 'pinyin' : 'text'
        });
        // 防止死循环
        if (!match[0]) obj.regex.lastIndex++;
      }
    });
    return matches;
  }

  /**
   * 替换敏感词
   */
  async filter(text, replacement = '*') {
    await this.initialize();
    if (!text || typeof text !== 'string') {
      return text;
    }

    return this.replaceMatches(text, replacement);
  }

  /**
   * 替换匹配的敏感词
   */
  replaceMatches(text, replacement = '***') {
    if (!text || typeof text !== 'string') {
      return text;
    }

    if (typeof replacement === 'function') {
      return text.replace(this.pattern, (match, ...groups) => {
        let definitionIndex = -1;
        const captureGroups = groups.slice(0, groups.length - 2);
        
        for (let i = 0; i < captureGroups.length; i++) {
          if (captureGroups[i] !== undefined) {
            definitionIndex = i;
            break;
          }
        }

        if (definitionIndex !== -1 && definitionIndex < this.definitions.length) {
          const def = this.definitions[definitionIndex];
          return replacement(match, def.original, def.category, def.risk);
        }
        return '***';
      });
    }
    
    return text.replace(this.pattern, match => 
      typeof replacement === 'string' ? replacement.repeat(match.length) : '***'
    );
  }

  /**
   * 添加自定义敏感词
   */
  async addCustomWord(word) {
    await this.initialize();
    if (!word?.trim() || this.customWords.has(word)) {
      return false;
    }
    
    this.customWords.add(word);
    this.flattenedDefinitions = this.flattenDefinitions();
    this.initializePatterns();
    return true;
  }

  /**
   * 删除自定义敏感词
   */
  async removeCustomWord(word) {
    await this.initialize();
    if (!this.customWords.has(word)) {
      return false;
    }
    
    this.customWords.delete(word);
    this.flattenedDefinitions = this.flattenDefinitions();
    this.initializePatterns();
    return true;
  }
}

// 导出单例实例
const textCensor = new TextCensor();

module.exports = textCensor;
