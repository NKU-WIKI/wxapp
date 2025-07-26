import http from '../request';

export interface HotSearchItem {
  query: string;
  search_count: number;
}

export interface HotAndNewSearchResponse {
  code: number;
  message: string;
  data: HotSearchItem[];
}

export const hotApi = {
  getHotPage: () => {
    return http.get<HotAndNewSearchResponse>('/knowledge/hot_and_new');
  }
}
