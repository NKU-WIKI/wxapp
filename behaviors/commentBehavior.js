/**
 * 评论行为 - 处理评论列表加载、发布、删除、回复等
 */
const { storage, createApiClient, msgSecCheck } = require('../utils/index');

// 创建评论API客户端
const commentApi = createApiClient('/api/wxapp/comment', {
  list:     { method: 'GET',  path: '/list' },      // params: post_id, page, page_size
  replies:  { method: 'GET',  path: '/replies' },   // params: comment_id, openid, page, page_size
  userList: { method: 'GET',  path: '/user' },      // params: target_openid, page, page_size
  detail:   { method: 'GET',  path: '/detail' },    // params: comment_id, openid
  create:   { method: 'POST', path: '/create' },
  update:   { method: 'POST', path: '/update' },
  delete:   { method: 'POST', path: '/delete' },
});

// API客户端：通用互动
const actionApi = createApiClient('/api/wxapp/action', {
  toggle: { method: 'POST', path: '/toggle' } // params: target_id, target_type, action_type, openid
});

module.exports = Behavior({
  methods: {
    /**
     * 获取评论列表或回复列表
     * @param {object} options - 参数对象
     * @param {number|string} options.resourceId - 资源ID (帖子ID)
     * @param {number|string} [options.parentId] - 父评论ID，如果提供此参数，则获取回复列表
     * @param {number} [options.page=1] - 页码
     * @param {number} [options.pageSize=10] - 每页数量
     * @returns {Promise<Object|null>} 评论列表和分页信息
     */
    async _getCommentList(options = {}) {
      const { resourceId, parentId, page = 1, pageSize = 10 } = options;
      if (!resourceId && !parentId) {
        console.debug('获取评论失败: 缺少 resourceId 或 parentId');
        return null;
      }
      
      const openid = storage.get('openid');
      let apiCall;
      let params = { openid, page, page_size: pageSize };

      if (parentId) {
        // 获取回复列表
        params.comment_id = parentId;
        apiCall = commentApi.replies(params);
      } else {
        // 获取帖子的评论列表
        params.post_id = resourceId;
        apiCall = commentApi.list(params);
      }

      try {
        const res = await apiCall;
        if (res.code !== 200) throw new Error(res.message || '获取评论列表失败');
        
        return {
          list: res.data || [],
          ...res.pagination
        };
      } catch (err) {
        console.debug('获取评论列表失败:', err);
        return null;
      }
    },

    /**
     * 获取指定用户的评论列表
     * @param {string} targetOpenid - 目标用户的openid
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @returns 
     */
    async _getCommentListByUser(targetOpenid, page = 1, pageSize = 10) {
      if (!targetOpenid) return null;
      try {
        const res = await commentApi.userList({ target_openid: targetOpenid, page, page_size: pageSize });
        if (res.code !== 200) throw new Error(res.message || '获取用户评论列表失败');
        return {
          list: res.data || [],
          ...res.pagination
        };
      } catch (err) {
        console.debug('获取用户评论列表失败:', err);
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
        console.debug('获取评论详情失败', err);
        return null;
      }
    },

    /**
     * 创建评论或回复
     * @param {object} data - 评论数据
     * @returns {Promise<object>} 创建的评论或API响应
     */
    async _createComment(data) {
      if (!data || !data.content || !data.resource_id) {
        throw new Error('缺少必要的评论参数');
      }

      // const checkResult = await msgSecCheck(data.content, 2);
      // if (!checkResult.pass) {
      //   throw new Error(checkResult.reason || '内容含有违规信息');
      // }
        
      const openid = storage.get('openid');
      if (!openid) {
        throw new Error('评论失败：用户未登录');
      }

      const params = {
        openid,
        resource_id: data.resource_id,
        resource_type: data.resource_type || 'post',
        content: data.content.trim(),
        parent_id: data.parent_id,
        image: data.image
      };
      
      try {
        return await commentApi.create(params);
      } catch (err) {
        console.debug('创建评论失败:', err);
        throw err;
      }
    },

    /**
     * 删除评论
     * @param {string} commentId - 评论ID
     * @returns {Promise<object>} API响应
     */
    async _deleteComment(commentId) {
      if (!commentId) {
        throw new Error('缺少评论ID');
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        throw new Error('删除评论失败：用户未登录');
      }

      try {
        const params = { comment_id: commentId, openid };
        const res = await commentApi.delete(params);
        if (res.code !== 200) {
          throw new Error(res.message || '删除评论失败');
        }
        return res;
      } catch (err) {
        console.debug('删除评论失败', err);
        throw err;
      }
    },

    /**
     * 点赞/取消点赞评论
     * @param {string} commentId - 评论ID
     * @returns {Promise<object|null>} 点赞结果
     */
    async _toggleCommentLike(commentId) {
      if (!commentId) return null;
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('点赞失败: 未登录');
        return null;
      }

      try {
        const params = {
          target_id: commentId,
          target_type: 'comment',
          action_type: 'like',
          openid
        };
        const res = await actionApi.toggle(params);
        if (res.code !== 200 || !res.data) throw new Error(res.message || '操作失败');
        return res.data;
      } catch (err) {
        console.debug('点赞评论失败', err);
        return null;
      }
    }
  }
}); 