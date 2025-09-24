import Taro from '@tarojs/taro'

/**
 * 网络诊断结果接口
 */
export interface NetworkDiagnosisResult {
  networkType: string
  isConnected: boolean
}

/**
 * 执行网络诊断
 * @returns {Promise<NetworkDiagnosisResult>} 诊断结果
 */
export const performNetworkDiagnosis = async (): Promise<NetworkDiagnosisResult> => {
  // 检查网络连接状态
  const networkInfo = await Taro.getNetworkType()
  const isConnected = networkInfo.networkType !== 'none'

  return {
    networkType: networkInfo.networkType,
    isConnected,
  }
}

/**
 * 显示网络诊断结果
 * @param result 诊断结果
 */
export const showDiagnosisResult = (result: NetworkDiagnosisResult) => {
  const networkTypeMap: Record<string, string> = {
    wifi: 'WiFi',
    '2g': '2G',
    '3g': '3G',
    '4g': '4G',
    '5g': '5G',
    unknown: '未知',
    none: '无网络',
  }

  const networkTypeText = networkTypeMap[result.networkType] || result.networkType
  const connectionStatus = result.isConnected ? '已连接' : '未连接'

  const content = `网络类型: ${networkTypeText}\n连接状态: ${connectionStatus}`

  Taro.showModal({
    title: '网络诊断结果',
    content,
    showCancel: false,
    confirmText: '确定',
  })
}

/**
 * 执行完整的网络诊断并显示结果
 */
export const runNetworkDiagnosis = async () => {
  Taro.showLoading({
    title: '诊断中...',
    mask: true,
  })

  try {
    const result = await performNetworkDiagnosis()
    showDiagnosisResult(result)
  } catch (error) {
    Taro.showToast({
      title: '诊断失败，请重试',
      icon: 'none',
    })
  } finally {
    Taro.hideLoading()
  }
}
