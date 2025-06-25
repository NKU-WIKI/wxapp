/**
 * 用户行为 - 处理用户信息、登录状态和权限
 */
const { storage, createApiClient } = require('../utils/index');

// API客户端：用户
const userApi = createApiClient('/wxapp/user', {
  profile:    { method: 'GET',  path: '/profile' }, // params: openid, current_openid
  myProfile:  { method: 'GET',  path: '/my/profile' }, // params: openid
  update:     { method: 'POST', path: '/update' }, // params: openid, ...
  list:       { method: 'GET',  path: '/list' }, // params: page, page_size, nickname, sort_by
  followers:  { method: 'GET',  path: '/followers' }, // params: openid, page, page_size
  followings: { method: 'GET',  path: '/followings' },// params: openid, page, page_size
});

// API客户端：通用互动
const actionApi = createApiClient('/wxapp/action', {
  toggle: { method: 'POST', path: '/toggle' } // params: target_id, target_type, action_type, openid
});


module.exports = Behavior({
  
  methods: {
    // ==== 数据获取 ====

    /**
     * 获取用户列表，支持所有用户、粉丝、关注列表
     * @param {Object} filter - 筛选条件
     * @param {string} filter.type - 列表类型：all(所有用户)、follower(粉丝)、following(关注)
     * @param {string} filter.openid - 用户openid（当type为follower或following时必填）
     * @param {string} filter.nickname - 昵称搜索关键词
     * @param {number} page - 页码，默认1
     * @param {number} pageSize - 每页数量，默认10
     * @returns {Promise<Object>} API响应
     */
    async _getUserList(filter = {}, page = 1, pageSize = 10) {
      const params = { page, page_size: pageSize };
      const { type, openid, nickname } = filter;

      let apiCall;

      switch (type) {
        case 'follower':
          if (!openid) throw new Error('获取粉丝列表必须提供 openid');
          params.openid = openid;
          apiCall = userApi.followers(params);
          break;
        case 'following':
          if (!openid) throw new Error('获取关注列表必须提供 openid');
          params.openid = openid;
          apiCall = userApi.followings(params);
          break;
        default: // 'all' or other
          if (nickname) {
            params.nickname = nickname;
          }
          apiCall = userApi.list(params);
          break;
      }
      
      try {
        const res = await apiCall;
        if (res.code !== 200) {
          throw new Error(res.message || '获取用户列表失败');
        }
        
        // 处理分页数据，确保返回标准格式
        return {
          data: res.data || [],
          pagination: res.pagination || {
            total: 0,
            page: page,
            page_size: pageSize,
            total_pages: 0,
            has_more: false
          }
        };
      } catch (err) {
        console.debug(`获取用户列表失败 (type: ${type}):`, err);
        throw err;
      }
    },

    /**
     * 获取指定openid的用户公开信息
     * @param {string} targetOpenid - 要获取信息的用户openid
     * @param {boolean} checkFollowStatus - 是否要检查当前用户的关注状态
     * @returns {Promise<object|null>} 用户信息或 null
     */
    async _getUserProfile(targetOpenid, checkFollowStatus = false) {
      // 防御性编程：处理可能传入对象的情况
      if (typeof targetOpenid === 'object' && targetOpenid !== null && targetOpenid.openid) {
        console.warn('_getUserProfile 接收到对象参数，已自动修正。请检查调用源。', targetOpenid);
        targetOpenid = targetOpenid.openid;
      }
      
      if (!targetOpenid || typeof targetOpenid !== 'string') {
        console.error('_getUserProfile 接收到无效的 openid 参数:', targetOpenid);
        return null;
      }
      
      const params = { openid: targetOpenid };
      if (checkFollowStatus) {
        const currentOpenid = storage.get('openid');
        if (currentOpenid) {
          params.current_openid = currentOpenid;
        }
      }

      try {
        const res = await userApi.profile(params);
        if (res.code !== 200) throw new Error(res.message || '获取用户信息失败');
        return res.data;
      } catch (err) {
        console.debug('获取用户信息失败:', err);
        return null;
      }
    },

    /**
     * 获取当前登录用户的完整信息
     * @returns {Promise<object|null>}
     */
    async _getMyProfile() {
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('获取我的信息失败: openid 不存在');
        return null;
      }
      try {
        const res = await userApi.myProfile({ openid });
        if (res.code !== 200) throw new Error(res.message || '获取我的信息失败');
        return res.data;
      } catch (err) {
        console.debug('获取我的信息失败:', err);
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
        const userInfo = await this._getUserProfile(post.openid);
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
     * @param {string} targetOpenid - 被关注用户的 openid
     * @returns {Promise<object|null>} 操作结果或 null, data.is_active 表示操作后是否为关注状态
     */
    async _toggleFollow(targetOpenid) {
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('关注操作失败: 未登录');
        return null;
      }
      if (!targetOpenid) {
        console.debug('关注操作失败: 缺少目标用户 openid');
        return null;
      }

      try {
        console.debug(`执行关注/取消关注操作 -> ${targetOpenid}`);
        
        const params = {
          target_id: targetOpenid,
          target_type: 'user',
          action_type: 'follow',
          openid: openid
        };
        
        const res = await actionApi.toggle(params);
        
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