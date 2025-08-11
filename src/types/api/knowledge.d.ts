/**
 * RAG (Retrieval-Augmented Generation) 搜索的请求参数接口
 */
export interface RagSearchRequest {
  query: string;
  openid: string;
  top_k_retrieve?: number;
  top_k_rerank?: number;
  retrieval_strategy?: 'auto' | 'hybrid' | 'vector_only' | 'bm25_only' | 'es_only';
  rerank_strategy?: 'no_rerank' | 'bge_reranker' | 'st_reranker' | 'personalized';
}

/**
 * RAG 搜索结果中单个条目的元数据
 */
export interface RagResultMetadata {
  title: string;
  author: string;
  platform: string;
  // 可以根据后端实际返回添加更多字段
}

/**
 * RAG 搜索返回的单个知识条目接口
 */
export interface KnowledgeSearchItem {
  id: string;
  text: string;
  metadata: RagResultMetadata;
  score: number;
}
