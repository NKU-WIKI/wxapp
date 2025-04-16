/**
 * 评论行为 - 处理评论列表加载、发布、删除、回复等
 */
const { storage, createApiClient } = require('../utils/util');

// 创建评论API客户端
const commentApi = createApiClient('/api/wxapp/comment', {
  list:   { method: 'GET',  path: '/list',   params: { openid: true, resource_id: true, resource_type: true } }, // Required: resource_id, resource_type
  detail: { method: 'GET',  path: '/detail', params: { openid: true, comment_id: true } },
  create: { method: 'POST', path: '',        params: { openid: true, resource_id: true, resource_type: true, content: true } }, // Required: resource_id, resource_type, content
  delete: { method: 'POST', path: '/delete', params: { openid: true, comment_id: true } },
  like:   { method: 'POST', path: '/like',   params: { openid: true, comment_id: true } }
});

module.exports = Behavior({
  methods: {
    /**
     * 获取评论列表
     * @param {number|string} resourceId - 资源ID
     * @param {object} [options={}] - 可选参数
     * @param {string} [options.resourceType='post'] - 资源类型，如post、knowledge等
     * @param {string} [options.parentId] - 父评论ID，获取回复列表时使用
     * @param {number} [options.page=1] - 页码
     * @param {number} [options.page_size=20] - 每页数量
     * @returns {Promise<Object|null>} 评论列表和分页信息
     */
    async _getCommentList(resourceId, options = {}) {
      if (!resourceId) return null;
      
      const { resourceType = 'post', parentId, page = 1, page_size = 20, limit } = options;

      const openid = storage.get('openid');
      const params = { 
        resource_id: resourceId,
        resource_type: resourceType,
        parent_id: parentId, 
        page, 
        page_size: page_size || limit || 20,  // 优先使用page_size，兼容旧的limit参数
        openid 
      };

      // 兼容旧版本API，如果是post类型，同时设置post_id参数
      if (resourceType === 'post') {
        params.post_id = Number(resourceId);
      }

      try {
        const res = await commentApi.list(params);
        if (res.code !== 200) throw new Error(res.message || '获取评论列表失败');
        
        // 适配新API响应格式
        return {
          list: res.data || [],  // 评论数据直接在data中
          total: res.pagination?.total || 0,
          page: res.pagination?.page || page,
          page_size: res.pagination?.page_size || params.page_size,
          has_more: res.pagination?.has_more || false
        };
      } catch (err) {
        return null;
      }
    },

    /**
     * 获取单条评论详情
     * @param {string} commentId - 评论ID
     * @returns {Promise<object|null>} 评论详情
     */
    async _getCommentDetail(commentId) {
      if (!commentId) return null;
      
      try {
        const res = await commentApi.detail({ 
          comment_id: commentId, 
          openid: storage.get('openid') 
        });
        
        if (res.code !== 200) throw new Error(res.message || '获取评论详情失败');
        return res.data;
      } catch (err) {
        return null;
      }
    },

    /**
     * 创建评论或回复
     * @param {string|number} resourceId - 资源ID
     * @param {string} content - 评论内容
     * @param {object} [options={}] - 可选参数
     * @param {string} [options.resourceType='post'] - 资源类型，如post、knowledge等
     * @param {string} [options.parentId] - 父评论ID，回复时使用
     * @param {object} [options.replyTo] - 回复对象信息，回复的回复时使用
     * @returns {Promise<object>} 创建的评论或API响应
     */
    async _createComment(resourceId, content, options = {}) {
      if (!resourceId) {
        return { code: 400, message: '缺少资源ID' };
      }
      if (!content?.trim()) {
        return { code: 400, message: '评论内容不能为空' };
      }
      
      const { resourceType = 'post', parentId = null, replyTo = null } = options;
      
      const openid = storage.get('openid');
      if (!openid) {
        return { code: 401, message: '用户未登录' };
      }

      try {
        const params = { 
          resource_id: resourceId,
          resource_type: resourceType,
          content: content.trim(), 
          parent_id: parentId, 
          openid 
        };
        
        // 兼容旧版本API，如果是post类型，同时设置post_id参数
        if (resourceType === 'post') {
          params.post_id = Number(resourceId);
        }
        
        // 如果是回复的回复，添加回复对象信息
        if (replyTo) {
          params.reply_to = JSON.stringify(replyTo);
        }
        
        const res = await commentApi.create(params);
        
        // 直接返回API响应
        return res;
      } catch (err) {
        // 返回错误响应而不是null
        return { 
          code: 500, 
          message: err.message || '评论创建失败', 
          error: err 
        };
      }
    },

    /**
     * 删除评论
     * @param {string} commentId - 评论ID
     * @returns {Promise<object>} API响应
     */
    async _deleteComment(commentId) {
      if (!commentId) {
        return { code: 400, message: '缺少评论ID' };
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        return { code: 401, message: '用户未登录' };
      }

      try {
        const params = { 
          comment_id: Number(commentId), // 确保转换为数字
          openid 
        };
        
        const res = await commentApi.delete(params);
        
        // 直接返回API响应，不再转换为布尔值
        return res;
      } catch (err) {
        return { code: 500, message: err.message || '删除评论失败' };
      }
    },

    /**
     * 点赞/取消点赞评论
     * @param {string} commentId - 评论ID
     * @returns {Promise<{status: string, like_count: number}|null>} 点赞结果
     */
    async _toggleCommentLike(commentId) {
      if (!commentId) return null;
      
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        const res = await commentApi.like({ 
          comment_id: commentId, 
          openid 
        });
        
        if (res.code !== 200 || !res.data) throw new Error(res.message || '操作失败');
        return res.data;
      } catch (err) {
        return null;
      }
    }
  }
}); 