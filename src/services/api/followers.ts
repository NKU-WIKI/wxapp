import { GetFollowersParams, FollowersResponse, FollowActionParams, FollowActionResponse } from '@/types/api/followers.d';
import http from '../request';

// 获取关注/粉丝列表
export const getFollowers = (params: GetFollowersParams) => {
  console.log('[API] 获取关注/粉丝列表请求:', params);
  
  // 根据API文档，使用正确的端点
  const endpoint = params.type === 'following' 
    ? '/wxapp/user/me/following'  // 获取我的关注列表
    : '/wxapp/user/me/followers'; // 获取我的粉丝列表
  
  // 根据API文档，只需要page和page_size参数
  const requestParams: any = {
    page: params.page || 1,
    page_size: params.page_size || 10
  };
  
  console.log('[API] 实际请求参数:', requestParams);
  console.log('[API] 请求端点:', endpoint);
  
  return http.get(endpoint, requestParams)
    .then(response => {
      console.log('[API] 获取关注/粉丝列表响应:', JSON.stringify(response));
      return response;
    })
    .catch(error => {
      console.error('[API] 获取关注/粉丝列表失败:', error);
      throw error;
    });
};

// 关注/取关用户
export const followAction = (data: FollowActionParams) => {
  console.log('[API] 关注/取关请求:', data);
  return http.post('/wxapp/action/toggle', {
    target_type: 'user',
    target_id: data.target_user_id, // 根据API文档，应该是openid，但从关注列表获取的是数字ID，先尝试数字ID
    action_type: 'follow'
  })
    .then(response => {
      console.log('[API] 关注/取关响应:', JSON.stringify(response));
      if (response.code === 200) {
        return response;
      } else {
        throw new Error((response as any).message || '操作失败');
      }
    })
    .catch(error => {
      console.error('[API] 关注/取关失败:', error);
      // 如果是400错误且提示target_id格式问题，可能需要使用openid而不是数字ID
      if (error.message && error.message.includes('target_id')) {
        console.warn('[API] 可能需要使用openid而不是数字ID作为target_id');
      }
      throw error;
    });
};

const followersApi = {
  getFollowers,
  followAction
};

export default followersApi;
