import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  CreateCommentRequest,
  Comment,
  CommentDetail,
  CommentUpdate,
} from "@/types/api/comment.d";
import {
  createComment as createCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  getComments,
} from "@/services/api/comment";
// 由于后端暂无 /users/{id} 用户详情接口，不进行远程查询，使用本地回退

const getFallbackUserInfo = (userId: string) => {
  const suffix = userId ? userId.slice(-8) : "匿名";
  return { nickname: `用户${suffix}`, avatar: "" };
};

// 获取评论列表的 Thunk - 使用树形接口
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (params: {
    resource_id: string;
    resource_type: string;
    parent_id?: string;
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_desc?: boolean;
    max_depth?: number;
    limit_per_level?: number;
  }, { rejectWithValue }) => {
    try {
      // 设置默认参数
      const apiParams: {
        resource_id: string;
        resource_type: string;
        parent_id?: string;
        skip: number;
        limit: number;
        sort_by: string;
        sort_desc: boolean;
        max_depth?: number;
        limit_per_level?: number;
      } = {
        resource_id: params.resource_id,
        resource_type: params.resource_type,
        skip: params.skip || 0,
        limit: params.limit || 20,
        sort_by: params.sort_by || 'created_at',
        sort_desc: params.sort_desc !== undefined ? params.sort_desc : true,
        max_depth: params.max_depth || 5,
        limit_per_level: params.limit_per_level || 10
      };

      if (params.parent_id && params.parent_id !== 'undefined' && params.parent_id !== 'null') {
        apiParams.parent_id = params.parent_id;
      }

      const response = await getComments(apiParams);

      // API返回的是 Comment[] 类型，我们需要转换为 CommentDetail[] 格式
      const commentData: Comment[] = response?.data || [];

      // 转换数据为 CommentDetail[] 格式
      const convertToCommentDetails = (comments: Comment[]): CommentDetail[] => {
        return comments.map(comment => {
          // 递归转换子评论
          const convertedChildren = comment.children ? convertToCommentDetails(comment.children) : [];

          const commentDetail: CommentDetail = {
            ...comment,
            // 转换字段名以匹配现有组件期望的格式
            created_at: comment.created_at,
            create_at: comment.created_at, // 兼容字段
            like_count: comment.likes_count || 0,
            has_liked: comment.has_liked || false,
            reply_count: convertedChildren.length,
            // 使用API返回的user信息
            author_nickname: comment.user?.nickname || comment.author_nickname || getFallbackUserInfo(comment.user_id).nickname,
            author_avatar: comment.user?.avatar || comment.author_avatar || getFallbackUserInfo(comment.user_id).avatar,
            // 递归转换子评论，确保子评论也有正确的用户信息
            children: convertedChildren
          };



          return commentDetail;
        });
      };

      return convertToCommentDetails(commentData);
    } catch (error: any) {
      
      return rejectWithValue(error.message || "Failed to fetch comments");
    }
  }
);

// 创建评论的 Thunk
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (params: CreateCommentRequest, { rejectWithValue, getState }) => {
    try {
      const response = await createCommentApi(params);
      const state = getState() as any;
      const currentUser = state?.user;
      const commentState = state?.comment;
      
      // 确保response.data存在
      const payload = (response.data || response) as any;
      
      // 查找被回复用户的昵称（如果是回复）
      let parentAuthorNickname = '';
      if (params.parent_id) {
        // 如果请求参数中已经包含了parent_author_nickname，直接使用
        if ((params as any).parent_author_nickname) {
          parentAuthorNickname = (params as any).parent_author_nickname;
        } else {
          // 否则在现有评论中查找父评论的作者昵称
          const findParentAuthor = (comments: CommentDetail[]): string => {
            for (const comment of comments) {
              if (comment.id === params.parent_id) {
                return comment.author_nickname || '';
              }
              if (comment.children && comment.children.length > 0) {
                const found = findParentAuthor(comment.children);
                if (found) return found;
              }
            }
            return '';
          };
          parentAuthorNickname = findParentAuthor(commentState?.comments || []);
        }
      }
      
      // 如果是当前用户，直接使用当前用户信息
      if (currentUser?.user?.id === payload?.user_id) {
        const normalized = {
          ...payload,
          // 统一字段
          created_at: payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
          create_at: payload?.create_at || payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
          like_count: payload?.like_count ?? payload?.likes_count ?? 0,
          has_liked: payload?.is_liked ?? payload?.has_liked ?? false,
          author_nickname: currentUser?.user?.nickname || '我',
          author_avatar: currentUser?.user?.avatar || '',
          parent_author_nickname: parentAuthorNickname,
        } as CommentDetail;
        return normalized;
      }

      // 否则查询用户信息
      const userInfo = getFallbackUserInfo(payload?.user_id);
      
      const normalized = {
        ...payload,
        // 统一字段
        created_at: payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
        create_at: payload?.create_at || payload?.created_at || payload?.update_time || payload?.create_time || new Date().toISOString(),
        like_count: payload?.like_count ?? payload?.likes_count ?? 0,
        has_liked: payload?.is_liked ?? payload?.has_liked ?? false,
        author_nickname: payload?.author_nickname ?? payload?.user?.nickname ?? userInfo.nickname,
        author_avatar: payload?.author_avatar ?? payload?.avatar ?? payload?.user?.avatar ?? userInfo.avatar,
        parent_author_nickname: parentAuthorNickname,
      } as CommentDetail;
      
      // 创建评论通知（如果不是给自己的帖子评论）
      if (params.resource_type === 'post' && currentUser?.user?.id) {
        // 需要获取帖子作者ID和标题
        // 这里我们通过参数传递或从 store 中获取
        const postAuthorId = (params as any).post_author_id;
        const postTitle = (params as any).post_title;

        if (postAuthorId && postTitle && postAuthorId !== currentUser.user.id) {
          
          
          // 导入通知工具类
          import('@/utils/notificationHelper').then(({ BBSNotificationHelper }) => {
            BBSNotificationHelper.handleCommentNotification({
              postId: params.resource_id,
              postTitle: postTitle,
              postAuthorId: postAuthorId,
              currentUserId: currentUser.user.id,
              commentContent: params.content
            }).then(() => {
              
            }).catch((_error) => {
              
            });
          }).catch((_error) => {
            
          });
        } else {
          
        }
      }
      
      return normalized;
    } catch (error: any) {
      
      return rejectWithValue(error.message || "Failed to create comment");
    }
  }
);

// 更新评论的 Thunk
export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, data }: { commentId: string; data: CommentUpdate }, { rejectWithValue }) => {
    try {
      const response = await updateCommentApi(commentId, data);
      return response.data; // 返回数据部分
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update comment");
    }
  }
);

// 删除评论的 Thunk
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (commentId: string, { rejectWithValue }) => {
    try {
      await deleteCommentApi(commentId);
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete comment");
    }
  }
);

export interface CommentState {
  // We can add a list to hold comments for a specific post
  comments: CommentDetail[];
  fetchStatus: "idle" | "pending" | "succeeded" | "failed";
  createStatus: "idle" | "pending" | "succeeded" | "failed";
  updateStatus: "idle" | "pending" | "succeeded" | "failed";
  deleteStatus: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  fetchStatus: "idle",
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
  error: null,
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取评论
      .addCase(fetchComments.pending, (state) => {
        state.fetchStatus = "pending";
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        // 数据已在thunk中处理完毕，直接使用
        state.comments = action.payload || [];
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.error = action.payload as string;
      })
      // 处理创建评论
      .addCase(createComment.pending, (state) => {
        state.createStatus = "pending";
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        const newComment = action.payload;
        
        // 如果是回复评论（有parent_id），需要添加到对应父评论的children中
        if (newComment.parent_id) {
          const addToParent = (comments: CommentDetail[]): boolean => {
            for (const comment of comments) {
              // 找到父评论
               if (comment.id === newComment.parent_id) {
                 if (!comment.children) {
                   comment.children = [];
                 }
                 comment.children.push(newComment);
                 // 更新父评论的回复数量
                 comment.reply_count = (comment.reply_count || 0) + 1;
                 return true;
               }
              // 递归查找子评论中的父评论
              if (comment.children && comment.children.length > 0) {
                if (addToParent(comment.children)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          // 尝试添加到父评论的children中
          const added = addToParent(state.comments);
          
          // 如果没有找到父评论，说明可能是数据不一致，仍然添加到顶级列表
          if (!added) {
            
            state.comments.push(newComment);
          }
        } else {
          // 顶级评论直接添加到列表中
          state.comments.push(newComment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload as string;
      })
      // 处理更新评论
      .addCase(updateComment.pending, (state) => {
        state.updateStatus = "pending";
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.comments.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.comments[index] = action.payload;
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload as string;
      })
      // 处理删除评论
      .addCase(deleteComment.pending, (state) => {
        state.deleteStatus = "pending";
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.comments = state.comments.filter(c => c.id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetCreateStatus } = commentSlice.actions;

export default commentSlice.reducer;
