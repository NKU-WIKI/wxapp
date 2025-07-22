// 聊天消息接口
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system" | "tool";
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
  toolCalls?: OpenAIToolCall[]; // 添加工具调用字段
  references?: any[]; // 添加参考资料字段，用于存储知识库搜索结果
}

// 聊天会话接口
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// OpenAI API 配置
export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// OpenAI 消息格式
export interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

// OpenAI API 请求参数
export interface OpenAIRequestParams {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: OpenAITool[]; // 添加工具字段
  tool_choice?:
    | "auto"
    | "none"
    | { type: "function"; function: { name: string } };
}

// OpenAI API 响应
export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 流式响应数据块
export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
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

// OpenAI 工具定义
export interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

// OpenAI 工具调用
export interface OpenAIToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
  index?: number;
}

// OpenAI 工具输出
export interface OpenAIToolOutput {
  tool_call_id: string;
  output: string;
}
