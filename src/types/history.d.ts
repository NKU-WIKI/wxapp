// 原有的历史记录项目类型
export interface HistoryItem {
  id: string // 帖子id
  title: string
  cover: string // 封面图
  avatar: string // 发帖人头像
  createdAt: string // 帖子发布时间（ISO字符串）
  viewedAt: string // 浏览时间（ISO字符串）
  link?: string // 帖子跳转链接
}

// API返回的浏览历史记录类型
export interface ViewHistoryRead {
  id: string
  tenant_id: string
  created_at: string
  updated_at: string
  target_type: 'post' | 'product' | 'user'
  target_id: string
  user_id: string
}

// 扩展的浏览历史记录类型（包含目标内容信息）
export interface ViewHistoryItem extends ViewHistoryRead {
  target_title?: string
  target_content?: string
  target_author?: string
  target_avatar?: string
  target_cover?: string
}
