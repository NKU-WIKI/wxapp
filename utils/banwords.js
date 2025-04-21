/**
 * 敏感词库数据集中管理
 * 组织方式：分类 > 词库
 */

const logger = require('./logger');

// 敏感词库配置工厂 - 极简版
const BanwordsFactory = {
  // 创建敏感词数据工厂
  createBanwordsData(libraryConfigs) {
    return {
      // 自定义敏感词集合
      customBanwords: [],
      
      // 词库配置
      libraryConfigs,
      
      // 获取分类
      getCategory(name) {
        try {
          if (!this.libraryConfigs[name]) {
            return { words: new Set(), patterns: [] };
          }
          
          const config = this.libraryConfigs[name];
          return {
            name,
            words: new Set(config.words || []),
            patterns: (config.patterns || []).map(p => 
              p instanceof RegExp ? p : new RegExp(p.source, p.flags)),
            metadata: config.metadata || {}
          };
        } catch (err) {
          logger.debug(`获取分类[${name}]失败:`, err);
          return { words: new Set(), patterns: [] };
        }
      },
      
      // 获取指定分类的词汇
      getWords(category) {
        try {
          return [...this.getCategory(category).words];
        } catch (err) {
          logger.debug(`获取分类[${category}]词汇失败:`, err);
          return [];
        }
      },
      
      // 获取指定分类的模式
      getPatterns(category) {
        try {
          return this.getCategory(category).patterns;
        } catch (err) {
          logger.debug(`获取分类[${category}]模式失败:`, err);
          return [];
        }
      },
      
      // 添加自定义敏感词
      addCustomBanwords(words) {
        if (Array.isArray(words)) {
          this.customBanwords = [...this.customBanwords, ...words];
          logger.debug(`添加${words.length}个自定义敏感词`);
        }
      },
      
      // 获取所有敏感词
      getAllBanwords() {
        return {
          library: this.libraryConfigs,
          custom: this.customBanwords
        };
      }
    };
  }
};

// 完整词库配置
const LIBRARY_CONFIGS = {
  // 政治类
  political: {
    words: [
      '习近平', '李克强', '胡锦涛', '温家宝', '江泽民', 
      '毛泽东', '邓小平', '习大大', '总书记', '国家领导人',
      '中共', '共产党', '党中央', '中央政府', '中南海',
      '政治局', '常委', '人大', '政协', '国务院',
      '中央委员会', '中纪委', '军委', '国防部', '外交部',
      '最高法院', '最高检察院', '宪法', '法律法规', '政府工作报告',
      '人民代表', '两会', '全国人大', '全国政协', '政治体制',
      '政府机构', '党政机关', '中央领导', '国家主席', '总理',
      '副主席', '党组织', '组织部', '宣传部', '统战部',
      '领导集体', '集体领导', '三个代表', '科学发展观', '政治路线',
      '十九大', '二十大', '国家安全', '政治安全', '意识形态',
      '中央精神', '政治正确', '路线斗争', '政治斗争',
      '游行', '示威', '集会', '抗议', '革命', '政治运动',
      '市委书记', '书记', '市长', '省长', '委书记', '区长', '县长',
      '政府领导', '省委书记', '县委书记', '区委书记', '书记处', '李强',
      '蔡奇', '丁薛祥', '赵乐际', '王沪宁', '韩正',

      // 新增政治局常委
      '李希', '何立峰', '张国清', '刘国中', '王小洪', 
      '吴政隆', '谌贻琴', '秦刚', '陈吉宁', '黄坤明',
      
      // 新增国务院领导
      '刘金国', '王东明', '肖捷', '郑栅洁', '金壮龙',
      '怀进鹏', '王文涛', '应勇', '胡和平', '唐登杰',
      
      // 新增军委委员
      '苗华', '张升民', '李尚福', '刘振立', '徐起零',

      // 新增近五年重要政治人物（2020-2024）
      '李鸿忠', '王晨', '许其亮', '杨洁篪', '杨晓渡',
      '陈希', '郭声琨', '黄坤明', '尤权', '沈跃跃',
      '吉炳轩', '艾力更·依明巴海', '陈竺', '王东明',
      '白玛赤林', '丁仲礼', '郝明金', '蔡达峰', '武维华',
      
      // 新增省级行政区主官
      '尹力', '陈吉宁', '李干杰', '许勤', '易炼红',
      '郑栅洁', '王浩', '周祖翼', '信长星', '梁言顺',
      
      // 新增军委委员
      '李尚福', '刘振立', '苗华', '张升民'
    ],
    patterns: [
      { source: '习\\s*近\\s*平', flags: 'i' },
      { source: '李\\s*克\\s*强', flags: 'i' },
      { source: '毛\\s*泽\\s*东', flags: 'i' },
      { source: '中\\s*共', flags: 'i' },
      { source: '共\\s*产\\s*党', flags: 'i' },
      { source: '政\\s*治\\s*局', flags: 'i' },
      { source: '常\\s*委', flags: 'i' },
      { source: '总\\s*书\\s*记', flags: 'i' },
      { source: '国\\s*家\\s*主\\s*席', flags: 'i' },
      { source: '中\\s*央\\s*政\\s*府', flags: 'i' },
      { source: '市\\s*委\\s*书\\s*记', flags: 'i' },
      { source: '省\\s*委\\s*书\\s*记', flags: 'i' },
      { source: '县\\s*委\\s*书\\s*记', flags: 'i' },
      { source: '区\\s*委\\s*书\\s*记', flags: 'i' },
      { source: '李\\s*强', flags: 'i' },
      { source: '蔡\\s*奇', flags: 'i' },
      { source: '丁\\s*薛\\s*祥', flags: 'i' },
      { source: '赵\\s*乐\\s*际', flags: 'i' },
      { source: '王\\s*沪\\s*宁', flags: 'i' },
      { source: '何\\s*立\\s*峰', flags: 'i' },
      { source: '张\\s*国\\s*清', flags: 'i' },
      { source: '刘\\s*国\\s*中', flags: 'i' },
      { source: '王\\s*小\\s*洪', flags: 'i' },
      { source: '谌\\s*贻\\s*琴', flags: 'i' },
      { source: '李\\s*尚\\s*福', flags: 'i' },
      { source: '刘\\s*振\\s*立', flags: 'i' },
      { source: '苗\\s*华', flags: 'i' },
      { source: '张\\s*升\\s*民', flags: 'i' },
      { source: '尹\\s*力', flags: 'i' },
      { source: '陈\\s*吉\\s*宁', flags: 'i' }
    ],
    metadata: {
      riskLevel: 10,
      comboCheck: true  // 需要组合检测
    }
  },
  
  // 特殊符号
  specialSymbols: {
    words: {
      '⚣': '同性恋', '⚤': '同性恋', '⚥': '性相关',
      '♂': '男性', '♀': '女性', '※': '重点标记'
    },
    metadata: {
      autoReplace: true
    }
  },
  
  // 特殊的遮挡字符
  specialChars: {
    chars: ['囗', '口', '⃤', '⃠', '⃝', '□', '■', '○', '●', '△', '▲', '▼', '▽', '◆', '◇'],
    metadata: {
      description: '常用于遮挡敏感词的特殊字符'
    }
  },
  
  // 敏感词组合检测
  vulgarCombos: {
    patterns: [
      ['你', '死'],
      ['死', '你'],
      ['你', '妈'],
      ['妈', '死'],
      ['你', '全家'],
      ['你家', '剩一人'],
      ['你', '妈', '了'],
      ['小', '死', '你'],
      ['你', '死', '家']
    ],
    metadata: {
      description: '常见侮辱性词组组合'
    }
  },
  
  // 诈骗类
  fraud: {
    words: [
      '中奖', '转账', '刷单', '兼职', '佣金',
      '保证金', '手续费', '押金', '提现费'
    ],
    patterns: [
      { source: 'v[\\s\\d]{1,}', flags: 'i' },
      { source: '[vV微]我\\d+', flags: 'i' },
      { source: '代考|替考', flags: 'i' },
      { source: '联系方式', flags: 'i' },
      { source: '加微信', flags: 'i' },
      { source: '私聊', flags: 'i' },
      { source: '秦始皇', flags: 'i' },
      { source: '我是.*[，,].*v我', flags: 'i' }
    ]
  },
  
  // 白名单词库
  whitelist: {
    words: [
      '世界和平', '和平', '物理', '化学', '数学',
      '文学', '历史', '科学', '技术', '创新',
      '发展', '进步', '教育', '知识', '研究'
    ],
    metadata: { isPositive: true }
  },

  // 金融敏感词库 - 股票交易相关
  financialSensitive: {
    words: [
      '股票', '股市', '股价', '股份', '牛市', '熊市', 
      '涨停', '跌停', '大盘', '指数', '基金', '证券',
      '炒股', '交易', '买入', '卖出', '投资', '融资',
      '操盘', '庄家', '短线', '长线', '波段', '抄底',
      '低吸', '高抛', '解套', '止损', '止盈', '杠杆',
      '配资', '市值', '利润', '资产', '分红', '回购',
      '年报', '季报', '月报', '周报', '日报', '财报',
      '推荐股', '荐股', '牛股', '黑马', '龙头股', '涨幅',
      '跌幅', '盘面', '盘口', '板块', '行情', '走势',
      '趋势', '形态', '个股', '破发', '破净', '破位'
    ],
    patterns: [
      { source: '推荐.*股票', flags: 'i' },
      { source: '股票.*推荐', flags: 'i' },
      { source: '买.*股票', flags: 'i' },
      { source: '股票.*买', flags: 'i' },
      { source: '卖.*股票', flags: 'i' },
      { source: '股票.*卖', flags: 'i' },
      { source: '炒.*股', flags: 'i' },
      { source: '推荐.*基金', flags: 'i' },
      { source: '基金.*推荐', flags: 'i' },
      { source: '荐.*股', flags: 'i' },
      { source: '赚钱.*方法', flags: 'i' },
      { source: '投资.*收益', flags: 'i' },
      { source: '收益.*投资', flags: 'i' },
      { source: '盈利.*方法', flags: 'i' },
      { source: '方法.*盈利', flags: 'i' }
    ],
    metadata: {
      description: '金融敏感词库，用于检测股票、基金等金融推荐和交易内容',
      riskLevel: 8,
      category: '金融敏感'
    }
  },

  // 暴力威胁敏感词库 - 检测暴力、威胁等有害内容
  violentContent: {
    words: [
      // 暴力行为
      '杀死', '杀害', '谋杀', '杀人', '自杀', '杀掉', '捅死', '打死', '弄死',
      '砍死', '勒死', '毒死', '踩死', '压死', '淹死', '绞死', '枪毙', '处死',
      '绞刑', '枪决', '斩首', '斩杀', '枪杀', '炸死', '焚烧', '火烧', '烧死',
      '溺死', '吊死', '上吊', '投毒', '下毒', '毒害', '暗杀', '抹杀', '屠杀',
      '虐杀', '残杀', '处决', '灭口', '灭掉', '消灭', '肢解', '分尸', '剁碎', 
      
      // 暴力手段
      '打爆', '暴打', '痛打', '狂殴', '殴打', '抽打', '拳打', '脚踢', '踹飞',
      '砍伤', '刺伤', '捅伤', '割喉', '砍头', '断头', '砍断', '刺穿', '捅穿',
      '打烂', '打残', '打断', '打晕', '打趴', '打废', '打瘫', '废掉', '砸烂',
      '撕碎', '扭断', '折断', '挑断', '撕裂', '碾压', '踩扁', '踩爆', '踩烂',
      
      // 暴力武器
      '砍刀', '菜刀', '剑', '长剑', '大刀', '匕首', '尖刀', '刀片', '斧头',
      '斧子', '铁棍', '钢管', '铁棒', '棍棒', '棒球棍', '铁锤', '锤子', '榔头',
      '扳手', '螺丝刀', '剪刀', '枪', '火器', '炸弹', '弹药', '子弹', '手榴弹',
      
      // 威胁描述
      '我要你死', '让你死', '你会死', '弄死你', '杀了你', '打死你', '踹死你',
      '废了你', '打残你', '砍了你', '剁了你', '打爆你', '弄残你', '打你',
      '往死里打', '打到你', '打到死', '打到残', '砍到死', '砍断你', '砍你',
      '捅你', '捅死你', '杀你', '让你生不如死', '打到你生不如死', '弄到你生不如死',
      
      // 仇恨表达
      '恨死你', '恨不得杀了你', '恨不得你死', '我恨你', '恨你全家', '恨不得你',
      '恨不得把你', '让你后悔', '让你血流成河', '血债血偿', '血债需要血来还',
      '不得好死', '不得安宁', '不得善终', '不得好过', '不得安生'
    ],
    patterns: [
      // 暴力行为模式
      { source: '(杀|弄|打|砍|捅|踹|剁|废|毒|烧|打爆)[了]?你', flags: 'i' },
      { source: '(我|要)(杀|弄|打|砍|捅|踹|剁|废|毒|烧)死[了]?你', flags: 'i' },
      { source: '(我|要)(把|将)你(杀|弄|打|砍|捅|踹|剁|废|毒|烧)死', flags: 'i' },
      { source: '(我|要)(把|将)你(弄|打|砍)(成|到)(残废|重伤|死|半死)', flags: 'i' },
      { source: '我.{0,5}(一|用).{0,5}(刀|剑|斧|枪|棍|棒).{0,5}(砍|劈|捅|戳|刺|打)死.{0,5}你', flags: 'i' },
      { source: '我.{0,5}(一|用).{0,5}(刀|剑|斧|枪|棍|棒).{0,5}(砍|劈|捅|戳|刺|打).{0,5}你', flags: 'i' },
      { source: '我.{0,5}(杀|弄|打|踢|砍|捅|踹|剁|废|毒|烧)(掉|了|死).{0,5}(你|他|她)', flags: 'i' },
      { source: '我.*?(砍|杀|捅|弄|打|踢|射)死.*?你', flags: 'i' },
      
      // 针对特定个人的暴力威胁
      { source: '[一我][剑刀枪].{0,5}(捅|砍|杀|打).{0,5}死.{0,5}[a-zA-Z\\u4e00-\\u9fa5]{1,10}', flags: 'i' },
      { source: '(弄|打|砍|踢|踹|杀|捅)死.{0,5}[a-zA-Z\\u4e00-\\u9fa5]{1,10}', flags: 'i' },
      { source: '[a-zA-Z\\u4e00-\\u9fa5]{1,10}.{0,5}(弄|打|砍|踢|踹|杀|捅)死', flags: 'i' }
    ],
    metadata: {
      description: '暴力威胁敏感词库，用于检测暴力、威胁、仇恨等有害内容',
      riskLevel: 9,
      category: '暴力威胁'
    }
  },

  // 领域豁免词
  domainSafe: {
    words: [
      '实验', '数据', '分析', '理论', '方法'
    ]
  },

  // 相似音规则
  similarSounds: {
    words: {
      // 增强谐音变体映射
      '傻': ['沙','煞','啥','厦','杀','纱','傻','撒','萨','仨','莎','砂','鲨','痧'],
      '逼': ['比','币','b','bi','笔','闭','壁','碧','哔','逼','屄','毕','庇','蔽','痹','蓖'],
      '操': ['草','艹','cao','日','曹','槽','嘈','操','糙'],
      '妈': ['马','ma','吗','嘛','麻','骂','妈','码','蚂','玛','螨'],
      '的': ['地', '得', '德', 'de', 'di', 'dei'],
      '死': ['4','si','is','思','斯','司','丝','撕','私','嘶','死','四'],
      '你': ['ni','尼','泥','拟','逆','妮','昵','腻','鲵','倪','祢'],
      '我': ['wo','沃','握','卧','窝','蜗','涡','倭','挝','喔'],
      
      // 添加更多常见谐音
      '日': ['入','ri','r'],
      '贱': ['践','溅','键','箭','剑','jiàn'],
      '婊': ['表','标','镖','膘','裱','飙','飚','彪','biao'],
      '屎': ['shi','是','事','市','式','示','仕','柿','适','侍'],
      '滚': ['棍','gun','滚','磙','辊','衮'],
      '蠢': ['chun','春','纯','唇','醇','淳','椿'],
      '智': ['zhi','之','只','支','止','旨','志','至','纸','址'],
      '障': ['zhang','章','樟','彰','璋','漳','獐','蟑'],
      '瓜': ['gua','刮','挂','卦','褂','呱'],
      '废': ['fei','飞','非','肥','菲','啡','沸','肺','匪'],
      '猪': ['zhu','主','珠','株','诸','猪','铢','竹','竺'],
      '狗': ['gou','够','沟','勾','苟','钩','垢','媾','枸'],
    }
  },

  // 首字母缩写敏感词
  abbreviations: {
    words: {
      'sb': '傻逼',
      'nmsl': '你妈死了',
      'cnm': '操你妈',
      'wcnm': '我操你妈',
      'wsnd': '我是你爹',
      'wqnmd': '我去你妈的',
      'sb': '傻逼',
      'nc': '脑残',
      'nt': '脑瘫',
      'mlgb': '妈了个逼',
      'rnm': '日你妈',
      'cao': '操',
      'woc': '我操',
      'wtf': '他妈的',
      'stfw': '善体风味',
      'ghs': '搞黄色',
      'djb': '大几把',
      'mdzz': '妈的智障',
      'nmb': '你妈逼',
      'gkd': '搞快点',
      'tmd': '他妈的',
      'zz': '智障',
      'yygq': '阴阳怪气',
      'bjdw': '不解释多问',
      'sjb': '神经病'
    },
    metadata: {
      description: '常见首字母缩写敏感词',
      riskLevel: 9
    }
  },

  // 诈骗组合规则
  fraudCombos: {
    rules: [
      ['我是', 'v我'],
      ['我是', 'v'],
      ['中奖', '联系'],
      ['客服', '微信'],
      ['秦始皇', '50'],
      ['v我', '50'],
      ['v', '50'],
      ['v我', '钱'],
      ['加我', '联系'],
      ['发红包', '加我'],
      ['联系', '微信'],
      ['私聊', '价格'],
      ['免费', '领取'],
      ['加我', '微信'],
      ['私聊', '微信'],
      ['私聊', '联系'],
      ['私发', '联系方式'],
      ['告诉', '联系方式'],
      ['一手', '资源'],
      ['低价', '资源'],
      ['考试', '答案'],
      ['答案', '联系'],
      ['作弊', '联系'],
      ['考证', '包过'],
      ['包过', '联系'],
      ['办理', '证件'],
      ['证件', '办理'],
      ['假证', '办理'],
      ['办证', '联系'],
      ['高薪', '兼职'],
      ['兼职', '招聘'],
      ['招聘', '日结'],
      ['网络', '兼职'],
      ['轻松', '赚钱'],
      ['赚钱', '方法'],
      ['武器', '私聊'], 
      ['枪', '私聊'], 
      ['AK', '私聊'],
      ['地狱火', '私聊'],
      ['自用', '99新'], 
      ['出土', 'AK'], 
      ['兵马俑', 'AK'], 
      ['出土', '武器'],
      ['扣1', '送'], 
      ['我想要', '私聊'], 
      ['感兴趣', '私聊'],
      ['点', '私聊'],
      ['联系', '私聊'],
      ['高考', '真题'],
      ['出', '真题'],
      ['泄露', '真题'],
      ['内部', '真题'],
      ['真题', '➕v'],
      ['高考', '➕v'],
      ['内部人员', '泄露'],
      ['2025', '高考'],
      ['未来', '真题'],
      ['一手', '真题'],
      // 金融诈骗组合
      ['股票', '推荐'],
      ['推荐', '股票'],
      ['买', '股票'],
      ['荐', '股'],
      ['股票', '内幕'],
      ['内幕', '消息'],
      ['股市', '赚钱'],
      ['赚钱', '股市'],
      ['股票', '牛市'],
      ['牛市', '行情'],
      ['基金', '推荐'],
      ['推荐', '基金'],
      ['投资', '理财'],
      ['理财', '产品'],
      ['高', '收益'],
      ['收益', '保障'],
      ['稳赚', '不赔'],
      ['稳定', '收益'],
      ['股票', '稳赚'],
      ['财富', '增长'],
      ['收益', '倍增']
    ]
  },

  // 政治组合模式
  politicalCombos: {
    patterns: [
      { source: '习近平.*李克强', flags: 'i' },
      { source: '习近平.*胡锦涛', flags: 'i' },
      { source: '习近平.*江泽民', flags: 'i' },
      { source: '李克强.*习近平', flags: 'i' },
      { source: '胡锦涛.*习近平', flags: 'i' },
      { source: '江泽民.*习近平', flags: 'i' },
      { source: '毛泽东.*习近平', flags: 'i' },
      { source: '习近平.*毛泽东', flags: 'i' },
      { source: '中共.*习近平', flags: 'i' },
      { source: '习近平.*中共', flags: 'i' },
      { source: '政治.*改革', flags: 'i' },
      { source: '体制.*改革', flags: 'i' },
      { source: '言论.*自由', flags: 'i' },
      { source: '新闻.*自由', flags: 'i' },
      { source: '民主.*选举', flags: 'i' },
      { source: '人权.*保障', flags: 'i' },
      { source: '司法.*独立', flags: 'i' },
      { source: '台湾.*独立', flags: 'i' },
      { source: '香港.*独立', flags: 'i' },
      { source: '西藏.*独立', flags: 'i' },
      { source: '新疆.*独立', flags: 'i' },
      { source: '文革.*复辟', flags: 'i' },
      { source: '六四.*真相', flags: 'i' },
      { source: '天安门.*事件', flags: 'i' }
    ]
  },
  
  // 政治拼音模式
  politicalPinyinPatterns: {
    patterns: [
      { source: 'zhengzhi', flags: 'i' },
      { source: 'minzhu', flags: 'i' },
      { source: 'ziyou', flags: 'i' },
      { source: 'renquan', flags: 'i' },
      { source: 'xianzheng', flags: 'i' },
      { source: 'gonggongdang', flags: 'i' },
      { source: 'gongchandang', flags: 'i' },
      { source: 'zhonggong', flags: 'i' },
      { source: 'xijinping', flags: 'i' },
      { source: 'maozedong', flags: 'i' },
      { source: 'dengxiaoping', flags: 'i' },
      { source: 'likeqiang', flags: 'i' },
      { source: 'hujintao', flags: 'i' },
      { source: 'jiangzemin', flags: 'i' },
      { source: 'wenjiabao', flags: 'i' },
      { source: 'fangeming', flags: 'i' },
      { source: 'liusi', flags: 'i' },
      { source: 'bajiu', flags: 'i' },
      { source: 'taiwan(duli|du)', flags: 'i' },
      { source: 'xizang(duli|du)', flags: 'i' },
      { source: 'xinjiang(duli|du)', flags: 'i' },
      { source: 'xianggang(duli|du)', flags: 'i' }
    ]
  },
  
  // 脏话和侮辱词库
  vulgar: {
    words: [
      '傻逼', '傻叉', '傻屌', '傻×', '傻B', '煞笔', '沙比', '沙雕', '傻吊',
      '操你', '草你', '艹你', '日你', '尼玛', '泥马', '妈的', '玛的', 'TM',
      '他妈', '他吗', '她妈', '它妈', '特么', '你妈', '你妈的', '你玛德', '你马德', '狗屎', '狗日', 
      '滚蛋', '滚你', '我操', '我草', '卧槽', '握草', '五毛', '鸡巴', '屌丝',
      '屁眼', '混蛋', '王八蛋', '垃圾', '婊子', '贱人', '人渣', '禽兽', '牛逼',
      '牛B', '装逼', '装B', '逗比', '逗逼', '闭嘴', '龟儿子', '去死'
    ],
    patterns: [
      { source: '[\\u4e00-\\u9fa5]*[傻煞沙啥厦纱杀]*[\\u4e00-\\u9fa5]*[逼笔比屄壁b吊碧标彪憋瘪鳖蹩]*[\\u4e00-\\u9fa5]*', flags: 'i' },
      { source: '[傻煞沙啥厦纱杀]\\s*[逼笔比屄壁b吊碧标彪憋瘪鳖蹩]', flags: 'i' },
      { source: 'sha\\s*bi', flags: 'i' },
      { source: 'shabi', flags: 'i' },
      { source: 'sb', flags: 'i' },
      
      { source: '[\\u4e00-\\u9fa5]*[操草艹槽曹]*[\\u4e00-\\u9fa5]*[你妳]*[\\u4e00-\\u9fa5]*[妈马吗麻玛]*[\\u4e00-\\u9fa5]*', flags: 'i' },
      { source: '[操草艹槽曹]\\s*[你妳]', flags: 'i' },
      { source: '[你妳]\\s*[妈马吗麻玛]', flags: 'i' },
      { source: '[他她它]\\s*[妈马吗玛]', flags: 'i' },
      { source: '[日入扌]\\s*[你妳]', flags: 'i' },
      
      { source: 'fuck', flags: 'i' },
      { source: 'shit', flags: 'i' },
      { source: 'bitch', flags: 'i' },
      { source: 'dick', flags: 'i' },
      { source: 'stupid', flags: 'i' },
      { source: 'cnm', flags: 'i' },
      { source: 'nmsl', flags: 'i' },
      { source: 'wtf', flags: 'i' }
    ],
    metadata: {
      riskLevel: 8,
      category: '不文明用语'
    }
  },
  
  // 歧视性词汇
  discrimination: {
    words: [
      '残废', '瘸子', '瞎子', '聋子', '哑巴', '弱智', '智障', '白痴',
      '低能儿', '精神病', '神经病', '脑残', '脑瘫', '智力障碍',
      '黑鬼', '黑鬼佬', '黑鬼子', '黑猩猩', '黑人猿', '黑鬼猿', '黑奴',
      '鬼佬', '洋鬼子', '番鬼子', '老外', '外国佬',
      '小日本', '日本鬼子', '日本狗', '日本猪', '日本猴子',
      '棒子', '韩国狗', '高丽棒子', '死韩国佬',
      '蒙古症', '蒙古人', '蒙古佬', '蒙古野人',
      '俄罗斯猪', '毛子', '俄国佬', '俄罗斯佬',
      '台巴子', '台湾猪', '台湾狗', '台湾猴', '湾湾',
      '支那', '支那猪', '支那人', '支那狗', '支那猴'
    ],
    patterns: [
      { source: '残废|瘸子|瞎子|聋子|哑巴|弱智|智障|白痴|脑残|脑瘫', flags: 'i' },
      { source: '黑\\s*鬼', flags: 'i' },
      { source: '鬼\\s*子', flags: 'i' },
      { source: '鬼\\s*佬', flags: 'i' },
      { source: '小\\s*日\\s*本', flags: 'i' },
      { source: '棒\\s*子', flags: 'i' },
      { source: '台\\s*巴\\s*子', flags: 'i' },
      { source: '支\\s*那', flags: 'i' }
    ],
    metadata: {
      riskLevel: 9,
      category: '歧视性言论'
    }
  },

  // 色情词库
  pornography: {
    words: [
      '性交', '口交', '肛交', '乳交', '足交', '手淫', '自慰', '射精', '做爱',
      '打飞机', '潮吹', '吹箫', '口爆', '颜射', '肛门', '阴道', '阴茎', '阴蒂',
      '嫖娼', '卖淫', '妓女', '妓院', '按摩院', '全套', '半套', '一夜情', '包夜',
      '约炮', '啪啪啪', '爱爱', '叫床', '偷情', '出轨', '色情', '黄色', 'JJ',
      '打炮', '性虐', 'SM', '捆绑', '强奸', '迷奸', '轮奸', '诱奸', '调教',
      '淫荡', '淫乱', '淫水', '情色', 'AV', '黄片', '爱液', 'H漫', '成人漫画'
    ],
    patterns: [
      { source: '性\\s*交', flags: 'i' },
      { source: '口\\s*交', flags: 'i' },
      { source: '肛\\s*交', flags: 'i' },
      { source: '乳\\s*交', flags: 'i' },
      { source: '足\\s*交', flags: 'i' },
      { source: '手\\s*淫', flags: 'i' },
      { source: '自\\s*慰', flags: 'i' },
      { source: '射\\s*精', flags: 'i' },
      { source: '做\\s*爱', flags: 'i' },
      { source: '约\\s*炮', flags: 'i' },
      { source: '啪\\s*啪\\s*啪', flags: 'i' },
      { source: '色\\s*情', flags: 'i' },
      { source: '黄\\s*色', flags: 'i' },
      { source: '强\\s*奸', flags: 'i' },
      { source: '迷\\s*奸', flags: 'i' },
      { source: '轮\\s*奸', flags: 'i' },
      { source: '诱\\s*奸', flags: 'i' }
    ],
    metadata: {
      riskLevel: 8,
      category: '色情内容'
    }
  },
  
  // 脏话拼音模式
  vulgarPinyinPatterns: {
    patterns: [
      // 通用拼音匹配模式，不针对特定词汇
      { source: '[s5$\\*]+[h\\*]*[a@4]+[\\s\\*\\-\\_\\.]*[b8\\*]+[i1!|\\*]+', flags: 'i' },
      { source: 's[\\W\\d]*h[\\W\\d]*a[\\W\\d]*b[\\W\\d]*i', flags: 'i' },
      { source: '[s5$\\*]+[h\\*]*[a@4\\*]+[\\W\\d]*[b8\\*]+[i1!|\\*]+', flags: 'i' },
      { source: 'sh[a@4]+[^a-zA-Z0-9]*b[i1!|]+', flags: 'i' },
      
      // 通用模式匹配"c"打头的脏话
      { source: 'c[a@4o0\\*]+[\\W\\d]*n[i1!|\\*]+[\\W\\d]*m[a@4\\*]+', flags: 'i' },
      
      // 通用模式匹配"n"打头的脏话
      { source: 'n[i1!|\\*]+[\\W\\d]*m[a@4\\*]+[\\W\\d]*s[i1!|\\*]', flags: 'i' },
      { source: 'n[i1!|\\*]+[\\W\\d]*m[a@4\\*]+[\\W\\d]*d[e\\*]*', flags: 'i' },
      { source: 'nmd', flags: 'i' },
      { source: 'nimade', flags: 'i' },
      { source: 'ni[\\s\\*\\-\\_\\.]*ma[\\s\\*\\-\\_\\.]*de', flags: 'i' },
      { source: 'ni[\\s\\*\\-\\_\\.]*[m]+a[\\s\\*\\-\\_\\.]*de', flags: 'i' },
      
      // 其他更通用的脏话模式
      { source: 'r[i1!|\\*]+[\\W\\d]*n[i1!|\\*]+', flags: 'i' },
      { source: 'g[o0\\*]+[\\W\\d]*u[\\W\\d]*s[\\W\\d]*h[\\W\\d]*i', flags: 'i' },
      
      // 保留原有模式但改进正则表达式
      { source: 'sh[a@4]+[\\s\\*\\-\\_\\.]*b', flags: 'i' },
      { source: 's[\\s\\*\\-\\_\\.]*b[i1!|]*', flags: 'i' },
      { source: 'sh[a@4]+[\\s\\*\\-\\_\\.]*[bp][i1!|]*', flags: 'i' },
      { source: 'sh[a@4]+(bi|b|pi)', flags: 'i' },
      { source: 'shabi', flags: 'i' },
      { source: 'shabiao', flags: 'i' },
      { source: 'sb', flags: 'i' },
      { source: '5[\\s\\*\\-\\_\\.]*b', flags: 'i' },
      { source: 's[\\s\\*\\-\\_\\.]*8', flags: 'i' },
      { source: 'sh[a@4]+[\\s\\*\\-\\_\\.]*b[i1!|]+', flags: 'i' },
      { source: 'c[a@4o0]+[\\s\\*\\-\\_\\.]*n[i1!|]+[\\s\\*\\-\\_\\.]*m[a@4]+', flags: 'i' },
      { source: 'cao[\\s\\*\\-\\_\\.]*ni[\\s\\*\\-\\_\\.]*ma', flags: 'i' },
      { source: 'caoni(ma)?', flags: 'i' },
      { source: 'cn(nm|m)', flags: 'i' },
      { source: 'nm(s|sl)', flags: 'i' },
      { source: 'nima', flags: 'i' },
      { source: 'tama', flags: 'i' },
      { source: 'ni[\\s\\*\\-\\_\\.]*de[\\s\\*\\-\\_\\.]*ma', flags: 'i' },
      { source: 'biaozi', flags: 'i' },
      { source: 'jiba', flags: 'i' },
      { source: 'gou(shi|ri)', flags: 'i' },
      { source: 'niubi', flags: 'i' },
      { source: 'doubi', flags: 'i' },
      { source: 'shaojian', flags: 'i' },
      { source: 'shenjingbing', flags: 'i' },
      { source: 'baichi', flags: 'i' },
      { source: 'wocao', flags: 'i' },
      { source: 'cao(ni|ta|le)', flags: 'i' },
      { source: 'ri(ni|ta)', flags: 'i' },
      { source: 'gun(dan|ni)', flags: 'i' },
      { source: 'qunima', flags: 'i' },
      { source: 'nmlgb', flags: 'i' },
      { source: 'madesb', flags: 'i' },
      { source: 'si(ni|ta)', flags: 'i' },
      { source: 'ni[s\\$]i', flags: 'i' }
    ]
  },
  
  // 歧视拼音模式
  discriminationPinyinPatterns: {
    patterns: [
      { source: 'canfei', flags: 'i' },
      { source: 'ruozhi', flags: 'i' },
      { source: 'zhizhang', flags: 'i' },
      { source: 'heigui', flags: 'i' },
      { source: 'xiazi', flags: 'i' },
      { source: 'longzi', flags: 'i' },
      { source: 'yaba', flags: 'i' },
      { source: 'guizi', flags: 'i' },
      { source: 'xiaoribeng?', flags: 'i' },
      { source: 'ribengui', flags: 'i' },
      { source: 'bangzi', flags: 'i' },
      { source: 'taiwanzhu', flags: 'i' },
      { source: 'zhina', flags: 'i' }
    ]
  },
  
  // 色情拼音模式
  pornographyPinyinPatterns: {
    patterns: [
      { source: 'xing(jiao|ai|gong|fu)', flags: 'i' },
      { source: 'koujiao', flags: 'i' },
      { source: 'analv?jiao', flags: 'i' },
      { source: 'renjiao', flags: 'i' },
      { source: 'zijiao', flags: 'i' },
      { source: 'shejing', flags: 'i' },
      { source: 'zigong', flags: 'i' },
      { source: 'shouyin', flags: 'i' },
      { source: 'ziwei', flags: 'i' },
      { source: 'jipin', flags: 'i' },
      { source: 'heima', flags: 'i' },
      { source: 'sao(hui|qi)', flags: 'i' },
      { source: 'yindao', flags: 'i' },
      { source: 'yinjing', flags: 'i' },
      { source: 'maiyin', flags: 'i' },
      { source: 'yuepao', flags: 'i' },
      { source: 'yapapa', flags: 'i' },
      { source: 'seqing', flags: 'i' },
      { source: 'chengren', flags: 'i' },
      { source: 'qiangjian', flags: 'i' },
      { source: 'luanjian', flags: 'i' }
    ]
  },
  
  // 拼音变种匹配器
  pinyinVariants: {
    patterns: {
      'a': ['@', '4', 'ā', 'á', 'ǎ', 'à', 'α', 'A'],
      'b': ['8', '6', 'ḃ', 'ḅ', 'ḇ', 'ƀ', 'B'],
      'c': ['<', '(', 'ç', 'ć', 'č', 'ĉ', 'C'],
      'd': ['D'],
      'e': ['3', '€', 'ē', 'é', 'ě', 'è', 'E'],
      'f': ['ƒ', 'F'],
      'g': ['G'],
      'h': ['H'],
      'i': ['1', '!', 'ī', 'í', 'ǐ', 'ì', 'I', '|'],
      'j': ['J'],
      'k': ['K'],
      'l': ['1', '|', 'L'],
      'm': ['M'],
      'n': ['N'],
      'o': ['0', '°', 'ō', 'ó', 'ŏ', 'ò', 'O'],
      'p': ['P'],
      'q': ['Q'],
      'r': ['R'],
      's': ['5', '$', 'S'],
      't': ['+', '7', 'T'],
      'u': ['μ', 'ū', 'ú', 'ǔ', 'ù', 'U'],
      'v': ['V'],
      'w': ['W'],
      'x': ['X'],
      'y': ['Y'],
      'z': ['2', 'Z']
    },
    metadata: {
      description: '用于检测各种拼音变种和谐词'
    }
  },
  
  // 语义维度关键词
  semanticDimensions: {
    financial: [
      '钱', '元', '转账', '微信', '支付', '收款', '汇款', '付款', 
      '红包', '现金', '资金', '充值', '余额', '银行', '财付通', '人民币',
      '块钱', '毛钱', '美元', '港币', '欧元', '日元', '韩元', '英镑'
    ],
    contact: [
      '联系', '加我', 'v', 'V', '微信', 'wx', '电话', 'qq', 'QQ',
      '联络', '私聊', '好友', '添加', '加入', '加下', '告诉我', '通知我',
      '发我', '打给我', '微博', '短信', '邮件', '邮箱', '联系方式'
    ],
    fraudulent: [
      '免费', '秦始皇', '领取', '中奖', '优惠', '赠送', '奖励',
      '幸运', '折扣', '赚钱', '代理', '额外', '高薪', '零投入',
      '一夜暴富', '快速致富', '躺赚', '无本万利', '轻松赚', '保本'
    ],
    urgency: [
      '速度', '快', '马上', '立即', '很快', '抓紧', '趁早', '今日',
      '仅限', '最后', '错过', '今天', '快速', '限时', '抢先', '现在',
      '立刻', '赶紧', '抓住机会', '不要错过', '机不可失', '过期不候'
    ],
    privacy: [
      '密码', '隐私', '账号', '验证码', '绑定', '登录', '注册',
      '身份证', '安全', '改密', '个人信息', '银行卡', '卡号', '安全码',
      '有效期', '信用卡', '储蓄卡', '开户行', '账户', '户主', '手机号'
    ],
    vulgar: [
      '傻逼', '操你', '妈的', '滚蛋', '混蛋', '狗屎', '废物', '垃圾', 
      '蠢货', '白痴', '笨蛋', '猪头', '狗屁', '放屁', '吃屎', '去死',
      '牛逼', '装逼', '逗比', '煞笔', '傻缺', '沙雕', '龟儿子'
    ]
  },
  
  // 高优先级敏感词列表 - 这些词需要快速检测
  highPriorityBanwords: {
    words: [
      '傻逼', 'sb', '操你妈', 'cnm', '你妈死了', '你妈的', '你玛德', '你马德', 'nmd', 'nt', 'AK', '枪', '武器', '地狱火', '煞笔',
      '高考真题', '内部泄露', '未发布真题',
      // 添加政治人物名字为高优先级敏感词
      '习近平', '李克强', '胡锦涛', '温家宝', '江泽民', '毛泽东', '邓小平',
      '习大大', '总书记', '国家主席', '总理', '中共', '共产党', '党中央',
      // 添加政治敏感地区相关词汇
      '台独', '藏独', '疆独', '港独', '六四', '八九', '天安门事件',
      // 添加拼音变体
      'xijinping', 'likeqiang', 'hujintao', 'jiangzemin', 'maozedong', 'dengxiaoping',
      'ccp', 'gcd', 'liusi', '8964',
      // 添加金融敏感词汇
      '买股票', '推荐股票', '股票推荐', '荐股', '炒股', '股票内幕', '股票交易', '牛股',
      // 添加暴力相关高优先级敏感词
      '杀死', '杀人', '杀害', '谋杀', '杀掉', '捅死', '打死', '砍死', '弄死',
      '一剑', '捅死', '一刀', '杀了', '打爆', '砍伤', '砍死',
      // 添加暴力+人名组合检测
      '杀死某人', '杀人犯', '杀人者', '杀人魔', '杀手', '凶手', '刺客', '暗杀',
      '我要杀', '我要打', '我要砍', '我想杀', '打算杀', '计划杀'
    ],
    metadata: {
      description: '高优先级敏感词，需要立即检测',
      riskLevel: 10
    }
  },

  // 非法交易组合模式
  illegalTradePatterns: {
    patterns: [
      ['武器', '私聊'], ['枪', '私聊'], ['AK', '私聊'], ['地狱火', '私聊'],
      ['自用', '99新'], ['出土', 'AK'], ['兵马俑', 'AK'], ['出土', '武器'],
      ['扣1', '送'], ['我想要', '私聊'], ['感兴趣', '私聊'],
      ['高考', '真题'], ['出', '高考真题'], ['内部', '泄露'], ['真题', '泄露'],
      ['高考', '内部'], ['出', '真题'], ['内部人员', '真题'], ['考试', '真题'], 
      ['➕v', '真题'], ['考试', '➕v']
    ],
    metadata: {
      description: '非法交易组合模式，用于检测可疑交易'
    }
  },

  // 联系方式模式
  contactMethods: {
    patterns: [
      { source: '[vV微]\\s*我?\\s*\\d+', flags: 'i' },
      { source: '[➕\\+＋加][vV微信]', flags: 'i' },
      { source: '[vV微信][：:@]\\s*\\d+', flags: 'i' },
      { source: '\\d{9,}', flags: 'i' }
    ],
    metadata: {
      description: '检测异常联系方式的正则模式',
      riskLevel: 8
    }
  },

  // 高考真题诈骗检测
  examScam: {
    keywords: [
      '高考真题', '内部真题', '真实泄露', '内部资料', '内部人员',
      '未发布', '提前曝光', '提前获取', '绝密资料', '独家资料'
    ],
    futurePatternsYears: [2025, 2026, 2027, 2028, 2029, 2030],
    subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'],
    contactCombos: [
      ['高考真题', '联系'],
      ['内部真题', '➕v'],
      ['真题', '出售'],
      ['真题', '售卖'],
      ['真题', '购买'],
      ['真题', '密押']
    ],
    metadata: {
      description: '检测高考真题诈骗的相关配置',
      riskLevel: 9
    }
  },

  // 正则表达式模式
  sensitiveRegexPatterns: {
    patterns: [
      // 改进傻逼类变体正则，包含所有可能的组合
      { source: '[傻煞沙啥厦纱杀][逼比笔屄壁b]', flags: 'i' },
      { source: '[傻煞沙啥厦纱杀]\\s*[逼比笔屄壁b]', flags: 'i' },
      // 增加更多谐音匹配
      { source: '(sha|sa|xa|cha)\\s*(bi|pi|bee)', flags: 'i' },
      { source: 's\\s*b', flags: 'i' },
      { source: '操\\s*你\\s*妈', flags: 'i' },
      { source: 'c\\s*n\\s*m', flags: 'i' },
      { source: '你\\s*妈\\s*死', flags: 'i' },
      { source: '你\\s*妈\\s*的', flags: 'i' },
      { source: '你\\s*玛\\s*德', flags: 'i' },
      { source: '你\\s*马\\s*德', flags: 'i' },
      { source: 'n\\s*m\\s*d', flags: 'i' },
      { source: 'ak\\s*[4547]*', flags: 'i' },
      { source: '[枪槍]\\s*[支把]', flags: 'i' },
      { source: '地\\s*狱\\s*火', flags: 'i' },
      { source: '[vV微]\\s*我?\\s*\\d+', flags: 'i' }, // 异常联系方式
      // 增加更多谐音组合的检测
      { source: '(cao|cao|tzao)\\s*(ni|nee)\\s*(ma|mma)', flags: 'i' },
      { source: '(ni|nee)\\s*(ma|mma)\\s*(si|sz|死|西)', flags: 'i' },
      { source: '(ni|nee)\\s*(ma|mma|ma)\\s*(de|di|地|的|德)', flags: 'i' },
      { source: '(gun|gun|滚)\\s*dan', flags: 'i' },
      // 针对壁/笔/逼等谐音的宽松匹配
      { source: '([a-zA-Z\\u4e00-\\u9fa5]?)壁([a-zA-Z\\u4e00-\\u9fa5]?)', flags: 'i' },
      // 宽泛匹配所有可能的谐音组合
      { source: '([a-zA-Z]*?)sha([a-zA-Z]*?)bi([a-zA-Z]*?)', flags: 'i' }
    ],
    metadata: {
      description: '敏感词正则表达式模式，用于模糊匹配'
    }
  },
  
  // 武器/军火相关敏感词
  weapons: {
    words: [
      'AK', 'AK47', 'M4A1', 'AWP', '地狱火', '手雷', '突击步枪',
      '手枪', '狙击枪', '狙击步枪', '冲锋枪', '炸弹', '军火', '子弹',
      '武器', '枪', '炮', '兵工厂', '军火库', '军火商', '弹药',
      '麻醉枪', '电击枪', '气枪', '猎枪', '散弹枪', '步枪',
      '军刀', '匕首', '弓弩', '砍刀'
    ]
  },

  // 政治法律类
  politicalLegal: {
    words: [
      '言论自由', '新闻自由', '司法独立', '三权分立', '民主制度',
      '威权', '专制', '独裁', '选举', '投票权',
      '公民权利', '基本人权', '示威', '抗议', '游行',
      '政治庇护', '政治避难', '政治犯', '异见人士', '维权',
      '人权组织', '言论管制', '网络管制', '审查制度', '信息封锁',
      '防火墙', '翻墙', '信息自由', '新闻管制', '舆论导向',
      '舆论监督', '自媒体管理', '政治改革', '体制改革', '社会转型',
      '民主化', '自由化', '宪政', '法治', '人治',
      '政治体制', '社会主义', '资本主义', '共产主义', '自由主义'
    ],
    metadata: {
      riskLevel: 9,
      category: '政治法律'
    }
  },
  
  // 敏感历史事件
  sensitiveHistory: {
    words: [
      '文革', '文化大革命', '六四', '八九', '1989年', 
      '天安门事件', '反右', '大跃进', '三年困难', '上山下乡',
      '知青', '右派', '反革命', '平反', '改革开放',
      '政治运动', '四人帮', '林彪', '批斗', '阶级斗争',
      '资产阶级自由化', '清场', '镇压', '政治迫害', '政治清洗'
    ],
    metadata: {
      riskLevel: 9,
      category: '敏感历史事件'
    }
  },
  
  // 政治敏感地区
  sensitiveRegions: {
    words: [
      '台湾', '西藏', '新疆', '香港', '澳门',
      '钓鱼岛', '南海', '东海', '钓鱼台', '台独',
      '藏独', '疆独', '港独', '两岸关系', '一国两制',
      '统一', '回归', '主权', '领土完整', '领海',
      '领空', '领土争议', '主权争议', '藏南', '南沙',
      '西沙', '东沙', '独立', '分裂', '分离主义',
      '民族分裂', '国家分裂', '民族自决', '中央政权', '地方政权'
    ],
    metadata: {
      riskLevel: 8,
      category: '政治敏感地区'
    }
  },

  // 政治敏感谐音变体
  politicalVariants: {
    words: {
      '习近平': ['习大大', '习主席', 'XJP', 'xjp', '习总', '习氏', '习特勒'],
      '中共': ['中国共产党', '共产党', 'CCP', 'ccp', '共党', '土共', '赤党'],
      '民主': ['敏珠', '民煮', 'MZ', 'mz', '敏主', '敏舟'],
      '自由': ['资游', '字由', 'ZY', 'zy', '紫忧', '仔忧'],
      '宪政': ['县政', '线政', '宪章', 'XZ', 'xz', '贤政'],
      '六四': ['六月四日', '8964', '89年', '天安门事件', 'liusi'],
      '法轮功': ['FLG', 'flg', 'falungong', '发轮功', '法轮大法', '轮子功'],
      '台独': ['台湾独立', '台湾国', '台湾岛国', '台灣獨立', 'TD', 'taidu'],
      '藏独': ['西藏独立', '西藏国', '藏人政府', '西藏流亡', 'ZD', 'zangdu'],
      '疆独': ['东突', '维吾尔独立', '新疆独立', '突厥斯坦', 'JD', 'jiangdu'],
      '港独': ['香港独立', '香港国', '香港民族', 'HKI', 'gangdu', '港英政府']
    },
    metadata: {
      description: '政治敏感词汇的变体、谐音映射表',
      riskLevel: 9
    }
  },
  
  // 政治敏感模式 - 正则匹配
  politicalRegexPatterns: {
    patterns: [
      // 领导人名字的变体
      { source: 'x[ij\\*\\s]+j[ij\\*\\s]+[np]([iy\\*\\s])+([ng\\*\\s])+', flags: 'i' },
      { source: 'xi[\\s\\*]*da[\\s\\*]*da', flags: 'i' },
      { source: 'xi[\\s\\*]*jin[\\s\\*]*ping', flags: 'i' },
      { source: 'li[\\s\\*]*ke[\\s\\*]*qiang', flags: 'i' },
      { source: '[m\\*]ao[\\s\\*]*ze[\\s\\*]*dong', flags: 'i' },
      { source: 'deng[\\s\\*]*xiao[\\s\\*]*ping', flags: 'i' },
      
      // 敏感政治术语变体
      { source: 'min[\\s\\*]*zhu', flags: 'i' },
      { source: 'zi[\\s\\*]*you', flags: 'i' },
      { source: 'xian[\\s\\*]*zheng', flags: 'i' },
      { source: 'ren[\\s\\*]*quan', flags: 'i' },
      { source: 'gong[\\s\\*]*chan[\\s\\*]*dang', flags: 'i' },
      { source: 'zhong[\\s\\*]*gong', flags: 'i' },
      
      // 敏感事件变体
      { source: 'liu[\\s\\*]*si', flags: 'i' },
      { source: '(64|6[\\s\\*]4|六.{0,2}四|六.{0,1}月.{0,1}四)', flags: 'i' },
      { source: 'ba[\\s\\*]*jiu', flags: 'i' },
      { source: '8[\\s\\*]9|89[\\.\\-\\*]', flags: 'i' },
      { source: 'tian[\\s\\*]*an[\\s\\*]*men', flags: 'i' },
      { source: 'wen[\\s\\*]*ge|文.{0,2}革|文化.{0,2}革命', flags: 'i' },
      
      // 敏感地区相关
      { source: 'tai[\\s\\*]*du|台.{0,2}独', flags: 'i' },
      { source: 'zang[\\s\\*]*du|藏.{0,2}独', flags: 'i' },
      { source: 'jiang[\\s\\*]*du|疆.{0,2}独', flags: 'i' },
      { source: 'gang[\\s\\*]*du|港.{0,2}独', flags: 'i' },
      { source: 'tai[\\s\\*]*wan[\\s\\*]*(duli|du)', flags: 'i' },
      { source: 'xi[\\s\\*]*zang[\\s\\*]*(duli|du)', flags: 'i' },
      { source: 'xin[\\s\\*]*jiang[\\s\\*]*(duli|du)', flags: 'i' },
      { source: 'xiang[\\s\\*]*gang[\\s\\*]*(duli|du)', flags: 'i' }
    ],
    metadata: {
      description: '政治敏感词汇的正则表达式模式',
      riskLevel: 9
    }
  },
  
  // 政治敏感组合检测
  politicalSensitiveCombos: {
    patterns: [
      ['选举', '民主'],
      ['民主', '中国'],
      ['自由', '民主'],
      ['言论', '自由'],
      ['新闻', '自由'],
      ['宪政', '改革'],
      ['政治', '体制改革'],
      ['三权', '分立'],
      ['民主', '投票'],
      ['普选', '投票'],
      ['独立', '法院'],
      ['司法', '独立'],
      ['人权', '保障'],
      ['公民', '权利'],
      ['台湾', '独立'],
      ['香港', '独立'],
      ['西藏', '独立'],
      ['新疆', '独立'],
      ['钓鱼岛', '主权'],
      ['南海', '主权'],
      ['领土', '争议'],
      ['领海', '争议'],
      ['天安门', '抗议'],
      ['天安门', '学生'],
      ['六四', '真相'],
      ['六四', '学生'],
      ['六四', '镇压'],
      ['文革', '平反'],
      ['文革', '真相'],
      ['文革', '受害者'],
      ['政治', '言论'],
      ['言论', '审查'],
      ['网络', '审查'],
      ['媒体', '审查'],
      ['翻墙', '软件'],
      ['防火墙', '软件'],
      ['信息', '封锁'],
      ['独裁', '政府'],
      ['专制', '统治'],
      ['一党', '专政'],
      ['政治', '犯'],
      ['政治', '避难'],
      ['异见', '人士'],
      ['维权', '律师'],
      ['反腐', '运动'],
      ['政治', '打压'],
      ['习近平', '修宪'],
      ['习近平', '任期']
    ],
    metadata: {
      description: '政治敏感词组合检测配置',
      riskLevel: 9
    }
  },

  // 伪装检测配置
  camouflagePatterns: {
    // 常见用于伪装的干扰字符
    noiseChars: ['一', '丶', '点', '-', '_', '*', '~', '.', '。', '，', ',', '、', ' ', '|'],
    // 正则表达式模式，用于检测常见的伪装方式
    patterns: [
      // 连续重复字符，如"你一一一是一一一傻一一一逼"
      { regex: /(.)\1{2,}/, replace: '$1' },
      // 固定间隔插入相同字符，如"你一是一傻一逼"
      { regex: /(.)[一丶点\-_*~. |]+(.)[一丶点\-_*~. |]+(.)[一丶点\-_*~. |]+(.)/g, extract: '$1$2$3$4' },
      // 特殊符号间隔，如"你*是*傻*逼"
      { regex: /(.)[*]+(.)[*]+(.)[*]+(.)/g, extract: '$1$2$3$4' }
    ],
    // 需要优先检查的敏感词组合
    sensitiveWordGroups: [
      // 侮辱性词语
      ['你', '是', '傻', '逼'],
      ['你', '妈', '死', '了'],
      ['操', '你', '妈'],
      ['日', '你', '妈'],
      ['我', '日'],
      ['去', '死'],
      // 政治敏感词语
      ['习', '近', '平'],
      ['共', '产', '党']
    ],
    metadata: {
      description: '用于检测伪装敏感词的配置',
      riskLevel: 8
    }
  },

  // 域名白名单配置
  domainConfig: {
    // 域名白名单 - 这些域名被认为是安全的
    whitelist: [
      'weixin.qq.com',
      'mp.weixin.qq.com',
      'baidu.com',
      'qq.com',
      'bing.com',
      'microsoft.com',
      'github.com',
      'gitee.com',
      'nankai.edu.cn',
      'edu.cn',
      'gov.cn',
      'zhihu.com',
      'bilibili.com',
      'douyin.com',
      'tencent.com',
      'aliyun.com',
      'alibaba.com',
      'taobao.com',
      'jd.com',
      '163.com',
      'people.com.cn',
      'xinhuanet.com',
      'cctv.com',
      'csdn.net',
      'juejin.cn'
    ],
    
    // 可疑域名特征 - 这些特征通常与非法域名相关
    suspiciousPatterns: [
      // 可疑顶级域名
      { source: '\\.mom\\b', flags: 'i' },
      { source: '\\.top:[0-9]{4,5}\\b', flags: 'i' },
      { source: '\\.xyz\\b', flags: 'i' },
      { source: '\\.cc\\b', flags: 'i' },
      { source: '\\.tk\\b', flags: 'i' },
      { source: '\\.ml\\b', flags: 'i' },
      { source: '\\.ga\\b', flags: 'i' },
      { source: '\\.gq\\b', flags: 'i' },
      { source: '\\.cf\\b', flags: 'i' },
      // 可疑二级域名特征
      { source: '[0-9a-f]{5,}\\.[a-z]{2,7}\\b', flags: 'i' },
      { source: '(?:[0-9]+[a-z]+|[a-z]+[0-9]+)[0-9a-z]*\\.[a-z]{2,7}\\b', flags: 'i' },
      // 可疑路径特征
      { source: '/tianxie/', flags: 'i' },
      { source: '/tx\\.html', flags: 'i' },
      { source: '/pay/', flags: 'i' },
      { source: '/cz/', flags: 'i' },
      { source: '/admin/', flags: 'i' },
      { source: '/login\\.php', flags: 'i' },
      // 可疑参数特征
      { source: 'channelCode=[a-z0-9]+', flags: 'i' },
      { source: 'invite=[a-z0-9]+', flags: 'i' },
      { source: 'ref=[a-z0-9]+', flags: 'i' },
      // IP + 端口形式
      { source: 'https?://\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{2,5})?/', flags: 'i' }
    ],
    
    // 明确禁止的域名 - 直接添加用户提供的可疑域名
    blockedDomains: [
      '5fartgj27.mom',
      'uydgm.5fartgj27.mom'
    ],
    
    // 高风险组合 - URL + 敏感关键词
    riskyCombinations: [
      ['http', '联系'],
      ['https', '添加'],
      ['http', '加我'],
      ['链接', '下载'],
      ['链接', '点击'],
      ['网址', '领取'],
      ['网站', '资源']
    ]
  },
};

// 创建敏感词数据对象
const banwordsData = BanwordsFactory.createBanwordsData(LIBRARY_CONFIGS);

module.exports = banwordsData; 