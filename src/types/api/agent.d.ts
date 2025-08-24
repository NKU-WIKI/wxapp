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


export interface ChatCompletionsRequest {
  query: string;
  stream?: boolean | null;
  session_id?: string | null;
}

export interface ChatCompletionsResponse {
  content: string;
  session_id?: string;
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


