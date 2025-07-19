export interface ToggleActionParams {
  target_type: 'post' | 'comment' | 'user';
  target_id: number;
  action_type: 'like' | 'favorite' | 'follow';
}

export interface ToggleActionResponse {
  is_active: boolean;
  count: number;
} 