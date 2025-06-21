/**
 * 知识库行为 - 整合knowledge路径的API交互
 */
const { storage, createApiClient, msgSecCheck, ui } = require('../utils/index');

// 创建知识库API客户端
const knowledgeApi = createApiClient('/api/knowledge', {
  esSearch:     { method: 'GET', path: '/es-search' },      // params: query, openid, platform, page, ...
  suggestion:   { method: 'GET', path: '/suggestion' },     // params: query, openid
  history:      { method: 'GET', path: '/history' },        // params: openid
  clearHistory: { method: 'POST',path: '/history/clear' },  // params: openid
  insight:      { method: 'GET', path: '/insight' },        // params: date, page, page_size
});

module.exports = Behavior({
  methods: {
    /**
     * Elasticsearch搜索
     * @param {string} query 搜索关键词
     * @param {object} options 搜索选项
     * @param {string} options.platform 数据源筛选，多个用逗号分隔
     * @param {number} options.page 分页页码
     * @param {number} options.page_size 每页结果数
     * @returns {Promise<object|null>} 搜索结果
     */
    async _search(query, options = {}) {
      if (!query || !query.trim()) {
        return null;
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('搜索需要用户登录');
        return null;
      }
      
      try {
        const params = {
          query: query.trim(),
          openid,
          ...options
        };
        
        const res = await knowledgeApi.esSearch(params);
        
        if (res.code !== 200) {
          throw new Error(res.message || '搜索失败');
        }
        
        return {
          data: res.data || [],
          pagination: res.pagination || {
            total: 0,
            page: params.page || 1,
            page_size: params.page_size || 10,
            has_more: false
          }
        };
      } catch (err) {
        console.debug('ES搜索API失败:', err);
        throw err;
      }
    },

    /**
     * 获取搜索建议
     * @param {string} query 搜索关键词
     * @param {number} pageSize 返回数量
     * @returns {Promise<Array|null>}
     */
    async _getSuggestions(query, pageSize = 5) {
      if (!query || !query.trim()) {
        return null;
      }
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        const res = await knowledgeApi.suggestion({ query, openid, page_size: pageSize });
        if (res.code !== 200) throw new Error(res.message);
        return res.data;
      } catch (err) {
        console.debug('获取搜索建议失败:', err);
        return null;
      }
    },

    /**
     * 获取搜索历史
     * @param {number} pageSize 返回数量
     * @returns {Promise<Array|null>}
     */
    async _getSearchHistory(pageSize = 10) {
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        const res = await knowledgeApi.history({ openid, page_size: pageSize });
        if (res.code !== 200) throw new Error(res.message);
        return res.data;
      } catch (err) {
        console.debug('获取搜索历史失败:', err);
        return null;
      }
    },

    /**
     * 清空搜索历史
     * @returns {Promise<boolean>}
     */
    async _clearSearchHistory() {
      const openid = storage.get('openid');
      if (!openid) return false;

      try {
        const res = await knowledgeApi.clearHistory({ openid });
        return res.code === 200;
      } catch (err) {
        console.debug('清空搜索历史失败:', err);
        return false;
      }
    },

    /**
     * 获取指定日期的洞察报告
     * @param {string} date 日期，格式 YYYY-MM-DD
     * @param {object} options 分页选项 { page, page_size, category }
     * @returns {Promise<object|null>}
     */
    async _getInsight(date, options = {}) {
      if (!date) return null;
      const { page = 1, pageSize = 10, category } = options;

      try {
        const params = { 
          date, 
          page,
          page_size: pageSize,
        };
        if (category) {
          params.category = category;
        }

        const res = await knowledgeApi.insight(params);
        if (res.code !== 200) throw new Error(res.message);
        
        return {
          data: res.data || [],
          pagination: res.pagination || { has_more: false }
        };
      } catch (err) {
        console.debug(`获取洞察失败 (日期: ${date}):`, err);
        throw err;
      }
    },

    /**
     * 获取知识详情
     * @param {string|number} id 知识ID
     * @returns {Promise<object>} 知识详情
     */
    async _getKnowledgeDetail(id) {
      if (!id) {
        throw new Error('知识ID不能为空');
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('获取知识详情需要用户登录');
        throw new Error('用户未登录');
      }

      try {
        const res = await knowledgeApi.detail({
          id,
          openid
        });
        
        console.debug('知识详情API响应:', JSON.stringify(res));
        
        if (res.code !== 200) {
          throw new Error(res.message || '获取知识详情失败');
        }
        
        return res;
      } catch (err) {
        console.error('获取知识详情失败:', err);
        throw err;
      }
    },

    /**
     * 增加知识浏览量
     * @param {string|number} id 知识ID
     * @returns {Promise<boolean>} 是否成功
     */
    async _increaseKnowledgeViewCount(id) {
      if (!id) return false;
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('增加浏览量需要用户登录');
        return false;
      }

      try {
        const res = await knowledgeApi.viewCount({
          id,
          openid
        });
        
        return res.code === 200;
      } catch (err) {
        console.debug('增加浏览量失败:', err);
        return false;
      }
    },

    /**
     * 点赞/取消点赞知识
     * @param {string|number} id 知识ID
     * @param {boolean} isLike true为点赞，false为取消点赞
     * @returns {Promise<boolean>} 是否成功
     */
    async _toggleKnowledgeLike(id, isLike = true) {
      if (!id) return false;
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('点赞操作需要用户登录');
        return false;
      }

      try {
        let res;
        if (isLike) {
          res = await knowledgeApi.like({
            id,
            openid
          });
        } else {
          res = await knowledgeApi.unlike({
            id,
            openid
          });
        }
        
        return res.code === 200;
      } catch (err) {
        console.error('点赞操作失败:', err);
        return false;
      }
    },

    /**
     * 收藏/取消收藏知识
     * @param {string|number} id 知识ID
     * @param {boolean} isCollect true为收藏，false为取消收藏
     * @returns {Promise<boolean>} 是否成功
     */
    async _toggleKnowledgeCollect(id, isCollect = true) {
      if (!id) return false;
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('收藏操作需要用户登录');
        return false;
      }

      try {
        let res;
        if (isCollect) {
          res = await knowledgeApi.collect({
            id,
            openid
          });
        } else {
          res = await knowledgeApi.uncollect({
            id,
            openid
          });
        }
        
        return res.code === 200;
      } catch (err) {
        console.error('收藏操作失败:', err);
        return false;
      }
    },

    /**
     * 更新知识
     * @param {string|number} id 知识ID
     * @param {object} data 更新数据
     * @param {string} data.title 标题
     * @param {string} data.content 内容
     * @param {string} [data.tags] 标签，多个用逗号分隔
     * @returns {Promise<object>} 更新后的知识详情
     */
    async _updateKnowledge(id, data) {
      return new Promise(async (resolve, reject) => {
        if (!id) {
          reject(new Error('知识ID不能为空'));
          return;
        }
        
        if (!data || !data.title || !data.content) {
          reject(new Error('标题和内容不能为空'));
          return;
        }
        
        const openid = storage.get('openid');
        if (!openid) {
          reject(new Error('用户未登录'));
          return;
        }

        try {
          ui.showToast('正在检查内容...');
          
          // 检查内容和标题
          const contentCheck = msgSecCheck(data.content);
          const titleCheck = msgSecCheck(data.title);
          
          const [contentResult, titleResult] = await Promise.all([contentCheck, titleCheck]);
          
          if (!contentResult.pass) {
            ui.showToast(contentResult.reason, 'error', 3500);
            reject(new Error(`内容${contentResult.reason}`));
            return;
          }
          
          if (!titleResult.pass) {
            ui.showToast(titleResult.reason, 'error', 3500);
            reject(new Error(`标题${titleResult.reason}`));
            return;
          }
          
          const params = {
            id,
            openid,
            title: data.title,
            content: data.content
          };
          
          if (data.tags) params.tags = data.tags;
          
          const res = await knowledgeApi.update(params);
          
          if (res.code !== 200) {
            reject(new Error(res.message || '更新知识失败'));
            return;
          }
          
          resolve(res.data);
        } catch (err) {
          console.error('更新知识失败:', err);
          reject(err);
        }
      });
    },

    /**
     * 删除知识
     * @param {string|number} id 知识ID
     * @returns {Promise<boolean>} 是否成功
     */
    async _deleteKnowledge(id) {
      if (!id) {
        throw new Error('知识ID不能为空');
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('删除知识需要用户登录');
        throw new Error('用户未登录');
      }

      try {
        const res = await knowledgeApi.delete({
          id,
          openid
        });
        
        if (res.code !== 200) {
          throw new Error(res.message || '删除知识失败');
        }
        
        return true;
      } catch (err) {
        console.error('删除知识失败:', err);
        throw err;
      }
    },

    /**
     * 搜索帖子
     * @param {string} query 搜索关键词
     * @param {number} page 页码，默认1
     * @param {number} page_size 每页记录数，默认10
     * @param {string} sort_by 排序方式：time-时间，relevance-相关度，默认relevance
     * @returns {Promise<object>} 搜索结果，包含帖子列表和分页信息
     */
    async _searchPost(query, page = 1, page_size = 10, sort_by = 'relevance') {
      if (!query || !query.trim()) {
        return null;
      }

      try {
        const params = {
          query: query.trim(),
          search_type: 'post',
          page,
          page_size,
          sort_by
        };
        
        const res = await knowledgeApi.searchWxapp(params);
        
        if (res.code !== 200) {
          throw new Error(res.message || '搜索帖子失败');
        }
        
        return {
          data: res.data || [],
          pagination: res.pagination || {
            total: 0,
            page,
            page_size,
            total_pages: 0,
            has_more: false
          }
        };
      } catch (err) {
        console.debug('搜索帖子失败:', err);
        return null;
      }
    },

    /**
     * 搜索用户
     * @param {string} query 搜索关键词
     * @param {number} page 页码，默认1
     * @param {number} page_size 每页记录数，默认10
     * @param {string} sort_by 排序方式：time-时间，relevance-相关度，默认relevance
     * @returns {Promise<object>} 搜索结果，包含用户列表和分页信息
     */
    async _searchUser(query, page = 1, page_size = 10, sort_by = 'relevance') {
      if (!query || !query.trim()) {
        return null;
      }

      try {
        const params = {
          query: query.trim(),
          search_type: 'user',
          page,
          page_size,
          sort_by
        };
        
        const res = await knowledgeApi.searchWxapp(params);
        
        if (res.code !== 200) {
          throw new Error(res.message || '搜索用户失败');
        }
        
        return {
          data: res.data || [],
          pagination: res.pagination || {
            total: 0,
            page,
            page_size,
            total_pages: 0,
            has_more: false
          }
        };
      } catch (err) {
        console.debug('搜索用户失败:', err);
        return null;
      }
    },

    /**
     * 创建知识
     * @param {object} data 知识数据
     * @param {string} data.title 标题
     * @param {string} data.content 内容
     * @param {string} [data.tags] 标签，多个用逗号分隔
     * @returns {Promise<object>} 创建后的知识详情
     */
    _createKnowledge(data) {
      return new Promise(async (resolve, reject) => {
        if (!data || !data.title || !data.content) {
          reject(new Error('标题和内容不能为空'));
          return;
        }
        
        const openid = storage.get('openid');
        if (!openid) {
          reject(new Error('用户未登录'));
          return;
        }

        try {
          ui.showToast('正在检查内容...');
          
          // 检查内容和标题
          const contentCheck = msgSecCheck(data.content);
          const titleCheck = msgSecCheck(data.title);
          
          const [contentResult, titleResult] = await Promise.all([contentCheck, titleCheck]);
          
          if (!contentResult.pass) {
            ui.showToast(contentResult.reason, 'error', 3500);
            reject(new Error(`内容${contentResult.reason}`));
            return;
          }
          
          if (!titleResult.pass) {
            ui.showToast(titleResult.reason, 'error', 3500);
            reject(new Error(`标题${titleResult.reason}`));
            return;
          }
          
          const params = {
            openid,
            title: data.title,
            content: data.content
          };
          
          if (data.tags) params.tags = data.tags;
          
          const res = await knowledgeApi.create(params);
          
          if (res.code !== 200) {
            reject(new Error(res.message || '创建知识失败'));
            return;
          }
          
          resolve(res.data);
        } catch (err) {
          console.error('创建知识失败:', err);
          reject(err);
        }
      });
    }
  }
}); 