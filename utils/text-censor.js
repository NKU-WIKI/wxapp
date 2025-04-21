/**
 * 文本审核工具类
 * 提供文本审核功能，包装第三方库以适应微信小程序环境
 */

let originalTextCensor;

try {
  // 尝试导入text-censor库
  originalTextCensor = require('text-censor');
  
  // 如果是默认导出对象，获取它
  if (originalTextCensor && originalTextCensor.default) {
    originalTextCensor = originalTextCensor.default;
  }
} catch (error) {
  console.error('加载text-censor库失败:', error);
  // 创建一个空对象，下面会提供后备实现
  originalTextCensor = null;
}

// 导入所需模块
const logger = require('./logger');
const banwordsData = require('./banwords'); // 导入敏感词库数据
const pinyin = require('./pinyin'); // 导入拼音模块

/**
 * 文本审核类
 * 用于检测文本中的敏感词
 */
class TextCensor {
  constructor() {
    // 使用基础方法从banwords中获取配置
    this.highPriorityBanwords = [...banwordsData.getWords('highPriorityBanwords')];
    this.illegalTradePatterns = banwordsData.libraryConfigs.illegalTradePatterns.patterns || [];
    this.sensitiveRegexPatterns = (banwordsData.libraryConfigs.sensitiveRegexPatterns.patterns || []).map(p => new RegExp(p.source, p.flags));
    this.weaponKeywords = [...banwordsData.getWords('weapons')];
    
    // 交易意图词汇 - 从联系类别中提取，或使用默认值
    this.tradeIntentKeywords = [...banwordsData.getWords('contact')] || 
                              ['私聊', '联系', '自用', '感兴趣', '我想要', '扣1', '送'];
    
    // 添加高考真题诈骗关键词
    this.examScamKeywords = banwordsData.libraryConfigs.examScam?.keywords || [];
    this.contactPatterns = banwordsData.getPatterns('contactMethods') || [];
    
    // 默认敏感词 - 合并banwords中的敏感词
    this.defaultBanwords = [
      // 从banwords中导入各类敏感词
      ...banwordsData.getWords('vulgar') || [],
      ...banwordsData.getWords('discrimination') || [],
      ...banwordsData.getWords('pornography') || [],
      ...banwordsData.getWords('weapons') || [],
      ...this.highPriorityBanwords,
      ...this.examScamKeywords // 添加高考真题诈骗关键词
    ];
    
    // 去重
    this.defaultBanwords = [...new Set(this.defaultBanwords)];
    
    // 获取原始敏感词库的方法
    this.getOriginalCensor = () => {
      try {
        // 尝试加载text-censor库
        return require('text-censor');
      } catch (e) {
        logger.debug('加载text-censor库失败，使用内置敏感词检测');
        return null;
      }
    };
    
    // 初始化敏感词库
    this.textCensor = this.getOriginalCensor();
    logger.debug(`TextCensor初始化完成，加载了${this.defaultBanwords.length}个默认敏感词`);
  }
  
  /**
   * 检查文本是否包含敏感词
   * @param {string} text 待检查文本
   * @returns {Array} 检测到的敏感词列表
   */
  async checkText(text) {
    if (!text) return [];
    
    // 检查武器相关敏感词
    for (const keyword of this.weaponKeywords) {
      if (text.includes(keyword)) {
        // 检查是否同时包含交易意图词
        for (const tradeWord of this.tradeIntentKeywords) {
          if (text.includes(tradeWord)) {
            return [`疑似非法交易:${keyword}+${tradeWord}`];
          }
        }
        return [keyword];
      }
    }
    
    // 快速路径：直接检测常见敏感词
    const quickMatches = this.quickCheckCommonWords(text);
    if (quickMatches.length > 0) {
      return quickMatches;
    }
    
    try {
      // 如果存在原始censor库，使用它
      if (this.textCensor) {
        // 异步检查，使用Promise处理
        try {
          if (typeof this.textCensor.check === 'function') {
            const matches = await this.textCensor.check(text);
            if (matches && matches.length) {
              return matches;
            }
          } else if (typeof this.textCensor === 'function') {
            // 如果textCensor本身是函数
            const result = this.textCensor(text);
            // 处理可能的Promise返回值
            if (result instanceof Promise) {
              const matches = await result;
              if (matches && matches.length) {
                return matches;
              }
            } else if (result && result.length) {
              return result;
            }
          }
        } catch (err) {
          logger.error('原始敏感词库检查失败:', err);
        }
      }
      
      // 使用内置检测逻辑
      return this.fallbackCheck(text);
    } catch (err) {
      logger.error('敏感词检测失败:', err);
      // 使用内置检测作为后备
      return this.fallbackCheck(text);
    }
  }
  
  /**
   * 去除文本中的干扰字符以便于检测
   * @param {string} text 输入文本 
   * @returns {string} 处理后的文本
   */
  removeCamouflage(text) {
    if (!text) return '';
    
    // 1. 处理连续重复的单字符
    const repeatedCharRegex = /(.)\1{2,}/g;
    const textWithoutRepeats = text.replace(repeatedCharRegex, '$1');
    
    // 2. 处理有规律插入的单字符（如"你一是一傻一逼"，"你-是-傻-逼"等）
    const patternSequenceRegex = /(.)(.)\2+\1(.)\2+\1/g;
    let processedText = textWithoutRepeats;
    
    // 使用滑动窗口检测是否有模式插入
    const potentialSensitiveWords = [];
    for (let i = 0; i < processedText.length - 1; i++) {
      // 尝试提取不含重复字符的内容，窗口3到8个字符
      for (let j = 3; j <= Math.min(8, processedText.length - i); j++) {
        const window = processedText.substring(i, i + j);
        const chars = window.split('');
        
        // 检查是否存在规律性插入字符
        const filteredChars = [];
        for (let k = 0; k < chars.length; k++) {
          // 跳过与前一个或后一个字符相同的字符（可能是分隔符）
          const prevChar = k > 0 ? chars[k - 1] : '';
          const nextChar = k < chars.length - 1 ? chars[k + 1] : '';
          
          if (chars[k] !== prevChar || chars[k] !== nextChar) {
            filteredChars.push(chars[k]);
          }
        }
        
        // 如果过滤后长度至少为2且不到原长度的70%，可能存在敏感词
        if (filteredChars.length >= 2 && filteredChars.length < window.length * 0.7) {
          potentialSensitiveWords.push(filteredChars.join(''));
        }
      }
    }
    
    // 3. 处理特定占位符字符如一、丶、点、-、_、*等
    const placeholderRegex = /[一丶点\-_*\s]+/g;
    processedText = processedText.replace(placeholderRegex, '');
    
    return {
      processedText,
      potentialWords: potentialSensitiveWords
    };
  }

  /**
   * 提取有可能包含敏感词的短语
   * @param {string} text 输入文本
   * @returns {Array<string>} 可能包含敏感词的短语列表
   */
  extractPotentialPhrases(text) {
    if (!text || text.length < 2) return [];
    
    const phrases = [];
    
    // 1. 直接提取文本中的2-6字词语
    for (let i = 0; i < text.length - 1; i++) {
      for (let len = 2; len <= Math.min(6, text.length - i); len++) {
        phrases.push(text.substring(i, i + len));
      }
    }
    
    // 2. 提取去除伪装后的文本
    const { processedText, potentialWords } = this.removeCamouflage(text);
    if (processedText !== text) {
      phrases.push(processedText);
    }
    
    // 3. 添加可能的敏感词
    if (potentialWords.length > 0) {
      phrases.push(...potentialWords);
    }
    
    return [...new Set(phrases)]; // 去重
  }
  
  /**
   * 快速检查常见敏感词
   * @param {string} text 待检查文本
   * @returns {Array<string>} 匹配到的敏感词列表
   */
  quickCheckCommonWords(text) {
    if (!text) return [];
    
    // 1. 首先检测高优先级敏感词
    for (const word of this.highPriorityBanwords) {
      if (text.includes(word)) {
        logger.debug(`检测到高优先级敏感词: ${word}`);
        return [word];
      }
    }
    
    // 1.1 检测政治人物名字的变体和拼音
    try {
      // 获取政治敏感正则表达式
      const politicalRegexPatterns = banwordsData.getPatterns('politicalRegexPatterns') || [];
      for (const pattern of politicalRegexPatterns) {
        if (this.safeRegexTest(pattern, text)) {
          const match = pattern.source.replace(/\\s\*/g, '').replace(/[\[\]\\]/g, '');
          logger.debug(`检测到政治敏感内容: ${match}`);
          return [`政治敏感内容`];
        }
      }
      
      // 政治变体检测
      const politicalVariants = banwordsData.libraryConfigs.politicalVariants?.words || {};
      for (const [word, variants] of Object.entries(politicalVariants)) {
        if (text.includes(word)) {
          logger.debug(`检测到政治敏感词: ${word}`);
          return [`政治敏感词: ${word}`];
        }
        
        for (const variant of variants) {
          if (text.includes(variant)) {
            logger.debug(`检测到政治敏感词变体: ${variant} -> ${word}`);
            return [`政治敏感词变体: ${variant}`];
          }
        }
      }
      
      // 检查拼音
      if (pinyin) {
        const pinyinText = pinyin(text, { style: pinyin.STYLE_NORMAL }).flat().join('');
        const pinyinInitials = pinyin(text, { style: pinyin.STYLE_FIRST_LETTER }).flat().join('');
        
        const politicalPinyinPatterns = banwordsData.getPatterns('politicalPinyinPatterns') || [];
        for (const pattern of politicalPinyinPatterns) {
          if (this.safeRegexTest(pattern, pinyinText) || this.safeRegexTest(pattern, pinyinInitials)) {
            logger.debug(`检测到政治敏感拼音匹配`);
            return [`政治敏感拼音`];
          }
        }
      }
    } catch (error) {
      logger.debug(`政治敏感检测出错: ${error.message}`);
    }
    
    // 1.2 检查隐藏敏感词（使用重复字符分隔的敏感词）
    try {
      const { processedText, potentialWords } = this.removeCamouflage(text);
      if (processedText !== text || potentialWords.length > 0) {
        logger.debug(`检测到可能伪装的文本`);
        
        // 检查处理后的文本是否包含敏感词
        for (const word of this.highPriorityBanwords) {
          if (processedText.includes(word)) {
            logger.debug(`检测到伪装的高优先级敏感词: ${word}`);
            return [`伪装敏感词: ${word}`];
          }
        }
        
        // 检查可能的敏感词
        for (const phrase of potentialWords) {
          // 检查是否是高优先级敏感词
          for (const word of this.highPriorityBanwords) {
            if (phrase.includes(word) || word.includes(phrase)) {
              logger.debug(`检测到伪装的高优先级敏感词: ${word}`);
              return [`伪装敏感词: ${word}`];
            }
          }
          
          // 检查普通敏感词
          for (const word of this.banwords) {
            if (phrase.includes(word) || word.includes(phrase)) {
              logger.debug(`检测到伪装的敏感词: ${word}`);
              return [`伪装敏感词: ${word}`];
            }
          }
        }
      }
    } catch (error) {
      logger.debug(`伪装敏感词检测出错: ${error.message}`);
    }
    
    // 2. 检查敏感词组合模式
    const lowerText = text.toLowerCase();
    for (const pattern of this.illegalTradePatterns) {
      if (pattern.every(word => lowerText.includes(word.toLowerCase()))) {
        const combo = `${pattern.join('+')}`;
        logger.debug(`检测到非法交易组合: ${combo}`);
        return [`非法交易组合:${combo}`];
      }
    }
    
    // 2.1 检查异常联系方式 - 使用从banwords获取的联系方式模式
    for (const pattern of this.contactPatterns) {
      try {
        if (this.safeRegexTest(pattern, text)) {
          const match = text.match(pattern);
          if (match && match[0]) {
            // 检查是否同时包含敏感关键词
            const examScamConfig = banwordsData.libraryConfigs.examScam || {};
            const keywords = examScamConfig.keywords || [];
            
            const hasKeyword = keywords.some(keyword => 
              lowerText.includes(keyword.toLowerCase())
            );
            
            if (hasKeyword) {
              logger.debug(`检测到异常联系方式+敏感词`);
              return [`异常联系方式+敏感词组合`];
            }
            
            logger.debug(`检测到异常联系方式`);
            return [`异常联系方式`];
          }
        }
      } catch (error) {
        logger.debug(`联系方式检测出错: ${error.message}`);
      }
    }
    
    // 2.2 检查未来年份的敏感内容
    const examScamConfig = banwordsData.libraryConfigs.examScam || {};
    const futurePatternsYears = examScamConfig.futurePatternsYears || [];
    const keywords = examScamConfig.keywords || [];
    const subjects = examScamConfig.subjects || [];
    const currentYear = new Date().getFullYear();
    
    // 检查是否包含未来年份
    const yearPattern = /20\d\d/g;
    const years = text.match(yearPattern);
    
    if (years && years.length > 0) {
      for (const yearStr of years) {
        const year = parseInt(yearStr);
        if (year > currentYear || futurePatternsYears.includes(year)) {
          // 检查是否包含敏感关键词
          const hasKeyword = keywords.some(keyword => 
            lowerText.includes(keyword.toLowerCase())
          );
          
          // 检查是否包含学科关键词
          const hasSubjectKeyword = subjects.some(subject => 
            lowerText.includes(subject.toLowerCase())
          );
          
          if (hasKeyword || hasSubjectKeyword) {
            logger.debug(`检测到未来敏感内容: ${yearStr}`);
            return [`未来敏感内容:${yearStr}`];
          }
        }
      }
    }
    
    // 2.3 检查敏感组合
    const contactCombos = examScamConfig.contactCombos || [];
    for (const combo of contactCombos) {
      if (combo.every(word => lowerText.includes(word.toLowerCase()))) {
        logger.debug(`检测到敏感组合`);
        return [`敏感组合:${combo.join('+')}`];
      }
    }
    
    // 3. 使用正则表达式匹配变体形式
    const matches = [];
    for (const regex of this.sensitiveRegexPatterns) {
      try {
        if (this.safeRegexTest(regex, text)) {
          const match = regex.source.replace(/\\s\*/g, '').replace(/[\[\]\\]/g, '');
          logger.debug(`正则匹配敏感词: ${match}`);
          matches.push(match);
        }
      } catch (error) {
        logger.debug(`正则匹配出错: ${error.message}`);
      }
    }
    
    return matches;
  }
  
  /**
   * 检查文本的拼音变体
   * @param {string} text 待检查文本
   * @returns {Promise<Array>} 检测到的敏感词列表
   */
  async checkPinyinVariants(text) {
    logger.debug(`开始拼音检测，文本长度: ${text.length}`);
    const startTime = Date.now();
    const matches = new Set();
    
    try {
      // 安全检查 - 限制文本长度
      if (text.length > 200) {
        logger.debug(`拼音检测文本过长，截断为200字符`);
        text = text.substring(0, 200);
      }
      
      // 0. 直接检测常见敏感词的拼音形式（硬编码）
      const commonVulgarPinyinMap = {
        "nimade": "你妈的",
        "nmd": "你妈的",
        "cnm": "操你妈",
        "caonima": "操你妈",
        "sb": "傻逼",
        "shabi": "傻逼",
        "nima": "你妈",
        "tama": "他妈",
        "nmsl": "你妈死了",
        "wocao": "我操",
        "woc": "我操"
      };
      
      // 转换文本为小写无空格形式进行匹配
      const simplifiedText = text.toLowerCase().replace(/\s+/g, '');
      
      for (const [pinyin, meaning] of Object.entries(commonVulgarPinyinMap)) {
        if (simplifiedText.includes(pinyin)) {
          logger.debug(`直接匹配常见敏感拼音: ${pinyin} -> ${meaning}`);
          matches.add(`常见敏感拼音:${meaning}`);
        }
      }
      
      // 如果直接匹配到了常见拼音形式，直接返回结果
      if (matches.size > 0) {
        logger.debug(`直接匹配到常见敏感拼音，跳过后续检测`);
        return [...matches];
      }
      
      // 1. 直接检查组合模式
      logger.debug(`检查敏感组合模式`);
      if (banwordsData.libraryConfigs.illegalTradePatterns && banwordsData.libraryConfigs.illegalTradePatterns.patterns) {
        // 仅检查前10个模式
        const combos = banwordsData.libraryConfigs.illegalTradePatterns.patterns.slice(0, 10);
        for (const combo of combos) {
          if (text.includes(combo[0]) && text.includes(combo[1])) {
            logger.debug(`检测到敏感组合: ${combo.join('-')}`);
            matches.add(`组合:${combo.join('-')}`);
          }
        }
      }
      
      // 2. 使用正则模式匹配 - 限制数量
      logger.debug(`使用正则模式匹配...`);
      const regexPatterns = banwordsData.getPatterns('sensitiveRegexPatterns');
      logger.debug(`加载了 ${regexPatterns.length} 个正则模式，只检查前10个`);
      
      // 只检查前10个模式，避免卡死
      const patternsToCheck = regexPatterns.slice(0, 10);
      let regexMatchCount = 0;
      
      for (const pattern of patternsToCheck) {
        try {
          if (this.safeRegexTest(pattern, text)) {
            const match = text.match(pattern);
            if (match && match[0]) {
              logger.debug(`正则匹配成功: ${match[0]}`);
              matches.add(match[0]);
              regexMatchCount++;
              if (regexMatchCount >= 2) break; // 找到2个就足够了
            }
          }
        } catch (error) {
          logger.debug(`正则匹配错误: ${error.message}`);
        }
      }
      logger.debug(`正则匹配完成，找到 ${regexMatchCount} 个匹配`);
      
      // 如果已经找到匹配，则跳过拼音检测
      if (matches.size > 0) {
        logger.debug(`已找到 ${matches.size} 个匹配，跳过拼音转换检测`);
        return [...matches];
      }
      
      // 3. 拼音模式检测
      logger.debug(`开始拼音模式检测...`);
      try {
        if (pinyin) {
          // 转换为拼音
          const pinyinText = pinyin(text, { style: pinyin.STYLE_NORMAL }).flat().join('');
          const pinyinInitials = pinyin(text, { style: pinyin.STYLE_FIRST_LETTER }).flat().join('');
          
          logger.debug(`拼音转换结果 - 全拼: ${pinyinText}, 首字母: ${pinyinInitials}`);
          
          // 加载拼音模式，并限制数量
          const vulgarPatterns = banwordsData.getPatterns('vulgarPinyinPatterns').slice(0, 15) || [];
          
          // 只使用少量常见模式进行检测
          logger.debug(`使用 ${vulgarPatterns.length} 个拼音模式进行检测`);
          
          // 检测到的匹配计数
          let pinyinMatchCount = 0;
          
          // 在全拼和首字母形式中检测
          for (const pattern of vulgarPatterns) {
            try {
              // 使用安全的regex测试
              if (this.safeRegexTest(pattern, pinyinText)) {
                const match = pinyinText.match(pattern);
                if (match && match[0]) {
                  logger.debug(`全拼匹配成功: ${match[0]}`);
                  matches.add(`拼音:${match[0]}`);
                  pinyinMatchCount++;
                  if (pinyinMatchCount >= 2) break; // 找到2个就足够了
                }
              }
              
              if (this.safeRegexTest(pattern, pinyinInitials)) {
                const match = pinyinInitials.match(pattern);
                if (match && match[0]) {
                  logger.debug(`首字母匹配成功: ${match[0]}`);
                  matches.add(`拼音首字母:${match[0]}`);
                  pinyinMatchCount++;
                  if (pinyinMatchCount >= 2) break; // 找到2个就足够了
                }
              }
            } catch (error) {
              logger.debug(`拼音匹配错误: ${error.message}`);
            }
          }
          logger.debug(`拼音匹配完成，找到 ${pinyinMatchCount} 个匹配`);
          
          // 如果已经找到匹配，则跳过变体检测
          if (pinyinMatchCount > 0) {
            logger.debug(`拼音匹配已找到 ${pinyinMatchCount} 个结果，跳过变体检测`);
            return [...matches];
          }
          
          // 4. 生成有限数量的拼音变体并检测
          const variants = this.generatePinyinVariants(pinyinText).slice(0, 5); // 最多5个变体
          logger.debug(`生成了 ${variants.length} 个拼音变体`);
          
          // 变体检测计数
          let variantMatchCount = 0;
          
          // 对每个变体，只使用少量正则进行检测
          const limitedPatterns = vulgarPatterns.slice(0, 5); // 最多5个正则
          for (const variant of variants) {
            for (const pattern of limitedPatterns) {
              try {
                if (this.safeRegexTest(pattern, variant)) {
                  const match = variant.match(pattern);
                  if (match && match[0]) {
                    logger.debug(`变体匹配成功: ${match[0]}`);
                    matches.add(`变体:${match[0]}`);
                    variantMatchCount++;
                    if (variantMatchCount >= 1) break; // 找到1个就足够了
                  }
                }
              } catch (error) {
                logger.debug(`变体匹配错误: ${error.message}`);
              }
            }
            if (variantMatchCount > 0) break; // 找到1个变体匹配就停止
          }
          logger.debug(`变体匹配完成，找到 ${variantMatchCount} 个匹配`);
        }
      } catch (error) {
        logger.error(`拼音转换错误: ${error.message}`);
      }
      
    } catch (error) {
      logger.error(`拼音检测出错: ${error}`);
    }
    
    const endTime = Date.now();
    logger.debug(`拼音检测完成，耗时: ${endTime - startTime}ms，匹配结果: ${[...matches].join(', ')}`);
    return [...matches];
  }
  
  /**
   * 安全的正则表达式测试，避免长时间执行
   * @param {RegExp} regex 正则表达式
   * @param {string} text 要测试的文本
   * @returns {boolean} 是否匹配
   */
  safeRegexTest(regex, text) {
    try {
      // 设置更短的超时保护
      const timeoutMs = 50; // 50毫秒超时，避免卡死
      const startTime = Date.now();
      
      // 添加安全保护措施 - 对于可能导致灾难性回溯的长文本
      const MAX_TEXT_LENGTH = 1000; // 限制最大处理长度
      const MAX_SEGMENT_LENGTH = 200; // 限制分段长度
      
      if (text.length > MAX_TEXT_LENGTH) {
        // 对于超长文本，只处理前1000个字符
        text = text.substring(0, MAX_TEXT_LENGTH);
        logger.debug(`文本过长，截断处理，仅检查前${MAX_TEXT_LENGTH}个字符`);
      }
      
      // 分段测试，避免整体正则匹配超时
      if (text.length > MAX_SEGMENT_LENGTH) {
        // 文本太长，分段测试，每段重叠50%以避免遗漏跨段匹配
        for (let i = 0; i < text.length; i += MAX_SEGMENT_LENGTH / 2) {
          const segment = text.substr(i, MAX_SEGMENT_LENGTH);
          
          // 直接原子操作，避免复杂状态保存
          if (regex.test(segment)) {
            return true;
          }
          
          // 检查超时
          if (Date.now() - startTime > timeoutMs) {
            logger.debug(`正则测试超时: ${regex}`);
            return false;
          }
        }
        return false;
      } else {
        // 文本较短，直接测试
        return regex.test(text);
      }
    } catch (error) {
      logger.debug(`正则测试出错: ${error.message}`);
      return false;
    }
  }
  
  /**
   * 生成拼音变体，用于增强检测能力
   * @param {string} pinyinText 拼音文本
   * @returns {Array} 拼音变体数组
   */
  generatePinyinVariants(pinyinText) {
    try {
      const variants = [pinyinText.toLowerCase()];
      const variantChars = banwordsData.pinyinVariants?.patterns || {};
      
      // 替换单个字符
      for (let i = 0; i < pinyinText.length; i++) {
        const char = pinyinText[i].toLowerCase();
        if (variantChars[char]) {
          for (const variant of variantChars[char]) {
            const newVariant = pinyinText.substring(0, i) + variant + pinyinText.substring(i + 1);
            variants.push(newVariant.toLowerCase());
            
            // 限制变体数量，避免组合爆炸
            if (variants.length > 20) {
              logger.debug(`变体数量过多，截断处理`);
              return variants;
            }
          }
        }
      }
      
      // 删除空格版本
      variants.push(pinyinText.replace(/\s/g, '').toLowerCase());
      
      // 为所有可能的拼音组合生成通用变体
      // 不针对特定词汇进行硬编码处理
      
      return variants;
    } catch (error) {
      logger.debug(`生成变体错误: ${error.message}`);
      return [pinyinText];
    }
  }
  
  /**
   * 检查文本中是否包含敏感词
   * @param {string} text 待检查文本
   * @returns {Array<string>} 匹配的敏感词列表
   */
  checkWords(text) {
    if (!text) return [];
    
    const matches = [];
    
    // 检查高优先级敏感词
    for (const word of this.highPriorityBanwords) {
      if (text.includes(word)) {
        matches.push(word);
      }
    }
    
    // 如果已经找到高优先级敏感词，直接返回
    if (matches.length > 0) {
      return matches;
    }
    
    // 检查普通敏感词
    for (const word of this.defaultBanwords) {
      if (text.includes(word)) {
        matches.push(word);
      }
    }
    
    // 检查政治敏感词
    try {
      const politicalWords = banwordsData.getWords('political') || [];
      for (const word of politicalWords) {
        if (text.includes(word)) {
          matches.push(`政治敏感词:${word}`);
        }
      }
    } catch (error) {
      logger.debug(`政治敏感词检测出错: ${error.message}`);
    }
    
    return matches;
  }
  
  /**
   * 高级文本审查
   * @param {string} text 待审查文本
   * @param {object} options 选项
   * @returns {Promise<object>} 审查结果
   */
  async advancedCheck(text, options = {}) {
    if (!text) return { pass: true, matches: [], riskScore: 0 };
    
    const defaultOptions = {
      checkPinyin: true,
      checkContext: true,
      checkSemantic: false
    };
    
    const opts = { ...defaultOptions, ...options };
    const matches = [];
    
    // 检查原始文本
    const quickMatches = this.quickCheckCommonWords(text);
    if (quickMatches.length > 0) {
      matches.push(...quickMatches);
    }
    
    // 新增: 检查伪装文本
    const { processedText, potentialWords } = this.removeCamouflage(text);
    if (processedText !== text) {
      logger.debug(`检查伪装文本`);
      
      // 检查处理后文本的敏感词
      const processedMatches = this.checkWords(processedText);
      if (processedMatches.length > 0) {
        matches.push(...processedMatches.map(m => `伪装敏感词: ${m}`));
      }
      
      // 检查提取的敏感词
      for (const potentialWord of potentialWords) {
        const wordMatches = this.checkWords(potentialWord);
        if (wordMatches.length > 0) {
          matches.push(...wordMatches.map(m => `提取敏感词: ${m}`));
        }
      }
    }
    
    // 检查拼音变体
    if (opts.checkPinyin && matches.length === 0) {
      try {
        const pinyinMatches = await this.checkPinyinVariants(text);
        if (pinyinMatches.length > 0) {
          matches.push(...pinyinMatches);
        }
      } catch (err) {
        logger.debug('拼音检测超时');
      }
    }
    
    // 语境检测
    if (opts.checkContext && matches.length === 0) {
      // 提取潜在短语检查
      const phrases = this.extractPotentialPhrases(text);
      for (const phrase of phrases) {
        const phraseMatches = this.checkWords(phrase);
        if (phraseMatches.length > 0) {
          matches.push(...phraseMatches.map(m => `语境检测: ${m}`));
          break;
        }
      }
    }
    
    return {
      pass: matches.length === 0,
      matches,
      riskScore: matches.length > 0 ? 0.8 : 0
    };
  }
  
  /**
   * 检查内容安全
   * 整合了多种检测方法，简化contentSecurity模块的使用
   * @param {string} text 待检查文本
   * @param {Object} options 选项
   * @returns {Promise<Object>} 检查结果
   */
  async checkContentSafety(text, options = {}) {
    if (!text) return { safe: true, matches: [], evidence: '' };
    
    try {
      // 快速检查常见敏感词
      const quickMatches = this.quickCheckCommonWords(text);
      if (quickMatches.length > 0) {
        return {
          safe: false,
          matches: quickMatches,
          evidence: `包含敏感词: ${quickMatches.join(', ')}`,
          riskScore: 100
        };
      }
      
      // 基础检查
      const basicResult = await this.advancedCheck(text, options);
      
      // 构建结果
      return {
        safe: basicResult.pass,
        matches: basicResult.matches,
        evidence: basicResult.evidence,
        riskScore: basicResult.riskScore
      };
    } catch (err) {
      console.error('内容安全检查失败:', err);
      return { safe: true, matches: [], evidence: '' };
    }
  }
  
  /**
   * 后备的敏感词检查方法
   * @param {string} text 待检查文本
   * @returns {Array} 检测到的敏感词列表
   */
  fallbackCheck(text) {
    if (!text) return [];
    
    // 特殊处理：检查高优先级敏感词
    for (const word of this.highPriorityBanwords) {
      if (text.includes(word)) {
        return [word];
      }
    }
    
    const foundWords = [];
    
    // 简单的敏感词匹配
    for (const word of this.defaultBanwords) {
      if (text.indexOf(word) !== -1) {
        foundWords.push(word);
      }
    }
    
    return foundWords;
  }
  
  /**
   * 添加自定义敏感词
   * @param {string|Array} words 敏感词或敏感词数组
   */
  addWords(words) {
    if (!words) return;
    
    try {
      // 如果原始库实例存在，使用原始库功能
      if (this.textCensor && typeof this.textCensor.addWords === 'function') {
        this.textCensor.addWords(words);
        return;
      }
      
      // 后备实现：添加到默认敏感词列表
      if (Array.isArray(words)) {
        this.defaultBanwords = [...this.defaultBanwords, ...words];
      } else {
        this.defaultBanwords.push(words);
      }
      
      // 去重
      this.defaultBanwords = [...new Set(this.defaultBanwords)];
    } catch (error) {
      console.error('添加敏感词失败:', error);
    }
  }
}

module.exports = TextCensor; 