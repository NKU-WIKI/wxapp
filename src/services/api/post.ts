import {
  Post,
  GetForumPostsParams,
  CreateForumPostRequest,
  GetFeedParams,
} from "@/types/api/post.d";
import { API } from "@/types/api/recommend";
import http from "../request";

/**
 * 获取论坛帖子列表
 * @param params 包含分类ID和分页参数
 * @returns
 */
export const getForumPosts = (params: GetForumPostsParams) => {
  return http.get<Post[]>("/forums/posts", params);
};

/**
 * 获取帖子列表（别名函数，为了兼容现有代码）
 * @param params 包含分页参数
 * @returns
 */
export const getPosts = (params: any) => {
  return http.get<Post[]>("/forums/posts", params);
};

/**
 * 根据ID获取单个帖子详情
 */
export const getPostById = (postId: string) => {
  return http.get<Post>(`/forums/posts/${postId}`);
};

/**
 * 根据ID获取单个帖子详情（静默模式，不显示404错误）
 * 用于用户收藏/点赞/评论列表中的帖子信息获取
 */
export const getPostByIdSilent = (postId: string) => {
  return new Promise<{ code: number; data?: Post; message?: string }>((resolve) => {
    http.get<Post>(`/forums/posts/${postId}`)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        // 静默处理404错误，不抛出异常
        if (error?.statusCode === 404 || error?.status === 404) {
          resolve({ code: 404, message: 'Post not found' });
        } else {
          // 对于其他错误，仍然返回错误信息但不抛出异常
          resolve({ code: error?.code || 500, message: error?.message || 'Unknown error' });
        }
      });
  });
};

/**
 * 获取帖子详情（别名）
 */
export const getPostDetail = (postId: string) => {
  return getPostById(postId);
};

/**
 * 创建论坛帖子
 * @param data 包含标题、内容和状态
 * @returns
 */
export const createForumPost = (data: CreateForumPostRequest) => {
  return http.post<Post>("/forums/posts", data);
};

/**
 * 更新帖子
 * @param postId 帖子ID
 * @param data 要更新的数据
 * @returns
 */
export const updatePost = (postId: string, data: any) => { // Using 'any' for PostUpdate type temporarily
  return http.put<Post>(`/forums/posts/${postId}`, data);
};

/**
 * 删除帖子
 * @param postId 帖子ID
 * @returns
 */
export const deletePost = (postId: string) => {
  return http.delete<any>(`/forums/posts/${postId}`); // Assuming standard success response
};

/**
 * 获取我的草稿箱列表
 * @returns
 */
export const getMyDrafts = () => {
  return http.get<Post[]>("/forums/me/drafts").then(response => {
    if (Array.isArray(response?.data)) {
      // 过滤出真正的草稿
      const drafts = response.data.filter((item: any) => item?.status === 'draft');
      return {
        ...response,
        data: drafts
      };
    }
    return response;
  });
};

/**
 * 删除服务端草稿
 * 使用统一的帖子删除接口，因为草稿和帖子使用相同的数据结构
 */
export const deleteDraft = (draftId: string) => {
  return http.delete<any>(`/forums/posts/${draftId}`);
};
/**
 * 给帖子添加一个标签
 */
export const addPostTag = (postId: string, tagName: string) => {
  return http.post<any>(`/forums/posts/${postId}/tags`, { tag_name: tagName });
};
/**
 * 获取某个帖子的标签列表
 */
export const getPostTags = (postId: string) => {
  return http.get<any[]>(`/forums/posts/${postId}/tags`);
};
/**
 * 删除所有草稿
 */
export const clearAllDrafts = () => {
  // 如果后端无批量删除端点，前端可以先获取列表逐个删除
  return getMyDrafts().then(async (resp) => {
    const list = Array.isArray(resp.data) ? resp.data : [];
    for (const d of list) {
      try { 
        await deleteDraft((d as any).id);
      } catch {}
    }
    return { code: 0 } as any;
  });
};

/**
 * 获取社区动态信息流
 * @param params 分页参数
 * @returns
 */
export const getFeed = (params: GetFeedParams) => {
  // 使用相同的forums/posts端点获取信息流
  return http.get<Post[]>("/forums/posts", params);
};

/**
 * 获取帖子Feed
 * @param params 分页参数
 * @returns 帖子Feed列表
 */
export const getPostsFeed = (params: GetFeedParams) => {
  return http.get<Post[]>("/forums/posts/feed", params);
};

/**
 * 生成AI帖子Feed
 * @param topic 话题
 * @returns 生成的帖子Feed列表
 */
export const generatePostsFeed = (topic: string) => {
  return http.post<Post[]>("/forums/posts/feed/generate", { topic });
};

/**
 * 获取推荐帖子
 * @param params 推荐参数
 * @returns 推荐帖子列表
 */
export const getRecommendPosts = (params: API.RecommendParams) => {
  return http.get<Post[]>("/forums/posts/recommend", params);
};

// 默认导出对象，包含所有API函数
const postApi = {
  getForumPosts,
  getPosts,
  getPostById,
  getPostByIdSilent,
  createForumPost,
  updatePost,
  deletePost,
  getMyDrafts,
  deleteDraft,
  addPostTag,
  getPostTags,
  clearAllDrafts,
  getFeed,
  getPostsFeed,
  generatePostsFeed,
  getRecommendPosts,
};

export default postApi;
