import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import 'taro-ui/dist/style/index.scss'
import store, { persistor } from './store'
import { initTabBarSync } from './utils/tabBarSync'
import './app.scss'
import { fetchCurrentUser, fetchAboutInfo } from "./store/slices/userSlice";
import { initializeSettings, applyFontSize, applyNightMode } from "./store/slices/settingsSlice";


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
    // 初始化设置
    store.dispatch(initializeSettings());

    // 获取应用信息（包含租户信息）
    console.log('应用启动 - 开始获取aboutInfo');
    store.dispatch(fetchAboutInfo());

    // 等待一会儿确保aboutInfo加载完成
    setTimeout(() => {
      const currentState = store.getState();
      console.log('应用启动 - aboutInfo加载状态:', currentState.user.aboutInfo);
      console.log('应用启动 - aboutInfo状态:', currentState.user.aboutStatus);
    }, 2000);

    // 应用当前设置
    const state = store.getState();
    const settings = state.settings;

    // 应用字体大小和夜间模式
    applyFontSize(settings.fontSize);
    applyNightMode(settings.nightMode);

    // 检查是否有存储的token
    const storedToken = Taro.getStorageSync("token");
    console.log('应用启动 - 存储的token:', storedToken ? '存在' : '不存在');

    if (storedToken) {
      // 如果有token，尝试验证其有效性
      store.dispatch(fetchCurrentUser());
    } else {
      console.log('应用启动 - 未登录状态，所有请求将使用x-tenant-id头');
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
