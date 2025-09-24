import { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import userApi from '@/services/api/user'
import styles from './index.module.scss'

interface UserProfile {
  phone?: string | null
  wechat_id?: string | null
  qq_id?: string | null
  is_verified?: boolean
}

export default function AccountInfo() {
  const [profile, setProfile] = useState<UserProfile>({})
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // 获取用户资料
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await userApi.getMeProfile()
        if (response?.data) {
          setProfile(response.data)
        }
      } catch (error) {
        Taro.showToast({
          title: '获取资料失败',
          icon: 'none',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // 开始编辑字段
  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue || '')
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  // 保存编辑
  const saveEdit = async () => {
    if (!editingField) return

    // 验证输入
    if (!validateInput(editingField, editValue)) {
      return
    }

    try {
      const updateData = {
        [editingField]: editValue.trim(),
      }

      await userApi.updateMeProfile(updateData)

      // 更新本地状态
      setProfile((prev) => ({
        ...prev,
        [editingField]: editValue.trim(),
      }))

      setEditingField(null)
      setEditValue('')

      Taro.showToast({
        title: '修改成功',
        icon: 'success',
      })
    } catch (error) {
      Taro.showToast({
        title: '修改失败',
        icon: 'none',
      })
    }
  }

  // 验证输入
  const validateInput = (field: string, value: string) => {
    if (!value.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none',
      })
      return false
    }

    switch (field) {
      case 'phone':
        if (!/^1[3-9]\d{9}$/.test(value.trim())) {
          Taro.showToast({
            title: '手机号格式不正确',
            icon: 'none',
          })
          return false
        }
        break
      case 'wechat_id':
        if (!/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(value.trim())) {
          Taro.showToast({
            title: '微信号格式不正确',
            icon: 'none',
          })
          return false
        }
        break
      case 'qq_id':
        if (!/^\d{5,10}$/.test(value.trim())) {
          Taro.showToast({
            title: 'QQ号格式不正确',
            icon: 'none',
          })
          return false
        }
        break
    }
    return true
  }

  // 处理校园认证
  const handleVerification = () => {
    if (profile.is_verified) {
      Taro.showToast({
        title: '您已完成校园认证',
        icon: 'none',
      })
    } else {
      // 跳转到校园认证页面
      Taro.navigateTo({
        url: '/pages/subpackage-profile/campus-verification/index',
      })
    }
  }

  // 渲染字段行
  const renderField = (
    field: string,
    label: string,
    value: string | undefined,
    placeholder: string
  ) => {
    const isEditing = editingField === field
    const displayValue = value || ''

    return (
      <View key={field} className={styles.fieldRow}>
        <Text className={styles.fieldLabel}>{label}</Text>

        {isEditing ? (
          <View className={styles.editContainer}>
            <Input
              className={styles.editInput}
              value={editValue}
              placeholder={placeholder}
              onInput={(e) => setEditValue(e.detail.value)}
              focus
            />
            <View className={styles.editButtons}>
              <Button className={styles.cancelButton} size="mini" onClick={cancelEdit}>
                取消
              </Button>
              <Button className={styles.saveButton} size="mini" type="primary" onClick={saveEdit}>
                保存
              </Button>
            </View>
          </View>
        ) : (
          <View className={styles.fieldValue} onClick={() => startEdit(field, displayValue)}>
            <Text className={displayValue ? styles.valueText : styles.placeholderText}>
              {displayValue || '未设置'}
            </Text>
            <Text className={styles.editIcon}>›</Text>
          </View>
        )}
      </View>
    )
  }

  if (loading) {
    return (
      <View className={styles.container}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>联系方式</Text>
          <View className={styles.card}>
            {renderField('phone', '手机号', profile.phone || '', '请输入手机号')}
            {renderField('wechat_id', '微信号', profile.wechat_id || '', '请输入微信号')}
            {renderField('qq_id', 'QQ号', profile.qq_id || '', '请输入QQ号')}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>账号认证</Text>
          <View className={styles.card}>
            <View className={styles.fieldRow} onClick={handleVerification}>
              <Text className={styles.fieldLabel}>校园认证</Text>
              <View className={styles.fieldValue}>
                <Text className={profile.is_verified ? styles.verifiedText : styles.unverifiedText}>
                  {profile.is_verified ? '已认证' : '未认证'}
                </Text>
                {!profile.is_verified && <Text className={styles.editIcon}>›</Text>}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
