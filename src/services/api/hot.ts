import http from '../request';
import { HotAndNewSearchResponse, GetHotAndNewParams } from "@/types/api/hot_and_new";


export const hotAndNewApi = {
  getHotAndNewPage: (params: GetHotAndNewParams) => {
    return http.get<HotAndNewSearchResponse>('/knowledge/hot_and_new', params);
  }
}
