export interface KnowledgeSearchItem {
  id: string;
  title: string;
  content: string;
  original_url: string;
  author: string;
  platform: string;
  tag: string;
  create_time: string;
  update_time: string;
  relevance: number;
  is_truncated: boolean;
  is_official: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
}

export interface KnowledgeSearchResponse {
  data: KnowledgeSearchItem[];
  pagination: Pagination;
}