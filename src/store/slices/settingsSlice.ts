import Taro from '@tarojs/taro'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// 设置类型定义
export interface SettingsState {
  // 通知设置
  messageNotification: boolean
  pushNotification: boolean
  privateMessage: boolean

  // 外观设置
  fontSize: 'small' | 'medium' | 'large'
  nightMode: 'auto' | 'light' | 'dark'

  // 隐私设置
  whoCanMessage: 'everyone' | 'followers' | 'none'
  whoCanComment: 'everyone' | 'followers' | 'none'
  whoCanViewPosts: 'everyone' | 'followers' | 'self'

  // 通用设置
  personalizedRecommendation: boolean
  allowFileUpload: boolean
  allowClipboardAccess: boolean

  // 系统设置
  isInitialized: boolean
}

// 默认设置
const defaultSettings: SettingsState = {
  messageNotification: false,
  pushNotification: false,
  privateMessage: false,
  fontSize: 'medium',
  nightMode: 'auto',
  whoCanMessage: 'everyone',
  whoCanComment: 'everyone',
  whoCanViewPosts: 'everyone',
  personalizedRecommendation: false,
  allowFileUpload: true,
  allowClipboardAccess: true,
  isInitialized: false,
}

// 设置键名常量
export const SETTINGS_STORAGE_KEYS = {
  MESSAGE_NOTIFICATION: 'settings_message_notification',
  PUSH_NOTIFICATION: 'settings_push_notification',
  PRIVATE_MESSAGE: 'settings_private_message',
  FONT_SIZE: 'settings_font_size',
  NIGHT_MODE: 'settings_night_mode',
  WHO_CAN_MESSAGE: 'settings_who_can_message',
  WHO_CAN_COMMENT: 'settings_who_can_comment',
  WHO_CAN_VIEW_POSTS: 'settings_who_can_view_posts',
  PERSONALIZED_RECOMMENDATION: 'settings_personalized_recommendation',
  ALLOW_FILE_UPLOAD: 'settings_allow_file_upload',
  ALLOW_CLIPBOARD_ACCESS: 'settings_allow_clipboard_access',
}

// 从本地存储加载设置
const loadSettingsFromStorage = (): Partial<SettingsState> => {
  try {
    const settings: Partial<SettingsState> = {}

    // 加载布尔值设置
    const messageNotification = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.MESSAGE_NOTIFICATION)
    const pushNotification = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.PUSH_NOTIFICATION)
    const privateMessage = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.PRIVATE_MESSAGE)
    const personalizedRecommendation = Taro.getStorageSync(
      SETTINGS_STORAGE_KEYS.PERSONALIZED_RECOMMENDATION
    )
    const allowFileUpload = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.ALLOW_FILE_UPLOAD)
    const allowClipboardAccess = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.ALLOW_CLIPBOARD_ACCESS)

    if (messageNotification !== '') settings.messageNotification = messageNotification
    if (pushNotification !== '') settings.pushNotification = pushNotification
    if (privateMessage !== '') settings.privateMessage = privateMessage
    if (personalizedRecommendation !== '')
      settings.personalizedRecommendation = personalizedRecommendation
    if (allowFileUpload !== '') settings.allowFileUpload = allowFileUpload
    if (allowClipboardAccess !== '') settings.allowClipboardAccess = allowClipboardAccess

    // 加载字符串设置
    const fontSize = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.FONT_SIZE)
    const nightMode = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.NIGHT_MODE)
    const whoCanMessage = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.WHO_CAN_MESSAGE)
    const whoCanComment = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.WHO_CAN_COMMENT)
    const whoCanViewPosts = Taro.getStorageSync(SETTINGS_STORAGE_KEYS.WHO_CAN_VIEW_POSTS)

    if (fontSize) settings.fontSize = fontSize
    if (nightMode) settings.nightMode = nightMode
    if (whoCanMessage) settings.whoCanMessage = whoCanMessage
    if (whoCanComment) settings.whoCanComment = whoCanComment
    if (whoCanViewPosts) settings.whoCanViewPosts = whoCanViewPosts

    return settings
  } catch (error) {
    return {}
  }
}

// 保存设置到本地存储
const saveSettingToStorage = (key: string, value: any) => {
  try {
    Taro.setStorageSync(key, value)
  } catch (error) {}
}

// 初始状态（合并默认设置和本地存储的设置）
const initialState: SettingsState = {
  ...defaultSettings,
  ...loadSettingsFromStorage(),
  isInitialized: true,
}

// 创建 slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // 初始化设置
    initializeSettings: (state) => {
      const storedSettings = loadSettingsFromStorage()
      Object.assign(state, storedSettings)
      state.isInitialized = true
    },

    // 更新通知设置
    setMessageNotification: (state, action: PayloadAction<boolean>) => {
      state.messageNotification = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.MESSAGE_NOTIFICATION, action.payload)
    },

    setPushNotification: (state, action: PayloadAction<boolean>) => {
      state.pushNotification = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.PUSH_NOTIFICATION, action.payload)
    },

    setPrivateMessage: (state, action: PayloadAction<boolean>) => {
      state.privateMessage = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.PRIVATE_MESSAGE, action.payload)
    },

    // 更新外观设置
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.FONT_SIZE, action.payload)
      // 立即应用字体大小
      applyFontSize(action.payload)
    },

    setNightMode: (state, action: PayloadAction<'auto' | 'light' | 'dark'>) => {
      state.nightMode = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.NIGHT_MODE, action.payload)
      // 立即应用夜间模式
      applyNightMode(action.payload)
    },

    // 更新隐私设置
    setWhoCanMessage: (state, action: PayloadAction<'everyone' | 'followers' | 'none'>) => {
      state.whoCanMessage = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.WHO_CAN_MESSAGE, action.payload)
    },

    setWhoCanComment: (state, action: PayloadAction<'everyone' | 'followers' | 'none'>) => {
      state.whoCanComment = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.WHO_CAN_COMMENT, action.payload)
    },

    setWhoCanViewPosts: (state, action: PayloadAction<'everyone' | 'followers' | 'self'>) => {
      state.whoCanViewPosts = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.WHO_CAN_VIEW_POSTS, action.payload)
    },

    // 更新通用设置
    setPersonalizedRecommendation: (state, action: PayloadAction<boolean>) => {
      state.personalizedRecommendation = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.PERSONALIZED_RECOMMENDATION, action.payload)
    },

    setAllowFileUpload: (state, action: PayloadAction<boolean>) => {
      state.allowFileUpload = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.ALLOW_FILE_UPLOAD, action.payload)
    },

    setAllowClipboardAccess: (state, action: PayloadAction<boolean>) => {
      state.allowClipboardAccess = action.payload
      saveSettingToStorage(SETTINGS_STORAGE_KEYS.ALLOW_CLIPBOARD_ACCESS, action.payload)
    },

    // 重置所有设置
    resetSettings: (state) => {
      Object.assign(state, defaultSettings)
      // 清除本地存储
      Object.values(SETTINGS_STORAGE_KEYS).forEach((key) => {
        try {
          Taro.removeStorageSync(key)
        } catch (error) {}
      })
      // 重新应用默认设置
      applyFontSize(defaultSettings.fontSize)
      applyNightMode(defaultSettings.nightMode)
    },
  },
})

// 应用字体大小到页面
const applyFontSize = (fontSize: 'small' | 'medium' | 'large') => {
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
  }

  try {
    // 设置根元素的字体大小
    const fontSizePx = fontSizeMap[fontSize]

    // 通过修改 CSS 自定义属性来应用字体大小
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--app-font-size', fontSizePx)
      document.documentElement.style.setProperty(
        '--app-font-size-small',
        `${parseInt(fontSizePx) - 2}px`
      )
      document.documentElement.style.setProperty(
        '--app-font-size-large',
        `${parseInt(fontSizePx) + 2}px`
      )
    }
  } catch (error) {}
}

// 应用夜间模式到页面
const applyNightMode = (nightMode: 'auto' | 'light' | 'dark') => {
  try {
    let actualMode = nightMode

    // 如果是自动模式，根据系统时间判断
    if (nightMode === 'auto') {
      const hour = new Date().getHours()
      actualMode = hour >= 19 || hour <= 7 ? 'dark' : 'light'
    }

    // 应用主题
    if (typeof document !== 'undefined') {
      const root = document.documentElement

      if (actualMode === 'dark') {
        root.classList.add('dark-theme')
        root.classList.remove('light-theme')

        // 设置深色主题的 CSS 变量
        root.style.setProperty('--app-bg-color', '#1a1a1a')
        root.style.setProperty('--app-text-color', '#ffffff')
        root.style.setProperty('--app-card-bg', '#2d2d2d')
        root.style.setProperty('--app-border-color', '#404040')
        root.style.setProperty('--app-primary-color', '#5a67d8')
      } else {
        root.classList.add('light-theme')
        root.classList.remove('dark-theme')

        // 设置浅色主题的 CSS 变量
        root.style.setProperty('--app-bg-color', '#ffffff')
        root.style.setProperty('--app-text-color', '#333333')
        root.style.setProperty('--app-card-bg', '#ffffff')
        root.style.setProperty('--app-border-color', '#e2e8f0')
        root.style.setProperty('--app-primary-color', '#4f46e5')
      }
    }
  } catch (error) {}
}

// 导出 actions
export const {
  initializeSettings,
  setMessageNotification,
  setPushNotification,
  setPrivateMessage,
  setFontSize,
  setNightMode,
  setWhoCanMessage,
  setWhoCanComment,
  setWhoCanViewPosts,
  setPersonalizedRecommendation,
  setAllowFileUpload,
  setAllowClipboardAccess,
  resetSettings,
} = settingsSlice.actions

// 导出工具函数
export { applyFontSize, applyNightMode }

export default settingsSlice.reducer
