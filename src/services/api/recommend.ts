import http from '../request';
import { recommendResponse, recommendParams } from "@/types/api/recommend";


export const recommendApi = {
  getRecommendPost: (params: recommendParams) => {
    return http.get<recommendResponse>('/knowledge/recommend', params);
  }
}
