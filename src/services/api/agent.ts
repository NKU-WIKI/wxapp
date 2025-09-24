import {
  RagRequest,
  ChatRequest,
  ApiResponse_ChatResponse_,
  ChatCompletionsRequest,
  ChatCompletionsResponse,
  TextPolishRequest,
  TextSummarizeRequest,
  TextSummarizeResponse,
  KeywordsRequest,
  KeywordsResponse,
  ReplySuggestionsRequest,
  ReplySuggestionsResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  TranscribeRequest,
  TranscribeResponse,
  UserPreferencesRequest,
  UserPreferencesResponse,
  ModelStatsResponse,
  RoutingInfoRequest,
  RoutingInfoResponse,
  WorkflowExecutionRequest,
  WorkflowExecutionResponse,
  WorkflowTemplateResponse,
  RagSourcesRequest,
  RAGSourcesResponse,
  RAGResponse,
} from '@/types/api/agent.d'
import http from '../request'

// RAG问答：混合检索 + GLM 生成
export const rag = (data: RagRequest) => {
  return http.get<RAGResponse>('/agent/rag-answer', data)
}

// RAG文档来源：仅返回检索到的文档来源
export const ragSources = (data: RagSourcesRequest) => {
  return http.get<RAGSourcesResponse>('/agent/rag-sources', data)
}

// AI聊天
export const chatAPI = (data: ChatRequest) => {
  return http.post<ApiResponse_ChatResponse_>('/agent/chat', data)
}

// AI聊天（SSE流式）
export const chatStream = (data: ChatRequest) => {
  return http.post<any>('/agent/chat/stream', data)
}

// 保留原有函数以兼容现有代码
export const chatCompletions = (data: ChatCompletionsRequest) => {
  return http.post<ChatCompletionsResponse>('/agent/chat', {
    message: data.query,
    system_prompt: null,
    temperature: 0.7,
    max_tokens: 0,
  })
}

// 智能路由聊天
export const chatRouted = (data: ChatRequest) => {
  return http.post<ApiResponse_ChatResponse_>('/agent/chat/routed', data)
}

// 文本摘要
export const textSummarize = (data: TextSummarizeRequest) => {
  return http.post<TextSummarizeResponse>('/agent/summarize', data)
}

// 关键词提取
export const keywords = (data: KeywordsRequest) => {
  return http.post<KeywordsResponse>('/agent/keywords', data)
}

// 生成快捷回复建议
export const replySuggestions = (data: ReplySuggestionsRequest) => {
  return http.post<ReplySuggestionsResponse>('/agent/reply-suggestions', data)
}

// 文本向量化
export const embeddings = (data: EmbeddingRequest) => {
  return http.post<EmbeddingResponse>('/agent/embeddings', data)
}

// 智能路由向量化
export const embeddingsRouted = (data: EmbeddingRequest) => {
  return http.post<EmbeddingResponse>('/agent/embeddings/routed', data)
}

// 语音转文字（需要登录）
export const transcribe = (data: TranscribeRequest) => {
  return http.post<TranscribeResponse>('/agent/transcribe', data)
}

// 示例音频转文字（匿名可用）
export const transcribeSample = (data: TranscribeRequest) => {
  return http.post<TranscribeResponse>('/agent/transcribe/sample', data)
}

// 获取用户AI偏好
export const getUserPreferences = () => {
  return http.get<UserPreferencesResponse>('/agent/preferences')
}

// 设置用户AI偏好
export const setUserPreferences = (data: UserPreferencesRequest) => {
  return http.post<UserPreferencesResponse>('/agent/preferences', data)
}

// 获取模型性能统计
export const getModelStats = () => {
  return http.get<ModelStatsResponse>('/agent/models/stats')
}

// 获取模型路由信息
export const getRoutingInfo = (data: RoutingInfoRequest) => {
  return http.post<RoutingInfoResponse>('/agent/routing-info', data)
}

// 执行工作流
export const executeWorkflow = (data: WorkflowExecutionRequest) => {
  return http.post<WorkflowExecutionResponse>('/agent/workflow/execute', data)
}

// 获取工作流模板
export const getWorkflowTemplates = () => {
  return http.get<WorkflowTemplateResponse>('/agent/workflow/templates')
}

// 快速内容分析
export const quickAnalyze = (content: string) => {
  return http.get<WorkflowExecutionResponse>(
    `/agent/workflow/quick-analyze?content=${encodeURIComponent(content)}`
  )
}

// 快速文章生成
export const quickGenerate = (topic: string) => {
  return http.get<WorkflowExecutionResponse>(
    `/agent/workflow/quick-generate?topic=${encodeURIComponent(topic)}`
  )
}

// 保留textPolish以兼容现有代码，但使用新的实现
export const textPolish = (data: TextPolishRequest) => {
  // 使用新的chatAPI实现润色功能
  const requestData: ChatRequest = {
    message: `请润色以下文本内容：\n\n${data.text}`,
    system_prompt: `请以${data.mode === 'professional' ? '专业' : data.mode === 'casual' ? '轻松' : data.mode === 'academic' ? '学术' : '正式'}的语气润色文本，保持内容准确性和可读性。`,
    temperature: 0.7,
    max_tokens: data.stream ? undefined : 1000,
  }
  return chatAPI(requestData)
}

// ragSearch API不在文档中，暂时返回空数组
export const ragSearch = (_params: any) => {
  // 注意：这个API不在官方文档中
  return Promise.resolve({ code: 200, data: [] })
}

const agentApi = {
  rag,
  ragSources,
  chatAPI,
  chatStream,
  chatCompletions,
  chatRouted,
  textSummarize,
  keywords,
  replySuggestions,
  embeddings,
  embeddingsRouted,
  transcribe,
  transcribeSample,
  getUserPreferences,
  setUserPreferences,
  getModelStats,
  getRoutingInfo,
  executeWorkflow,
  getWorkflowTemplates,
  quickAnalyze,
  quickGenerate,
  textPolish,
  ragSearch,
}

export default agentApi
