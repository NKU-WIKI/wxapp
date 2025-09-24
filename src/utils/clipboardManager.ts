import Taro from '@tarojs/taro'

import { store } from '@/store'

/**
 * 检查剪切板访问权限
 * @returns {boolean} 是否允许访问剪切板
 */
export const checkClipboardPermission = (): boolean => {
  const state = store.getState()
  return state.settings.allowClipboardAccess
}

/**
 * 安全地读取剪切板内容
 * @returns {Promise<string>} 剪切板内容，如果无权限或读取失败返回空字符串
 */
export const safeGetClipboardData = async (): Promise<string> => {
  if (!checkClipboardPermission()) {
    Taro.showToast({
      title: '剪切板访问已禁用，请在设置中开启',
      icon: 'none',
      duration: 2500,
    })
    return ''
  }

  try {
    const res = await Taro.getClipboardData()
    return res.data || ''
  } catch (error) {
    // 静默处理错误，避免过多提示
    return ''
  }
}

/**
 * 安全地设置剪切板内容
 * @param data 要设置的内容
 * @returns {Promise<boolean>} 是否设置成功
 */
export const safeSetClipboardData = async (data: string): Promise<boolean> => {
  if (!checkClipboardPermission()) {
    Taro.showToast({
      title: '剪切板访问已禁用，请在设置中开启',
      icon: 'none',
      duration: 2500,
    })
    return false
  }

  try {
    await Taro.setClipboardData({ data })
    return true
  } catch (error) {
    Taro.showToast({
      title: '复制失败',
      icon: 'none',
    })
    return false
  }
}
