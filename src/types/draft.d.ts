export interface DraftPost {
  id: string;
  title: string;
  content: string;
  avatar: string;
  updatedAt: number;
  tags?: string[];
  category_id?: string;
} 