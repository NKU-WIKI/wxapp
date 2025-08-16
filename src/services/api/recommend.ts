import http from "../request";
import {
  RecommendRequest,
  RecommendResponse,
} from "@/types/api/recommend";

/**
 * 获取推荐内容（帖子、用户等）
 * @param params
 * @returns
 */
export const getRecommendations = (params: RecommendRequest) => {
  return http.get<RecommendResponse>("/recommendations", params);
};

const recommendApi = {
  getRecommendations,
};

export default recommendApi;