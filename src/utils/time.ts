import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);
// Set the locale to Chinese
dayjs.locale('zh-cn');

/**
 * Formats a given time string into a relative time format.
 * e.g., "几秒前", "2分钟前", "3小时前"
 * @param time - The time string to format (e.g., "2024-05-21T12:34:56Z")
 * @returns A string representing the relative time.
 */
export function formatRelativeTime(time: string): string {
  if (!time) {
    return '时间未知';
  }
  return dayjs(time).fromNow();
} 