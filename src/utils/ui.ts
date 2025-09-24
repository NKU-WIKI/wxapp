import Taro from '@tarojs/taro'

interface ToastOptions {
  type?: 'success' | 'error' | 'loading' | 'none' | 'info'
  duration?: number
}

/**
 * 显示一个轻提示
 * @param title 提示的内容
 * @param options 配置项
 */
export const showToast = (title: string, options: ToastOptions = {}) => {
  const { type = 'none', duration = 2000 } = options

  let iconType: 'success' | 'error' | 'loading' | 'none' = 'none'
  if (type === 'success' || type === 'error' || type === 'loading') {
    iconType = type
  }

  Taro.showToast({
    title,
    icon: iconType,
    duration,
  })
}
