import { HistoryItem } from '@/types/history';
import { getStorage, setStorage } from './storage';

const HISTORY_KEY = 'browse_history';
const MAX_HISTORY = 200;

/**
 * 添加一条浏览历史
 */
export function addHistory(item: HistoryItem) {
  let history: HistoryItem[] = getStorage<HistoryItem[]>(HISTORY_KEY, []) || [];
  // 先移除同id的
  history = history.filter(h => h.id !== item.id);
  // 插入到最前面
  history.unshift(item);
  // 限制最大条数
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  setStorage(HISTORY_KEY, history);
}

/**
 * 分页获取历史
 * @param page 页码（从1开始）
 * @param pageSize 每页条数
 */
export function getHistory(page = 1, pageSize = 20): HistoryItem[] {
  const history: HistoryItem[] = getStorage<HistoryItem[]>(HISTORY_KEY, []) || [];
  const start = (page - 1) * pageSize;
  return history.slice(start, start + pageSize);
}

/**
 * 删除单条历史
 */
export function removeHistory(id: string) {
  let history: HistoryItem[] = getStorage<HistoryItem[]>(HISTORY_KEY, []) || [];
  history = history.filter(h => h.id !== id);
  setStorage(HISTORY_KEY, history);
}

/**
 * 清空所有历史
 */
export function clearHistory() {
  setStorage(HISTORY_KEY, []);
}
// 调用 clearHistory() 可清空所有浏览历史 