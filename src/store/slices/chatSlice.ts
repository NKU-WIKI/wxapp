import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ChatMessage,
  ChatSession,
  OpenAIRequestParams,
  OpenAIMessage,
} from "@/types/chat";
import { KnowledgeSearchItem, RagSearchRequest } from "@/types/api/knowledge"; // 导入类型
import knowledgeApi from '@/services/api/knowledge'; // 导入API服务
import Taro from "@tarojs/taro";

declare const wx: any;

// 聊天状态接口
interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
    enableStreaming: boolean;
  };
  // 新增 RAG 搜索相关状态
  searchResults: KnowledgeSearchItem[];
  searchLoading: boolean;
  searchError: string | null;
}

// 创建默认会话
const createDefaultSession = (): ChatSession => ({
  id: `session_${Date.now()}`,
  title: "新对话",
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 初始状态
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isTyping: false,
  isLoading: false,
  error: null,
  config: {
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4096,
    enableStreaming: true,
  },
  // 初始化搜索状态
  searchResults: [],
  searchLoading: false,
  searchError: null,
};

// 异步 thunk: RAG 搜索
export const searchByRag = createAsyncThunk(
  "chat/searchByRag",
  async (params: RagSearchRequest, { rejectWithValue }) => {
    try {
      const response = await knowledgeApi.searchByRag(params);
      if (response.code === 200) {
        return response.data;
      } else {
        return rejectWithValue(response.message || '搜索失败');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "RAG 搜索请求失败");
    }
  }
);


// 异步 thunk：流式接收 AI 消息
export const streamMessageFromAI = createAsyncThunk(
  "chat/streamMessageFromAI",
  async (
    params: { message: string; sessionId: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState() as { chat: ChatState };
    const { config, currentSession } = state.chat;

    if (!currentSession) {
      return rejectWithValue("No active session");
    }

    const messageId = `ai_stream_${Date.now()}`;

    // 尝试获取相关知识
    let contextInfo = "";
    let references = undefined;
    try {
      const searchResult = await knowledgeApi.search({
        query: params.message,
        page: 1,
        page_size: 20,
        max_content_length: 500, // 限制内容长度
      });

      if (searchResult && searchResult.data && searchResult.data.length > 0) {
        contextInfo = searchResult.data
          .map((item, index) => `[${index + 1}] ${item.title}\n${item.content}`)
          .join("\n\n");
        references = searchResult.data;
      }
    } catch (error) {
      console.error("获取知识库信息失败:", error);
    }

    const initialMessage: ChatMessage = {
      id: messageId,
      content: "",
      role: "assistant",
      timestamp: Date.now(),
      isStreaming: true,
      references: references,
    };
    dispatch(addMessage(initialMessage));

    const messagesForAPI: OpenAIMessage[] = [];
    const systemPrompt = `你是南开小知，南开知识社区的智能助理...`;
    messagesForAPI.push({ role: "system" as const, content: systemPrompt });

    const history = currentSession.messages
      .slice(0, -1)
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
    messagesForAPI.push(...history);

    const currentUserMessage =
      currentSession.messages[currentSession.messages.length - 1];
    let userPrompt = currentUserMessage.content;

    if (contextInfo) {
      const instruction = `请根据以下参考资料回答我的问题...`;
      userPrompt = instruction;
    }

    messagesForAPI.push({ role: "user" as const, content: userPrompt });

    const requestBody: OpenAIRequestParams = {
      model: config.model,
      messages: messagesForAPI,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
    };

    try {
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";

      const requestTask = wx.request({
        url: `${process.env.OPENAI_BASE_URL}/chat/completions`,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        data: requestBody,
        responseType: "arraybuffer",
        enableChunked: true,
        success: () => {
          dispatch(
            updateStreamingMessage({
              messageId,
              content: fullContent,
              isComplete: true,
            })
          );
        },
        fail: (err) => {
          dispatch(setError(`请求错误: ${err.errMsg}`));
          dispatch(
            updateStreamingMessage({
              messageId,
              content: `Error: ${err.errMsg}`,
              isComplete: true,
            })
          );
        },
      });

      let buffer = "";
      requestTask.onChunkReceived((res: any) => {
        const chunk = decoder.decode(res.data as ArrayBuffer);
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6);
            if (jsonStr.trim() === "[DONE]") {
              requestTask.abort();
              dispatch(
                updateStreamingMessage({
                  messageId,
                  content: fullContent,
                  isComplete: true,
                })
              );
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.choices && parsed.choices[0].delta.content) {
                fullContent += parsed.choices[0].delta.content;
                dispatch(
                  updateStreamingMessage({
                    messageId,
                    content: fullContent,
                    isComplete: false,
                  })
                );
              }
            } catch (e) {
              console.error("JSON parsing error:", line, e);
            }
          }
        }
      });

      return messageId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      dispatch(setError(errorMessage));
      dispatch(
        updateStreamingMessage({
          messageId,
          content: `抱歉，出错了: ${errorMessage}`,
          isComplete: true,
        })
      );
      return rejectWithValue(errorMessage);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    initializeChat: (state) => {
      if (state.sessions.length === 0) {
        const defaultSession = createDefaultSession();
        state.sessions.push(defaultSession);
        state.currentSession = defaultSession;
      } else if (!state.currentSession && state.sessions.length > 0) {
        state.currentSession = state.sessions[0];
      }
    },
    createSession: (state, action: PayloadAction<{ title?: string }> = { payload: {} }) => {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: action.payload?.title || "",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.sessions.unshift(newSession);
      state.currentSession = newSession;
      state.error = null;
    },
    switchSession: (state, action: PayloadAction<string>) => {
      const session = state.sessions.find((s) => s.id === action.payload);
      if (session) {
        state.currentSession = session;
        state.error = null;
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      const sessionIdToDelete = action.payload;
      const sessionIndex = state.sessions.findIndex(s => s.id === sessionIdToDelete);
      if (sessionIndex === -1) return;
      state.sessions.splice(sessionIndex, 1);
      if (state.currentSession?.id === sessionIdToDelete) {
        if (state.sessions.length > 0) {
          const newCurrentIndex = Math.max(0, sessionIndex - 1);
          state.currentSession = state.sessions[newCurrentIndex];
        } else {
          const newSession = createDefaultSession();
          state.sessions.push(newSession);
          state.currentSession = newSession;
        }
      }
    },
    renameSession: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const { id, title } = action.payload;
      const session = state.sessions.find((s) => s.id === id);
      if (session) {
        session.title = title;
        session.updatedAt = Date.now();
        if (state.currentSession?.id === id) {
          state.currentSession.title = title;
          state.currentSession.updatedAt = Date.now();
        }
      }
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentSession) {
        state.currentSession.messages.push(action.payload);
        state.currentSession.updatedAt = Date.now();
        if (
          action.payload.role === "user" &&
          state.currentSession.messages.length === 1 &&
          (!state.currentSession.title || state.currentSession.title === "新对话")
        ) {
          const cleanContent = action.payload.content.replace(/\s+/g, ' ').trim();
          state.currentSession.title = cleanContent.slice(0, 10);
        }
      }
      state.error = null;
    },
    updateStreamingMessage: (
      state,
      action: PayloadAction<{
        messageId: string;
        content: string;
        isComplete: boolean;
      }>
    ) => {
      if (state.currentSession) {
        const message = state.currentSession.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          message.content = action.payload.content;
          if (action.payload.isComplete) {
            message.isStreaming = false;
          }
          state.currentSession.updatedAt = Date.now();
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.messages = state.currentSession.messages.filter(
          (m) => m.id !== action.payload
        );
        state.currentSession.updatedAt = Date.now();
      }
    },
    clearCurrentSession: (state) => {
      if (state.currentSession) {
        state.currentSession.messages = [];
        state.currentSession.updatedAt = Date.now();
      }
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateConfig: (
      state,
      action: PayloadAction<Partial<ChatState['config']>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
      state.searchLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // RAG Search
      .addCase(searchByRag.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
        state.searchResults = [];
      })
      .addCase(searchByRag.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchByRag.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
      })
      // streamMessageFromAI
      .addCase(streamMessageFromAI.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(streamMessageFromAI.fulfilled, (state) => {
        state.isTyping = false;
      })
      .addCase(streamMessageFromAI.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload as string;
      });
  },
});

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
  setTyping,
  setLoading,
  setError,
  updateConfig,
  clearSearchResults, // 导出新 action
} = chatSlice.actions;

export default chatSlice.reducer;
