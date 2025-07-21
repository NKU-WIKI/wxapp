import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ChatMessage, ChatSession, OpenAIRequestParams } from '@/types/chat'

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
const defaultSession = createDefaultSession()
const initialState: ChatState = {
  currentSession: defaultSession,
  sessions: [defaultSession],
  isTyping: false,
  isLoading: false,
  error: null,
  config: {
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    enableStreaming: true
  }
}

// 异步 thunk：发送消息到 AI
export const sendMessageToAI = createAsyncThunk(
  'chat/sendMessageToAI',
  async (params: {
    message: string
    sessionId: string
  }, { getState, rejectWithValue }) => {
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
  async (params: {
    message: string
    sessionId: string
  }, { dispatch, rejectWithValue }) => {
    try {
      // 模拟流式响应
      const messageId = `ai_stream_${Date.now()}`
      const fullResponse = `这是一个模拟的流式 AI 回复，针对你的问题："${params.message}"。我会逐字显示这个回复内容，就像真实的 AI 助手一样。`
      
      // 创建初始消息
      const initialMessage: ChatMessage = {
        id: messageId,
        content: '',
        role: 'assistant',
        timestamp: Date.now(),
        isStreaming: true
      }
      
      dispatch(addMessage(initialMessage))
      
      // 模拟逐字显示
      for (let i = 0; i <= fullResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        const partialContent = fullResponse.slice(0, i)
        
        dispatch(updateStreamingMessage({
          messageId,
          content: partialContent,
          isComplete: i === fullResponse.length
        }))
      }
      
      return messageId
    } catch (error) {
      return rejectWithValue('流式接收失败，请重试')
    }
  }
)

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
    
    // 删除会话
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload)
      
      // 如果删除的是当前会话，切换到第一个会话或创建新会话
      if (state.currentSession?.id === action.payload) {
        state.currentSession = state.sessions.length > 0 ? state.sessions[0] : null
      }
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