import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ChatMessage,
  ChatSession,
  OpenAIRequestParams,
  OpenAIMessage,
} from "@/types/chat";
import { KnowledgeSearchItem } from "@/types/api/knowledge"; // 导入类型
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
}

// 创建默认会话
const createDefaultSession = (): ChatSession => ({
  id: `session_${Date.now()}`,
  title: "新对话",
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// 初始状态 - 不预创建会话，让持久化或页面逻辑来处理
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  isTyping: false,
  isLoading: false,
  error: null,
  config: {
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 4096, // gpt-4o 支持更大的上下文
    enableStreaming: true,
  },
};

// 异步 thunk：发送消息到 AI
export const sendMessageToAI = createAsyncThunk(
  "chat/sendMessageToAI",
  async (
    params: {
      message: string;
      sessionId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // 这里是 mock 实现，实际应用中会调用 OpenAI API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiResponse = `这是一个模拟的 AI 回复，回复你的消息："${params.message}"。在实际应用中，这里会调用 OpenAI API 来获取真实的智能回复。`;

      return {
        id: `ai_${Date.now()}`,
        content: aiResponse,
        role: "assistant" as const,
        timestamp: Date.now(),
      };
    } catch (error) {
      return rejectWithValue("发送消息失败，请重试");
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
      // 导入知识库API
      const knowledgeApi = require("@/services/api/knowledge").default;

      // 调用ES搜索接口
      const searchResult = await knowledgeApi.search({
        query: params.message,
        page: 1,
        page_size: 20,
        max_content_length: 500, // 限制内容长度
      });

      // 如果有搜索结果，将其作为上下文信息
      if (searchResult && searchResult.data && searchResult.data.length > 0) {
        // 在 contextInfo 中包含完整的参考资料内容，同时前端也可以手动注入到消息气泡后面
        contextInfo = searchResult.data
          .map((item, index) => `[${index + 1}] ${item.title}\n${item.content}`)
          .join("\n\n");

        // 将知识库搜索结果存储在 references 变量中
        references = searchResult.data;
      }
    } catch (error) {
      console.error("获取知识库信息失败:", error);
      // 获取失败不影响主流程，继续执行
    }

    // 创建初始消息对象，包含 references 字段（如果有）
    const initialMessage: ChatMessage = {
      id: messageId,
      content: "",
      role: "assistant",
      timestamp: Date.now(),
      isStreaming: true,
      references: references, // 在创建对象时就包含 references 字段
    };
    dispatch(addMessage(initialMessage));

    // 准备发送到 API 的消息列表
    const messagesForAPI: OpenAIMessage[] = [];

    // 1. 系统提示词 (人设)
    const systemPrompt = `你是南开小知，南开知识社区的智能助理，致力于践行开源、共治、普惠的价值观。为南开学子提供全面的知识检索、精准的课程查询、及时的活动提醒等服务。`;
    messagesForAPI.push({ role: "system" as const, content: systemPrompt });

    // 2. 对话历史 (除最新一条)
    const history = currentSession.messages
      .slice(0, -1)
      .filter((m) => m.role === "user" || m.role === "assistant") // 过滤掉 system 和 tool 角色
      .map((m) => ({
        role: m.role as "user" | "assistant", // 使用类型断言确保类型兼容
        content: m.content,
      }));
    messagesForAPI.push(...history);

    // 3. 当前用户问题 (结合上下文和指令)
    const currentUserMessage =
      currentSession.messages[currentSession.messages.length - 1];
    let userPrompt = currentUserMessage.content;

    if (contextInfo) {
      const instruction = `请根据以下参考资料回答我的问题。回答时需要像学术论文一样，在引用信息的位置加上脚注，例如 [1]。输出markdown格式。

### 参考资料
${contextInfo}

### 我的问题
${currentUserMessage.content}`;
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
      const Decoder = typeof TextDecoder !== 'undefined' ? TextDecoder : require('text-encoding').TextDecoder;
      const decoder = new Decoder("utf-8");
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
        enableChunked: true, // 关键：开启流式接收
        success: () => {
          // 流式接收完成
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
        buffer = lines.pop() || ""; // 保留不完整的行

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6);
            if (jsonStr.trim() === "[DONE]") {
              // 服务端发送[DONE]表示结束，此时可以关闭请求
              requestTask.abort(); // 主动断开连接
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
      console.error("Streaming failed", error);
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
    // 初始化聊天状态 - 如果没有会话则创建默认会话
    initializeChat: (state) => {
      if (state.sessions.length === 0) {
        const defaultSession = createDefaultSession();
        state.sessions.push(defaultSession);
        state.currentSession = defaultSession;
      } else if (!state.currentSession && state.sessions.length > 0) {
        // 如果有会话但没有当前会话，设置第一个为当前会话
        state.currentSession = state.sessions[0];
      }
    },

    // 创建新会话
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

    // 切换当前会话
    switchSession: (state, action: PayloadAction<string>) => {
      const session = state.sessions.find((s) => s.id === action.payload);
      if (session) {
        state.currentSession = session;
        state.error = null;
      }
    },

    // 删除会话
    deleteSession: (state, action: PayloadAction<string>) => {
      const sessionIdToDelete = action.payload;
      const sessionIndex = state.sessions.findIndex(
        (s) => s.id === sessionIdToDelete
      );

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

    // 添加消息
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentSession && state.currentSession.id) {
        state.currentSession.messages.push(action.payload);
        state.currentSession.updatedAt = Date.now();

        // 如果是用户消息且是第一条消息，自动生成标题（取前10个字符）
        if (
          action.payload.role === "user" &&
          state.currentSession.messages.length === 1 &&
          (state.currentSession.title === "" || state.currentSession.title === "新对话")
        ) {
          // 取用户消息的前10个字符作为会话标题，去掉换行符和多余空格
          const cleanContent = action.payload.content.replace(/\s+/g, ' ').trim();
          state.currentSession.title = cleanContent.length > 10 
            ? cleanContent.slice(0, 10) 
            : cleanContent;
        }
      }
      state.error = null;
    },

    // 更新流式消息
    updateStreamingMessage: (
      state,
      action: PayloadAction<{
        messageId: string;
        content: string;
        isComplete: boolean;
      }>
    ) => {
      if (state.currentSession && state.currentSession.id) {
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

    // 删除消息
    deleteMessage: (state, action: PayloadAction<string>) => {
      if (state.currentSession && state.currentSession.id) {
        state.currentSession.messages = state.currentSession.messages.filter(
          (m) => m.id !== action.payload
        );
        state.currentSession.updatedAt = Date.now();
      }
    },

    // 清空当前会话
    clearCurrentSession: (state) => {
      if (state.currentSession && state.currentSession.id) {
        state.currentSession.messages = [];
        state.currentSession.updatedAt = Date.now();
      }
      state.error = null;
    },

    // 设置打字状态
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 更新配置
    updateConfig: (
      state,
      action: PayloadAction<Partial<ChatState["config"]>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // 重置状态
    resetChatState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // sendMessageToAI
      .addCase(sendMessageToAI.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        state.isTyping = false;
        if (state.currentSession && state.currentSession.id) {
          state.currentSession.messages.push(action.payload);
          state.currentSession.updatedAt = Date.now();
        }
      })
      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload as string;
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
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
