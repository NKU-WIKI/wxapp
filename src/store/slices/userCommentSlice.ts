import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Taro from '@tarojs/taro';
import { userApi } from '@/services/api/user';
import postApi from '@/services/api/post';

// 定义API返回的评论项结构
interface ApiCommentItem {
  id: number;
  resource_id: number;
  resource_type: string;
  parent_id: number | null;
  user_id: number;
  openid: string | null;
  nickname: string | null;
  avatar: string | null;
  content: string;
  image: string | null;
  like_count: number;
  reply_count: number;
  status: number;
  is_deleted: number;
  create_time: string;
  update_time: string;
  post_title: string;
  post_author_nickname?: string; // 新增帖子作者昵称字段
  // 新增parent_comment字段
  parent_comment?: {
    id: number;
    content: string;
    author_nickname: string;
    create_time: string;
  } | null;
}

// 定义包含帖子信息的评论项
interface CommentWithPostInfo {
  id: number;
  post_id: number;
  content: string;
  create_time: string;
  like_count: number;
  reply_count: number;
  is_liked?: boolean;
  post_title: string;
  post_content: string;
  post_author_nickname?: string; // 新增帖子作者昵称字段
  post_image?: string | string[] | undefined;
  author_info?: {
    id: number;
    nickname: string;
    avatar: string;
  };
  // 新增字段用于区分评论类型
  parent_id: number | null;
  parent_comment_content?: string | null;
  parent_comment_author?: string | null;
  is_reply: boolean; // 是否为回复评论
}

// 定义状态类型
interface UserCommentState {
  items: CommentWithPostInfo[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    has_more: boolean;
  };
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// 初始状态
const initialState: UserCommentState = {
  items: [],
  pagination: {
    page: 1,
    page_size: 10,
    total: 0,
    has_more: false
  },
  loading: 'idle',
  error: null
};

// 获取用户评论列表的异步thunk
export const fetchUserComments = createAsyncThunk(
  'userComment/fetchUserComments',
  async (params: { page?: number; page_size?: number; isAppend?: boolean }, { rejectWithValue }) => {
    try {
      // 获取用户评论列表
      const response = await userApi.getUserComments({
        page: params.page || 1,
        page_size: params.page_size || 10
      });
      
      // 提取响应数据
      const responseData = response as any;
      const comments: ApiCommentItem[] = Array.isArray(responseData.data) ? responseData.data : [];
      const pagination = responseData.pagination || {
        page: params.page || 1,
        page_size: params.page_size || 10,
        total: 0,
        has_more: false
      };

      // 🔥 后端联调 - 打印用户评论列表原始数据
      console.log('🔥 用户评论列表 - 原始API响应:', responseData);
      console.log('🔥 用户评论列表 - 评论数量:', comments.length);

      // 如果没有评论数据，直接返回空数组
      if (!comments.length) {
        return {
          items: [],
          pagination,
          isAppend: params.isAppend || false
        };
      }

      // 将API数据转换为前端需要的格式
      const commentsWithPostInfo: CommentWithPostInfo[] = comments.map((comment) => {
        // 从后端返回的parent_comment字段中提取父评论信息
        const parentCommentContent = comment.parent_comment?.content || null;
        const parentCommentAuthor = comment.parent_comment?.author_nickname || null;
        
        // 🔥 如果是回复评论，打印父评论信息
        if (comment.parent_id && comment.parent_comment) {
          console.log(`✅ 回复评论信息:`, {
            commentId: comment.id,
            parentId: comment.parent_id,
            parentAuthor: parentCommentAuthor,
            parentContent: parentCommentContent?.substring(0, 50) + '...'
          });
        }
        
        return {
          id: comment.id,
          post_id: comment.resource_id, // API中是resource_id
          content: comment.content || '',
          create_time: comment.create_time || '',
          like_count: comment.like_count || 0,
          reply_count: comment.reply_count || 0,
          is_liked: false, // API没有返回，默认为false
          post_title: comment.post_title || '未知标题',
          post_content: '内容不可用', // API没有返回帖子内容
          post_author_nickname: comment.post_author_nickname || '', // 新增帖子作者昵称
          post_image: undefined,
          author_info: {
            id: comment.user_id || 0,
            nickname: comment.nickname || '未知用户',
            avatar: comment.avatar || ''
          },
          // 新增字段用于区分评论类型
          parent_id: comment.parent_id || null,
          parent_comment_content: parentCommentContent,
          parent_comment_author: parentCommentAuthor,
          is_reply: !!comment.parent_id // 如果parent_id存在，则为回复评论
        };
      });

      // 🔥 后端联调 - 打印转换后的数据
      console.log('🔥 用户评论列表 - 转换后的评论数据:', commentsWithPostInfo);
      console.log('🔥 用户评论列表 - 分页信息:', pagination);
       
      return {
        items: commentsWithPostInfo,
        pagination,
        isAppend: params.isAppend || false
      };
    } catch (error: any) {
      return rejectWithValue(error.message || '获取评论列表失败');
    }
  }
);

// 创建slice
const userCommentSlice = createSlice({
  name: 'userComment',
  initialState,
  reducers: {
    resetUserComments: (state) => {
      state.items = [];
      state.pagination = {
        page: 1,
        page_size: 10,
        total: 0,
        has_more: false
      };
      state.loading = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        
        if (action.payload.isAppend) {
          // 追加模式：添加新的评论项到现有列表
          state.items = [...state.items, ...action.payload.items];
        } else {
          // 替换模式：完全替换评论列表
          state.items = action.payload.items;
        }
        
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { resetUserComments } = userCommentSlice.actions;
export default userCommentSlice.reducer; 