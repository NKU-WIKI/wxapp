import 'abort-controller/polyfill';
import { PropsWithChildren, useEffect } from 'react'
import { useLaunch } from '@tarojs/taro'
import { Provider } from 'react-redux'
import 'taro-ui/dist/style/index.scss'
import { store } from './store'
import { checkAuth } from './store/slices/userSlice'
import './app.scss'

function App({ children }: PropsWithChildren) {

  useEffect(() => {
    store.dispatch(checkAuth())
  }, [])

  return <Provider store={store}>{children}</Provider>
}

export default App
