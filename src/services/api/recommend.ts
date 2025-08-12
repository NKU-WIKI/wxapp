import http from '../request';
import { recommendItem, recommendParams } from "@/types/api/recommend";


export const recommendApi = {
  getRecommendPost: (params: recommendParams) => {
    // 新 OpenAPI: /api/knowledge/recommend
    return http.get<recommendItem>('/knowledge/recommend', params);
  }
}
