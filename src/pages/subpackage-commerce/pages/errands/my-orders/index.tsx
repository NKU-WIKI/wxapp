import { View, ScrollView, Text } from '@tarojs/components'
import CustomHeader from '@/components/custom-header'
import ErrandsTabBar from '../../../components/ErrandsTabBar'
import styles from './index.module.scss'

// 模拟的订单数据
const mockOrders = [
  {
    id: 1,
    date: '07-25 11:08',
    status: '已完成',
    from: { type: '取', location: '(津南校区)文科菜鸟驿站', phone: '166****9529' },
    to: { type: '送', location: '(津南校区)学10B楼下', phone: '166****9529' },
  },
  {
    id: 2,
    date: '07-26 14:30',
    status: '进行中',
    from: { type: '取', location: '第一食堂', phone: '138****1234' },
    to: { type: '送', location: '图书馆二楼', phone: '138****1234' },
  },
]

const ErrandsMyOrdersPage = () => {
  // 视觉占位
  const FilterTabs = () => (
    <View className={styles.filterTabs}>
      <Text className={`${styles.tab} ${styles.active}`}>我发的单</Text>
      <Text className={styles.tab}>我接的单</Text>
    </View>
  )

  const OrderCard = ({ order }) => (
    <View className={styles.orderCard}>
      <View className={styles.cardHeader}>
        <Text className={styles.orderDate}>{order.date}</Text>
        <Text className={styles.orderStatus}>{order.status}</Text>
      </View>
      <View className={styles.cardBody}>
        <View className={styles.locationRow}>
          <Text className={`${styles.tag} ${styles.tagFrom}`}>{order.from.type}</Text>
          <View className={styles.locationDetails}>
            <Text className={styles.locationText}>{order.from.location}</Text>
            <Text className={styles.phoneText}>{order.from.phone}</Text>
          </View>
        </View>
        <View className={styles.locationRow}>
          <Text className={`${styles.tag} ${styles.tagTo}`}>{order.to.type}</Text>
          <View className={styles.locationDetails}>
            <Text className={styles.locationText}>{order.to.location}</Text>
            <Text className={styles.phoneText}>{order.to.phone}</Text>
          </View>
        </View>
      </View>
    </View>
  )

  const EmptyState = () => (
    <View className={styles.emptyState}>
      <Text>没有更多了</Text>
    </View>
  )

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title="我的订单" />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <FilterTabs />
        <ScrollView scrollY style={{ height: 'calc(100% - 45px)' }}>
          {' '}
          {/* Adjust height for FilterTabs */}
          <View className={styles.orderList}>
            {mockOrders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
            <EmptyState />
          </View>
        </ScrollView>
      </View>
      <ErrandsTabBar activeTab="orders" />
    </View>
  )
}

export default ErrandsMyOrdersPage
