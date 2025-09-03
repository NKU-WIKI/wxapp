import http from '../request';

// 笔记可见性枚举
export type NoteVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

// 笔记状态枚举
export type NoteStatus = 'draft' | 'published' | 'archived' | 'deleted';

// 笔记列表项接口
export interface NoteListItem {
  id: string;
  title: string;
  content?: string;
  category_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  is_public: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  author_name?: string;
  author_avatar?: string;
  user_id?: string; // 新增：用户ID，用于调用正确的API
}

// 笔记统计信息接口
export interface NoteStats {
  total_notes: number;
  total_words: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  active_days: number;
  avg_words_per_note: number;
  most_active_day?: string;
  streak_days: number;
}

// 获取笔记列表参数接口
export interface GetNotesParams {
  q?: string; // 搜索关键词
  category?: string; // 分类筛选
  tags?: string[]; // 标签筛选
  author_id?: string; // 作者ID筛选
  status?: string; // 状态筛选
  sort_by?: string; // 排序字段，默认created_at
  sort_order?: 'asc' | 'desc'; // 排序方向，默认desc
  skip?: number; // 偏移量，默认0
  limit?: number; // 限制数量，默认20，最大100
}

// 创建笔记请求接口
export interface CreateNoteRequest {
  title: string; // 笔记标题
  content: string; // 笔记内容
  summary?: string; // 内容摘要
  excerpt?: string; // 摘录
  category_id?: string; // 分类ID
  tags?: string[]; // 标签列表
  link_info_id?: string; // 链接信息ID
  images?: string[]; // 图片URL列表
  mentioned_users?: string[]; // 提及的用户ID列表
  location?: string; // 地理位置信息
  visibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'; // 可见性设置
  allow_share?: boolean; // 是否允许转发
  allow_comment?: boolean; // 是否允许评论
  status?: 'draft' | 'published'; // 笔记状态
  word_count?: number; // 字数统计
  reading_time_minutes?: number; // 预计阅读时间
  is_featured?: boolean; // 是否精选
  featured_weight?: number; // 精选权重
}

/**
 * 获取笔记列表
 */
export const getNotes = async (params?: GetNotesParams) => {
  return http.get<{ code: number; message: string; data: NoteListItem[] }>('/notes', params);
};

/**
 * 获取笔记详情
 */
export const getNoteDetail = async (noteId: string, userId?: string) => {
  // 调试日志
  console.log('🔍 getNoteDetail函数调用:', {
    noteId,
    userId,
    hasUserId: !!userId
  });
  
  // 如果提供了userId，使用用户笔记列表接口
  if (userId) {
    const apiPath = `/users/${userId}/notes`;
    console.log('🔍 使用用户笔记列表API路径:', apiPath);
    return http.get<{ code: number; message: string; data: any[] }>(apiPath);
  }
  
  // 否则使用原来的路径（向后兼容）
  const apiPath = `/notes/${noteId}`;
  console.log('🔍 使用普通笔记API路径:', apiPath);
  return http.get<{ code: number; message: string; data: any }>(apiPath);
};

/**
 * 获取用户笔记列表
 */
export const getUserNotes = async (userId: string, params?: GetNotesParams) => {
  return http.get<{ code: number; message: string; data: NoteListItem[] }>(`/users/${userId}/notes`, params);
};

/**
 * 获取笔记推荐流
 */
export const getNoteFeed = async (params: { skip?: number; limit?: number } = {}) => {
  // 根据API文档，这个接口需要认证，让我们确保参数格式正确
  const requestParams = {
    skip: params.skip || 0,
    limit: params.limit || 20
  };
  
  return http.get<{ code: number; message: string; data: any }>('/notes/feed', requestParams);
};

/**
 * 获取笔记统计信息
 */
export const getNoteStats = async () => {
  return http.get<{ code: number; message: string; data: NoteStats }>('/notes/stats');
};

/**
 * 获取笔记分析数据
 */
export const getNoteAnalytics = async (noteId: string, days: number = 30) => {
  return http.get<{ code: number; message: string; data: any }>(`/notes/${noteId}/analytics`, { days });
};

/**
 * 创建笔记
 */
export const createNote = async (noteData: CreateNoteRequest) => {
  return http.post<any>('/notes', noteData);
};

export default {
  getNotes,
  getNoteDetail,
  getUserNotes, // 新增：获取用户笔记列表
  getNoteFeed,
  getNoteStats,
  getNoteAnalytics,
  createNote,
};
