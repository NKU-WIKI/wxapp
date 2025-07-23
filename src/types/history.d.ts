export interface HistoryItem {
  id: string; // 帖子id
  title: string;
  cover: string; // 封面图
  avatar: string; // 发帖人头像
  createdAt: string; // 帖子发布时间（ISO字符串）
  viewedAt: string; // 浏览时间（ISO字符串）
} 