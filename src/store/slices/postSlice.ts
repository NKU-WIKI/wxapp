import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { PaginatedData } from "@/types/api/common";
import {
  Post,
  GetForumPostsParams,
  CreateForumPostRequest,
  GetFeedParams,
  PostUpdate,
} from "@/types/api/post";
import {
  getForumPosts,
  createForumPost,
  getFeed,
  updatePost as updatePostApi,
  deletePost as deletePostApi,
  getMyDrafts,
  getPostDetail,
} from "@/services/api/post";
import { toggleAction } from "./actionSlice"; // 从 actionSlice 导入

// 获取论坛帖子的 Thunk
export const fetchForumPosts = createAsyncThunk(
  "posts/fetchForumPosts",
  async (params: GetForumPostsParams, { rejectWithValue }) => {
    try {
      const response = await getForumPosts(params);
      return {
        items: response.data, // API returns { code, message, data: Post[] }
        pagination: {
          skip: params.skip || 0,
          limit: params.limit || 20,
          total: response.data.length, // Approximate total from current response
          has_more: response.data.length === (params.limit || 20), // Has more if returned count equals limit
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch forum posts");
    }
  }
);

// 获取社区动态信息流的 Thunk
export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async (params: GetFeedParams, { rejectWithValue }) => {
    try {
      const response = await getFeed(params);
      return {
        items: response.data, // The API returns array data
        pagination: {
          skip: params.skip || 0,
          limit: params.limit || 20,
          total: response.data.length,
          has_more: response.data.length === (params.limit || 20),
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch feed");
    }
  }
);

// 创建论坛帖子的 Thunk
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: CreateForumPostRequest, { rejectWithValue }) => {
    try {
      const response = await createForumPost(postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create post");
    }
  }
);

// 更新帖子的 Thunk
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, data }: { postId: number; data: PostUpdate }, { rejectWithValue }) => {
    try {
      const response = await updatePostApi(postId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update post");
    }
  }
);

// 删除帖子的 Thunk
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: number, { rejectWithValue }) => {
    try {
      await deletePostApi(postId);
      return postId; // Return the id to remove from the list
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete post");
    }
  }
);

// 获取帖子详情的 Thunk
export const fetchPostDetail = createAsyncThunk(
  "posts/fetchPostDetail",
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await getPostDetail(postId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch post detail");
    }
  }
);

// 获取草稿箱的 Thunk
export const fetchDrafts = createAsyncThunk(
  "posts/fetchDrafts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyDrafts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch drafts");
    }
  }
);

export interface PostsState {
  list: Post[];
  currentPost: Post | null;
  pagination: PaginatedData<Post>["pagination"] | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  detailLoading: "idle" | "pending" | "succeeded" | "failed";
  error: any;
}

const initialState: PostsState = {
  list: [],
  currentPost: null,
  pagination: null,
  loading: "idle",
  detailLoading: "idle",
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Forum Posts
      .addCase(fetchForumPosts.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(fetchForumPosts.fulfilled, (state, action) => {
        state.loading = "succeeded";
        if (action.payload && action.payload.items) {
          // 刷新时保留用户交互状态：合并新数据与现有交互状态
          const existingPostsMap = new Map(state.list.map(post => [post.id, post]));
          state.list = action.payload.items.map(newPost => {
            const existingPost = existingPostsMap.get(newPost.id);
            if (existingPost) {
              // 保留用户交互状态，使用新数据更新其他字段
              return {
                ...newPost,
                is_liked: existingPost.is_liked,
                like_count: existingPost.like_count,
                is_favorited: existingPost.is_favorited,
                favorite_count: existingPost.favorite_count,
                is_following_author: existingPost.is_following_author
              };
            }
            return newPost;
          });
        }
        if (action.payload && action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchForumPosts.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = "succeeded";
        if (action.payload && action.payload.items) {
          // Based on new logic, feed might be replacing or appending
          if (action.payload.pagination && action.payload.pagination.skip > 0) {
            // If it's not the first page (skip > 0), append
            state.list = [...state.list, ...action.payload.items];
          } else {
            // 刷新时保留用户交互状态：合并新数据与现有交互状态
            const existingPostsMap = new Map(state.list.map(post => [post.id, post]));
            state.list = action.payload.items.map(newPost => {
              const existingPost = existingPostsMap.get(newPost.id);
              if (existingPost) {
                // 保留用户交互状态，使用新数据更新其他字段
                return {
                  ...newPost,
                  is_liked: existingPost.is_liked,
                  like_count: existingPost.like_count,
                  is_favorited: existingPost.is_favorited,
                  favorite_count: existingPost.favorite_count,
                  is_following_author: existingPost.is_following_author
                };
              }
              return newPost;
            });
          }
        }
        if (action.payload && action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Fetch Post Detail
      .addCase(fetchPostDetail.pending, (state) => {
        state.detailLoading = "pending";
      })
      .addCase(fetchPostDetail.fulfilled, (state, action) => {
        state.detailLoading = "succeeded";
        state.currentPost = action.payload;
      })
      .addCase(fetchPostDetail.rejected, (state, action) => {
        state.detailLoading = "failed";
        state.error = action.payload as string;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = "succeeded";
        // 可选：将新帖子添加到列表顶部
        state.list.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.list.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentPost && state.currentPost.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload);
        if (state.currentPost && state.currentPost.id === action.payload) {
          state.currentPost = null;
        }
      })
      // Fetch Drafts
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        // Assuming drafts are loaded into the main list for simplicity
        // A separate state for drafts might be better
        state.list = action.payload;
      })
      // Listen for the toggleAction from actionSlice
      .addCase(toggleAction.fulfilled, (state, action) => {
        const { request, is_active, count } = action.payload;
        const { target_id, action_type, target_type } = request;

        const updatePostState = (post: Post) => {
          if (target_type === "post") {
            if (action_type === "like") {
              post.is_liked = is_active;
              // 使用API返回的count字段更新点赞数量，如果没有则手动计算
              if (count !== undefined) {
                post.like_count = count;
              } else {
                // 手动计算点赞数量
                post.like_count = (post.like_count || 0) + (is_active ? 1 : -1);
              }
            } else if (action_type === "favorite") {
              post.is_favorited = is_active;
              // 使用API返回的count字段更新收藏数量，如果没有则手动计算
              if (count !== undefined) {
                post.favorite_count = count;
              } else {
                // 手动计算收藏数量
                post.favorite_count = (post.favorite_count || 0) + (is_active ? 1 : -1);
              }
            }
          }
          if (target_type === "user" && action_type === "follow") {
            if (post.user.id === target_id) {
              post.is_following_author = is_active;
            }
          }
        };

        // 根据不同 target_type 精准更新
        if (target_type === "post") {
          const postInList = state.list.find((p) => p.id === target_id);
          if (postInList) updatePostState(postInList);
          if (state.currentPost && state.currentPost.id === target_id) {
            updatePostState(state.currentPost);
          }
        }

        if (target_type === "user" && action_type === "follow") {
          // 更新列表中所有由该作者发布的帖子
          state.list.forEach((p) => {
            if (p.user && p.user.id === target_id) {
              updatePostState(p);
            }
          });
          // 更新详情
          if (
            state.currentPost &&
            state.currentPost.user &&
            state.currentPost.user.id === target_id
          ) {
            updatePostState(state.currentPost);
          }
        }
      });
  },
});

export default postsSlice.reducer;
