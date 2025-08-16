export interface RagRequest {
  q: string;
  size?: number | null;
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


