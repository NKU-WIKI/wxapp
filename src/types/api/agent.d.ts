export interface RagRequest {
  query: string;
  platform?: string | null;
  max_results?: number | null;
  format?: 'markdown' | 'json' | null;
  stream?: boolean | null;
  rewrite_query?: boolean | null;
}


