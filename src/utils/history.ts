import { HistoryItem } from '@/types/history';
import { getStorage, setStorage } from './storage';
import { createViewHistory } from '@/services/api/user';
import { CreateViewHistoryRequest } from '@/types/api/user';

const HISTORY_KEY = 'browse_history';
const MAX_HISTORY = 200;

/**
 * 记录浏览历史到服务器
 * @param targetType 目标类型
 * @param targetId 目标ID
 */
export async function recordViewHistory(targetType: "post" | "product" | "user", targetId: number) {
  try {
    const requestData: CreateViewHistoryRequest = {
      target_type: targetType,
      target_id: targetId
    };
    
    await createViewHistory(requestData);
    console.log('✅ 浏览历史已记录到服务器:', { targetType, targetId });
  } catch (error) {
    console.error('❌ 记录浏览历史到服务器失败:', error);
    // 不抛出错误，避免影响用户体验
  }
}

/**
 * 添加一条浏览历史（本地存储）
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
 * 添加浏览历史（同时记录本地和服务器）
 * @param item 浏览历史项
 * @param targetType 目标类型（用于服务器API）
 * @param targetId 目标ID（用于服务器API）
 */
export async function addHistoryWithServerSync(
  item: HistoryItem, 
  targetType: "post" | "product" | "user", 
  targetId: number
) {
  // 先记录到本地
  addHistory(item);
  
  // 暂时注释掉服务器API调用，等后端开发完成后再启用
  // await recordViewHistory(targetType, targetId);
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