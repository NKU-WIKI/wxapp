import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ChatMessage, ChatSession } from '@/types/chat'
// TODO: 更新为新的search类型定义
// import { SearchResultItem, SearchRequest } from "@/types/api/search";
// import searchApi from '@/services/api/search';
import agentApi from '@/services/api/agent'

// 聊天状态接口
interface ChatState {
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isTyping: boolean
  isLoading: boolean
  error: string | null
  config: {
    enableStreaming: boolean
  }
  // TODO: 更新为新的搜索类型
  // 新增 RAG 搜索相关状态
  // searchResults: SearchResultItem[];
  searchResults: any[] // 暂时使用any类型
  searchLoading: boolean
  searchError: string | null
}

// 创建默认会话
const createDefaultSession = (): ChatSession => ({
  id: `session_${Date.now()}`,
  title: '新对话',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

// 初始状态
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isTyping: false,
  isLoading: false,
  error: null,
  config: {
    enableStreaming: false,
  },
  // 初始化搜索状态
  searchResults: [],
  searchLoading: false,
  searchError: null,
}

// 异步 thunk: RAG 搜索
// TODO: 此函数已废弃，需要更新为新的search API
// export const searchByRag = createAsyncThunk(
//   "chat/searchByRag",
//   async (params: RagSearchRequest, { rejectWithValue }) => {
//     try {
//       const response = await knowledgeApi.searchByRag(params);
//       if (response.code === 200) {
//         return response.data;
//       } else {
//         return rejectWithValue(response.message || '搜索失败');
//       }
//     } catch (error: any) {
//       return rejectWithValue(error.message || "RAG 搜索请求失败");
//     }
//   }
// );

// 异步 thunk：流式接收 AI 消息
export const streamMessageFromAI = createAsyncThunk(
  'chat/streamMessageFromAI',
  async (
    params: { message: string; sessionId: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState() as { chat: ChatState }
    const { currentSession } = state.chat

    if (!currentSession) {
      return rejectWithValue('No active session')
    }

    const messageId = `ai_${Date.now()}`

    // TODO: 知识库搜索已废弃，需要更新为新的search API
    // 可选：并行检索知识库以展示参考资料
    let references: any[] | undefined
    // try {
    //   const searchResult = await knowledgeApi.search({
    //     query: params.message,
    //     page: 1,
    //     page_size: 10,
    //     max_content_length: 300,
    //   });
    //   if (Array.isArray(searchResult?.data) && searchResult.data.length > 0) {
    //     references = searchResult.data;
    //   }
    // } catch {}

    const initialMessage: ChatMessage = {
      id: messageId,
      content: '',
      role: 'assistant',
      timestamp: Date.now(),
      isStreaming: false,
      references,
    }
    dispatch(addMessage(initialMessage))

    try {
      const res = await agentApi.chatCompletions({
        query: params.message,
        stream: false,
        session_id: currentSession.id,
      })

      if (res.code === 200) {
        const content = (res.data as any)?.content || ''
        dispatch(
          updateStreamingMessage({
            messageId,
            content,
            isComplete: true,
          })
        )
        return messageId
      } else {
        const errMsg = res.msg || res.message || '对话失败'
        dispatch(setError(errMsg))
        dispatch(
          updateStreamingMessage({
            messageId,
            content: `抱歉，出错了: ${errMsg}`,
            isComplete: true,
          })
        )
        return rejectWithValue(errMsg)
      }
    } catch (error: any) {
      const errorMessage = error?.message || '网络错误'
      dispatch(setError(errorMessage))
      dispatch(
        updateStreamingMessage({
          messageId,
          content: `抱歉，出错了: ${errorMessage}`,
          isComplete: true,
        })
      )
      return rejectWithValue(errorMessage)
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    initializeChat: (state) => {
      if (state.sessions.length === 0) {
        const defaultSession = createDefaultSession()
        state.sessions.push(defaultSession)
        state.currentSession = defaultSession
      } else if (!state.currentSession && state.sessions.length > 0) {
        state.currentSession = state.sessions[0]
      }
    },
    createSession: (state, action: PayloadAction<{ title?: string }>) => {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: action.payload?.title || '',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      state.sessions.unshift(newSession)
      state.currentSession = newSession
      state.error = null
    },
    switchSession: (state, action: PayloadAction<string>) => {
      const session = state.sessions.find((s) => s.id === action.payload)
      if (session) {
        state.currentSession = session
        state.error = null
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      const sessionIdToDelete = action.payload
      const sessionIndex = state.sessions.findIndex((s) => s.id === sessionIdToDelete)
      if (sessionIndex === -1) return
      state.sessions.splice(sessionIndex, 1)
      if (state.currentSession?.id === sessionIdToDelete) {
        if (state.sessions.length > 0) {
          const newCurrentIndex = Math.max(0, sessionIndex - 1)
          state.currentSession = state.sessions[newCurrentIndex]
        } else {
          const newSession = createDefaultSession()
          state.sessions.push(newSession)
          state.currentSession = newSession
        }
      }
    },
    renameSession: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload
      const session = state.sessions.find((s) => s.id === id)
      if (session) {
        session.title = title
        session.updatedAt = Date.now()
        if (state.currentSession?.id === id) {
          state.currentSession.title = title
          state.currentSession.updatedAt = Date.now()
        }
      }
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentSession) {
        state.currentSession.messages.push(action.payload)
        state.currentSession.updatedAt = Date.now()
        if (
          action.payload.role === 'user' &&
          state.currentSession.messages.length === 1 &&
          (!state.currentSession.title || state.currentSession.title === '新对话')
        ) {
          const cleanContent = action.payload.content.replace(/\s+/g, ' ').trim()
          state.currentSession.title = cleanContent.slice(0, 10)
        }
      }
      state.error = null
    },
    updateStreamingMessage: (
      state,
      action: PayloadAction<{
        messageId: string
        content: string
        isComplete: boolean
      }>
    ) => {
      if (state.currentSession) {
        const message = state.currentSession.messages.find((m) => m.id === action.payload.messageId)
        if (message) {
          message.content = action.payload.content
          if (action.payload.isComplete) {
            message.isStreaming = false
          }
          state.currentSession.updatedAt = Date.now()
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.messages = state.currentSession.messages.filter(
          (m) => m.id !== action.payload
        )
        state.currentSession.updatedAt = Date.now()
      }
    },
    clearCurrentSession: (state) => {
      if (state.currentSession) {
        state.currentSession.messages = []
        state.currentSession.updatedAt = Date.now()
      }
      state.error = null
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateConfig: (state, action: PayloadAction<Partial<ChatState['config']>>) => {
      state.config = { ...state.config, ...action.payload }
    },
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchError = null
      state.searchLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      // TODO: RAG Search reducer已废弃，需要更新为新的search API
      // .addCase(searchByRag.pending, (state) => {
      //   state.searchLoading = true;
      //   state.searchError = null;
      //   state.searchResults = [];
      // })
      // .addCase(searchByRag.fulfilled, (state, action) => {
      //   state.searchLoading = false;
      //   state.searchResults = action.payload;
      // })
      // .addCase(searchByRag.rejected, (state, action) => {
      //   state.searchLoading = false;
      //   state.searchError = action.payload as string;
      // })
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
  },
})

export const {
  initializeChat,
  createSession,
  switchSession,
  renameSession,
  addMessage,
  updateStreamingMessage,
  deleteMessage,
  clearCurrentSession,
  deleteSession,
  setError,
  updateConfig,
  clearSearchResults, // 导出新 action
} = chatSlice.actions

export default chatSlice.reducer
