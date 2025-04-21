/**
 * 汉字转拼音模块的包装器
 * 使用轻量级的word-pinyin库，更适合微信小程序
 */

// 创建word-pinyin库的包装
let pinyin;

try {
  // 导入word-pinyin模块
  const wordPinyin = require('word-pinyin').default || require('word-pinyin');
  
  // 创建与原接口兼容的包装函数
  pinyin = function(text, options = {}) {
    if (!text) return [];
    
    const style = options.style || pinyin.STYLE_NORMAL;
    const characters = typeof text === 'string' ? text.split('') : [text.toString()];
    
    return characters.map(char => {
      let result;
      
      try {
        if (style === pinyin.STYLE_FIRST_LETTER) {
          // 获取首字母
          const letter = wordPinyin.getFirstLetter(char);
          result = letter ? [letter.toLowerCase()] : [char];
        } else {
          // 获取完整拼音
          const pinyinStr = wordPinyin.getPinyin(char, ''); // 不要分隔符
          result = pinyinStr ? [pinyinStr] : [char];
        }
      } catch (e) {
        // 转换失败时返回原字符
        result = [char];
      }
      
      return result;
    });
  };
  
  // 添加样式常量以保持兼容性
  pinyin.STYLE_NORMAL = 0;
  pinyin.STYLE_TONE = 1;
  pinyin.STYLE_TONE2 = 2;
  pinyin.STYLE_FIRST_LETTER = 3;
  pinyin.STYLE_INITIALS = 4;
  
  console.log('word-pinyin加载成功');
  
} catch (error) {
  console.error('加载word-pinyin库失败:', error);
  
  // 提供一个后备实现，仅支持基本功能
  pinyin = function(text, options = {}) {
    // 简单的后备实现，返回原文字数组
    if (!text) return [];
    
    const characters = typeof text === 'string' ? text.split('') : [text.toString()];
    return characters.map(char => [char]);
  };
  
  // 添加样式常量
  pinyin.STYLE_NORMAL = 0;
  pinyin.STYLE_TONE = 1;
  pinyin.STYLE_TONE2 = 2;
  pinyin.STYLE_FIRST_LETTER = 3;
  pinyin.STYLE_INITIALS = 4;
}

module.exports = pinyin; 