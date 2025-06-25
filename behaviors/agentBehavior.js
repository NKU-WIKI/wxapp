/**
 * 智能体行为 - 封装RAG API交互逻辑
 */
const { storage, createApiClient, ui, ToastType } = require('../utils/index');

// 创建常规RAG API客户端
const agentApi = createApiClient('/agent', {
  rag: { method: 'POST', path: '/rag', params: { openid: true, query: true } }
});

module.exports = Behavior({
  // 属性定义
  properties: {
    // 消息记录
    messages: {
      type: Array,
      value: []
    },
    // 当前会话相关参数
    session: {
      type: Object,
      value: {
        format: 'markdown', // 回复格式
        loading: false      // 是否正在加载
      }
    }
  },

  methods: {
    /**
     * 初始化智能体会话
     * @param {string} format - 回复格式，支持markdown和text，默认为markdown
     * @returns {boolean} 初始化结果
     */
    _initAgentSession(format = 'markdown') {
      this.setData({
        'session.format': format,
        'session.loading': false,
        messages: []
      });
      
      console.debug('智能体会话初始化完成:', { format });
      return true;
    },
    
    /**
     * 发送RAG查询
     * @param {string} query - 用户问题
     * @param {boolean} stream - 是否使用流式响应 (当前已禁用，默认为false)
     * @param {object} options - 其他API参数，如 platform, max_results
     * @returns {Promise<object|null>} 返回API响应的data部分，或在失败时返回null
     */
    async _sendRagQuery(query, stream = false, options = {}) {
      if (!query || !query.trim()) {
        ui.showToast('请输入内容', { type: ToastType.ERROR });
        return null;
      }
      
      const openid = storage.get('openid');
      if (!openid) {
        ui.showToast('登录状态异常，请重新登录', { type: ToastType.ERROR });
        return null;
      }

      const requestData = {
        openid,
        query: query.trim(),
        stream: false, // 强制为非流式
        ...options
      };
      
      try {
        const res = await agentApi.rag(requestData);
        if (res.code !== 200 || !res.data) {
          throw new Error(res.message || '未能获取到有效回答');
        }
        return res.data; // 直接返回data部分
      } catch (err) {
        console.error('发送RAG查询失败:', err);
        ui.showToast(err.message || '查询失败', { type: ToastType.ERROR });
        return null; // 失败时返回null
      }
    },

    /**
     * 清空会话
     */
    _clearAgentSession() {
      this.setData({
        messages: [],
        'session.loading': false
      });
    }
  }
});
