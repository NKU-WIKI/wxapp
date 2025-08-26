export interface RagRequest {
  q: string;
  size?: number | null;
}

export interface RagSourcesRequest {
  q: string;
  size?: number | null;
}

export interface DocSource {
  id: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content?: string;
  url?: string;
  platform?: string;
  author?: string;
  publish_time?: string;
  pagerank_score?: number;
}

export interface RAGResponse {
  answer: string;
  sources: DocSource[];
}


// 根据API文档更新的聊天接口
export interface ChatRequest {
  message: string;
  system_prompt?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
}

export interface ChatResponse {
  content: string;
}

export interface ApiResponse_ChatResponse_ {
  code: number;
  message: string;
  data: ChatResponse;
}

// 保留原有接口以兼容现有代码
export interface ChatCompletionsRequest {
  query: string;
  stream?: boolean | null;
  session_id?: string | null;
}

export interface ChatCompletionsResponse {
  content: string;
  session_id?: string;
}

// 关键词提取
export interface KeywordsRequest {
  text: string;
  top_k?: number | null;
}

export interface KeywordsResponse {
  keywords: string[];
}

// 生成快捷回复建议
export interface ReplySuggestionsRequest {
  message: string;
  num?: number | null;
}

export interface ReplySuggestionsResponse {
  suggestions: string[];
}

// 文本向量化
export interface EmbeddingRequest {
  texts: string[];
}

export interface EmbeddingVector {
  vector: number[];
}

export interface EmbeddingResponse {
  embeddings: EmbeddingVector[];
}

// 语音转文字
export interface TranscribeRequest {
  audio_file: string;
  sample_audio_only?: boolean | null;
}

export interface TranscribeResponse {
  text: string;
  confidence?: number | null;
  duration?: number | null;
}

// 用户偏好设置
export interface UserPreferencesRequest {
  preferences: any;
}

export interface UserPreferencesResponse {
  success: boolean;
  preferences?: any;
  message: string;
}

// 模型统计
export interface ModelStatsResponse {
  user_stats: any;
  model_stats: Record<string, any>;
  available_models: any[];
}

// 模型路由信息
export interface RoutingInfoRequest {
  task_type: string;
  content?: string | null;
}

export interface RoutingInfoResponse {
  selected_model: string;
  display_name: string;
  reason: string;
  confidence: number;
  fallback_models: string[];
  task_type: string;
  user_preferred_model?: string | null;
}

// 工作流
export interface WorkflowStepRequest {
  id: string;
  type: string;
  name: string;
  description: string;
  prompt_template: string;
  required_inputs?: string[];
  optional_inputs?: string[];
  outputs?: string[];
  dependencies?: string[];
  config?: any;
}

export interface WorkflowDefinitionRequest {
  id: string;
  name: string;
  description: string;
  version?: string;
  steps: WorkflowStepRequest[];
  output_template?: string | null;
  timeout_seconds?: number;
}

export interface WorkflowExecutionRequest {
  workflow_id?: string | null;
  template_name?: string | null;
  custom_workflow?: WorkflowDefinitionRequest;
  inputs: any;
}

export interface WorkflowExecutionResponse {
  workflow_id: string;
  status: string;
  result?: any;
  steps_executed?: number;
  execution_time?: number;
  error?: string | null;
}

export interface WorkflowTemplateResponse {
  templates: any[];
}

// RAG 相关类型
export interface RAGSourcesResponse {
  sources: any[];
}

export interface TextPolishRequest {
  text: string;
  mode?: 'professional' | 'casual' | 'academic' | 'shorten' | null;
  stream?: boolean | null;
}

export interface TextPolishResponse {
  content: string;
}

export interface TextSummarizeRequest {
  text: string;
  length?: 'short' | 'medium' | 'long' | null;
  stream?: boolean | null;
}

export interface TextSummarizeResponse {
  content: string;
}


