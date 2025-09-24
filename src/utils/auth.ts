import { store } from '@/store'
import Taro from '@tarojs/taro'

/**
 * 检查用户是否已登录
 * @returns {boolean} 用户是否已登录
 */
export const isLoggedIn = (): boolean => {
  const state = store.getState()
  return !!(state.user.user && state.user.token)
}

/**
 * 检查登录状态，如果未登录则显示友好的模态框提示引导用户登录
 * @returns {Promise<boolean>} 用户是否已登录且愿意继续操作
 */
export const checkLoginWithModal = async (): Promise<boolean> => {
  if (isLoggedIn()) {
    return true
  }

  return new Promise((resolve) => {
    Taro.showModal({
      title: '提示',
      content: '此功能需要登录后才能使用，是否前往登录？',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 跳转到登录页面
          Taro.navigateTo({
            url: '/pages/subpackage-profile/login/index',
            fail: () => {
              // 如果navigateTo失败，尝试使用redirectTo
              Taro.redirectTo({
                url: '/pages/subpackage-profile/login/index',
              })
            },
          })
        }
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      },
    })
  })
}

/**
 * 检查登录状态，如果未登录则显示简单Toast提示
 * @returns {boolean} 用户是否已登录
 */
export const checkLoginWithToast = (): boolean => {
  if (isLoggedIn()) {
    return true
  }

  Taro.showToast({
    title: '请先登录',
    icon: 'none',
    duration: 2000,
  })

  return false
}

/**
 * 需要登录权限的高阶函数包装器
 * @param fn 需要登录权限的函数
 * @param useModal 是否使用模态框提示，默认true
 * @returns 包装后的函数
 */
export const withLoginCheck = <T extends any[], R>(
  _fn: (..._args: T) => R,
  useModal: boolean = true
) => {
  return async (..._args: T): Promise<R | undefined> => {
    const hasLogin = useModal ? await checkLoginWithModal() : checkLoginWithToast()

    if (!hasLogin) {
      return undefined
    }

    return fn(...args)
  }
}
