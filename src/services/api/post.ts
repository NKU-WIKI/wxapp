import Taro from "@tarojs/taro";
import {
  Post,
  GetForumPostsParams,
  CreateForumPostRequest,
  GetFeedParams, GetHotPostsParams, PostHotRanking,
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
 * 根据ID获取单个帖子详情（完全静默模式，不显示任何错误）
 * 用于用户收藏/点赞/评论列表中的帖子信息获取
 * 完全绕过Taro拦截器，避免404错误在控制台显示
 */
export const getPostByIdSilent = (postId: string) => {
  return new Promise<{ code: number; data?: Post; message?: string }>((resolve) => {
    // 使用微信小程序原生API，完全绕过Taro拦截器
    if (typeof wx !== 'undefined') {
      const BASE_URL = process.env.BASE_URL;
      const getToken = () => Taro.getStorageSync("token") || null;

      // 获取默认租户ID的函数
      const getDefaultTenantId = () => {
        try {
          const store = require("@/store").default;
          const state = store.getState();
          const aboutInfo = state.user.aboutInfo;

          if (aboutInfo?.tenants) {
            const tenantId = aboutInfo.tenants["南开大学"];
            if (tenantId) return tenantId;
          }

          const cachedAboutInfo = Taro.getStorageSync("aboutInfo");
          if (cachedAboutInfo?.tenants) {
            const tenantId = cachedAboutInfo.tenants["南开大学"];
            if (tenantId) return tenantId;
          }

          return "f6303899-a51a-460a-9cd8-fe35609151eb"; // 默认南开大学租户ID
        } catch (error) {
          return "f6303899-a51a-460a-9cd8-fe35609151eb";
        }
      };

      const token = getToken();
      const headers: Record<string, string> = {
        'content-type': 'application/json',
        'X-Branch': 'dev'
      };

      if (!token) {
        headers['x-tenant-id'] = getDefaultTenantId();
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const finalUrl = `${BASE_URL}/api/v1/forums/posts/${postId}`;

      // 使用微信小程序原生request API，完全绕过拦截器
      wx.request({
        url: finalUrl,
        method: 'GET',
        header: headers,
        success: (res: any) => {
          if (res.statusCode === 200) {
            const responseData = res.data;
            if (responseData.code === 0) {
              resolve(responseData);
            } else {
              resolve({ code: responseData.code, message: responseData.msg || responseData.message });
            }
          } else if (res.statusCode === 404) {
            // 静默处理404，不输出任何错误信息
            resolve({ code: 404, message: 'Post not found' });
          } else {
            // 其他HTTP错误也静默处理
            resolve({ code: res.statusCode, message: 'Request failed' });
          }
        },
        fail: () => {
          // 静默处理网络错误
          resolve({ code: 500, message: 'Network error' });
        }
      });
    } else {
      // 如果不在微信小程序环境中，降级使用Taro请求（开发环境）
      const finalUrl = `/forums/posts/${postId}`;

      Taro.request({
        url: `${process.env.BASE_URL}/api/v1${finalUrl}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            const responseData = res.data as any;
            if (responseData.code === 0) {
              resolve(responseData);
            } else {
              resolve({ code: responseData.code, message: responseData.msg || responseData.message });
            }
          } else if (res.statusCode === 404) {
            resolve({ code: 404, message: 'Post not found' });
          } else {
            resolve({ code: res.statusCode, message: 'Request failed' });
          }
        },
        fail: () => {
          resolve({ code: 500, message: 'Network error' });
        }
      });
    }
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

/**
 * 获取热门帖子列表
 * @param params 查询参数
 * @returns 热门帖子列表
 */
export const getHotPostList = (params?: GetHotPostsParams) => {
  const raw = Taro.getStorageSync('token');
  const token = raw ? raw.replace(/^Bearer\s+/i, '') : '';
  
  return http.get<PostHotRanking[]>("/forums/hot-posts", params,{
    header: token ? { Authorization: `Bearer ${token}` } : {}
  });
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
  getHotPostList
};

export default postApi;
