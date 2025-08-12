import { GetCollectionParams, RemoveFromCollectionParams } from '@/types/api/collection.d';
import http from '../request';

const collectionApi = {
  // 获取收藏列表 - 使用已有的用户收藏接口
  getCollections: (params: GetCollectionParams = {}) => {
    console.log('[API] 获取收藏列表请求:', params);
    const requestParams = {
      page: params.page || 1,
      page_size: params.page_size || 10
    };
    return http.get('/wxapp/user/favorite', requestParams)
      .then(response => {
        console.log('[API] 获取收藏列表响应:', JSON.stringify(response));
        return response;
      })
      .catch(error => {
        console.error('[API] 获取收藏列表失败:', error);
        throw error;
      });
  },

  // 从收藏中移除
  removeFromCollection: (data: RemoveFromCollectionParams) => {
    console.log('[API] 移除收藏请求:', data);
    return http.post('/wxapp/action/toggle', {
      target_type: 'post',
      target_id: String(data.post_id),
      action_type: 'favorite'
    })
      .then(response => {
        console.log('[API] 移除收藏响应:', JSON.stringify(response));
        return response;
      })
      .catch(error => {
        console.error('[API] 移除收藏失败:', error);
        throw error;
      });
  }
};

export default collectionApi;
