import { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import 'taro-ui/dist/style/index.scss'
import { store } from './store'
import './app.scss'

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

function App({ children }: PropsWithChildren) {
  // The auth check is handled by the initial state in userSlice,
  // so the useEffect hook for checkAuth is not needed here.
  return <Provider store={store}>{children}</Provider>
}

export default App
