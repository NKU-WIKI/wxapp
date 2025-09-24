import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

import React from 'react'

import styles from './index.module.scss'

import AboutIcon from '@/components/about-icons'
import { CompanyInfo, LinkType } from '@/types/about'

const AboutPage: React.FC = () => {
  // 公司信息数据
  const companyInfo: CompanyInfo = {
    appName: 'nkuwiki',
    version: 'Version 1.0.0',
    website: 'https://nkuwiki.com',
    email: 'support@nkuwiki.com',
    github: 'NKU-WIKI',
    teamName: 'nkuwiki team',
    companyName: '沈阳最优解教育科技有限公司',
  }

  // 处理链接点击
  const handleLinkClick = (type: LinkType) => {
    switch (type) {
      case 'website':
        Taro.setClipboardData({
          data: companyInfo.website,
          success: () => {
            Taro.showToast({
              title: '网址已复制',
              icon: 'success',
            })
          },
        })
        break
      case 'email':
        Taro.setClipboardData({
          data: companyInfo.email,
          success: () => {
            Taro.showToast({
              title: '邮箱已复制',
              icon: 'success',
            })
          },
        })
        break
      case 'github':
        Taro.setClipboardData({
          data: companyInfo.github,
          success: () => {
            Taro.showToast({
              title: 'GitHub已复制',
              icon: 'success',
            })
          },
        })
        break
    }
  }

  return (
    <View className={styles.aboutPage}>
      {/* 内容区域 */}
      <View className={styles.content}>
        <View className={styles.container}>
          {/* 应用信息区域 */}
          <View className={styles.appInfo}>
            <View className={styles.logo}>
              <Image src="/assets/logo.png" className={styles.logoImage} mode="aspectFit" />
            </View>
            <View className={styles.appTextContainer}>
              <Text className={styles.appName}>{companyInfo.appName}</Text>
              <Text className={styles.version}>{companyInfo.version}</Text>
              <Text className={styles.subtitle}>校园知识共享平台</Text>
            </View>
          </View>

          {/* 愿景与目标 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>愿景与目标</Text>
            <View className={styles.visionContainer}>
              <Text className={styles.visionText}>
                我们致力于构建南开知识共同体，践行开源共治惠普三位一体价值体系（技术开源透明+社区协同共治+服务永久惠普），实现知识的自由流动与共享。
              </Text>
            </View>
          </View>

          {/* 相关链接 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>相关链接</Text>
            <View className={styles.linkList}>
              <View className={styles.linkItem} onClick={() => handleLinkClick('website')}>
                <View className={styles.linkIcon}>
                  <AboutIcon type="globe" size={20} color="#4a99cf" />
                </View>
                <Text className={styles.linkText}>官方网站: {companyInfo.website}</Text>
                <View className={styles.linkArrow}>
                  <AboutIcon type="arrow-right" size={16} color="#9B9B9B" />
                </View>
              </View>

              <View className={styles.linkItem} onClick={() => handleLinkClick('email')}>
                <View className={styles.linkIcon}>
                  <AboutIcon type="email" size={20} color="#4a99cf" />
                </View>
                <Text className={styles.linkText}>联系我们: {companyInfo.email}</Text>
                <View className={styles.linkArrow}>
                  <AboutIcon type="arrow-right" size={16} color="#9B9B9B" />
                </View>
              </View>

              <View className={styles.linkItem} onClick={() => handleLinkClick('github')}>
                <View className={styles.linkIcon}>
                  <AboutIcon type="github" size={20} color="#4a99cf" />
                </View>
                <Text className={styles.linkText}>GitHub: {companyInfo.github}</Text>
                <View className={styles.linkArrow}>
                  <AboutIcon type="arrow-right" size={16} color="#9B9B9B" />
                </View>
              </View>
            </View>
          </View>

          {/* 开发团队 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>开发团队</Text>
            <View className={styles.teamContainer}>
              <Text className={styles.teamName}>{companyInfo.teamName}</Text>
            </View>
          </View>

          {/* 注册公司 */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>注册公司</Text>
            <View className={styles.companyContainer}>
              <Text className={styles.companyName}>{companyInfo.companyName}</Text>
            </View>
          </View>

          {/* 调试区域 - 仅开发环境显示 */}
          {process.env.NODE_ENV === 'development' && (
            <View className={styles.debugSection}>
              <Text className={styles.debugTitle}>开发调试</Text>
              <View
                className={styles.debugButton}
                onClick={async () => {
                  try {
                    // 测试租户ID获取
                    const { getDefaultTenantId } = await import('@/services/request')
                    const tenantId = getDefaultTenantId()
                    Taro.showModal({
                      title: '租户ID信息',
                      content: `当前租户ID: ${tenantId}`,
                      showCancel: false,
                      confirmText: '确定',
                    })
                  } catch (error) {
                    Taro.showModal({
                      title: '调试错误',
                      content: `获取租户ID失败: ${error}`,
                      showCancel: false,
                      confirmText: '确定',
                    })
                  }
                }}
              >
                <Text className={styles.debugButtonText}>测试租户ID</Text>
              </View>

              <View
                className={styles.debugButton}
                onClick={async () => {
                  try {
                    // 测试搜索API
                    const { default: searchApi } = await import('@/services/api/search')
                    const hotQueries = await searchApi.getHotQueriesSimple()
                    Taro.showModal({
                      title: '搜索API测试',
                      content: `热门搜索词数量: ${hotQueries.length}\n前3个: ${hotQueries.slice(0, 3).join(', ')}`,
                      showCancel: false,
                      confirmText: '确定',
                    })
                  } catch (error) {
                    Taro.showModal({
                      title: '搜索API错误',
                      content: `测试失败: ${error}`,
                      showCancel: false,
                      confirmText: '确定',
                    })
                  }
                }}
              >
                <Text className={styles.debugButtonText}>测试搜索API</Text>
              </View>
            </View>
          )}

          {/* 底部版权信息 */}
          <View className={styles.footer}>
            <Text className={styles.copyright}>©2025 nkuwiki team</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default AboutPage
