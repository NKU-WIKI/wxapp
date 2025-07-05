export interface Author {
  name: string;
  avatar: string;
  school?: string;
}

export interface Comment {
  id: number;
  author: Author;
  content: string;
  time: string;
  likes: number;
  isAIAssistant?: boolean;
}

export interface Post {
  id: number;
  author: Author;
  time: string;
  content: string;
  image?: string; // 用于帖子列表的单张预览图
  images?: string[]; // 用于详情页的图片画廊
  tags: string[];
  location?: string;
  likes: number | string;
  commentsCount: number;
  stars?: number;
  comments?: Comment[];
} 