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
    [property: string]: any;
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
    [property: string]: any;
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
export enum NoteStatus {
    Archived = "archived",
    Deleted = "deleted",
    Draft = "draft",
    Published = "published",
}

/**
 * 可见性枚举
 */
export enum Visibility {
    Friends = "FRIENDS",
    Private = "PRIVATE",
    Public = "PUBLIC",
} 