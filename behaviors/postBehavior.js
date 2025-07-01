/**
 * 帖子行为 - 处理帖子数据的获取、发布、编辑、点赞等操作
 */
const { createApiClient, msgSecCheck, storage, logger } = require('../utils/index');

// 创建帖子API客户端
const postApi = createApiClient('/wxapp/post', {
  list:     { method: 'GET',  path: '/list' },
  detail:   { method: 'GET',  path: '/detail' }, // params: post_id, openid
  search:   { method: 'GET',  path: '/search' },
  status:   { method: 'GET',  path: '/status' }, // params: post_id, openid
  create:   { method: 'POST', path: '/create' },
  delete:   { method: 'POST', path: '/delete' }, // params: post_id, openid
  update:   { method: 'POST', path: '/update' }, // params: post_id, openid, ...
});

// API客户端：通用互动
const actionApi = createApiClient('/wxapp/action', {
  toggle: { method: 'POST', path: '/toggle' } // params: target_id, target_type, action_type, openid
});

module.exports = Behavior({
  methods: {
    /**
     * 获取帖子列表
     * @param {object} filter - 筛选条件对象, e.g., { category_id, sort_by, favorite, following, openid }
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns {Promise<Object>} API响应
     */
    async _getPostList(filter = {}, page = 1, pageSize = 10) {
      const params = { page, page_size: pageSize };

      // 兼容旧的分类ID直接传入
      if (typeof filter === 'number' && filter !== 0) {
        params.category_id = filter;
      } else if (typeof filter === 'object') {
        Object.assign(params, filter);
      }
      
      // 自动附加openid以获取帖子状态信息（点赞、收藏等）
      if (!params.openid) {
        const openid = storage.get('openid');
        if (openid) {
          params.openid = openid;
        }
      }

      try {
        const res = await postApi.list(params);
        if (res.code !== 200) {
          throw new Error(res.message || '获取帖子列表失败');
        }
        
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
         console.debug('获取帖子列表失败:', err);
         throw err;
      }
    },
    
    /**
     * 获取帖子详情
     * @param {string} postId 帖子ID
     * @returns {Promise<Object>} 帖子详情
     */
    async _getPostDetail(postId) {
      if (!postId) {
        throw new Error('未指定帖子ID');
      }
      
      try {
        const params = { post_id: postId };
        const openid = storage.get('openid');
        if (openid) {
          params.openid = openid;
        }
        const res = await postApi.detail(params);
        
        if (res.code !== 200) {
          throw new Error(res.message || '获取帖子详情失败');
        }
        
        return res;
      } catch (err) {
        console.debug('获取帖子详情失败:', err);
        throw err;
      }
    },
    
    /**
     * 创建帖子
     * @param {object} postData 帖子数据
     * @returns {Promise<Object>} API响应
     */
    async _createPost(data) {
      if (!data || (!data.content && !data.title)) {
        throw new Error('内容不能为空');
      }

      // const contentCheck = data.content ? msgSecCheck(data.content) : Promise.resolve({pass: true});
      // const titleCheck = data.title ? msgSecCheck(data.title) : Promise.resolve({pass: true});
      // const [contentResult, titleResult] = await Promise.all([contentCheck, titleCheck]);
      
      // if (!contentResult.pass) {
      //   throw new Error(contentResult.reason);
      // }
      // if (!titleResult.pass) {
      //   throw new Error(`标题${titleResult.reason.replace(/^内容/, '')}`);
      // }
      
      data.openid = storage.get('openid');
      if (!data.openid) {
        throw new Error('创建帖子失败：用户未登录');
      }
      
      try {
        // 第一步：创建帖子
        logger.debug('准备调用 postApi.create', { data });
        const result = await postApi.create(data);
        logger.debug('postApi.create 调用完成', { result });
        
        if (result && result.code === 200 && result.data && result.data.id) {
          const postId = result.data.id;
          logger.debug('帖子创建成功，准备直接调用云函数生成url_link', { postId });
          
          // 第二步：生成url_link (异步执行，不阻塞帖子发布)
          try {
            const res = await wx.cloud.callFunction({
              name: 'generateUrlLink',
              data: { postId: String(postId) }
            });

            if (res && res.result && res.result.code === 200 && res.result.data && res.result.data.urlLink) {
              const urlLink = res.result.data.urlLink;
              logger.debug('url_link生成成功，准备更新到后端', { postId, urlLink });
              
              // 第三步：更新帖子，将url_link保存到后端
              await this._updatePost(postId, { url_link: urlLink });
              result.data.urlLink = urlLink;
              logger.info('url_link已成功保存到后端', { postId, urlLink });

            } else {
              const errorInfo = {
                postId,
                resultCode: res && res.result ? res.result.code : 'undefined',
                resultMessage: res && res.result ? res.result.message : 'undefined'
              };
              logger.warn('云函数返回数据异常或未成功', errorInfo);
            }
          } catch (urlLinkError) {
            logger.warn('调用generateUrlLink云函数失败', { 
              postId, 
              errorMessage: urlLinkError && urlLinkError.message ? urlLinkError.message : String(urlLinkError),
              errorStack: urlLinkError && urlLinkError.stack ? urlLinkError.stack : 'no stack trace'
            });
          }
        }
        
        return result;
      } catch (err) {
        logger.error('创建帖子失败:', err);
        throw err;
      }
    },
    
    /**
     * 更新帖子
     * @param {string} postId 帖子ID
     * @param {object} postData 更新的帖子数据
     * @returns {Promise<Object>} API响应
     */
    async _updatePost(postId, data) {
      if (!postId) {
        throw new Error('缺少帖子ID');
      }
      if (!data || Object.keys(data).length === 0) {
        throw new Error('更新数据不能为空');
      }

      // const contentCheck = data.content ? msgSecCheck(data.content) : Promise.resolve({pass: true});
      // const titleCheck = data.title ? msgSecCheck(data.title) : Promise.resolve({pass: true});
      // const [contentResult, titleResult] = await Promise.all([contentCheck, titleCheck]);
      
      // if (!contentResult.pass) {
      //   throw new Error(contentResult.reason);
      // }
      // if (!titleResult.pass) {
      //   throw new Error(`标题${titleResult.reason.replace(/^内容/, '')}`);
      // }
      
      const params = {
        post_id: postId,
        openid: storage.get('openid'),
        ...data
      };

      if (!params.openid) {
        throw new Error('更新帖子失败：用户未登录');
      }
      
      try {
        return await postApi.update(params);
      } catch (err) {
        console.debug('更新帖子失败:', err);
        throw err;
      }
    },

    /**
     * 删除帖子
     * @param {string} postId 帖子ID
     * @returns {Promise<Object>} API响应
     */
    async _deletePost(postId) {
      if (!postId) {
        throw new Error('缺少帖子ID');
      }
      
      const params = {
        post_id: postId,
        openid: storage.get('openid')
      };

      if (!params.openid) {
        throw new Error('删除帖子失败：用户未登录');
      }
      
      try {
        const res = await postApi.delete(params);
        if (res.code !== 200) {
          throw new Error(res.message || '删除失败');
        }
        return res;
      } catch (err) {
        console.debug('删除帖子失败:', err);
        throw err;
      }
    },

    /**
     * 批量获取帖子状态
     * @param {Array|string} postIds 帖子ID数组或单个ID
     * @returns {Promise<Object|null>} API响应
     */
    async _getPostStatus(postIds) {
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('获取帖子状态失败: 未登录');
        return null;
      }

      try {
        // 处理帖子ID参数
        let postIdStr;
        if (Array.isArray(postIds)) {
          postIdStr = postIds.filter(Boolean).join(',');
        } else {
          postIdStr = String(postIds);
        }

        if (!postIdStr) {
          return null;
        }

        const params = {
          post_id: postIdStr,
          openid: openid
        };

        const res = await postApi.status(params);
        if (res.code !== 200) {
          throw new Error(res.message || '获取帖子状态失败');
        }

        return res;
      } catch (err) {
        console.debug('获取帖子状态失败:', err);
        return null;
      }
    },

    /**
     * 切换帖子点赞状态
     * @param {string} postId 帖子ID
     * @returns {Promise<Object|null>}
     */
    async _likePost(postId) {
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('点赞失败: 未登录');
        return null;
      }
      try {
        const params = {
          target_id: postId,
          target_type: 'post',
          action_type: 'like',
          openid: openid
        };
        const res = await actionApi.toggle(params);
        if (res.code !== 200) throw new Error(res.message);
        return res;
      } catch (err) {
        console.debug('点赞操作失败:', err);
        return null;
      }
    },
    
    /**
     * 切换帖子收藏状态
     * @param {string} postId 帖子ID
     * @returns {Promise<Object|null>}
     */
    async _favoritePost(postId) {
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('收藏失败: 未登录');
        return null;
      }
      try {
        const params = {
          target_id: postId,
          target_type: 'post',
          action_type: 'favorite',
          openid: openid
        };
        const res = await actionApi.toggle(params);
        if (res.code !== 200) throw new Error(res.message);
        return res;
      } catch (err) {
        console.debug('收藏操作失败:', err);
        return null;
      }
    },
  }
}); 