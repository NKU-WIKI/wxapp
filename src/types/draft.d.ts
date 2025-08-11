export interface DraftPost {
  id: string;
  title: string;
  content: string;
  avatar: string;
  updatedAt: number;
  // 可选的扩展草稿字段，用于完整恢复发布页状态
  images?: string[];
  tags?: string[]; // 保持与发布页一致的显示形式（可能以 # 开头）
  categoryId?: number;
  isPublic?: boolean;
  allowComments?: boolean;
  style?: string;
  useWikiAssistant?: boolean;
} 