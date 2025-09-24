import { Post } from './post.d'

export interface CollectionItem {
  id: number
  post: Post
  created_at: string
}

export interface CollectionResponse {
  items: CollectionItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface GetCollectionParams {
  page?: number
  page_size?: number
  category?: 'all' | 'post' | 'material' | 'activity'
  search?: string
}

export interface RemoveFromCollectionParams {
  post_id: number
}
