/**
 * 日期时间工具 - 使用微信小程序环境下的简单日期处理
 */

/**
 * 格式化数字为两位数
 * @param {Number} n 需要格式化的数字
 * @returns {String} 格式化后的字符串
 */
const formatNumber = n => n.toString().padStart(2, '0');

/**
 * 格式化日期时间
 * @param {Date|String|Number} date 日期对象或可转换为日期的值
 * @param {String} format 格式化模板，默认为'YYYY/MM/DD HH:mm:ss'
 * @returns {String} 格式化后的日期时间字符串
 */
const formatTime = (date, format = 'YYYY/MM/DD HH:mm:ss') => {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = formatNumber(d.getMonth() + 1);
  const day = formatNumber(d.getDate());
  const hour = formatNumber(d.getHours());
  const minute = formatNumber(d.getMinutes());
  const second = formatNumber(d.getSeconds());
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

/**
 * 格式化为相对时间
 * @param {Date|String|Number} timestamp 时间戳或日期对象
 * @returns {String} 相对时间文本，如"3分钟前"
 */
function formatRelativeTime(timestamp) {
  if (typeof timestamp === 'string' && /[年月天时分秒]前|刚刚发布/.test(timestamp)) {
    return timestamp;
  }

  if (!timestamp) return '刚刚发布';

  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return '刚刚发布';
    
    const now = new Date();
    
    // 如果是未来时间，显示"刚刚发布"
    if (date > now) return '刚刚发布';
    
    // 计算时间差（毫秒）
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    // 如果时间差小于15秒，显示"刚刚发布"
    if (seconds < 15) return '刚刚发布';
    
    // 时间单位
    const timeUnits = [
      { unit: '年', value: 365 * 24 * 60 * 60 },
      { unit: '个月', value: 30 * 24 * 60 * 60 },
      { unit: '天', value: 24 * 60 * 60 },
      { unit: '小时', value: 60 * 60 },
      { unit: '分钟', value: 60 },
      { unit: '秒', value: 1 }
    ];
    
    // 查找合适的时间单位
    for (const { unit, value } of timeUnits) {
      const count = Math.floor(seconds / value);
      if (count > 0) return `${count}${unit}前`;
    }
    
    return '刚刚发布';
  } catch (err) {
    console.debug('时间格式化错误:', err);
    return '刚刚发布';
  }
}

module.exports = {
  formatNumber,
  formatTime,
  formatRelativeTime
}; 