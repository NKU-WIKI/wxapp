// 聊天消息接口
export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: number
  isStreaming?: boolean
  error?: string
}

// 聊天会话接口
export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

// OpenAI API 配置
export interface OpenAIConfig {
  apiKey: string
  baseURL?: string
  model: string
  temperature?: number
  maxTokens?: number
}

// OpenAI 消息格式
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// OpenAI API 请求参数
export interface OpenAIRequestParams {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

// OpenAI API 响应
export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 流式响应数据块
export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason?: string
  }>
}

// 聊天页面状态
export interface ChatPageState {
  messages: ChatMessage[]
  isTyping: boolean
  isLoading: boolean
  error: string | null
  scrollTop: number
}

// 聊天配置
export interface ChatConfig {
  enableStreaming: boolean
  enableMarkdown: boolean
  maxMessageLength: number
  systemPrompt?: string
} 