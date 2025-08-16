import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import 'taro-ui/dist/style/index.scss'
import store, { persistor } from './store'
import { DEFAULT_DEV_TOKEN } from './constants'
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

  // 在应用启动时检查并设置默认 Token
  if (!Taro.getStorageSync('token')) {
    Taro.setStorageSync('token', DEFAULT_DEV_TOKEN);
  }

  useLaunch(() => {
    // On app launch, check and set a default token if none exists.
    if (!Taro.getStorageSync("token")) {
      Taro.setStorageSync("token", DEFAULT_DEV_TOKEN);
    }
    // Then, immediately try to fetch the current user to verify the token.
    // This will set the correct isLoggedIn state application-wide.
    store.dispatch(fetchCurrentUser());
  })

  // children 是将要会渲染的页面
  // The auth check is handled by the initial state in userSlice,
  // so the useEffect hook for checkAuth is not needed here.
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default App
