/**
 * NoteListItem，笔记列表项
 */
export interface NoteListItem {
  /**
   * Allow Comment，是否允许评论
   */
  allow_comment?: boolean;
  /**
   * Allow Share，是否允许转发
   */
  allow_share?: boolean;
  /**
   * Author Avatar，作者头像
   */
  author_avatar?: null | string;
  /**
   * Author Name，作者名称
   */
  author_name?: null | string;
  /**
   * Comment Count，评论次数
   */
  comment_count?: number;
  /**
   * Content，笔记内容摘要
   */
  content?: null | string;
  /**
   * Created At，创建时间
   */
  created_at: Date;
  /**
   * Id，笔记ID
   */
  id: string;
  /**
   * Images，图片URL列表
   */
  images?: string[] | null;
  /**
   * Like Count，点赞次数
   */
  like_count?: number;
  /**
   * Location，位置信息
   */
  location?: null | string;
  /**
   * Published At，发布时间
   */
  published_at?: Date | null;
  /**
   * Share Count，分享次数
   */
  share_count?: number;
  /**
   * 笔记状态
   */
  status: NoteStatus;
  /**
   * Tags，标签列表
   */
  tags?: string[] | null;
  /**
   * Category Id，分类ID
   */
  category_id?: string;
  /**
   * Title，笔记标题
   */
  title: string;
  /**
   * Updated At，更新时间
   */
  updated_at: Date;
  /**
   * View Count，浏览次数
   */
  view_count?: number;
  /**
   * 可见性
   */
  visibility: Visibility;
  /**
   * User，用户信息对象
   */
  user?: {
    id: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
    nickname: string;
    avatar: string;
    bio: string;
    birthday: string | null;
    school: string | null;
    college: string | null;
    location: string | null;
    wechat_id: string | null;
    qq_id: string | null;
    tel: string | null;
    status: string;
  };
  /**
   * User Id，用户ID（兼容旧版本）
   */
  user_id?: string;
  [property: string]: unknown;
}

/**
 * NoteDetail，笔记详情
 */
export interface NoteDetail {
  /**
   * Id，笔记ID
   */
  id: string;
  /**
   * Title，笔记标题
   */
  title: string;
  /**
   * Content，笔记内容
   */
  content: string;
  /**
   * Images，图片URL列表
   */
  images?: string[] | null;
  /**
   * Tags，标签列表
   */
  tags?: string[] | null;
  /**
   * Location，位置信息
   */
  location?: string | null;
  /**
   * Visibility，可见性
   */
  visibility: Visibility;
  /**
   * Allow Comment，是否允许评论
   */
  allow_comment?: boolean;
  /**
   * Allow Share，是否允许转发
   */
  allow_share?: boolean;
  /**
   * Status，笔记状态
   */
  status: NoteStatus;
  /**
   * Created At，创建时间
   */
  created_at: string;
  /**
   * Updated At，更新时间
   */
  updated_at: string;
  /**
   * Published At，发布时间
   */
  published_at?: string | null;
  /**
   * View Count，浏览次数
   */
  view_count?: number;
  /**
   * Like Count，点赞次数
   */
  like_count?: number;
  /**
   * Comment Count，评论次数
   */
  comment_count?: number;
  /**
   * Share Count，分享次数
   */
  share_count?: number;
  /**
   * User，用户信息对象
   */
  user?: {
    id: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
    nickname: string;
    avatar: string;
    bio: string;
    birthday: string | null;
    school: string | null;
    college: string | null;
    location: string | null;
    wechat_id: string | null;
    qq_id: string | null;
    tel: string | null;
    status: string;
  };
  /**
   * Author，作者信息（兼容旧版本）
   */
  author?: {
    id: string;
    nickname: string;
    avatar: string;
    level?: number;
    bio?: string;
  };
  /**
   * Is Liked，是否已点赞
   */
  is_liked?: boolean;
  /**
   * Is Favorited，是否已收藏
   */
  is_favorited?: boolean;
  [property: string]: unknown;
}

/**
 * CreateNoteRequest，创建笔记请求
 */
export interface CreateNoteRequest {
  /**
   * Title，笔记标题
   */
  title: string;
  /**
   * Content，笔记内容
   */
  content: string;
  /**
   * Images，图片URL列表
   */
  images?: string[];
  /**
   * Tags，标签列表
   */
  tags?: string[];
  /**
   * Location，位置信息
   */
  location?: string;
  /**
   * Visibility，可见性
   */
  visibility?: Visibility;
  /**
   * Allow Comment，是否允许评论
   */
  allow_comment?: boolean;
  /**
   * Allow Share，是否允许转发
   */
  allow_share?: boolean;
}

/**
 * GetNotesParams，获取笔记列表参数
 */
export interface GetNotesParams {
  /**
   * Skip，跳过数量
   */
  skip?: number;
  /**
   * Limit，限制数量
   */
  limit?: number;
  /**
   * Search，搜索关键词
   */
  search?: string;
  /**
   * Tags，标签过滤
   */
  tags?: string[];
  /**
   * Status，状态过滤
   */
  status?: NoteStatus;
  /**
   * Visibility，可见性过滤
   */
  visibility?: Visibility;
}

/**
 * 笔记状态枚举
 */
/* eslint-disable no-unused-vars */
export enum NoteStatus {
  Archived = 'archived',
  Deleted = 'deleted',
  Draft = 'draft',
  Published = 'published',
}
/* eslint-enable no-unused-vars */

/**
 * 可见性枚举
 */
/* eslint-disable no-unused-vars */
export enum Visibility {
  Friends = 'FRIENDS',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
}
/* eslint-enable no-unused-vars */

/**
 * NoteRead，笔记读取模型
 */
export interface NoteRead {
  /**
   * Allow Comment，是否允许评论
   */
  allow_comment?: boolean;
  /**
   * Allow Share，是否允许转发
   */
  allow_share?: boolean;
  /**
   * 分类信息
   */
  category?: null | NoteCategoryRead;
  /**
   * Comment Count，评论数
   */
  comment_count?: number;
  /**
   * Content，笔记内容
   */
  content?: null | string;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Excerpt，手动摘录
   */
  excerpt?: null | string;
  /**
   * Favorite Count，收藏数
   */
  favorite_count?: number;
  /**
   * Featured Weight，精选权重
   */
  featured_weight?: number;
  /**
   * Id
   */
  id: string;
  /**
   * Images，图片URL列表
   */
  images?: string[] | null;
  /**
   * Is Favorited，当前用户是否收藏
   */
  is_favorited?: boolean;
  /**
   * Is Featured，是否精选
   */
  is_featured?: boolean;
  /**
   * Is Liked，当前用户是否点赞
   */
  is_liked?: boolean;
  /**
   * Last Read At，最后阅读时间
   */
  last_read_at?: Date | null;
  /**
   * Like Count，点赞数
   */
  like_count?: number;
  /**
   * 链接信息
   */
  link_info?: null | AppsapiV1SchemasNoteLinkInfoRead;
  /**
   * Link Info Id，链接信息ID
   */
  link_info_id?: null | string;
  /**
   * Location，位置信息
   */
  location?: null | string;
  /**
   * Mentioned Users，提及的用户ID列表（支持字符串或UUID格式）
   */
  mentioned_users?: string[] | null;
  /**
   * Parent Note Id，父版本ID
   */
  parent_note_id?: null | string;
  /**
   * Published At，发布时间
   */
  published_at?: Date | null;
  /**
   * Reading Time Minutes，预计阅读时间
   */
  reading_time_minutes?: number;
  /**
   * Share Count，分享数
   */
  share_count?: number;
  /**
   * 笔记状态
   */
  status: NoteStatus;
  /**
   * Summary，内容摘要
   */
  summary?: null | string;
  /**
   * Tags，标签列表
   */
  tags?: string[] | null;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Title，笔记标题
   */
  title: string;
  /**
   * Updated At
   */
  updated_at: Date;
  /**
   * 用户信息
   */
  user?: null | UserRead;
  /**
   * User Id，用户ID
   */
  user_id: string;
  /**
   * Version，版本号
   */
  version?: number;
  /**
   * View Count，浏览量
   */
  view_count?: number;
  /**
   * 可见性
   */
  visibility: Visibility;
  /**
   * Word Count，字数统计
   */
  word_count?: number;
  [property: string]: unknown;
}

/**
 * NoteCategoryRead，笔记分类读取模型
 */
export interface NoteCategoryRead {
  /**
   * Color，分类颜色
   */
  color?: null | string;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Description，分类描述
   */
  description?: null | string;
  /**
   * Icon Url，分类图标
   */
  icon_url?: null | string;
  /**
   * Id
   */
  id: string;
  /**
   * Is Active，是否启用
   */
  is_active?: boolean;
  /**
   * Is System，是否系统分类
   */
  is_system?: boolean;
  /**
   * Level，分类层级
   */
  level?: number;
  /**
   * Name，分类名称
   */
  name: string;
  /**
   * Note Count，笔记数量
   */
  note_count?: number;
  /**
   * 父分类
   */
  parent?: null | NoteCategoryRead;
  /**
   * Parent Id，父分类ID
   */
  parent_id?: null | string;
  /**
   * Sort Order，排序权重
   */
  sort_order?: number | null;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Total Likes，总点赞数
   */
  total_likes?: number;
  /**
   * Total Views，总浏览量
   */
  total_views?: number;
  /**
   * Updated At
   */
  updated_at: Date;
}

/**
 * UserRead，用户读取模型，支持完整和简化两种模式
 */
export interface UserRead {
  /**
   * Avatar
   */
  avatar?: null | string;
  /**
   * Bio
   */
  bio?: null | string;
  /**
   * Birthday
   */
  birthday?: Date | null;
  /**
   * College
   */
  college?: null | string;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Id
   */
  id: string;
  /**
   * Level
   */
  level?: number | null;
  /**
   * Location
   */
  location?: null | string;
  /**
   * Nickname
   */
  nickname: string;
  /**
   * Qq Id
   */
  qq_id?: null | string;
  /**
   * School
   */
  school?: null | string;
  status: UserStatus;
  /**
   * Tel
   */
  tel?: null | string;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Updated At
   */
  updated_at: Date;
  /**
   * Wechat Id
   */
  wechat_id?: null | string;
}

/**
 * UserStatus，用户状态枚举。
 *
 * ACTIVE: 正常用户，可以登录和使用所有功能
 * INACTIVE: 未激活用户，可能是注册后未验证邮箱
 * BANNED: 被禁用户，无法登录和使用功能
 */
/* eslint-disable no-unused-vars */
export enum UserStatus {
  Active = 'active',
  Banned = 'banned',
  Inactive = 'inactive',
}
/* eslint-enable no-unused-vars */

/**
 * LinkInfoRead，链接信息读取模型
 */
export interface AppsapiV1SchemasNoteLinkInfoRead {
  /**
   * Access Count，访问次数
   */
  access_count?: number;
  /**
   * Content Length，内容长度
   */
  content_length?: number | null;
  /**
   * Content Type，MIME类型
   */
  content_type?: null | string;
  /**
   * Created At
   */
  created_at: Date;
  /**
   * Description，页面描述
   */
  description?: null | string;
  /**
   * Domain，域名
   */
  domain?: null | string;
  /**
   * Favicon Url，网站图标
   */
  favicon_url?: null | string;
  /**
   * Http Status Code，HTTP状态码
   */
  http_status_code?: number | null;
  /**
   * Id
   */
  id: string;
  /**
   * Last Accessed At，最后访问时间
   */
  last_accessed_at?: Date | null;
  /**
   * Last Validated At，最后验证时间
   */
  last_validated_at?: Date | null;
  /**
   * Link Type，链接类型
   */
  link_type?: string;
  /**
   * Metadata，扩展元数据
   */
  metadata?: Record<string, unknown> | null;
  /**
   * Original Url，原始URL
   */
  original_url: string;
  /**
   * Processed Url，处理后URL
   */
  processed_url?: null | string;
  /**
   * Screenshot Url，截图URL
   */
  screenshot_url?: null | string;
  /**
   * 链接状态
   */
  status: LinkStatus;
  /**
   * Tenant Id
   */
  tenant_id: string;
  /**
   * Title，页面标题
   */
  title?: null | string;
  /**
   * Updated At
   */
  updated_at: Date;
  /**
   * Validation Error，验证错误信息
   */
  validation_error?: null | string;
}

/**
 * 链接状态
 *
 * LinkStatus，链接状态枚举
 */
/* eslint-disable no-unused-vars */
export enum LinkStatus {
  Expired = 'expired',
  Invalid = 'invalid',
  Pending = 'pending',
  Valid = 'valid',
}
/* eslint-enable no-unused-vars */
