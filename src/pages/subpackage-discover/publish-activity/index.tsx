import { View, Text, Input, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

import styles from './index.module.scss'

import CustomHeader from '@/components/custom-header'
import activityApi from '@/services/api/activity'
import { RootState } from '@/store'
import {
  PostActivityCreateRequest,
  ActivityType,
  ActivityVisibility,
  ActivityRead,
} from '@/types/api/activity.d'
import { ActivityNotificationHelper } from '@/utils/notificationHelper'


interface FormState {
  title: string
  category: string
  description: string
  activity_type: ActivityType
  start_time: string // 手动输入日期时间
  end_time: string // 手动输入日期时间
  location: string
  online_url: string
  tags: string
  max_participants: number
  organizer_type: 'personal' | 'organization'
  organization_name: string
  contact_nickname: string
  contact_method: string
}

export default function PublishActivity() {
  // 从Redux store获取当前用户信息
  const currentUser = useSelector((state: RootState) => state.user.user)
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn)

  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const format = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
  const [form, setForm] = useState<FormState>({
    title: '',
    category: '',
    description: '',
    activity_type: ActivityType.Offline,
    start_time: format(now),
    end_time: format(oneHourLater),
    location: '',
    online_url: '',
    tags: '',
    max_participants: 5,
    organizer_type: 'personal',
    organization_name: '',
    contact_nickname: '',
    contact_method: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const requiredFilled =
    form.title &&
    form.category &&
    form.description &&
    form.start_time &&
    form.end_time &&
    form.contact_nickname &&
    form.contact_method &&
    ((form.activity_type === ActivityType.Offline && form.location) ||
      (form.activity_type === ActivityType.Online && form.online_url) ||
      form.activity_type === ActivityType.Hybrid) &&
    (form.organizer_type === 'personal' ||
      (form.organizer_type === 'organization' && form.organization_name))

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const parseDate = (value: string) => {
    // 支持 "YYYY-MM-DD HH:mm" 简易解析
    const replaced = value.replace('T', ' ')
    const ts = Date.parse(replaced.replace(/-/g, '/')) // iOS 兼容
    return Number.isNaN(ts) ? null : new Date(ts)
  }

  const decreaseParticipants = useCallback(() => {
    setForm((prev) => ({ ...prev, max_participants: Math.max(1, prev.max_participants - 1) }))
  }, [])

  const increaseParticipants = useCallback(() => {
    setForm((prev) => ({ ...prev, max_participants: Math.min(999, prev.max_participants + 1) }))
  }, [])

  const handleSubmit = async () => {
    // 检查标题长度
    if (form.title.length < 4 || form.title.length > 20) {
      Taro.showToast({ title: '活动标题需要4-20个字符', icon: 'none' })
      return
    }

    if (!requiredFilled) {
      Taro.showToast({ title: '请完善必填项', icon: 'none' })
      return
    }

    // 根据活动类型验证具体字段
    if (form.activity_type === ActivityType.Offline && !form.location) {
      Taro.showToast({ title: '线下活动请填写地点', icon: 'none' })
      return
    }
    if (form.activity_type === ActivityType.Online && !form.online_url) {
      Taro.showToast({ title: '线上活动请填写活动链接', icon: 'none' })
      return
    }

    const start = parseDate(form.start_time)
    const end = parseDate(form.end_time)
    if (!start || !end) {
      Taro.showToast({ title: '时间格式不正确', icon: 'none' })
      return
    }
    if (end <= start) {
      Taro.showToast({ title: '结束时间需晚于开始时间', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const payload: PostActivityCreateRequest = {
        title: form.title,
        category: form.category,
        description: form.description,
        activity_type: form.activity_type,
        start_time: start,
        end_time: end,
        location:
          form.activity_type !== ActivityType.Online ? form.location || undefined : undefined,
        online_url:
          form.activity_type !== ActivityType.Offline ? form.online_url || undefined : undefined,
        tags: form.tags ? form.tags.split(/[,，\s]+/).filter(Boolean) : undefined,
        max_participants: form.max_participants > 0 ? form.max_participants : null,
        visibility: ActivityVisibility.Public,
        organizer_type: form.organizer_type,
        publisher_organization:
          form.organizer_type === 'organization' ? form.organization_name : undefined,
        contact_name: form.contact_nickname,
        contact_info: form.contact_method,
        publisher: currentUser?.nickname || '匿名用户',
      } as PostActivityCreateRequest
      const res: any = await activityApi.createActivity(payload)

      if (res && res.code === 0) {
        // 获取创建的活动数据
        const createdActivity = res.data as ActivityRead

        // 获取当前用户信息（从Redux）

        // 发送活动发布通知
        if (createdActivity && isLoggedIn && currentUser?.id) {
          const organizerNickname = currentUser.nickname || '用户'

          ActivityNotificationHelper.handleActivityPublishedNotification({
            activity: createdActivity,
            organizerId: currentUser.id,
            organizerNickname,
          }).catch((_error) => {
            // 通知发送失败不影响主流程
          })
        }

        Taro.showToast({ title: '发布成功', icon: 'success' })
        // 重新启用自动跳转，发布成功后返回上一页
        setTimeout(() => {
          Taro.navigateBack()
        }, 1000)
      }
    } catch (e) {
      // 错误已由拦截器处理
    } finally {
      setSubmitting(false)
    }
  }

  const activityTypes: { label: string; value: ActivityType }[] = [
    { label: '线下', value: ActivityType.Offline },
    { label: '线上', value: ActivityType.Online },
    { label: '混合', value: ActivityType.Hybrid },
  ]

  // 预定义活动分类
  const activityCategories: { label: string; value: string }[] = [
    { label: '运动健身', value: '运动健身' },
    { label: '创意艺术', value: '创意艺术' },
    { label: '志愿公益', value: '志愿公益' },
    { label: '吃喝娱乐', value: '吃喝娱乐' },
    { label: '学习搭子', value: '学习搭子' },
    { label: '其他活动', value: '其他活动' },
  ]

  return (
    <View className={styles.publishActivityPage}>
      <CustomHeader title="发布活动" hideBack={false} />

      <View className={styles.formItem}>
        <View className={styles.labelContainer}>
          <Text className={styles.label}>
            活动标题<Text className={styles.required}>*</Text>
          </Text>
          <Text className={styles.charCount}>{form.title.length}/20</Text>
        </View>
        <Input
          className={styles.input}
          value={form.title}
          placeholder="例如：校园技术交流会（4-20字）"
          maxlength={20}
          onInput={(e) => update('title', e.detail.value)}
        />
        {form.title.length > 0 && form.title.length < 4 && (
          <Text className={styles.errorText}>标题至少需要4个字符</Text>
        )}
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>
          活动内容<Text className={styles.required}>*</Text>
        </Text>
        <Textarea
          className={styles.textarea}
          value={form.description}
          placeholder="介绍活动目的、流程、参与要求等..."
          onInput={(e) => update('description', e.detail.value)}
        />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>
          发布者类型<Text className={styles.required}>*</Text>
        </Text>
        <Picker
          mode="selector"
          range={['个人', '组织']}
          value={form.organizer_type === 'personal' ? 0 : 1}
          onChange={(e) => {
            const selectedIndex = e.detail.value
            const selectedType = selectedIndex === 0 ? 'personal' : 'organization'
            update('organizer_type', selectedType)
            // 如果切换为个人，清空组织名称
            if (selectedType === 'personal') {
              update('organization_name', '')
            }
          }}
        >
          <View className={styles.pickerWrapper}>
            <Text className={styles.pickerText}>
              {form.organizer_type === 'personal' ? '个人' : '组织'}
            </Text>
            <Text className={styles.pickerArrow}>›</Text>
          </View>
        </Picker>
      </View>

      {/* 组织名称输入框，仅在选择组织时显示 */}
      <View
        className={`${styles.formItem} ${form.organizer_type === 'personal' ? styles.hidden : ''}`}
      >
        <Text className={styles.label}>
          发布组织
          {form.organizer_type === 'organization' ? <Text className={styles.required}>*</Text> : ''}
        </Text>
        <Input
          className={styles.input}
          value={form.organization_name}
          placeholder="请填写组织名称，例如：计算机科学与技术学院学生会"
          onInput={(e) => update('organization_name', e.detail.value)}
        />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>
          联系人称呼<Text className={styles.required}>*</Text>
        </Text>
        <Input
          className={styles.input}
          value={form.contact_nickname}
          placeholder="活动参与者如何称呼您"
          onInput={(e) => update('contact_nickname', e.detail.value)}
        />
      </View>

      <View className={styles.formItem}>
        <Text className={styles.label}>
          联系方法<Text className={styles.required}>*</Text>
        </Text>
        <Input
          className={styles.input}
          value={form.contact_method}
          placeholder="微信号/手机号/QQ号"
          onInput={(e) => update('contact_method', e.detail.value)}
        />

        <View className={styles.formItem}>
          <Text className={styles.label}>
            分类<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.categorySelector}>
            {activityCategories.map((category) => (
              <View
                key={category.value}
                className={`${styles.categoryOption} ${form.category === category.value ? styles.categoryOptionActive : ''}`}
                onClick={() => update('category', category.value)}
              >
                <Text>{category.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            活动类型<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.typeSelector}>
            {activityTypes.map((t) => (
              <View
                key={t.value}
                className={`${styles.typeOption} ${form.activity_type === t.value ? styles.typeOptionActive : ''}`}
                onClick={() => update('activity_type', t.value)}
              >
                <Text>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>
            活动时间<Text className={styles.required}>*</Text>
          </Text>
          <View className={styles.timeRow}>
            <View className={styles.timeItem}>
              <Text className={styles.timeLabel}>开始时间</Text>
              <View className={styles.pickerGroup}>
                <Picker
                  mode="date"
                  value={form.start_time.split(' ')[0]}
                  start={format(new Date())}
                  end={format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))}
                  onChange={(e) => {
                    const newDate = e.detail.value
                    const oldTime = form.start_time.split(' ')[1] || '00:00'
                    update('start_time', `${newDate} ${oldTime}`)
                  }}
                >
                  <View className={styles.datetimePicker}>
                    <Text className={styles.value}>{form.start_time.split(' ')[0]}</Text>
                  </View>
                </Picker>
                <Picker
                  mode="time"
                  value={form.start_time.split(' ')[1]}
                  onChange={(e) => {
                    const newTime = e.detail.value
                    const oldDate = form.start_time.split(' ')[0]
                    update('start_time', `${oldDate} ${newTime}`)
                  }}
                >
                  <View className={styles.datetimePicker}>
                    <Text className={styles.value}>{form.start_time.split(' ')[1]}</Text>
                  </View>
                </Picker>
              </View>
            </View>
            <View className={styles.timeItem}>
              <Text className={styles.timeLabel}>结束时间</Text>
              <View className={styles.pickerGroup}>
                <Picker
                  mode="date"
                  value={form.end_time.split(' ')[0]}
                  start={form.start_time.split(' ')[0]}
                  end={format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))}
                  onChange={(e) => {
                    const newDate = e.detail.value
                    const oldTime = form.end_time.split(' ')[1] || '00:00'
                    update('end_time', `${newDate} ${oldTime}`)
                  }}
                >
                  <View className={styles.datetimePicker}>
                    <Text className={styles.value}>{form.end_time.split(' ')[0]}</Text>
                  </View>
                </Picker>
                <Picker
                  mode="time"
                  value={form.end_time.split(' ')[1]}
                  onChange={(e) => {
                    const newTime = e.detail.value
                    const oldDate = form.end_time.split(' ')[0]
                    update('end_time', `${oldDate} ${newTime}`)
                  }}
                >
                  <View className={styles.datetimePicker}>
                    <Text className={styles.value}>{form.end_time.split(' ')[1]}</Text>
                  </View>
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* 预渲染所有输入框，通过样式控制显示/隐藏，避免条件渲染导致的闪烁 */}
        <View
          className={`${styles.formItem} ${form.activity_type === ActivityType.Online ? styles.hidden : ''}`}
        >
          <Text className={styles.label}>
            地点
            {form.activity_type === ActivityType.Offline ? (
              <Text className={styles.required}>*</Text>
            ) : (
              ''
            )}
          </Text>
          <Input
            className={styles.input}
            value={form.location}
            placeholder="请填写活动地点，例如：图书馆201会议室"
            onInput={(e) => update('location', e.detail.value)}
          />
        </View>

        <View
          className={`${styles.formItem} ${form.activity_type === ActivityType.Offline ? styles.hidden : ''}`}
        >
          <Text className={styles.label}>
            线上链接
            {form.activity_type === ActivityType.Online ? (
              <Text className={styles.required}>*</Text>
            ) : (
              ''
            )}
          </Text>
          <Input
            className={styles.input}
            value={form.online_url}
            placeholder="请填写线上活动链接，例如：腾讯会议链接"
            onInput={(e) => update('online_url', e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>标签</Text>
          <Input
            className={`${styles.input} ${styles.tagsInput}`}
            value={form.tags}
            placeholder="多个用逗号或空格分隔"
            onInput={(e) => update('tags', e.detail.value)}
          />
          <Text className={styles.helper}>示例：技术 分享 招新</Text>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>参与人数上限</Text>
          <View className={styles.participantCounterWrapper}>
            <View className={styles.counterButton} onClick={decreaseParticipants}>
              <Text className={styles.counterButtonText}>-</Text>
            </View>
            <View className={styles.counterDisplay}>
              <Text className={styles.counterNumber}>{form.max_participants}</Text>
              <Text className={styles.counterUnit}>人</Text>
            </View>
            <View className={styles.counterButton} onClick={increaseParticipants}>
              <Text className={styles.counterButtonText}>+</Text>
            </View>
          </View>
          <Text className={styles.helper}>最少1人，最多999人</Text>
        </View>

        <View
          className={`${styles.submitBtn} ${!requiredFilled || submitting ? styles.disabledBtn : ''}`}
          onClick={() => {
            if (!submitting) handleSubmit()
          }}
        >
          <Text>{submitting ? '提交中...' : '发布活动'}</Text>
        </View>
      </View>
    </View>
  )
}
