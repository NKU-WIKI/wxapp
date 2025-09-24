import { RootState } from '@/store'
import { User } from '@/types/api/user'

// 隐私权限检查工具
export class PrivacyChecker {
  /**
   * 检查是否可以评论某用户的帖子
   */
  static canComment(
    postAuthor: User,
    currentUser: User | null,
    authorSettings: RootState['settings']
  ): boolean {
    // 如果没有登录，不能评论
    if (!currentUser) return false

    // 如果是自己的帖子，可以评论
    if (postAuthor.id === currentUser.id) return true

    // 根据帖子作者的隐私设置判断
    switch (authorSettings.whoCanComment) {
      case 'everyone':
        return true
      case 'followers':
        // 需要检查是否是关注者，这里简化处理，假设已关注
        return true // 实际应该查询关注关系
      case 'none':
        return false
      default:
        return false
    }
  }

  /**
   * 检查是否可以查看某用户的帖子
   */
  static canViewPost(
    postAuthor: User,
    currentUser: User | null,
    authorSettings: RootState['settings']
  ): boolean {
    // 如果是自己的帖子，总是可以查看
    if (currentUser && postAuthor.id === currentUser.id) return true

    // 根据帖子作者的隐私设置判断
    switch (authorSettings.whoCanViewPosts) {
      case 'everyone':
        return true
      case 'followers':
        // 如果没有登录，不能查看
        if (!currentUser) return false
        // 需要检查是否是关注者，这里简化处理
        return true // 实际应该查询关注关系
      case 'self':
        // 只有自己可以查看
        return currentUser ? postAuthor.id === currentUser.id : false
      default:
        return false
    }
  }

  /**
   * 获取隐私设置的描述文本
   */
  static getPrivacyDescription(setting: 'everyone' | 'followers' | 'none' | 'self'): string {
    switch (setting) {
      case 'everyone':
        return '所有人都可以'
      case 'followers':
        return '仅关注的人可以'
      case 'none':
        return '不允许任何人'
      case 'self':
        return '仅自己可以'
      default:
        return '未知设置'
    }
  }

  /**
   * 检查用户是否关注了目标用户
   * 这是一个占位函数，实际应用中需要调用API
   */
  static async isFollowing(_userId: string, _targetUserId: string): Promise<boolean> {
    // TODO: 实现关注关系检查API调用
    // 这里返回true作为占位
    return Promise.resolve(true)
  }
}

// 导出便捷的Hook
export const usePrivacyCheck = () => {
  return {
    canComment: PrivacyChecker.canComment,
    canViewPost: PrivacyChecker.canViewPost,
    getPrivacyDescription: PrivacyChecker.getPrivacyDescription,
    isFollowing: PrivacyChecker.isFollowing,
  }
}
