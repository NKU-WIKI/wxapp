import {
  SearchRequest,
  SearchBundleRead,

  SearchHistoryResponse,
  ClearHistoryResponse,
} from '@/types/api/search';
import http from '../request';

/**
 * 执行通用搜索
 * @param params 搜索参数
 * @returns 搜索结果
 */
export const search = (params: SearchRequest) => {
  return http.post<SearchBundleRead>('/search/', params);
};

/**
 * 获取热门搜索词
 * @returns 热门搜索词列表
 */
export const getHotQueries = () => {
  return http.get<string[]>('/search/hot-queries');
};

/**
 * 获取热门搜索词（简化版本，直接返回数组）
 * @returns 热门搜索词数组
 */
export const getHotQueriesSimple = async (): Promise<string[]> => {
  const response = await getHotQueries();
  return response.data || [];
};

/**
 * 获取搜索历史
 * @param pageSize 每页数量，默认10
 * @returns 搜索历史列表
 */
export const getSearchHistory = (pageSize: number = 10) => {
  return http.get<SearchHistoryResponse>('/search/history', { page_size: pageSize });
};

/**
 * 清空搜索历史
 * @returns 清空结果
 */
export const clearSearchHistory = () => {
  return http.post<ClearHistoryResponse>('/search/history/clear', {});
};

const searchApi = {
  search,
  getHotQueries,
  getHotQueriesSimple,
  getSearchHistory,
  clearSearchHistory,
};

export default searchApi;
