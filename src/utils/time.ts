import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/zh-cn";

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
// Set the locale to Chinese
dayjs.locale("zh-cn");

/**
 * 格式化发帖时间，显示为简洁的日期格式
 * 今年：显示为 "8-27" 格式
 * 非今年：显示为 "8-27-2022" 格式
 * @param time - 时间字符串
 * @returns 格式化后的日期字符串
 */
export function formatPostDate(time: string): string {
  if (!time) {
    return "时间未知";
  }

  try {
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) {
      return "时间未知";
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const postYear = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() 返回 0-11
    const day = date.getDate();

    if (postYear === currentYear) {
      // 今年：只显示月-日
      return `${month}-${day}`;
    } else {
      // 非今年：显示年-月-日
      return `${month}-${day}-${postYear}`;
    }
  } catch {
    return "时间未知";
  }
}

/**
 * 临时的简化时间格式化函数，用于测试
 */
function simpleFormatTime(timeStr: string): string {
  if (!timeStr) return "时间未知";

  try {
    const date = new Date(timeStr);
    if (Number.isNaN(date.getTime())) {
      return "时间未知";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "刚刚";
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 30) return `${diffDays}天前`;

    return date.toLocaleDateString("zh-CN");
  } catch {
    return "时间未知";
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
    return "时间未知";
  }

  // 临时使用简化版本进行测试
  const simpleResult = simpleFormatTime(time);

  // 暂时直接返回简化版本的结果，因为dayjs可能有时区问题
  return simpleResult;

  /* 注释掉dayjs版本，等修复后再启用
  try {
    // 检查dayjs是否能正确解析时间
    const dayjsObj = dayjs(time);
    
    if (!dayjsObj.isValid()) {
      return simpleResult; // 使用简化版本作为回退
    }
    
    const result = dayjsObj.fromNow();
    return result;
  } catch {
    return simpleResult; // 使用简化版本作为回退
  }
  */
}
