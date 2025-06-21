/**
 * 智能体行为 - 封装RAG API交互逻辑
 */
const { storage, createApiClient, createStreamApiClient, ui, ToastType } = require('../utils/index');

// 创建常规RAG API客户端
const agentApi = createApiClient('/api/agent', {
  rag: { method: 'POST', path: '/rag', params: { openid: true, query: true } }
});

// 创建流式RAG API客户端
const agentStreamApi = createStreamApiClient('/api/agent', {
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
     * @param {boolean} stream - 是否使用流式响应
     * @param {object} options - 其他API参数，如 platform, max_results
     */
    async _sendRagQuery(query, stream = false, options = {}) {
      if (!query || !query.trim()) {
        ui.showToast('请输入内容', { type: ToastType.ERROR });
        return;
      }
      
      const userMessage = { role: 'user', content: query };
      const assistantMessage = { role: 'assistant', content: '', loading: true, sources: [] };
      
      const messages = [...this.data.messages, userMessage, assistantMessage];
      const assistantIndex = messages.length - 1;
      
      this.setData({ messages, 'session.loading': true });

      const openid = storage.get('openid');
      if (!openid) {
        messages[assistantIndex].content = '发送失败，请重新登录。';
        messages[assistantIndex].error = true;
        messages[assistantIndex].loading = false;
        this.setData({ messages, 'session.loading': false });
        return;
      }

      const requestData = {
        openid,
        query: query.trim(),
        stream,
        ...options
      };
      
      try {
        if (stream) {
          // 处理流式请求
          agentStreamApi.rag(requestData, {
            onMessage: (chunks) => {
              chunks.forEach(chunk => {
                try {
                  const data = JSON.parse(chunk);
                  if (data.type === 'delta' && data.content) {
                    messages[assistantIndex].content += data.content;
                    this.setData({ [`messages[${assistantIndex}].content`]: messages[assistantIndex].content });
                  } else if (data.type === 'sources') {
                    messages[assistantIndex].sources = data.sources;
                  } else if (data.type === 'error') {
                    messages[assistantIndex].error = true;
                    messages[assistantIndex].content = data.message;
                  }
                } catch (err) { /* ignore parse error */ }
              });
            },
            onComplete: () => {
              messages[assistantIndex].loading = false;
              this.setData({ 
                [`messages[${assistantIndex}].loading`]: false,
                'session.loading': false 
              });
            }
          });
        } else {
          // 处理非流式请求
          const res = await agentApi.rag(requestData);
          if (res.code !== 200) {
            throw new Error(res.message || '智能体响应异常');
          }
          
          messages[assistantIndex].content = res.data.response;
          messages[assistantIndex].sources = res.data.sources;
          messages[assistantIndex].loading = false;
          
          this.setData({ messages, 'session.loading': false });
        }
      } catch (err) {
        console.debug('发送RAG查询失败:', err);
        messages[assistantIndex].content = '抱歉，我暂时无法回答您的问题，请稍后再试。';
        messages[assistantIndex].error = true;
        messages[assistantIndex].loading = false;
        this.setData({ messages, 'session.loading': false });
        ui.showToast(err.message || '发送失败', { type: ToastType.ERROR });
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
