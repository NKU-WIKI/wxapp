import { useSelector } from 'react-redux'
import Taro from '@tarojs/taro'
import { RootState } from '@/store'

export const useAuthGuard = () => {
  const { isLoggedIn, token } = useSelector((state: RootState) => state.user)

  const checkAuth = () => {
    if (!isLoggedIn || !token) {
      Taro.showModal({
        title: '请先登录',
        content: '您需要登录才能执行此操作，是否立即前往登录页面？',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/subpackage-profile/login/index' })
          }
        },
      })
      return false
    }
    return true
  }

  return { checkAuth, isLoggedIn }
}
