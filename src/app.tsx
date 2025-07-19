import 'abort-controller/polyfill';
import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { Provider } from 'react-redux'
import 'taro-ui/dist/style/index.scss'
import { store } from './store'
import './app.scss'

function App({ children }: PropsWithChildren) {
  // The auth check is handled by the initial state in userSlice,
  // so the useEffect hook for checkAuth is not needed here.
  return <Provider store={store}>{children}</Provider>
}

export default App
