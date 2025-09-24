
import { useState, useCallback, useEffect } from 'react'

import { View, ScrollView, Text, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { useDispatch, useSelector } from 'react-redux'


import CustomHeader from '@/components/custom-header'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { RootState, AppDispatch } from '@/store'
import { createErrand, clearError } from '@/store/slices/marketplaceSlice'
import { ErrandType } from '@/types/api/marketplace.d'

import styles from './index.module.scss'


const ErrandsPublishPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { checkAuth } = useAuthGuard()
  const { createErrandLoading, error } = useSelector((state: RootState) => state.marketplace)

  // 表单状态
  const [errandType, setErrandType] = useState<ErrandType>(ErrandType.EXPRESS_PICKUP)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [reward, setReward] = useState('')
  const [locationFrom, setLocationFrom] = useState('')
  const [locationTo, setLocationTo] = useState('')
  const [deadline, setDeadline] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  // 表单验证
  const validateForm = useCallback(() => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入任务标题', icon: 'none' })
      return false
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入任务详情', icon: 'none' })
      return false
    }
    if (!reward.trim()) {
      Taro.showToast({ title: '请输入悬赏金额', icon: 'none' })
      return false
    }
    if (parseFloat(reward) <= 0) {
      Taro.showToast({ title: '悬赏金额必须大于0', icon: 'none' })
      return false
    }
    return true
  }, [title, content, reward])

  // 处理发布
  const handlePublish = useCallback(async () => {
    if (!checkAuth()) return

    if (!validateForm()) return

    try {
      const errandData = {
        title: title.trim(),
        content: content.trim(),
        errand_type: errandType,
        reward: parseFloat(reward),
        location_from: locationFrom.trim() || undefined,
        location_to: locationTo.trim() || undefined,
        deadline: deadline.trim() || undefined,
        contact_info: contactInfo.trim() || undefined,
      }

      await dispatch(createErrand(errandData)).unwrap()

      Taro.showToast({ title: '发布成功', icon: 'success' })

      // 使用更短的延迟时间，避免页面跳转时的DOM冲突
      setTimeout(() => {
        // 发送刷新事件通知主页
        Taro.eventCenter.trigger('refreshErrandsListings')

        // 使用更保守的导航方式
        Taro.navigateBack({
          delta: 1,
          success: () => {
            // 导航成功，无需额外处理
          },
          fail: (_navError) => {
            // 导航失败，静默处理
          },
        })
      }, 300)
    } catch (catchError) {
      //
      // 错误已经在slice中处理了，这里不需要额外处理
    }
  }, [
    checkAuth,
    validateForm,
    title,
    content,
    errandType,
    reward,
    locationFrom,
    locationTo,
    deadline,
    contactInfo,
    dispatch,
  ])

  // 错误处理
  useEffect(() => {
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // 任务类型选择组件
  const TaskTypeSelector = () => {
    const taskTypes = [
      { type: ErrandType.EXPRESS_PICKUP, label: '快递代取' },
      { type: ErrandType.FOOD_DELIVERY, label: '食堂带饭' },
      { type: ErrandType.GROCERY_SHOPPING, label: '超市代购' },
      { type: ErrandType.OTHER, label: '其他' },
    ]

    return (
      <View className={styles.taskTypes}>
        {taskTypes.map(({ type, label }) => (
          <Text
            key={type}
            className={`${styles.taskType} ${errandType === type ? styles.active : ''}`}
            onClick={() => setErrandType(type)}
          >
            {label}
          </Text>
        ))}
      </View>
    )
  }

  // 表单输入组件
  const FormInput = ({
    label,
    placeholder,
    value,
    onChange,
    type = 'text' as const,
    isTextarea = false,
  }) => (
    <View className={styles.formSection}>
      <Text className={styles.sectionTitle}>{label}</Text>
      {isTextarea ? (
        <Textarea
          className={styles.detailsInput}
          placeholder={placeholder}
          value={value}
          onInput={(e) => onChange(e.detail.value)}
        />
      ) : (
        <Input
          className={styles.textInput}
          type={type}
          placeholder={placeholder}
          value={value}
          onInput={(e) => onChange(e.detail.value)}
        />
      )}
    </View>
  )

  // 悬赏金额输入组件
  const RewardInput = () => (
    <View className={styles.formSection}>
      <Text className={styles.sectionTitle}>悬赏金额</Text>
      <View className={styles.rewardInputContainer}>
        <Text className={styles.currencySymbol}>¥</Text>
        <Input
          className={styles.rewardInput}
          type="digit"
          placeholder="请输入金额"
          value={reward}
          onInput={(e) => setReward(e.detail.value)}
        />
      </View>
    </View>
  )

  // 发布按钮组件
  const PublishButton = () => (
    <View className={styles.publishButton}>
      <Text
        className={`${styles.publishBtn} ${createErrandLoading === 'pending' ? styles.disabled : ''}`}
        onClick={createErrandLoading !== 'pending' ? handlePublish : undefined}
      >
        {createErrandLoading === 'pending' ? '发布中...' : '确认发布'}
      </Text>
    </View>
  )

  return (
    <View style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CustomHeader title="发布需求" />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ScrollView scrollY style={{ height: '100%' }} className={styles.pageContent}>
          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>任务类型</Text>
            <TaskTypeSelector />
          </View>

          <FormInput
            label="任务标题"
            placeholder="请输入简洁的任务标题"
            value={title}
            onChange={setTitle}
          />

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>任务详情</Text>
            <Textarea
              className={styles.detailsInput}
              placeholder={`请详细描述您的需求，如：${errandType === ErrandType.EXPRESS_PICKUP ? '快递单号、取件码' : errandType === ErrandType.FOOD_DELIVERY ? '具体菜品、份数' : errandType === ErrandType.GROCERY_SHOPPING ? '商品名称、规格' : '具体要求'}、期望送达时间等...`}
              value={content}
              onInput={(e) => setContent(e.detail.value)}
            />
          </View>

          <RewardInput />

          <FormInput
            label="起始地点"
            placeholder="请输入任务起始地点"
            value={locationFrom}
            onChange={setLocationFrom}
          />

          <FormInput
            label="目的地点"
            placeholder="请输入任务目的地点"
            value={locationTo}
            onChange={setLocationTo}
          />

          <FormInput
            label="期望完成时间 (选填)"
            placeholder="例如：今天下午3点前"
            value={deadline}
            onChange={setDeadline}
          />

          <FormInput
            label="联系方式 (选填)"
            placeholder="请输入您的联系方式"
            value={contactInfo}
            onChange={setContactInfo}
          />

          <PublishButton />
        </ScrollView>
      </View>
    </View>
  )
}

export default ErrandsPublishPage
