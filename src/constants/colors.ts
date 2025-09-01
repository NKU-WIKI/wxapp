/**
 * 颜色常量定义
 * 集中管理项目中所有的颜色配置，避免硬编码
 */

// ==================== 主题色 ====================
export const THEME_COLORS = {
  // 主色调 - 紫色系
  PRIMARY: '#4F46E5',           // 主要按钮、链接、选中状态
  PRIMARY_LIGHT: '#8B5CF6',     // 主色浅色版本
  PRIMARY_DARK: '#7C3AED',      // 主色深色版本，hover状态
  
  // 强调色
  ACCENT: '#8B5CF6',            // 强调元素
  ACCENT_LIGHT: '#A78BFA',      // 强调色浅色版本
} as const;

// ==================== 状态色 ====================
export const STATUS_COLORS = {
  // 成功色
  SUCCESS: '#22C55E',           // 成功状态
  SUCCESS_LIGHT: '#4ADE80',     // 成功色浅色版本
  SUCCESS_DARK: '#16A34A',      // 成功色深色版本
  
  // 警告色
  WARNING: '#F59E0B',           // 警告状态
  WARNING_LIGHT: '#FCD34D',     // 警告色浅色版本
  WARNING_DARK: '#D97706',      // 警告色深色版本
  
  // 错误色
  ERROR: '#EF4444',             // 错误状态、删除按钮
  ERROR_LIGHT: '#F87171',       // 错误色浅色版本
  ERROR_DARK: '#DC2626',        // 错误色深色版本
  
  // 信息色
  INFO: '#3B82F6',              // 信息提示
  INFO_LIGHT: '#60A5FA',        // 信息色浅色版本
  INFO_DARK: '#2563EB',         // 信息色深色版本
} as const;

// ==================== 背景色 ====================
export const BACKGROUND_COLORS = {
  // 页面背景
  PAGE: '#F8F8F8',              // 页面主背景
  PAGE_LIGHT: '#FAFAFA',        // 页面浅色背景
  PAGE_GRAY: '#F5F5F5',         // 页面灰色背景
  PAGE_COOL: '#F9FAFB',         // 页面冷色背景
  
  // 卡片背景
  CARD: '#FFFFFF',              // 卡片背景
  CARD_HOVER: '#F9FAFB',        // 卡片悬停背景
  
  // 输入框背景
  INPUT: '#F5F5F5',             // 搜索框等输入背景
  INPUT_FOCUS: '#F3F4F6',       // 输入框聚焦背景
  
  // 特殊背景
  OVERLAY: 'rgba(0, 0, 0, 0.5)', // 遮罩层背景
  MODAL: '#FFFFFF',             // 模态框背景
} as const;

// ==================== 文字颜色 ====================
export const TEXT_COLORS = {
  // 主要文字
  PRIMARY: '#333333',           // 主要文字颜色
  PRIMARY_DARK: '#111827',      // 深色主要文字
  PRIMARY_MEDIUM: '#1F2937',    // 中等深度主要文字
  
  // 次要文字
  SECONDARY: '#666666',         // 次要文字颜色
  SECONDARY_LIGHT: '#888888',   // 浅色次要文字
  SECONDARY_GRAY: '#9B9B9B',    // 灰色次要文字
  
  // 辅助文字
  HELPER: '#999999',            // 辅助文字
  HELPER_LIGHT: '#6B7280',      // 浅色辅助文字
  HELPER_GRAY: '#9CA3AF',       // 灰色辅助文字
  
  // 占位符文字
  PLACEHOLDER: '#C7C7C7',       // 占位符文字
  DISABLED: '#D1D5DB',          // 禁用状态文字
  
  // 反色文字
  WHITE: '#FFFFFF',             // 白色文字
  INVERSE: '#FFFFFF',           // 反色文字（用于深色背景）
} as const;

// ==================== 边框颜色 ====================
export const BORDER_COLORS = {
  // 基础边框
  BASE: '#E5E5E5',              // 基础边框
  LIGHT: '#F0F0F0',             // 浅色边框
  GRAY: '#E5E7EB',              // 灰色边框
  COOL: '#F3F4F6',              // 冷色边框
  
  // 分割线
  DIVIDER: '#F0F0F0',           // 分割线
  SEPARATOR: '#E5E7EB',         // 分隔符
  
  // 输入框边框
  INPUT: '#D1D5DB',             // 输入框边框
  INPUT_FOCUS: THEME_COLORS.PRIMARY, // 输入框聚焦边框
  
  // 状态边框
  ERROR: STATUS_COLORS.ERROR,   // 错误边框
  SUCCESS: STATUS_COLORS.SUCCESS, // 成功边框
  WARNING: STATUS_COLORS.WARNING, // 警告边框
} as const;

// ==================== 阴影颜色 ====================
export const SHADOW_COLORS = {
  // 基础阴影
  BASE: 'rgba(0, 0, 0, 0.1)',   // 基础阴影
  LIGHT: 'rgba(0, 0, 0, 0.05)', // 浅色阴影
  MEDIUM: 'rgba(0, 0, 0, 0.15)', // 中等阴影
  DARK: 'rgba(0, 0, 0, 0.25)',  // 深色阴影
  
  // 特殊阴影
  CARD: 'rgba(0, 0, 0, 0.08)',  // 卡片阴影
  MODAL: 'rgba(0, 0, 0, 0.3)',  // 模态框阴影
  HEADER: 'rgba(0, 0, 0, 0.05)', // 导航栏阴影
} as const;

// ==================== 渐变色 ====================
export const GRADIENT_COLORS = {
  // 主题渐变
  PRIMARY: `linear-gradient(135deg, ${THEME_COLORS.PRIMARY} 0%, ${THEME_COLORS.PRIMARY_LIGHT} 100%)`,
  
  // 状态渐变
  SUCCESS: `linear-gradient(135deg, ${STATUS_COLORS.SUCCESS} 0%, ${STATUS_COLORS.SUCCESS_LIGHT} 100%)`,
  ERROR: `linear-gradient(135deg, ${STATUS_COLORS.ERROR} 0%, ${STATUS_COLORS.ERROR_LIGHT} 100%)`,
  
  // 背景渐变
  PAGE: `linear-gradient(to bottom, ${BACKGROUND_COLORS.PAGE} 0%, ${BACKGROUND_COLORS.PAGE_LIGHT} 100%)`,
} as const;

// ==================== 透明度变体 ====================
export const ALPHA_COLORS = {
  // 主题色透明度变体
  PRIMARY_10: `${THEME_COLORS.PRIMARY}1A`,   // 10% 透明度
  PRIMARY_20: `${THEME_COLORS.PRIMARY}33`,   // 20% 透明度
  PRIMARY_50: `${THEME_COLORS.PRIMARY}80`,   // 50% 透明度
  
  // 状态色透明度变体
  ERROR_10: `${STATUS_COLORS.ERROR}1A`,      // 10% 透明度
  SUCCESS_10: `${STATUS_COLORS.SUCCESS}1A`,  // 10% 透明度
  WARNING_10: `${STATUS_COLORS.WARNING}1A`,  // 10% 透明度
  
  // 黑色透明度变体
  BLACK_5: 'rgba(0, 0, 0, 0.05)',
  BLACK_10: 'rgba(0, 0, 0, 0.1)',
  BLACK_20: 'rgba(0, 0, 0, 0.2)',
  BLACK_50: 'rgba(0, 0, 0, 0.5)',
  
  // 白色透明度变体
  WHITE_10: 'rgba(255, 255, 255, 0.1)',
  WHITE_20: 'rgba(255, 255, 255, 0.2)',
  WHITE_50: 'rgba(255, 255, 255, 0.5)',
  WHITE_90: 'rgba(255, 255, 255, 0.9)',
} as const;

// ==================== 组合色彩方案 ====================
export const COLOR_SCHEMES = {
  // 卡片配色方案
  CARD_DEFAULT: {
    background: BACKGROUND_COLORS.CARD,
    text: TEXT_COLORS.PRIMARY,
    border: BORDER_COLORS.LIGHT,
    shadow: SHADOW_COLORS.CARD,
  },
  
  // 按钮配色方案
  BUTTON_PRIMARY: {
    background: THEME_COLORS.PRIMARY,
    text: TEXT_COLORS.WHITE,
    border: THEME_COLORS.PRIMARY,
    hover: THEME_COLORS.PRIMARY_DARK,
  },
  
  BUTTON_SECONDARY: {
    background: BACKGROUND_COLORS.CARD,
    text: THEME_COLORS.PRIMARY,
    border: BORDER_COLORS.INPUT,
    hover: BACKGROUND_COLORS.CARD_HOVER,
  },
  
  // 输入框配色方案
  INPUT_DEFAULT: {
    background: BACKGROUND_COLORS.INPUT,
    text: TEXT_COLORS.PRIMARY,
    border: BORDER_COLORS.BASE,
    placeholder: TEXT_COLORS.PLACEHOLDER,
  },
} as const;

// ==================== 导出所有颜色 ====================
export const COLORS = {
  ...THEME_COLORS,
  ...STATUS_COLORS,
  ...BACKGROUND_COLORS,
  ...TEXT_COLORS,
  ...BORDER_COLORS,
  ...SHADOW_COLORS,
  ...ALPHA_COLORS,
} as const;

// ==================== 类型定义 ====================
export type ThemeColorKey = keyof typeof THEME_COLORS;
export type StatusColorKey = keyof typeof STATUS_COLORS;
export type BackgroundColorKey = keyof typeof BACKGROUND_COLORS;
export type TextColorKey = keyof typeof TEXT_COLORS;
export type BorderColorKey = keyof typeof BORDER_COLORS;
export type ColorKey = keyof typeof COLORS; 
