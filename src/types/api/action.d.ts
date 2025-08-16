/**
 * @description 切换交互状态 (点赞/收藏/关注) 的请求体
 */
export interface ToggleActionRequest {
  target_id: number;
  target_type: "post" | "comment" | "user";
  action_type: "like" | "favorite" | "follow";
  active?: boolean; // 可选，默认为 true
}

/**
 * @description 切换交互状态的响应体
 * @description (根据 openapi.md 的通用实践，响应可能包含操作后的状态和计数)
 */
export interface ToggleActionResponse {
  is_active: boolean;
  // count is no longer part of the response according to the new docs
  // count: number;
}
