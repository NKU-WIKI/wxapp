import Taro, { useLaunch } from '@tarojs/taro'

import { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import 'taro-ui/dist/style/index.scss'
import store, { persistor } from './store'
import { fetchUnreadCounts } from './store/slices/notificationSlice'
import { initializeSettings, applyFontSize, applyNightMode } from './store/slices/settingsSlice'
import { fetchCurrentUser, fetchAboutInfo } from './store/slices/userSlice'
import { initTabBarSync } from './utils/tabBarSync'
import './app.scss'

// AbortController polyfill for WeChat miniprogram
if (typeof globalThis.AbortController === 'undefined') {
  globalThis.AbortController = class AbortController {
    signal: any
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }
    }
    abort() {
      this.signal.aborted = true
    }
  }
}

// 初始化导航栏状态同步
initTabBarSync()

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    // 初始化设置
    store.dispatch(initializeSettings())

    // 获取应用信息（包含租户信息）
    store.dispatch(fetchAboutInfo())

    // 等待一会儿确保aboutInfo加载完成
    setTimeout(() => {
      // 等待aboutInfo加载完成
    }, 2000)

    // 应用当前设置
    const state = store.getState()
    const settings = state.settings

    // 应用字体大小和夜间模式
    applyFontSize(settings.fontSize)
    applyNightMode(settings.nightMode)

    // 检查是否有存储的token
    const storedToken = Taro.getStorageSync('token')

    if (storedToken) {
      // 如果有token，尝试验证其有效性
      store.dispatch(fetchCurrentUser())

      // 获取未读通知数量（仅在已登录时）
      store.dispatch(fetchUnreadCounts()).catch((_error) => {
        // 静默处理错误，不影响应用启动
      })
    } else {
      // 未登录状态，所有请求将使用x-tenant-id头
    }
  })

  // children 是将要会渲染的页面
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default App
