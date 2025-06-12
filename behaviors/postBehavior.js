/**
 * 帖子行为 - 处理帖子数据的获取、发布、编辑、点赞等操作
 */
const { createApiClient, msgSecCheck, ui, storage } = require('../utils/index');

// 创建帖子API客户端
const postApi = createApiClient('/api/wxapp/post', {
  list:     { method: 'GET',  path: '/list',    params: {} },
  detail:   { method: 'GET',  path: '/detail',  params: { openid: true, post_id: true } },
  like:     { method: 'POST', path: '/like',    params: { openid: true, post_id: true } },
  favorite: { method: 'POST', path: '/favorite',params: { openid: true, post_id: true } },
  status:   { method: 'GET',  path: '/status',  params: { openid: true, post_id: true } },
  create:   { method: 'POST', path: '',         params: { openid: true, title: true, content: true } },
  delete:   { method: 'POST', path: '/delete',  params: { openid: true, post_id: true } },
  update:   { method: 'POST', path: '/update',  params: { openid: true, post_id: true, title: true, content: true } }
});

module.exports = Behavior({
  methods: {
    /**
     * 获取帖子列表
     * @param {string} openid 用户ID
     * @param {number|object} filter 分类ID或筛选条件对象
     * @param {number} page 页码
     * @param {number} page_size 每页数量
     * @returns {Promise<Object>} API响应
     */
    async _getPostList(filter = {}, page = 1, page_size = 10) {
      // 构建查询参数
      const params = { page, page_size };
      
      // 支持直接传入分类ID的简写方式，兼容旧代码
      if (typeof filter === 'number') {
        if (filter !== 0) params.category_id = filter;
      } 
      // 支持传入对象形式的筛选条件
      else if (typeof filter === 'object') {
        // 提取支持的筛选条件
        const validFilters = [
          'category_id', 'tag', 'openid', 'favorite', 'order_by'
        ];
        
        // 将有效的筛选条件添加到参数中
        validFilters.forEach(key => {
          if (filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
            // 对于数组类型的参数进行处理
            if (Array.isArray(filter[key])) {
              if (filter[key].length > 0) {
                params[key] = filter[key].join(',');
              }
            } 
            // 对于0值需要特殊处理（分类ID为0表示全部分类，应该不传）
            else if (key === 'category_id' && filter[key] === 0) {
              // 不添加此条件
            }
            // 其他普通参数直接添加
            else {
              params[key] = filter[key];
            }
          }
        });
      }
      
      try {
        const res = await postApi.list(params);
        if (res.code !== 200) {
          throw new Error(res.message || '获取帖子列表失败');
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
        const res = await postApi.detail({ post_id: postId });
        
        if (res.code !== 200) {
          throw new Error(res.message || '获取帖子详情失败');
        }
        
        return res;
      } catch (err) {
        throw err;
      }
    },
    
    /**
     * 获取帖子状态（点赞、收藏、关注等）
     * @param {string|string[]} post_ids 帖子ID或ID数组
     * @returns {Promise<Object>} API响应
     */
    async _getPostStatus(post_ids) {
      try {
        if (!post_ids || (Array.isArray(post_ids) && post_ids.length === 0)) {
          return { code: -1, message: '没有提供帖子ID' };
        }
        
        // 检查登录状态
        const openid = this.getStorage('openid');
        if (!openid) {
          return { code: -1, message: '用户未登录' };
        }
        
        // 将数组转换为逗号分隔的字符串
        const postIdsParam = Array.isArray(post_ids) ? post_ids.join(',') : post_ids;
        
        // 如果帖子ID过多，截取前10个避免请求过大
        const postIdsLimited = postIdsParam.length > 100 
          ? `${postIdsParam.split(',').slice(0, 10).join(',')}`
          : postIdsParam;
        
        // 使用postApi发送请求，确保请求被发出
        const res = await postApi.status({ 
          post_id: postIdsLimited, 
          openid: openid 
        });
        
        return res;
      } catch (err) {
        return { code: -1, message: err.message || '获取状态失败' };
      }
    },
    
    /**
     * 创建帖子
     * @param {object} postData 帖子数据
     * @returns {Promise<Object>} API响应
     */
    _createPost(data) {
      return new Promise((resolve, reject) => {
        if (!data || (!data.content && !data.title)) {
          reject(new Error('内容不能为空'));
          return;
        }

        // 不在这里显示toast，让组件来负责显示
        
        // 检查内容和标题
        // const contentCheck = data.content ? msgSecCheck(data.content) : Promise.resolve({pass: true});
        // const titleCheck = data.title ? msgSecCheck(data.title) : Promise.resolve({pass: true});
        
        const contentCheck = Promise.resolve({pass: true});
        const titleCheck = Promise.resolve({pass: true});
        Promise.all([contentCheck, titleCheck])
          .then(([contentResult, titleResult]) => {
            if (!contentResult.pass) {
              // 直接使用带前缀的reason
              reject(new Error(contentResult.reason));
              return;
            }
            
            if (!titleResult.pass) {
              // 使用baseReason，添加"标题"前缀
              const titleError = titleResult.reason ? 
                `标题${titleResult.reason}` : 
                titleResult.reason.replace(/^内容/, '标题');
              reject(new Error(titleError));
              return;
            }
            
            // 内容安全，创建帖子
            data.openid = storage.get('openid'); // 确保有openid参数
            postApi.create(data).then(res => {
              resolve(res);
            }).catch(err => {
              reject(err);
            });
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    
    /**
     * 更新帖子
     * @param {string} postId 帖子ID
     * @param {object} postData 更新的帖子数据
     * @returns {Promise<Object>} API响应
     */
    _updatePost(postId, data) {
      return new Promise((resolve, reject) => {
        if (!postId) {
          reject(new Error('缺少帖子ID'));
          return;
        }
        
        if (!data || Object.keys(data).length === 0) {
          reject(new Error('更新数据不能为空'));
          return;
        }

        // 不在这里显示toast，让组件来负责显示
        
        // 只检查更新的内容
        const contentCheck = data.content ? msgSecCheck(data.content) : Promise.resolve({pass: true});
        const titleCheck = data.title ? msgSecCheck(data.title) : Promise.resolve({pass: true});
        
        Promise.all([contentCheck, titleCheck])
          .then(([contentResult, titleResult]) => {
            if (!contentResult.pass) {
              // 直接使用带前缀的reason
              reject(new Error(contentResult.reason));
              return;
            }
            
            if (!titleResult.pass) {
              // 使用baseReason，添加"标题"前缀
              const titleError = titleResult.reason ? 
                `标题${titleResult.reason}` : 
                titleResult.reason.replace(/^内容/, '标题');
              reject(new Error(titleError));
              return;
            }
            
            // 内容安全，更新帖子
            const params = {
              post_id: postId,
              openid: storage.get('openid'),
              ...data
            };
            postApi.update(params).then(res => {
              resolve(res);
            }).catch(err => {
              reject(err);
            });
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    
    /**
     * 删除帖子
     * @param {string} postId 帖子ID
     * @returns {Promise<Object>} API响应
     */
    async _deletePost(postId) {
      if (!postId) {
        throw new Error('未指定帖子ID');
      }
      
      try {
        const res = await postApi.delete({ post_id: postId });
        if (res.code !== 200) {
          throw new Error(res.message || '删除帖子失败');
        }
        return res;
      } catch (err) {
        throw err;
      }
    },
    
    /**
     * 点赞/取消点赞帖子
     * @param {string} postId 帖子ID
     * @returns {Promise<Object>} API响应
     */
    async _likePost(postId) {
      if (!postId) {
        throw new Error('未指定帖子ID');
      }
      
      try {
        const res = await postApi.like({ post_id: postId });
        if (res.code !== 200) {
          throw new Error(res.message || '点赞操作失败');
        }
        return res;
      } catch (err) {
        console.debug('postBehavior _likePost failed:', err);
        throw err;
      }
    },
    
    /**
     * 收藏/取消收藏帖子
     * @param {string} postId 帖子ID
     * @returns {Promise<Object>} API响应
     */
    async _favoritePost(postId) {
      if (!postId) {
        throw new Error('未指定帖子ID');
      }
      
      try {
        const res = await postApi.favorite({ post_id: postId });
        if (res.code !== 200) {
          throw new Error(res.message || '收藏操作失败');
        }
        return res;
      } catch (err) {
        console.debug('postBehavior _favoritePost failed:', err);
        throw err;
      }
    }
  }
}); 