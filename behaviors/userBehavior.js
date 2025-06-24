const { storage, createApiClient } = require('../utils/util');

// 使用createApiClient创建统一的用户API
const userApi = createApiClient('/api/wxapp/user', {
  profile: { method: 'GET',  path: '/profile', params: { openid: true } },
  update:  { method: 'POST', path: '/update',  params: { openid: true } },
  follow:  { method: 'POST', path: '/follow',  params: { follower_id: true, followed_id: true } },
  status:  { method: 'GET',  path: '/status',  params: { openid: true, target_id: true, target_openid: false } },
  list:    { method: 'GET',  path: '/list',    params: {} }
});

module.exports = Behavior({
  
  methods: {
    // ==== 数据获取 ====

    /**
     * 获取用户列表，支持所有用户、粉丝、关注列表
     * @param {Object} filter - 筛选条件
     * @param {string} filter.type - 列表类型：all(所有用户)、follower(粉丝)、following(关注)
     * @param {string} filter.openid - 用户openid（当type为follower或following时必填）
     * @param {number} page - 页码，默认1
     * @param {number} page_size - 每页数量，默认10
     * @returns {Promise<Object>} API响应
     */
    async _getUserList(filter = {}, page = 1, page_size = 10) {
      // 构建查询参数
      const params = { page, page_size };
      
      // 如果filter是对象，提取支持的参数
      if (typeof filter === 'object') {
        // 支持type参数：all, follower, following
        if (filter.type) {
          params.type = filter.type;
        }
        
        // 支持openid参数
        if (filter.openid) {
          params.openid = filter.openid;
        }
      }
      
      try {
        const res = await userApi.list(params);
        if (res.code !== 200) {
          throw new Error(res.message || '获取用户列表失败');
        }
        
        // 处理分页数据，确保返回标准格式
        const result = {
          data: res.data || [],
          pagination: res.pagination || {
            total: res.total || 0,
            page: page,
            page_size: page_size,
            total_pages: Math.ceil((res.total || 0) / page_size) || 0,
            has_more: res.has_more !== undefined ? res.has_more : 
              ((page * page_size) < (res.total || 0))
          }
        };
        
        return result;
      } catch (err) {
        console.debug('获取用户列表失败:', err);
        throw err;
      }
    },

    /**
     * 获取指定openid的用户公开信息
     * @param {string} targetOpenid - 要获取信息的用户openid
     * @returns {Promise<object|null>} 用户信息或 null
     */
    async _getUserProfileByOpenid(targetOpenid) {
      if (!targetOpenid) return null;
      try {
        const res = await userApi.profile({
          openid: targetOpenid
        });
        if (res.code !== 200) throw new Error(res.message || '获取用户信息失败');
        return res.data;
      } catch (err) {
        console.debug('获取用户信息失败:', err);
        return null;
      }
    },

    /**
     * 根据帖子获取作者信息并补充到帖子对象
     * @param {object} post - 帖子对象
     * @returns {Promise<object>} 补充了作者信息的帖子对象
     */
    async _enrichPostWithUserInfo(post) {
      if (!post || !post.openid) return post;
      
      try {
        const userInfo = await this._getUserProfileByOpenid(post.openid);
        if (userInfo) {
          return {
            ...post,
            bio: userInfo.bio,
            // 其他可能需要的用户信息字段
          };
        }
      } catch (err) {
        console.debug('补充作者信息失败:', err);
      }
      
      return post;
    },

    /**
     * 获取当前用户与目标用户的关系状态 (如是否关注)
     * @param {string} targetUserId - 目标用户ID
     * @returns {Promise<object|null>} 关系状态或 null
     */
    async _getUserStatus(targetUserId) {
      if (!targetUserId) return null;
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        const res = await userApi.status({ openid, target_id: targetUserId });
        return res.code === 200 ? res.data : null;
      } catch (err) {
        console.debug('获取用户关系状态失败:', err);
        return null;
      }
    },

    /**
     * 获取当前用户与目标用户的关系状态(使用openid)
     * @param {string} targetOpenid - 目标用户openid
     * @returns {Promise<object|null>} 关系状态或 null
     */
    async _getUserStatusByOpenid(targetOpenid) {
      if (!targetOpenid) return null;
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        const res = await userApi.status({ openid, target_openid: targetOpenid });
        return res.code === 200 ? res.data : null;
      } catch (err) {
        console.debug('获取用户关系状态失败:', err);
        return null;
      }
    },

    // ==== 用户操作 ====

    /**
     * 更新当前登录用户的资料
     * @param {object} profileData - 需要更新的字段对象
     * @returns {Promise<object|null>} 更新后的用户信息或 null
     */
    async _updateUserProfile(profileData) {
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        console.debug('更新用户资料, 数据:', JSON.stringify(profileData));
        const res = await userApi.update({ ...profileData, openid });
        if (res.code !== 200) throw new Error(res.message || '更新资料失败');

        const updatedUserInfo = res.data;
        
        // 确保更新的头像URL被正确保存
        if (profileData.avatar && (!updatedUserInfo.avatar || updatedUserInfo.avatar !== profileData.avatar)) {
          console.debug('发现头像URL不一致，手动更正');
          updatedUserInfo.avatar = profileData.avatar;
        }
        
        // 更新本地存储和全局数据
        console.debug('更新资料成功，更新本地存储');
        storage.set('userInfo', updatedUserInfo);
        
        // 同时设置刷新标记
        storage.set('needRefreshProfile', true);
        storage.set('profileUpdateTime', Date.now());
        
        // 更新全局数据
        const app = getApp();
        if (app?.globalData) {
          app.globalData.userInfo = updatedUserInfo;
          console.debug('全局用户数据已更新');
        }
        
        return updatedUserInfo;
      } catch (err) {
        console.debug('更新资料失败:', err);
        return null;
      }
    },

    /**
     * 切换对目标用户的关注状态
     * @param {object|string} params - 关注参数对象或被关注用户ID
     * @returns {Promise<object|null>} 操作结果或 null
     */
    async _toggleFollow(params) {
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        console.debug('执行关注/取消关注操作');
        
        // 兼容两种调用方式
        let apiParams;
        if (typeof params === 'string') {
          // 旧方式：直接传入被关注用户ID
          apiParams = { 
            followed_id: params, 
            follower_id: openid 
          };
        } else {
          // 新方式：传入完整参数对象
          apiParams = { ...params };
          // 确保至少有follower_id
          if (!apiParams.follower_id) {
            apiParams.follower_id = openid;
          }
        }
        
        // API请求
        const res = await userApi.follow(apiParams);
        
        if (res.code !== 200 || !res.data) {
          throw new Error(res.message || '操作失败');
        }
        
        console.debug('关注/取消关注操作结果:', res.data);
        
        return res;
      } catch (err) {
        console.debug('关注操作失败:', err);
        return null;
      }
    }
  }
}); 