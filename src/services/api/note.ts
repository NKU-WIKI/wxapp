import http from '../request';
import { NoteDetail, NoteRead, NoteListItem } from '@/types/api/note.d';

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
 * 支持可选认证：未登录用户可通过x-tenant-id头访问
 */
export const getNotes = async (params?: GetNotesParams) => {
  return http.get<{ code: number; message: string; data: NoteListItem[] }>('/notes', params);
};

/**
 * 切换用户交互状态（点赞、收藏、关注等）
 */
interface ToggleActionResponse {
  code: number;
  message: string;
  data: {
    success: boolean;
    action_type: string;
    target_id: string;
    target_type: string;
    is_active: boolean;
  };
}

export const toggleAction = async (params: {
  targetId: string;
  targetType: 'post' | 'comment' | 'user' | 'note' | 'listing';
  actionType: 'like' | 'favorite' | 'follow';
}) => {
  return http.post<ToggleActionResponse>('/actions/toggle', {
    target_id: params.targetId,
    target_type: params.targetType,
    action_type: params.actionType
  });
};

/**
 * 获取笔记详情
 */
interface GetNotesResponse {
  code: number;
  message: string;
  data: NoteListItem[];
}

export const getNoteDetail = async (noteId: string, userId?: string) => {
  if (userId) {
    // 如果有用户ID，获取该用户的笔记列表
    return http.get<GetNotesResponse>(`/users/${userId}/notes`);
  } else {
    // 尝试通过feed接口获取笔记详情
    // 由于单个笔记详情接口可能不存在，我们使用feed接口并通过ID筛选
    try {
      // 首先尝试直接获取笔记详情
      return await http.get<{ code: number; message: string; data: NoteDetail }>(`/notes/${noteId}`);
    } catch (error: unknown) {
      // 如果直接获取失败，尝试通过其他方式
      if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 404) {
        // 404错误，可能接口不存在，抛出更明确的错误
        throw new Error('笔记不存在或已被删除');
      }
      throw error;
    }
  }
};

/**
 * 获取用户笔记列表
 */
export const getUserNotes = async (userId: string, params?: GetNotesParams) => {
  return http.get<{ code: number; message: string; data: NoteListItem[] }>(`/users/${userId}/notes`, params);
};

/**
 * 获取笔记推荐流
 * 支持可选认证：未登录用户可通过x-tenant-id头访问
 */
interface NoteFeedResponse {
  code: number;
  message: string;
  data: {
    items: NoteRead[];
    total: number;
    skip: number;
    limit: number;
  };
}

export const getNoteFeed = async (params: { skip?: number; limit?: number } = {}) => {
  const requestParams = {
    skip: params.skip || 0,
    limit: params.limit || 20
  };

  return http.get<NoteFeedResponse>('/notes/feed', requestParams);
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
interface NoteAnalyticsData {
  views_by_day: { date: string; views: number }[];
  likes_by_day: { date: string; likes: number }[];
  comments_by_day: { date: string; comments: number }[];
  total_views: number;
  total_likes: number;
  total_comments: number;
  growth_rate: {
    views: number;
    likes: number;
    comments: number;
  };
}

export const getNoteAnalytics = async (noteId: string, days: number = 30) => {
  return http.get<{ code: number; message: string; data: NoteAnalyticsData }>(`/notes/${noteId}/analytics`, { days });
};

/**
 * 创建笔记
 */
export const createNote = async (noteData: CreateNoteRequest) => {
  return http.post<{ code: number; message: string; data: NoteDetail }>('/notes', noteData);
};

/**
 * 分享笔记
 */
interface ShareNoteResponse {
  code: number;
  message: string;
  data: {
    share_url: string;
    share_type: string;
    share_count: number;
    qr_code_url?: string;
  };
}

export const shareNote = async (noteId: string, shareType: 'link' | 'poster' | 'text' = 'link') => {
  // 根据API文档，share_type是必需的查询参数
  return http.post<ShareNoteResponse>(`/notes/${noteId}/share?share_type=${shareType}`);
};

export default {
  getNotes,
  getNoteDetail,
  getUserNotes, // 新增：获取用户笔记列表
  getNoteFeed,
  getNoteStats,
  getNoteAnalytics,
  createNote,
  toggleAction,
  shareNote,
};
