export interface recommendItem {
  hot_posts: [],
  "new_posts": [],
  "recommended_posts": [],
  "statistics": {
    "total_hot_posts": number,
    "total_new_posts": number,
    "total_recommended_posts": number,
    "data_sources": [],
    "time_range": string,
    "hot_weight": number,
    "new_weight": number
  }
}

export interface recommendResponse {
  code: number;
  message: string;
  data: recommendItem;
}

export interface recommendParams {
  enable_ai_recommendation?: boolean;
  user_id?: string | null;
  limit?: number;
  hot_weight?: number;
  new_weight?: number;
  days?: number;
}
