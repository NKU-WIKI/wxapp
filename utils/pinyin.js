/**
 * 汉字转拼音模块的包装器
 * 使用轻量级的word-pinyin库，更适合微信小程序
 */

const { pinyin } = require('pinyin-pro');

function textToPinyin(text, sep = ' ') {
  if (!text) return '';
  // 返回分词后的拼音，全部小写，无音调
  return pinyin(text, { toneType: 'none', type: 'array' }).join(sep);
}

module.exports = {
  textToPinyin
}; 