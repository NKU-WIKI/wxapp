import { View, ScrollView, Text, Image } from '@tarojs/components'
import CustomHeader from '@/components/custom-header'
import ErrandsTabBar from '../../../components/ErrandsTabBar'
import styles from './index.module.scss'

const mockStats = {
  totalIncome: '2,358.00',
  todayIncome: '128.00',
}

const menuItems = [
  { id: 1, label: '订单统计', icon: '/assets/icons/stats.svg' },
  { id: 2, label: '投诉处理', icon: '/assets/icons/complaint.svg', badge: 2 },
  { id: 3, label: '跑腿协议', icon: '/assets/icons/agreement.svg' },
  { id: 4, label: '客服中心', icon: '/assets/icons/support.svg' },
]

const orderManagementItems = [
  { id: 1, label: '待接单', icon: '/assets/icons/pending.svg', count: 2 },
  { id: 2, label: '进行中', icon: '/assets/icons/in-progress.svg' },
  { id: 3, label: '已完成', icon: '/assets/icons/completed.svg' },
  { id: 4, label: '已取消', icon: '/assets/icons/cancelled.svg' },
]

const ErrandsMyPage = () => {
  // 视觉占位
  const StatsCard = () => (
    <View className={styles.statsCard}>
      <View className={styles.statItem}>
        <Text className={styles.statValue}>¥{mockStats.totalIncome}</Text>
        <Text className={styles.statLabel}>累计收入</Text>
      </View>
      <View className={styles.statItem}>
        <Text className={styles.statValue}>¥{mockStats.todayIncome}</Text>
        <Text className={styles.statLabel}>今日收入</Text>
      </View>
    </View>
  )

  const MenuGrid = ({ items }) => (
    <View className={styles.menuGrid}>
      {items.map((item) => (
        <View key={item.id} className={styles.menuItem}>
          {item.badge && (
            <View className={styles.badge}>
              <Text>{item.badge}</Text>
            </View>
          )}
          <Image src={item.icon} className={styles.menuIcon} />
          <Text className={styles.menuLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  )

  const Section = ({ title, children }) => (
    <View className={styles.section}>
      <Text className={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title="我的" />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }}>
          <StatsCard />
          <MenuGrid items={menuItems} />
          <Section title="订单管理">
            <MenuGrid items={orderManagementItems} />
          </Section>
        </ScrollView>
      </View>
      <ErrandsTabBar activeTab="my" />
    </View>
  )
}

export default ErrandsMyPage
