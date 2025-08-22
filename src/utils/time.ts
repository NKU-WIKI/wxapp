import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/zh-cn';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
// Set the locale to Chinese
dayjs.locale('zh-cn');

// 测试dayjs是否正常工作
const testDayjs = () => {
  console.log('🧪 测试dayjs功能:');
  
  // 测试当前时间
  const now = dayjs();
  console.log('当前时间 (本地):', now.format('YYYY-MM-DD HH:mm:ss'));
  console.log('当前时间 (UTC):', now.utc().format('YYYY-MM-DD HH:mm:ss'));
  
  // 测试解析UTC时间
  const testTime = "2025-08-22T17:12:44.291Z";
  const parsed = dayjs(testTime);
  const parsedLocal = dayjs(testTime).local();
  
  console.log('解析测试时间:', {
    input: testTime,
    isValid: parsed.isValid(),
    utcFormatted: parsed.utc().format('YYYY-MM-DD HH:mm:ss'),
    localFormatted: parsed.format('YYYY-MM-DD HH:mm:ss'),
    fromNow: parsed.fromNow(),
    diffMinutes: now.diff(parsed, 'minute'),
    diffHours: now.diff(parsed, 'hour')
  });
  
  // 测试相对时间
  const oneHourAgo = dayjs().subtract(1, 'hour');
  console.log('1小时前:', oneHourAgo.fromNow());
  
  // 手动计算时间差
  const manualDiff = new Date().getTime() - new Date(testTime).getTime();
  const manualHours = Math.floor(manualDiff / (1000 * 60 * 60));
  const manualMinutes = Math.floor(manualDiff / (1000 * 60));
  console.log('手动计算时间差:', {
    diffMs: manualDiff,
    diffMinutes: manualMinutes,
    diffHours: manualHours
  });
};

// 在模块加载时运行测试
testDayjs();

/**
 * 临时的简化时间格式化函数，用于测试
 */
function simpleFormatTime(timeStr: string): string {
  if (!timeStr) return '时间未知';
  
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      console.error('❌ 无效的时间格式:', timeStr);
      return '时间未知';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    console.log('🔧 简化版本时间计算:', {
      input: timeStr,
      now: now.toISOString(),
      inputDate: date.toISOString(),
      diffMs: diffMs,
      diffMinutes: diffMinutes,
      diffHours: diffHours,
      diffDays: diffDays
    });
    
    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 30) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  } catch (error) {
    console.error('❌ simpleFormatTime 错误:', error);
    return '时间未知';
  }
}

/**
 * Formats a given time string into a relative time format.
 * e.g., "几秒前", "2分钟前", "3小时前"
 * @param time - The time string to format (e.g., "2024-05-21T12:34:56Z")
 * @returns A string representing the relative time.
 */
export function formatRelativeTime(time: string): string {
  if (!time) {
    console.warn('⚠️ formatRelativeTime: 时间参数为空');
    return '时间未知';
  }
  
  // 临时使用简化版本进行测试
  const simpleResult = simpleFormatTime(time);
  console.log('🔧 使用简化版本格式化:', { input: time, output: simpleResult });
  
  // 暂时直接返回简化版本的结果，因为dayjs可能有时区问题
  return simpleResult;
  
  /* 注释掉dayjs版本，等修复后再启用
  try {
    console.log('🔍 formatRelativeTime 输入:', time);
    
    // 检查dayjs是否能正确解析时间
    const dayjsObj = dayjs(time);
    console.log('🔍 dayjs解析结果:', {
      isValid: dayjsObj.isValid(),
      year: dayjsObj.year(),
      month: dayjsObj.month(),
      date: dayjsObj.date(),
      hour: dayjsObj.hour(),
      minute: dayjsObj.minute(),
      second: dayjsObj.second(),
      format: dayjsObj.format('YYYY-MM-DD HH:mm:ss')
    });
    
    if (!dayjsObj.isValid()) {
      console.error('❌ dayjs无法解析时间:', time);
      return simpleResult; // 使用简化版本作为回退
    }
    
    const result = dayjsObj.fromNow();
    console.log('⏰ 时间格式化成功:', { input: time, output: result });
    return result;
  } catch (error) {
    console.error('❌ formatRelativeTime 错误:', { time, error });
    return simpleResult; // 使用简化版本作为回退
  }
  */
} 