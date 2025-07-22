import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ChatMessage, ChatSession, OpenAIRequestParams } from '@/types/chat'
import Taro from '@tarojs/taro'

declare const wx: any;

// 聊天状态接口
interface ChatState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isTyping: boolean
  isLoading: boolean
  error: string | null
  config: {
    model: string
    temperature: number
    maxTokens: number
    enableStreaming: boolean
  }
}

// 创建默认会话
const createDefaultSession = (): ChatSession => ({
  id: `session_${Date.now()}`,
  title: '新对话',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
})

// 初始状态
const initialSessions = [createDefaultSession()]
const initialCurrentSession = initialSessions[0]

const initialState: ChatState = {
  currentSession: initialCurrentSession,
  sessions: initialSessions,
  isTyping: false,
  isLoading: false,
  error: null,
  config: {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096, // gpt-4o 支持更大的上下文
    enableStreaming: true
  }
}

// 异步 thunk：发送消息到 AI
export const sendMessageToAI = createAsyncThunk(
  'chat/sendMessageToAI',
  async (params: {
    message: string,
    sessionId: string
  }, { rejectWithValue }) => {
    try {
      // 这里是 mock 实现，实际应用中会调用 OpenAI API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiResponse = `这是一个模拟的 AI 回复，回复你的消息："${params.message}"。在实际应用中，这里会调用 OpenAI API 来获取真实的智能回复。`
      
      return {
        id: `ai_${Date.now()}`,
        content: aiResponse,
        role: 'assistant' as const,
        timestamp: Date.now()
      }
    } catch (error) {
      return rejectWithValue('发送消息失败，请重试')
    }
  }
)

// 异步 thunk：流式接收 AI 消息
export const streamMessageFromAI = createAsyncThunk(
  'chat/streamMessageFromAI',
  async (_: { message: string, sessionId: string }, { dispatch, getState, rejectWithValue }) => {
    const state = getState() as { chat: ChatState };
    const { config, currentSession } = state.chat;

    if (!currentSession) {
      return rejectWithValue('No active session');
    }

    const messageId = `ai_stream_${Date.now()}`;
    const initialMessage: ChatMessage = {
      id: messageId,
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
      isStreaming: true
    };
    dispatch(addMessage(initialMessage));

    const requestBody: OpenAIRequestParams = {
      model: config.model,
      messages: currentSession.messages.map(m => ({ role: m.role, content: m.content })),
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true
    };

    try {
      let fullContent = '';
      const decoder = new TextDecoder('utf-8');
      const requestTask = wx.request({
        url: `${process.env.OPENAI_BASE_URL}/chat/completions`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        data: requestBody,
        responseType: 'arraybuffer',
        enableChunked: true, // 关键：开启流式接收
        success: (res) => {
          if (res.statusCode !== 200) {
            dispatch(setError(`请求失败: ${res.statusCode}`));
            const errorContent = res.data ? decoder.decode(res.data as ArrayBuffer) : `Status Code: ${res.statusCode}`;
            dispatch(updateStreamingMessage({ messageId, content: `Error: ${errorContent}`, isComplete: true }));
          }
        },
        fail: (err) => {
          dispatch(setError(err.errMsg));
          dispatch(updateStreamingMessage({ messageId, content: `Error: ${err.errMsg}`, isComplete: true }));
        }
      });

      requestTask.onChunkReceived((res) => {
        const chunk = decoder.decode(res.data as ArrayBuffer, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '[DONE]') {
              dispatch(updateStreamingMessage({ messageId, content: fullContent, isComplete: true }));
              requestTask.abort(); // 完成后中断请求
              return;
            }
            try {
              const jsonData = JSON.parse(dataStr);
              const deltaContent = jsonData.choices[0]?.delta?.content;
              if (deltaContent) {
                fullContent += deltaContent;
                dispatch(updateStreamingMessage({ messageId, content: fullContent, isComplete: false }));
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      });


      return messageId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch(updateStreamingMessage({ messageId, content: `Error: ${errorMessage}`, isComplete: true }));
      return rejectWithValue(errorMessage);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // 创建新会话
    createSession: (state, action: PayloadAction<{ title?: string }>) => {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: action.payload.title || '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      state.sessions.unshift(newSession)
      state.currentSession = newSession
      state.error = null
    },
    
    // 切换当前会话
    switchSession: (state, action: PayloadAction<string>) => {
      const session = state.sessions.find(s => s.id === action.payload)
      if (session) {
        state.currentSession = session
        state.error = null
      }
    },

    // 删除会话
    deleteSession: (state, action: PayloadAction<string>) => {
      const sessionIdToDelete = action.payload;
      const sessionIndex = state.sessions.findIndex(s => s.id === sessionIdToDelete);

      if (sessionIndex === -1) return;

      state.sessions.splice(sessionIndex, 1);

      // 如果删除的是当前会话，则切换到另一个会话
      if (state.currentSession?.id === sessionIdToDelete) {
        if (state.sessions.length > 0) {
          // 优先切换到前一个会话，否则切换到后一个，或第一个
          const newCurrentIndex = Math.max(0, sessionIndex - 1);
          state.currentSession = state.sessions[newCurrentIndex];
        } else {
          // 如果没有会话了，创建一个新的
          const newSession = createDefaultSession();
          state.sessions.push(newSession);
          state.currentSession = newSession;
        }
      }
    },

    // 重命名会话
    renameSession: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload
      const session = state.sessions.find(s => s.id === id)
      if (session) {
        session.title = title
        session.updatedAt = Date.now()
        if (state.currentSession?.id === id) {
          state.currentSession.title = title
          state.currentSession.updatedAt = Date.now()
        }
      }
    },
    
    // 添加消息
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentSession && state.currentSession.id) {
        state.currentSession.messages.push(action.payload)
        state.currentSession.updatedAt = Date.now()
        
        // 如果是用户消息且没有标题，自动生成标题
        if (action.payload.role === 'user' && 
            state.currentSession.messages.length === 1 && 
            state.currentSession.title === '新对话') {
          state.currentSession.title = action.payload.content.slice(0, 20) + '...'
        }
      }
      state.error = null
    },
    
    // 更新流式消息
    updateStreamingMessage: (state, action: PayloadAction<{
      messageId: string
      content: string
      isComplete: boolean
    }>) => {
      if (state.currentSession && state.currentSession.id) {
        const message = state.currentSession.messages.find(m => m.id === action.payload.messageId)
        if (message) {
          message.content = action.payload.content
          if (action.payload.isComplete) {
            message.isStreaming = false
          }
          state.currentSession.updatedAt = Date.now()
        }
      }
    },
    
    // 删除消息
    deleteMessage: (state, action: PayloadAction<string>) => {
      if (state.currentSession && state.currentSession.id) {
        state.currentSession.messages = state.currentSession.messages.filter(
          m => m.id !== action.payload
        )
        state.currentSession.updatedAt = Date.now()
      }
    },
    
    // 清空当前会话
    clearCurrentSession: (state) => {
      if (state.currentSession && state.currentSession.id) {
        state.currentSession.messages = []
        state.currentSession.updatedAt = Date.now()
      }
      state.error = null
    },
    
    // 设置打字状态
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // 更新配置
    updateConfig: (state, action: PayloadAction<Partial<ChatState['config']>>) => {
      state.config = { ...state.config, ...action.payload }
    },
    
    // 重置状态
    resetChatState: (state) => {
      return initialState
    }
  },
  extraReducers: (builder) => {
    builder
      // sendMessageToAI
      .addCase(sendMessageToAI.pending, (state) => {
        state.isTyping = true
        state.error = null
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        state.isTyping = false
        if (state.currentSession && state.currentSession.id) {
          state.currentSession.messages.push(action.payload)
          state.currentSession.updatedAt = Date.now()
        }
      })
      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.isTyping = false
        state.error = action.payload as string
      })
      
      // streamMessageFromAI
      .addCase(streamMessageFromAI.pending, (state) => {
        state.isTyping = true
        state.error = null
      })
      .addCase(streamMessageFromAI.fulfilled, (state) => {
        state.isTyping = false
      })
      .addCase(streamMessageFromAI.rejected, (state, action) => {
        state.isTyping = false
        state.error = action.payload as string
      })
  }
})

export const {
  createSession,
  switchSession,
  renameSession,
  addMessage,
  updateStreamingMessage,
  deleteMessage,
  clearCurrentSession,
  deleteSession,
  setTyping,
  setLoading,
  setError,
  updateConfig,
  resetChatState
} = chatSlice.actions

export default chatSlice.reducer