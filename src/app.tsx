import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import 'taro-ui/dist/style/index.scss'
import store, { persistor } from './store'
import { initTabBarSync } from './utils/tabBarSync'
import './app.scss'
import { fetchCurrentUser } from "./store/slices/userSlice";

// AbortController polyfill for WeChat miniprogram
if (typeof globalThis.AbortController === 'undefined') {
  globalThis.AbortController = class AbortController {
    signal: any;
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      };
    }
    abort() {
      this.signal.aborted = true;
    }
  };
}

// 初始化导航栏状态同步
initTabBarSync();

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    // 检查是否有存储的token
    const storedToken = Taro.getStorageSync("token");
    
    if (storedToken) {
      // 如果有token，尝试验证其有效性
      store.dispatch(fetchCurrentUser());
    } else {
      // 如果没有token，直接设置为未登录状态
      console.log("No token found, user needs to login");
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
