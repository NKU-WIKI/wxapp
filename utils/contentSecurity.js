/**
 * 内容安全检测模块（泛化增强版）
 */

const logger = require('./logger');
const storage = require('./storage');
const banwordsData = require('./banwords');

const pinyin = require('./pinyin'); // 汉字转拼音
const TextCensor = require('./text-censor'); // 高级文本审查
const textCensor = new TextCensor();

const REJECT_CODES = {
  SENSITIVE_WORDS: 87014,
  POLITICAL: 87015,
  SPAM: 87018,
  FRAUD: 87019,
  WECHAT_REVIEW: 87020
};

// 内容风险评估器
class ContentRiskAnalyzer {
  constructor() {
    this.riskFactors = {};
    this.totalScore = 0;
    this.threshold = 0.6; // 风险阈值   
    this.detectionResults = [];
  }

  // 添加风险因素
  addRiskFactor(name, score, evidence = null) {
    this.riskFactors[name] = { score, evidence };
    this.totalScore += score;
    this.detectionResults.push({
      factor: name,
      score: score,
      evidence: evidence
    });
    logger.debug(`添加风险因素[${name}]: ${score} - ${evidence}`);
    return this;
  }

  // 获取风险评分
  getRiskScore() {
    return Math.min(this.totalScore, 1.0);
  }

  // 获取风险报告
  getRiskReport() {
    return {
      score: this.getRiskScore(),
      factors: this.riskFactors,
      results: this.detectionResults,
      isRisky: this.getRiskScore() >= this.threshold
    };
  }
}

// 特征提取器
class FeatureExtractor {
  // 提取文本特征
  static extractFeatures(content) {
    if (!content) return {};
    
    // 基础文本特征
    const features = {
      content, // 保存原始内容便于后续处理
      length: content.length,
      hasNumbers: /\d+/.test(content),
      hasUrls: /https?:\/\/\S+/.test(content),
      hasEmails: /\S+@\S+\.\S+/.test(content),
      hasMentions: /@\S+/.test(content),
      wordCount: content.split(/\s+/).length,
      segments: content.split(/[,，.。;；!！?？]/),
      keywords: this.extractKeywords(content)
    };
    
    // 语义向量 (简化版) - 实际项目中可接入词向量模型
    features.semanticVector = this.generateSimpleSemanticVector(content);
    
    return features;
  }
  
  // 提取关键词
  static extractKeywords(content) {
    // 简单实现 - 实际项目应使用TF-IDF或其他算法
    const words = content.split(/[\s\W]+/).filter(w => w.length > 1);
    return [...new Set(words)];
  }
  
  // 生成简单语义向量
  static generateSimpleSemanticVector(content) {
    const lowerContent = content.toLowerCase();
    const result = {};
    
    // 直接从libraryConfigs获取语义维度
    const dimensions = banwordsData.libraryConfigs.semanticDimensions || {};
    
    // 为每个维度计算分数
    for (const [dimension, keywords] of Object.entries(dimensions)) {
      result[dimension] = this.calcSemanticScore(lowerContent, keywords);
    }
    
    return result;
  }
  
  // 计算语义得分
  static calcSemanticScore(content, keywords) {
    return keywords.filter(k => content.includes(k)).length / keywords.length;
  }
}

// 模式识别器
class PatternRecognizer {
  constructor() {
    this.patterns = {};
    this.asyncPatterns = {}; // 单独存储异步检测器
  }
  
  // 注册新模式
  registerPattern(name, detector, weight = 1.0) {
    // 区分同步和异步检测器
    if (detector.constructor.name === 'AsyncFunction' ||
        detector.toString().includes('async')) {
      this.asyncPatterns[name] = { detector, weight };
    } else {
      this.patterns[name] = { detector, weight };
    }
    return this;
  }
  
  // 检测所有模式 - 同步检测器
  detectPatterns(content, features) {
    const results = {};
    
    for (const [name, pattern] of Object.entries(this.patterns)) {
      try {
        const { matched, evidence } = pattern.detector(content, features);
        if (matched) {
          results[name] = {
            score: pattern.weight,
            evidence: evidence
          };
        }
      } catch (err) {
        logger.error(`模式识别器[${name}]出错:`, err);
      }
    }
    
    return results;
  }
  
  // 异步检测所有模式 - 处理异步检测器
  async detectPatternsAsync(content, features) {
    const results = {};
    
    // 先执行同步检测器
    Object.assign(results, this.detectPatterns(content, features));
    
    // 快速检测路径：如果已经找到高风险模式，不再执行后续检测
    const hasHighRisk = Object.values(results).some(r => r.score >= 0.8);
    if (hasHighRisk) {
      return results;
    }
    
    // 并发执行所有异步检测器，限制最长等待时间
    const timeout = 3000; // 3秒超时
    const asyncTimeout = new Promise(resolve => setTimeout(resolve, timeout, {}));
    
    try {
      const asyncResults = await Promise.race([
        // 并行执行所有异步检测器
        Promise.all(
          Object.entries(this.asyncPatterns).map(async ([name, pattern]) => {
            try {
              const { matched, evidence } = await Promise.race([
                pattern.detector(content, features),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error(`检测器[${name}]超时`)), 1000)
                )
              ]);
              
              if (matched) {
                return {
                  name,
                  result: {
                    score: pattern.weight,
                    evidence: evidence
                  }
                };
              }
              return null;
            } catch (err) {
              logger.error(`异步模式识别器[${name}]出错:`, err);
              return null;
            }
          })
        ).then(results => {
          // 过滤null结果并转换为对象
          const filteredResults = {};
          results.filter(Boolean).forEach(item => {
            filteredResults[item.name] = item.result;
          });
          return filteredResults;
        }),
        asyncTimeout
      ]);
      
      // 合并异步检测结果
      Object.assign(results, asyncResults);
    } catch (err) {
      logger.error('异步模式检测出错:', err);
    }
    
    return results;
  }
}

// 创建模式识别器实例和注册检测模式
function createPatternRecognizer() {
  const recognizer = new PatternRecognizer();
  
  // 从banwordsData中获取详细配置
  const semanticDimensions = banwordsData.libraryConfigs.semanticDimensions || {};
  const fraudCombos = banwordsData.libraryConfigs.fraudCombos?.rules || [];
  
  // 1. 高风险词汇模式 - 从banwordsData获取关键词
  recognizer.registerPattern('high_risk_keywords', 
    (content, features) => {
      const highRiskWords = banwordsData.getWords('highPriorityBanwords');
      const matches = highRiskWords.filter(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      return {
        score: matches.length > 0 ? 1.0 : 0,
        evidence: matches.length > 0 ? `包含高风险词: ${matches.join(', ')}` : null
      };
    },
    1.0
  );
  
  // 2. 异常联系方式检测 - 从banwordsData获取模式
  recognizer.registerPattern('abnormal_contact', 
    (content, features) => {
      const contactPatterns = banwordsData.getPatterns('contactMethods');
      let matches = [];
      
      for (const pattern of contactPatterns) {
        try {
          if (pattern.test(content)) {
            matches.push(pattern.source.replace(/\\s\*/g, '').replace(/[\[\]\\]/g, ''));
          }
        } catch (err) {
          logger.debug(`联系方式模式检测失败: ${err.message}`);
        }
      }
      
      return {
        score: matches.length > 0 ? 0.8 : 0,
        evidence: matches.length > 0 ? `包含异常联系方式: ${matches.join(', ')}` : null
      };
    },
    0.8
  );
  
  // 3. 诈骗组合模式检测 - 从banwordsData获取规则
  recognizer.registerPattern('fraud_combo', 
    (content, features) => {
      const lowerContent = content.toLowerCase();
      const matches = [];
      
      for (const rule of fraudCombos) {
        if (rule.every(word => lowerContent.includes(word.toLowerCase()))) {
          matches.push(rule.join('+'));
        }
      }
      
      // 检查高考真题诈骗
      const examScam = banwordsData.libraryConfigs.examScam || {};
      const examKeywords = examScam.keywords || [];
      const years = examScam.futurePatternsYears || [];
      const subjects = examScam.subjects || [];
      const contactCombos = examScam.contactCombos || [];
      
      // 检查年份+真题组合
      for (const year of years) {
        if (content.includes(year.toString())) {
          for (const keyword of examKeywords) {
            if (content.includes(keyword)) {
              matches.push(`${year}+${keyword}`);
            }
          }
        }
      }
      
      // 检查学科+真题组合
      for (const subject of subjects) {
        if (content.includes(subject)) {
          for (const keyword of examKeywords) {
            if (content.includes(keyword)) {
              matches.push(`${subject}+${keyword}`);
            }
          }
        }
      }
      
      // 检查联系方式组合
      for (const combo of contactCombos) {
        if (combo.every(word => content.includes(word))) {
          matches.push(combo.join('+'));
        }
      }
      
      return {
        score: matches.length > 0 ? 0.9 : 0,
        evidence: matches.length > 0 ? `包含诈骗组合: ${matches.join(', ')}` : null
      };
    },
    0.9
  );
  
  // 4. 政治敏感内容检测 - 从banwordsData获取配置
  recognizer.registerPattern('political_sensitive', 
    (content, features) => {
      let isPoliticalSensitive = false;
      let evidence = [];
      
      // 检查政治敏感词
      const politicalWords = [
        ...banwordsData.getWords('political') || [],
        ...banwordsData.getWords('politicalLegal') || [],
        ...banwordsData.getWords('sensitiveHistory') || [],
        ...banwordsData.getWords('sensitiveRegions') || []
      ];
      
      const matches = politicalWords.filter(word => 
        content.includes(word)
      );
      
      if (matches.length > 0) {
        isPoliticalSensitive = true;
        evidence.push(`包含政治敏感词: ${matches.join(', ')}`);
      }
      
      // 检查政治敏感组合
      const politicalCombos = banwordsData.libraryConfigs.politicalSensitiveCombos?.patterns || [];
      for (const combo of politicalCombos) {
        if (combo.every(word => content.includes(word))) {
          isPoliticalSensitive = true;
          evidence.push(`包含政治敏感组合: ${combo.join('+')}`);
        }
      }
      
      // 检查政治敏感正则表达式
      const politicalRegexPatterns = banwordsData.getPatterns('politicalRegexPatterns');
      for (const pattern of politicalRegexPatterns) {
        try {
          if (pattern.test(content)) {
            isPoliticalSensitive = true;
            evidence.push(`匹配政治敏感模式: ${pattern.source.replace(/\\s\*/g, '').replace(/[\[\]\\]/g, '')}`);
          }
        } catch (err) {
          logger.debug(`政治模式检测失败: ${err.message}`);
        }
      }
      
      return {
        score: isPoliticalSensitive ? 1.0 : 0,
        evidence: isPoliticalSensitive ? evidence.join('; ') : null
      };
    },
    1.0
  );
  
  // 5. 语义风险检测 - 从banwordsData获取语义维度
  recognizer.registerPattern('semantic_risk', 
    (content, features) => {
      let riskScore = 0;
      let evidence = [];
      
      // 分析不同维度的匹配情况
      const dimensions = {
        financial: 0,
        contact: 0,
        fraudulent: 0,
        urgency: 0, 
        privacy: 0,
        vulgar: 0
      };
      
      // 从banwordsData获取语义维度关键词
      for (const [dimension, keywords] of Object.entries(semanticDimensions)) {
        if (dimensions[dimension] !== undefined && Array.isArray(keywords)) {
          const matches = keywords.filter(word => 
            content.toLowerCase().includes(word.toLowerCase())
          );
          dimensions[dimension] = matches.length;
          
          // 记录匹配的关键词
          if (matches.length > 0) {
            evidence.push(`${dimension}维度: ${matches.join(', ')}`);
          }
        }
      }
      
      // 根据维度匹配情况计算风险分数
      if (dimensions.contact > 0 && dimensions.financial > 0) {
        riskScore += 0.3;
      }
      
      if (dimensions.contact > 0 && dimensions.fraudulent > 0) {
        riskScore += 0.4;
      }
      
      if (dimensions.financial > 0 && dimensions.fraudulent > 0) {
        riskScore += 0.4;
      }
      
      if (dimensions.urgency > 0 && dimensions.financial > 0) {
        riskScore += 0.2;
      }
      
      if (dimensions.privacy > 0 && dimensions.contact > 0) {
        riskScore += 0.3;
      }
      
      if (dimensions.vulgar > 0) {
        riskScore += 0.1 * Math.min(dimensions.vulgar, 3);
      }
      
      // 限制最高分数为1.0
      riskScore = Math.min(riskScore, 1.0);
      
      return {
        score: riskScore,
        evidence: riskScore > 0 ? `语义风险因素: ${evidence.join('; ')}` : null
      };
    },
    0.8
  );
  
  // 6. 通用内容敏感度检测 - 从banwordsData获取敏感词库
  recognizer.registerPattern('common_sensitive', 
    (content, features) => {
      // 从banwordsData获取所有敏感词库
      const vulgarWords = banwordsData.getWords('vulgar');
      const pornWords = banwordsData.getWords('pornography');
      const discriminationWords = banwordsData.getWords('discrimination');
      
      const allCategories = [
        { name: '不文明用语', words: vulgarWords },
        { name: '色情内容', words: pornWords },
        { name: '歧视性言论', words: discriminationWords }
      ];
      
      let matchedCategories = [];
      let matches = [];
      
      for (const category of allCategories) {
        const categoryMatches = category.words.filter(word => 
          content.toLowerCase().includes(word.toLowerCase())
        );
        
        if (categoryMatches.length > 0) {
          matchedCategories.push(category.name);
          matches.push(...categoryMatches);
        }
      }
      
      // 计算敏感度分数
      const score = matchedCategories.length > 0 ? 
        Math.min(0.6 + (matches.length * 0.1), 1.0) : 0;
      
      return {
        score: score,
        evidence: score > 0 ? 
          `包含敏感内容(${matchedCategories.join(',')}): ${matches.join(', ')}` : null
      };
    },
    0.7
  );
  
  // 7. 首字母缩写敏感词检测
  recognizer.registerPattern('pinyin_sensitive', 1.0,
    (content, features) => {
      // 从banwordsData中获取首字母缩写配置，而不是硬编码
      const commonAbbrs = banwordsData.libraryConfigs.abbreviations?.words || {};

      // 将文本转为小写并去除常见分隔符进行检测
      const simpleContent = content.toLowerCase().replace(/[\s\-_\.]/g, '');

      // 检查是否包含这些首字母缩写
      const matches = [];
      for (const [abbr, meaning] of Object.entries(commonAbbrs)) {
        if (simpleContent.includes(abbr)) {
          matches.push(`首字母敏感词:${abbr}(${meaning})`);
        }
      }

      return {
        matched: matches.length > 0,
        evidence: matches.length > 0 ? matches.join('; ') : null
      };
    },
    1.0  // 设为最高风险级别
  );
  
  // 8. 金融敏感内容检测
  recognizer.registerPattern('financial_sensitive', 
    (content, features) => {
      // 从banwordsData中获取金融敏感词
      const financialWords = banwordsData.getWords('financialSensitive') || [];
      const financialPatterns = banwordsData.getPatterns('financialSensitive') || [];
      
      // 检查直接包含金融敏感词
      const wordMatches = [];
      for (const word of financialWords) {
        if (content.includes(word)) {
          wordMatches.push(word);
          // 找到2个就足够了
          if (wordMatches.length >= 2) break;
        }
      }
      
      // 检查正则模式匹配
      const patternMatches = [];
      for (const pattern of financialPatterns) {
        try {
          if (pattern.test(content)) {
            const match = content.match(pattern);
            if (match && match[0]) {
              patternMatches.push(match[0]);
              // 找到1个模式匹配就足够了
              break;
            }
          }
        } catch (error) {
          logger.debug(`金融模式匹配错误: ${error.message}`);
        }
      }
      
      // 检查是否同时包含组合词 - 从banwordsData中获取
      const financialCombos = banwordsData.libraryConfigs.fraudCombos?.rules || [];
      const comboMatches = [];
      
      // 只检查可能是金融相关的组合
      const financialKeywords = ['股票', '基金', '投资', '理财', '股市', '荐股', '推荐'];
      
      for (const combo of financialCombos) {
        // 只检查至少包含一个金融关键词的组合
        const hasFinancialKeyword = combo.some(word => 
          financialKeywords.includes(word)
        );
        
        if (hasFinancialKeyword && combo.every(word => content.includes(word))) {
          comboMatches.push(`组合:${combo.join('+')}`);
          // 找到一个组合匹配就足够了
          break;
        }
      }
      
      // 合并所有匹配结果
      const allMatches = [...wordMatches, ...patternMatches, ...comboMatches];
      
      return {
        matched: allMatches.length > 0,
        evidence: allMatches.length > 0 ? `金融敏感内容: ${allMatches.join(', ')}` : null
      };
    },
    0.9  // 设置为较高风险级别
  );
  
  // 9. 可疑域名/URL检测 - 检查内容中的链接是否在白名单中
  recognizer.registerPattern('suspicious_domain', 
    (content, features) => {
      // 链接正则表达式 - 匹配http/https链接，尽可能宽松地匹配任何形式的URL
      const urlRegex = /(https?:\/\/[^\s()<>]+(?:\([^\s()<>]+\)|[^\s`!()\[\]{};:'\".,<>?«»""'']))/gi;
      const urls = content.match(urlRegex) || [];
      
      // 如果没有找到URL，直接返回不匹配
      if (urls.length === 0) {
        return {
          matched: false,
          evidence: null
        };
      }
      
      // 获取域名白名单和可疑特征列表
      const whitelist = banwordsData.libraryConfigs.domainConfig?.whitelist || [];
      const blockedDomains = banwordsData.libraryConfigs.domainConfig?.blockedDomains || [];
      const suspiciousPatterns = banwordsData.libraryConfigs.domainConfig?.suspiciousPatterns || [];
      const riskyCombinations = banwordsData.libraryConfigs.domainConfig?.riskyCombinations || [];
      
      // 编译可疑特征正则表达式
      const suspiciousRegexes = suspiciousPatterns.map(pattern => {
        try {
          return new RegExp(pattern.source, pattern.flags || '');
        } catch (err) {
          logger.debug(`无效的域名模式正则表达式: ${pattern.source}`, err);
          return null;
        }
      }).filter(Boolean);
      
      // 检查每个URL
      const suspiciousUrls = [];
      
      for (const url of urls) {
        try {
          // 提取域名 - 简化版本，实际使用时可能需要更复杂的URL解析
          let domain = url.replace(/^https?:\/\//, '').split(/[/?#]/)[0].toLowerCase();
          
          // 检查是否在阻止列表中
          if (blockedDomains.some(blocked => domain.includes(blocked))) {
            suspiciousUrls.push(`禁止域名: ${domain}`);
            continue;
          }
          
          // 检查是否在白名单中
          const inWhitelist = whitelist.some(allowed => {
            return domain === allowed || domain.endsWith('.' + allowed);
          });
          
          // 如果在白名单中，跳过此URL
          if (inWhitelist) {
            continue;
          }
          
          // 如果不在白名单中，检查是否匹配可疑特征
          let isSuspicious = false;
          let evidence = '';
          
          // 检查可疑特征
          for (const regex of suspiciousRegexes) {
            if (regex.test(url)) {
              isSuspicious = true;
              evidence = `可疑URL特征: ${regex.source}`;
              break;
            }
          }
          
          if (isSuspicious) {
            suspiciousUrls.push(`可疑链接: ${url} (${evidence})`);
          } else {
            // 如果URL不在白名单中，也不匹配可疑特征，将其标记为未知域名
            suspiciousUrls.push(`未知域名: ${domain}`);
          }
        } catch (err) {
          logger.debug(`URL解析错误: ${url}`, err);
        }
      }
      
      // 检查内容中是否同时包含URL和特定关键词
      const lowerContent = content.toLowerCase();
      const riskyComboFound = riskyCombinations.some(combo => 
        combo.every(keyword => lowerContent.includes(keyword.toLowerCase()))
      );
      
      if (riskyComboFound && urls.length > 0) {
        suspiciousUrls.push('检测到URL与敏感关键词组合');
      }
      
      return {
        matched: suspiciousUrls.length > 0,
        evidence: suspiciousUrls.length > 0 ? 
          `检测到可疑链接: ${suspiciousUrls.join('; ')}` : null
      };
    },
    1.0  // 设置为最高风险级别，非法链接直接拦截
  );
  
  // 10. 重复敏感词检测 - 检测连续重复的敏感词
  recognizer.registerPattern('repeated_sensitive_words',
    (content, features) => {
      // 获取高优先级敏感词列表
      const sensitiveWords = banwordsData.getWords('highPriorityBanwords') || [];
      
      // 创建敏感词匹配记录
      const matches = [];
      
      // 检测连续重复的相同敏感词
      for (const word of sensitiveWords) {
        // 忽略过短的词（小于2个字符），避免误判
        if (word.length < 2) {
          // 单字敏感词需要特殊处理
          // 构建重复模式正则表达式：检测连续2次以上的重复
          const repeatRegex = new RegExp(`(${word}){2,}`, 'g');
          const repeatMatches = content.match(repeatRegex);
          
          if (repeatMatches && repeatMatches.length > 0) {
            matches.push(`重复敏感词: ${repeatMatches[0]}`);
          }
          continue;
        }
        
        // 检查是否存在敏感词
        if (content.includes(word)) {
          // 构建重复模式正则表达式
          const repeatRegex = new RegExp(`(${word}){2,}`, 'g');
          const repeatMatches = content.match(repeatRegex);
          
          if (repeatMatches && repeatMatches.length > 0) {
            matches.push(`重复敏感词: ${repeatMatches[0]}`);
          }
        }
      }
      
      // 检测带有变种的重复字符（如"滚滚滚"、"狗狗狗"等）
      // 匹配连续3个或更多相同的字符
      const sameCharRegex = /(.)\1{2,}/g;
      const sameCharMatches = content.match(sameCharRegex) || [];
      
      for (const match of sameCharMatches) {
        const char = match[0]; // 获取重复的字符
        
        // 检查这个字符是否在高优先级敏感词列表中
        if (sensitiveWords.includes(char)) {
          matches.push(`重复敏感字符: ${match}`);
        }
      }
      
      return {
        matched: matches.length > 0,
        evidence: matches.length > 0 ? 
          `检测到重复敏感内容: ${matches.join('; ')}` : null
      };
    },
    1.0  // 设置为最高风险级别
  );
  
  // 11. 暴力内容检测 - 识别暴力威胁等有害内容
  recognizer.registerPattern('violent_content',
    (content, features) => {
      // 从banwordsData中获取暴力威胁敏感词
      const violentWords = banwordsData.getWords('violentContent') || [];
      const violentPatterns = banwordsData.getPatterns('violentContent') || [];
      
      // 检查直接包含暴力敏感词
      const wordMatches = [];
      for (const word of violentWords) {
        if (content.includes(word)) {
          wordMatches.push(word);
          // 找到3个就足够了
          if (wordMatches.length >= 3) break;
        }
      }
      
      // 检查正则模式匹配
      const patternMatches = [];
      for (const pattern of violentPatterns) {
        try {
          if (pattern.test(content)) {
            const match = content.match(pattern);
            if (match && match[0]) {
              patternMatches.push(match[0]);
              // 找到1个模式匹配就足够了，因为模式通常更精确
              break;
            }
          }
        } catch (error) {
          logger.debug(`暴力模式匹配错误: ${error.message}`);
        }
      }
      
      // 特殊处理：检测针对特定人名的暴力内容
      // 提取可能的人名（简单识别，2-3个汉字或英文名）
      const nameRegex = /([a-zA-Z]{2,20}|[\u4e00-\u9fa5]{1,5})/g;
      const possibleNames = [...new Set(content.match(nameRegex) || [])]; // 去重
      
      // 检查暴力动词与人名的组合
      const violentVerbs = ['杀', '打', '砍', '捅', '弄死', '杀死', '打死', '砍死', '捅死'];
      const nameViolenceMatches = [];
      
      for (const name of possibleNames) {
        // 过滤掉太短或敏感词列表中的词
        if (name.length < 2 || violentWords.includes(name)) continue;
        
        for (const verb of violentVerbs) {
          // 检查"动词+人名"和"人名+动词"两种模式
          if (content.includes(`${verb}${name}`) || content.includes(`${name}${verb}`)) {
            nameViolenceMatches.push(`针对个人暴力:${verb}+${name}`);
            break;
          }
        }
      }
      
      // 合并所有匹配结果
      const allMatches = [...wordMatches, ...patternMatches, ...nameViolenceMatches];
      
      return {
        matched: allMatches.length > 0,
        evidence: allMatches.length > 0 ? `暴力内容: ${allMatches.join(', ')}` : null
      };
    },
    0.95  // 设置为很高风险级别
  );
  
  return recognizer;
}

// 快速检测敏感词 - 直接复用TextCensor的快速检测能力
async function quickCheck(content) {
  if (!content) return null;
  
  try {
    // 先检查高优先级敏感词
    const highPriorityWords = banwordsData.getWords('highPriorityBanwords');
    for (const word of highPriorityWords) {
      if (content.includes(word)) {
        const category = determineCategory(word);
        return {
          pass: false,
          code: category === 'political' ? REJECT_CODES.POLITICAL : REJECT_CODES.SENSITIVE_WORDS,
          reason: category === 'political' ? '政治敏感内容' : '包含敏感词',
          details: { 
            matches: [word], 
            evidence: `${category === 'political' ? '政治敏感' : '敏感词'}: ${word}` 
          }
        };
      }
      
      // 检查重复敏感词
      if (word.length === 1) {
        // 构建重复模式正则表达式：检测连续2次以上的重复
        const repeatRegex = new RegExp(`(${word}){2,}`, 'g');
        if (repeatRegex.test(content)) {
          return {
            pass: false,
            code: REJECT_CODES.SENSITIVE_WORDS,
            reason: '包含重复敏感词',
            details: {
              matches: [content.match(repeatRegex)[0]],
              evidence: `重复敏感词: ${content.match(repeatRegex)[0]}`
            }
          };
        }
      }
    }
    
    // 检测连续重复字符是否包含敏感字符
    const sameCharRegex = /(.)\1{2,}/g;
    const sameCharMatches = content.match(sameCharRegex) || [];
    
    for (const match of sameCharMatches) {
      const char = match[0]; // 获取重复的字符
      
      // 检查这个字符是否在高优先级敏感词列表中
      if (highPriorityWords.includes(char)) {
        return {
          pass: false,
          code: REJECT_CODES.SENSITIVE_WORDS,
          reason: '包含重复敏感词',
          details: {
            matches: [match],
            evidence: `重复敏感字符: ${match}`
          }
        };
      }
    }
    
    // 检查政治敏感词正则模式
    const politicalRegexPatterns = banwordsData.getPatterns('politicalRegexPatterns') || [];
    for (const pattern of politicalRegexPatterns) {
      try {
        if (pattern.test(content)) {
          return {
            pass: false,
            code: REJECT_CODES.POLITICAL,
            reason: '政治敏感内容',
            details: { 
              matches: ['政治敏感内容'], 
              evidence: `包含政治敏感内容` 
            }
          };
        }
      } catch (err) {
        logger.debug('政治正则匹配出错:', err);
      }
    }
    
    // 检查政治变体词
    const politicalVariants = banwordsData.libraryConfigs.politicalVariants?.words || {};
    for (const [word, variants] of Object.entries(politicalVariants)) {
      if (content.includes(word)) {
        return {
          pass: false,
          code: REJECT_CODES.POLITICAL,
          reason: '政治敏感内容',
          details: { 
            matches: [`政治敏感词: ${word}`],
            evidence: `包含政治敏感词: ${word}` 
          }
        };
      }
      
      for (const variant of variants) {
        if (content.includes(variant)) {
          return {
            pass: false,
            code: REJECT_CODES.POLITICAL,
            reason: '政治敏感内容',
            details: { 
              matches: [`政治敏感词变体: ${variant}`],
              evidence: `包含政治敏感词变体: ${variant} -> ${word}` 
            }
          };
        }
      }
    }
    
    // 使用TextCensor的快速检查
    const quickMatches = textCensor.quickCheckCommonWords(content);
    if (quickMatches.length > 0) {
      // 判断是否政治敏感
      const isPolitical = quickMatches.some(match => 
        match.includes('政治') || match.includes('敏感')
      );
      
      return {
        pass: false,
        code: isPolitical ? REJECT_CODES.POLITICAL : REJECT_CODES.SENSITIVE_WORDS,
        reason: isPolitical ? '政治敏感内容' : '包含敏感词',
        details: { 
          matches: quickMatches, 
          evidence: `包含${isPolitical ? '政治敏感内容' : '敏感词'}: ${quickMatches.join(', ')}` 
        }
      };
    }
    
    // 检查正则表达式匹配 - 使用通用的正则表达式
    const sensitiveRegexPatterns = banwordsData.getPatterns('sensitiveRegexPatterns');
    for (const pattern of sensitiveRegexPatterns) {
      try {
        if (pattern.test(content)) {
          return {
            pass: false,
            code: REJECT_CODES.SENSITIVE_WORDS,
            reason: '包含敏感词',
            details: { 
              matches: [pattern.source.replace(/\\s\*/g, '')],
              evidence: `正则匹配: ${pattern.source.replace(/\\s\*/g, '')}`
            }
          };
        }
      } catch (err) {
        logger.debug('正则匹配出错:', err);
      }
    }
    
    // 检查敏感组合
    const vulgarCombos = banwordsData.libraryConfigs.vulgarCombos?.patterns || [];
    for (const combo of vulgarCombos) {
      if (combo.every(word => content.includes(word))) {
        return {
          pass: false,
          code: REJECT_CODES.SENSITIVE_WORDS,
          reason: '包含敏感词组合',
          details: { 
            matches: [combo.join('+')],
            evidence: `敏感词组合: ${combo.join('+')}`
          }
        };
      }
    }
    
    // 检查非法交易组合
    try {
      const lowerContent = content.toLowerCase();
      
      // 直接从libraryConfigs获取非法交易组合
      const illegalTradePatterns = banwordsData.libraryConfigs.illegalTradePatterns?.patterns || [];
      for (const pattern of illegalTradePatterns) {
        if (pattern.every(word => lowerContent.includes(word.toLowerCase()))) {
          return {
            pass: false,
            code: REJECT_CODES.FRAUD,
            reason: '疑似非法交易内容',
            details: {
              matches: [pattern.join('+')],
              evidence: `非法交易组合: ${pattern.join('+')}`
            }
          };
        }
      }
      
      // 检查武器相关敏感词与交易意图组合
      const weaponKeywords = banwordsData.getWords('weapons');
      // 直接从contact分类获取交易意图词
      const tradeKeywords = banwordsData.getWords('contact') || [];
      
      for (const weapon of weaponKeywords) {
        if (lowerContent.includes(weapon.toLowerCase())) {
          for (const trade of tradeKeywords) {
            if (lowerContent.includes(trade.toLowerCase())) {
              return {
                pass: false,
                code: REJECT_CODES.FRAUD,
                reason: '疑似非法交易内容',
                details: {
                  matches: [`${weapon}+${trade}`],
                  evidence: `非法交易组合: ${weapon}+${trade}`
                }
              };
            }
          }
        }
      }
      
      // 检查异常联系方式
      const contactPatterns = banwordsData.getPatterns('contactMethods') || [];
      for (const pattern of contactPatterns) {
        try {
          if (pattern.test(content)) {
            // 获取所有敏感词配置
            const sensitiveConfigs = {};
            Object.entries(banwordsData.libraryConfigs).forEach(([category, config]) => {
              if (config.keywords && Array.isArray(config.keywords)) {
                sensitiveConfigs[category] = config.keywords;
              }
            });
            
            // 检查是否同时包含敏感关键词
            let matchedCategory = null;
            let hasMatchedKeyword = false;
            
            // 检查每个类别的关键词
            Object.entries(sensitiveConfigs).forEach(([category, keywords]) => {
              if (hasMatchedKeyword) return; // 已找到匹配，不再继续
              
              for (const keyword of keywords) {
                if (lowerContent.includes(keyword.toLowerCase())) {
                  matchedCategory = category;
                  hasMatchedKeyword = true;
                  break;
                }
              }
            });
            
            if (hasMatchedKeyword && matchedCategory) {
              // 提高检测优先级
              return {
                pass: false,
                code: REJECT_CODES.FRAUD,
                reason: '疑似诈骗内容',
                details: {
                  matches: [`异常联系方式+${matchedCategory}敏感词`],
                  evidence: `检测到敏感组合: 联系方式+${matchedCategory}关键词`
                }
              };
            }
          }
        } catch (err) {
          logger.debug(`联系方式模式检测失败: ${err.message}`);
        }
      }
    } catch (err) {
      logger.error('检查非法交易组合失败:', err);
    }
    
    // 快速检查没找到敏感词，返回null继续常规检测
    return null;
  } catch (err) {
    logger.error('快速敏感词检测出错:', err);
    return null;
  }
}

// 辅助函数：判断敏感词类别
function determineCategory(word) {
  // 判断是否是政治敏感词
  const politicalWords = [
    ...banwordsData.getWords('political') || [],
    ...banwordsData.getWords('politicalLegal') || [],
    ...banwordsData.getWords('sensitiveHistory') || [],
    ...banwordsData.getWords('sensitiveRegions') || []
  ];
  
  if (politicalWords.includes(word)) {
    return 'political';
  }
  
  // 检查政治变体
  const politicalVariants = banwordsData.libraryConfigs.politicalVariants?.words || {};
  for (const [_, variants] of Object.entries(politicalVariants)) {
    if (variants.includes(word)) {
      return 'political';
    }
  }
  
  // 检查是否包含政治关键词 - 从配置中获取关键词
  const politicalKeywords = banwordsData.libraryConfigs.politicalKeywords?.words || [];
  if (politicalKeywords.some(key => word.includes(key))) {
    return 'political';
  }
  
  return 'sensitive';
}

/**
 * 调用微信内容安全检测接口
 * @param {string} content 需要检查的内容
 * @param {Object} options 选项
 * @returns {Promise<Object>} 检查结果
 */
async function msgSecCheck(content, options = {}) {
  if (!content || content.trim() === '') {
    logger.debug('内容为空，跳过内容安全检测');
    return { pass: true, message: '内容为空' };
  }
  
  logger.debug(`准备进行内容安全检测，内容长度: ${content.length}`);
  
  try {
    // 1. 本地快速检测
    const quickResult = await quickCheck(content);
    if (quickResult && !quickResult.pass) {
      logger.debug(`本地内容安全检测未通过: ${quickResult.reason}`);
      return quickResult;
    }
    
    // 2. 调用云函数进行微信官方内容安全检测
    try {
      logger.debug('调用微信官方内容安全检测云函数');
      const cloudResult = await wx.cloud.callFunction({
        name: 'msgSecCheck',
        data: {
          content,
          scene: options.scene || 3,  // 默认场景值3
          version: options.version || 2  // 默认版本2
        }
      });
      
      logger.debug(`微信云函数返回结果: ${JSON.stringify(cloudResult)}`);
      
      // 处理云函数返回结果
      if (cloudResult && cloudResult.result) {
        const result = cloudResult.result;
        
        // 检测是否通过
        if (result.message !== 'pass') {
          const detail = result.data?.result || {};
          return {
            pass: false,
            code: REJECT_CODES.WECHAT_REVIEW,
            reason: detail.labelText || '违规内容',
            details: {
              wechatResult: detail,
              evidence: `微信检测: ${detail.labelText || '未知违规'}`
            }
          };
        }
      }
    } catch (cloudError) {
      // 云函数调用错误，记录日志但不阻止继续执行本地检测
      logger.error(`微信内容安全云函数调用失败: ${cloudError.message || cloudError}`);
    }
    
    // 3. 本地全面内容检测
    try {
      const analyzer = new ContentRiskAnalyzer();
      const features = FeatureExtractor.extractFeatures(content);
      
      // 使用TextCensor进行深入检测
      const censorResult = await textCensor.advancedCheck(content, {
        checkPinyin: true,
        checkContext: true
      });
      
      // 如果审查结果包含匹配项，直接将其添加到风险因素中
      if (censorResult.matches && censorResult.matches.length > 0) {
        logger.debug(`文本审查发现敏感内容: ${censorResult.matches.join(', ')}`);
        analyzer.addRiskFactor('text_censor', 0.9, 
          `包含敏感内容: ${censorResult.matches.join(', ')}`);
        
        // 检查是否为高风险敏感词
        for (const match of censorResult.matches) {
          if (match.includes('拼音:') || match.includes('谐音') || match.includes('变体:')) {
            analyzer.addRiskFactor('pinyin_sensitive', 1.0, 
              `包含拼音敏感词: ${match}`);
            break;
          }
        }
      }
      
      // 添加手动检测特殊组合的逻辑 - 从banwords中获取
      const vulgarCombos = banwordsData.libraryConfigs.vulgarCombos?.patterns || [];
      
      // 如果内容包含特定词语组合，增加风险系数
      const sensitiveMatches = [];
      for (const combo of vulgarCombos) {
        if (combo.every(word => content.includes(word))) {
          sensitiveMatches.push(`敏感组合:${combo.join('+')}`);
        }
      }
      
      // 检查是否包含遮挡符号
      const specialChars = banwordsData.libraryConfigs.specialChars?.chars || ['囗'];
      const sensitiveWords = [...banwordsData.getWords('vulgar'), '你', '妈'];
      
      for (const char of specialChars) {
        if (content.includes(char)) {
          for (const word of sensitiveWords) {
            if (content.includes(word)) {
              sensitiveMatches.push(`使用特殊字符遮挡敏感内容:${char}+${word}`);
              break;
            }
          }
        }
      }
      
      if (sensitiveMatches.length > 0) {
        analyzer.addRiskFactor('custom_combo', 0.9, 
          `包含敏感组合: ${sensitiveMatches.join(', ')}`);
      }
      
      // 如果文本审查已经发现敏感内容，可以跳过模式检测
      if (analyzer.getRiskScore() < 0.8) {
        // 检测各类模式 - 使用异步版本
        try {
          // 创建新的模式识别器，不使用单例
          const patternRecognizer = createPatternRecognizer();
          const patternResults = await patternRecognizer.detectPatternsAsync(content, features);
          
          // 添加检测结果到风险分析器
          for (const [name, result] of Object.entries(patternResults)) {
            analyzer.addRiskFactor(name, result.score, result.evidence);
          }
        } catch (err) {
          logger.error('模式检测失败:', err);
        }
      }
          
      // 获取风险报告
      const riskReport = analyzer.getRiskReport();
      logger.debug(`风险评估结果: ${JSON.stringify(riskReport)}`);
      
      // 判断是否通过检测
      if (riskReport.isRisky) {
        // 找出风险因素中得分最高的一个确定拒绝原因
        const highestFactor = riskReport.results
          .sort((a, b) => b.score - a.score)[0];
          
        // 确定拒绝代码和原因
        let rejectCode;
        let rejectReason;
        
        if (highestFactor.factor === 'political_sensitive') {
          rejectCode = REJECT_CODES.POLITICAL;
          rejectReason = '政治敏感内容';
        } else if (['fraud_combo', 'semantic_risk', 'abnormal_contact'].includes(highestFactor.factor)) {
          rejectCode = REJECT_CODES.FRAUD;
          rejectReason = '疑似诈骗内容';
        } else if (highestFactor.factor === 'text_censor') {
          rejectCode = REJECT_CODES.SENSITIVE_WORDS;
          rejectReason = '包含敏感词';
        } else if (highestFactor.factor === 'pinyin_sensitive') {
          rejectCode = REJECT_CODES.SENSITIVE_WORDS;
          rejectReason = '包含谐音敏感词';
        } else if (highestFactor.factor === 'custom_combo') {
          rejectCode = REJECT_CODES.SENSITIVE_WORDS;
          rejectReason = '包含敏感组合';
        } else if (highestFactor.factor === 'common_sensitive') {
          rejectCode = REJECT_CODES.SENSITIVE_WORDS;
          rejectReason = '包含敏感词';
        } else if (highestFactor.factor === 'financial_sensitive') {
          rejectCode = REJECT_CODES.SENSITIVE_WORDS;
          rejectReason = '包含金融敏感内容';
        } else if (highestFactor.factor === 'violent_content') {
          rejectCode = REJECT_CODES.SENSITIVE_WORDS;
          rejectReason = '包含暴力内容';
        } else {
          rejectCode = REJECT_CODES.SENSITIVE_WORDS;
          rejectReason = '包含违规内容';
        }
        
        // 收集所有风险因素的证据作为匹配结果
        const matches = riskReport.results
          .filter(r => r.evidence)
          .map(r => typeof r.evidence === 'string' ? r.evidence : JSON.stringify(r.evidence));
        
        // 为了兼容原checkContent函数的返回格式，附加相关字段
        return {
          pass: false,
          safe: false,
          code: rejectCode,
          reason: rejectReason,
          details: riskReport,
          matches,
          evidence: `高风险内容: ${highestFactor.factor}`,
          riskScore: riskReport.score * 100
        };
      }
      
      // 正常通过
      return { 
        pass: true,
        safe: true,
        matches: [], 
        evidence: '',
        riskScore: 0
      };
    } catch (err) {
      logger.error('内容安全检测出错:', err);
      // 出错时也返回拒绝结果，避免敏感内容因错误而放行
      return { 
        pass: false, 
        safe: false, 
        code: REJECT_CODES.SENSITIVE_WORDS, 
        reason: '内容检测错误', 
        riskScore: 0, 
        details: { errorMessage: err.message || String(err) }
      };
    }
  } catch (err) {
    logger.error('内容安全检测出错:', err);
    // 出错时也返回拒绝结果，避免敏感内容因错误而放行
    return { 
      pass: false, 
      safe: false, 
      code: REJECT_CODES.SENSITIVE_WORDS, 
      reason: '内容检测错误', 
      riskScore: 0, 
      details: { errorMessage: err.message || String(err) }
    };
  }
}

// 初始化敏感词库
function initBanwords() {
  logger.debug('初始化内容安全模块敏感词库');
  return new Promise((resolve, reject) => {
    try {
      // 从存储中加载自定义敏感词
      const customBanwords = storage.get('custom_banwords') || [];
      banwordsData.addCustomBanwords(customBanwords);
      
      // 添加到TextCensor
      textCensor.addWords(customBanwords);
      
      resolve(true);
    } catch (err) {
      logger.error('初始化敏感词库失败:', err);
      reject(err);
    }
  });
}

module.exports = {
  initBanwords,
  msgSecCheck
}; 