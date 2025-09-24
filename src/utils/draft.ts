import Taro from '@tarojs/taro'
import { DraftPost } from '@/types/draft'

const DRAFT_KEY = 'draft_posts'

export function getDrafts(): DraftPost[] {
  const drafts = Taro.getStorageSync(DRAFT_KEY) || []
  return drafts.sort((a, b) => b.updatedAt - a.updatedAt)
}

export function saveDraft(draft: DraftPost): void {
  const drafts = getDrafts()
  const idx = drafts.findIndex((d) => d.id === draft.id)
  const now = Date.now()
  const draftToSave: DraftPost = { ...draft, updatedAt: now }
  if (idx > -1) {
    drafts[idx] = draftToSave
  } else {
    drafts.unshift(draftToSave)
  }
  Taro.setStorageSync(DRAFT_KEY, drafts)
}

export function removeDraft(id: string): void {
  const drafts = getDrafts().filter((d) => d.id !== id)
  Taro.setStorageSync(DRAFT_KEY, drafts)
}

export function clearDrafts(): void {
  Taro.removeStorageSync(DRAFT_KEY)
}
