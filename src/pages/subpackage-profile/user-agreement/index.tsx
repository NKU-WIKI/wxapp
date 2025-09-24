import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

import styles from './index.module.scss'

/**
 * 用户服务协议页面
 * 展示详细的用户服务协议条款
 */
export default function UserAgreementPage() {
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
        <Text className={styles.title}>用户服务协议</Text>
      </View>

      {/* 协议内容 */}
      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>1. 协议的确认和接受</Text>
          <Text className={styles.sectionContent}>
            nku元智wiki（以下简称&quot;本平台&quot;）根据相关法律法规和技术规范，制定本用户服务协议（以下简称&quot;本协议&quot;）。
            您在使用本平台提供的各项服务前，请您务必仔细阅读并透彻理解本协议的全部内容。
            您在注册或使用本平台服务时，视为您已充分阅读、理解并接受本协议的全部内容，并承诺遵守本协议。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>2. 服务内容</Text>
          <Text className={styles.sectionContent}>本平台为高校师生提供以下服务：</Text>
          <Text className={styles.listItem}>• 校园信息分享和交流平台</Text>
          <Text className={styles.listItem}>• 学术资源和学习资料共享</Text>
          <Text className={styles.listItem}>• 校园活动和通知发布</Text>
          <Text className={styles.listItem}>• AI 智能助手服务</Text>
          <Text className={styles.listItem}>• 其他符合法律法规的校园服务</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>3. 用户注册与账户管理</Text>
          <Text className={styles.sectionContent}>
            3.1 您在注册账户时，应提供真实、准确、完整的个人信息，并及时更新以确保信息的有效性。
          </Text>
          <Text className={styles.sectionContent}>
            3.2 您应妥善保管账户信息和密码，对账户下发生的所有行为承担责任。
          </Text>
          <Text className={styles.sectionContent}>
            3.3 您承诺不会将账户转让、出租或出借给他人使用。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>4. 用户行为规范</Text>
          <Text className={styles.sectionContent}>
            4.1 您承诺在平台上发布的内容符合法律法规，不得：
          </Text>
          <Text className={styles.listItem}>• 发布虚假、误导性信息</Text>
          <Text className={styles.listItem}>• 侵犯他人知识产权</Text>
          <Text className={styles.listItem}>• 发布色情、暴力、恐怖内容</Text>
          <Text className={styles.listItem}>• 进行商业广告或 spam 行为</Text>
          <Text className={styles.listItem}>• 其他违法违规行为</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>5. 内容所有权和使用许可</Text>
          <Text className={styles.sectionContent}>
            5.1 您对上传的内容享有相应权利，但授予本平台非独占、免费的使用许可。
          </Text>
          <Text className={styles.sectionContent}>
            5.2 本平台有权对违规内容进行删除或屏蔽处理。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>6. 服务中断和终止</Text>
          <Text className={styles.sectionContent}>
            6.1 本平台有权根据需要暂停或终止部分或全部服务。
          </Text>
          <Text className={styles.sectionContent}>6.2 您有权随时终止使用本平台服务。</Text>
          <Text className={styles.sectionContent}>6.3 严重违规用户，本平台有权永久封禁账户。</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>7. 免责声明</Text>
          <Text className={styles.sectionContent}>
            7.1 本平台不对用户发布的内容真实性、准确性负责。
          </Text>
          <Text className={styles.sectionContent}>
            7.2 因不可抗力等原因导致的服务中断，本平台不承担责任。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>8. 协议修改</Text>
          <Text className={styles.sectionContent}>
            本平台有权根据需要修改本协议，修改后的协议将在平台上公布。
            您继续使用服务即视为接受修改后的协议。
          </Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>9. 法律适用</Text>
          <Text className={styles.sectionContent}>
            本协议适用中华人民共和国法律法规。如发生争议，应通过友好协商解决；
            协商不成的，可向沈阳最优解教育科技有限公司申请仲裁，或向有管辖权的人民法院提起诉讼。
          </Text>
        </View>

        <View className={styles.footer}>
          <Text className={styles.updateTime}>最后更新时间：2025年8月</Text>
        </View>
      </ScrollView>
    </View>
  )
}
