// 参考资料接口
export interface ChatReference {
  id: string;
  title: string;
  content: string;
  url?: string;
  score?: number;
}

// 聊天消息接口
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
  toolCalls?: OpenAIToolCall[]; // 添加工具调用字段
  references?: ChatReference[]; // 添加参考资料字段，用于存储知识库搜索结果
}

// 聊天会话接口
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// 聊天页面状态
export interface ChatPageState {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  scrollTop: number;
}

// 聊天配置
export interface ChatConfig {
  enableStreaming: boolean;
  enableMarkdown: boolean;
  maxMessageLength: number;
  systemPrompt?: string;
  enableTools?: boolean; // 是否启用工具
}

// 兼容层：为未来可能的工具调用保留扩展点，但不再与 OpenAI 类型耦合
export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
  index?: number;
}
