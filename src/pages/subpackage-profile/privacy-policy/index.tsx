import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

/**
 * 隐私政策页面
 * 展示详细的隐私政策条款
 */
export default function PrivacyPolicyPage() {
  const handleBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className={styles.container}>
      {/* 顶部导航栏 */}
      <View className={styles.header}>
        <Text className={styles.backBtn} onClick={handleBack}>
          返回
        </Text>
        <Text className={styles.title}>隐私政策</Text>
      </View>

      {/* 政策内容 */}
      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>1. 信息收集与使用</Text>
          <Text className={styles.sectionContent}>
            nku元智wiki（以下简称&quot;本平台&quot;）非常重视用户的隐私保护。
            我们会按照本隐私政策收集、使用和保护您的个人信息。
          </Text>
          <Text className={styles.sectionContent}>我们可能收集的个人信息包括：</Text>
          <Text className={styles.listItem}>• 账户信息：用户名、密码、昵称</Text>
          <Text className={styles.listItem}>• 联系信息：手机号码、邮箱地址</Text>
          <Text className={styles.listItem}>• 设备信息：设备型号、操作系统、IP地址</Text>
          <Text className={styles.listItem}>• 使用信息：访问记录、操作日志</Text>
          <Text className={styles.listItem}>• 位置信息：地理位置（仅在获得授权后）</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>2. 信息存储与安全</Text>
          <Text className={styles.sectionContent}>
            2.1 我们会采取合理的技术和组织措施保护您的个人信息安全。
          </Text>
          <Text className={styles.sectionContent}>
            2.2 个人信息存储在中国大陆境内，不涉及跨境传输。
          </Text>
          <Text className={styles.sectionContent}>
            2.3 我们会定期审查和更新安全措施，确保信息安全。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>3. 信息使用目的</Text>
          <Text className={styles.sectionContent}>我们收集和使用您的个人信息用于以下目的：</Text>
          <Text className={styles.listItem}>• 提供基础的平台服务和功能</Text>
          <Text className={styles.listItem}>• 维护平台安全和秩序</Text>
          <Text className={styles.listItem}>• 改进和优化用户体验</Text>
          <Text className={styles.listItem}>• 发送重要的服务通知</Text>
          <Text className={styles.listItem}>• 提供客户服务和技术支持</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>4. 信息共享与披露</Text>
          <Text className={styles.sectionContent}>
            4.1 我们不会向第三方出售、出租或以其他方式披露您的个人信息，除非：
          </Text>
          <Text className={styles.listItem}>• 获得您的明确同意</Text>
          <Text className={styles.listItem}>• 法律法规要求</Text>
          <Text className={styles.listItem}>• 保护平台和用户权益</Text>
          <Text className={styles.listItem}>• 涉及合并、收购或资产转让</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>5. Cookie 和本地存储</Text>
          <Text className={styles.sectionContent}>
            5.1 我们使用 Cookie 和本地存储技术来改善用户体验。
          </Text>
          <Text className={styles.sectionContent}>
            5.2 这些技术帮助我们记住您的偏好和设置，但不会收集敏感信息。
          </Text>
          <Text className={styles.sectionContent}>
            5.3 您可以通过浏览器设置控制 Cookie 的使用。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>6. 第三方服务</Text>
          <Text className={styles.sectionContent}>
            6.1 本平台可能使用第三方服务（如微信登录），这些服务有各自的隐私政策。
          </Text>
          <Text className={styles.sectionContent}>
            6.2 我们会要求第三方服务提供商保护您的信息安全。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>7. 未成年人保护</Text>
          <Text className={styles.sectionContent}>7.1 本平台主要面向18岁以上的用户。</Text>
          <Text className={styles.sectionContent}>
            7.2 若您是未成年人，请在监护人指导下使用本平台。
          </Text>
          <Text className={styles.sectionContent}>
            7.3 我们会采取额外措施保护未成年人的信息安全。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>8. 您的权利</Text>
          <Text className={styles.sectionContent}>您对个人信息享有以下权利：</Text>
          <Text className={styles.listItem}>• 访问和查看您的个人信息</Text>
          <Text className={styles.listItem}>• 更正不准确的信息</Text>
          <Text className={styles.listItem}>• 删除您的个人信息</Text>
          <Text className={styles.listItem}>• 撤销对信息处理的同意</Text>
          <Text className={styles.listItem}>• 投诉和举报</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>9. 信息保留期限</Text>
          <Text className={styles.sectionContent}>
            9.1 我们会根据业务需要和法律法规要求保留您的个人信息。
          </Text>
          <Text className={styles.sectionContent}>
            9.2 当您注销账户或不再使用服务时，我们会按照相关法律法规处理您的信息。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>10. 隐私政策更新</Text>
          <Text className={styles.sectionContent}>10.1 我们可能不定期更新本隐私政策。</Text>
          <Text className={styles.sectionContent}>
            10.2 重大变更时，我们会通过平台通知等方式告知您。
          </Text>
          <Text className={styles.sectionContent}>
            10.3 您继续使用服务即视为接受更新后的隐私政策。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>11. 联系我们</Text>
          <Text className={styles.sectionContent}>
            如果您对本隐私政策或个人信息处理有任何疑问，请通过以下方式联系我们：
          </Text>
          <Text className={styles.listItem}>• 邮箱：support@nkuwiki.com</Text>
          <Text className={styles.listItem}>• 微信公众号：nku元智wiki</Text>
          <Text className={styles.listItem}>• 平台内反馈功能</Text>
        </View>

        <View className={styles.footer}>
          <Text className={styles.updateTime}>最后更新时间：2025年8月</Text>
        </View>
      </ScrollView>
    </View>
  )
}
