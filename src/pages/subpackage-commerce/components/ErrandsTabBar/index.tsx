import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface Props {
  activeTab: 'home' | 'orders' | 'my'
}

const ErrandsTabBar = ({ activeTab }: Props) => {
  const tabs = [
    { key: 'home', name: '首页', path: '/pages/subpackage-commerce/pages/errands/home/index' },
    {
      key: 'orders',
      name: '订单',
      path: '/pages/subpackage-commerce/pages/errands/my-orders/index',
    },
    { key: 'my', name: '我的', path: '/pages/subpackage-commerce/pages/errands/my/index' },
  ]

  const handleTabClick = (path) => {
    const currentPages = Taro.getCurrentPages()
    const currentPage = currentPages[currentPages.length - 1]
    // Avoid navigating to the same page
    if (currentPage && `/${currentPage.route}` === path) {
      return
    }
    Taro.redirectTo({ url: path })
  }

  return (
    <View className={styles.tabBarContainer}>
      {tabs.map((tab) => (
        <View
          key={tab.key}
          className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <Text>{tab.name}</Text>
        </View>
      ))}
    </View>
  )
}

export default ErrandsTabBar
