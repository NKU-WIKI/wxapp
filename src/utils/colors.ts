/**
 * 颜色工具函数
 * 方便在TypeScript组件中使用颜色常量
 */

import { 
  THEME_COLORS, 
  STATUS_COLORS, 
  BACKGROUND_COLORS, 
  TEXT_COLORS,
  BORDER_COLORS,
  SHADOW_COLORS,
  COLOR_SCHEMES
} from '@/constants/colors';

// ==================== 快捷访问函数 ====================

/**
 * 获取主题色
 */
export const getThemeColor = (variant: 'primary' | 'light' | 'dark' | 'accent' = 'primary') => {
  const colorMap = {
    primary: THEME_COLORS.PRIMARY,
    light: THEME_COLORS.PRIMARY_LIGHT,
    dark: THEME_COLORS.PRIMARY_DARK,
    accent: THEME_COLORS.ACCENT,
  };
  return colorMap[variant];
};

/**
 * 获取状态色
 */
export const getStatusColor = (status: 'success' | 'error' | 'warning' | 'info', variant: 'default' | 'light' | 'dark' = 'default') => {
  const colorMap = {
    success: {
      default: STATUS_COLORS.SUCCESS,
      light: STATUS_COLORS.SUCCESS_LIGHT,
      dark: STATUS_COLORS.SUCCESS_DARK,
    },
    error: {
      default: STATUS_COLORS.ERROR,
      light: STATUS_COLORS.ERROR_LIGHT,
      dark: STATUS_COLORS.ERROR_DARK,
    },
    warning: {
      default: STATUS_COLORS.WARNING,
      light: STATUS_COLORS.WARNING_LIGHT,
      dark: STATUS_COLORS.WARNING_DARK,
    },
    info: {
      default: STATUS_COLORS.INFO,
      light: STATUS_COLORS.INFO_LIGHT,
      dark: STATUS_COLORS.INFO_DARK,
    },
  };
  return colorMap[status][variant];
};

/**
 * 获取文字颜色
 */
export const getTextColor = (type: 'primary' | 'secondary' | 'helper' | 'placeholder' | 'white' = 'primary') => {
  const colorMap = {
    primary: TEXT_COLORS.PRIMARY,
    secondary: TEXT_COLORS.SECONDARY,
    helper: TEXT_COLORS.HELPER,
    placeholder: TEXT_COLORS.PLACEHOLDER,
    white: TEXT_COLORS.WHITE,
  };
  return colorMap[type];
};

/**
 * 获取背景色
 */
export const getBackgroundColor = (type: 'page' | 'card' | 'input' | 'modal' = 'page') => {
  const colorMap = {
    page: BACKGROUND_COLORS.PAGE,
    card: BACKGROUND_COLORS.CARD,
    input: BACKGROUND_COLORS.INPUT,
    modal: BACKGROUND_COLORS.MODAL,
  };
  return colorMap[type];
};

// ==================== 组合样式生成器 ====================

/**
 * 生成按钮样式
 */
export const getButtonStyle = (variant: 'primary' | 'secondary' = 'primary') => {
  return COLOR_SCHEMES[`BUTTON_${variant.toUpperCase()}` as keyof typeof COLOR_SCHEMES];
};

/**
 * 生成卡片样式
 */
export const getCardStyle = () => {
  return COLOR_SCHEMES.CARD_DEFAULT;
};

/**
 * 生成输入框样式
 */
export const getInputStyle = () => {
  return COLOR_SCHEMES.INPUT_DEFAULT;
};

// ==================== 透明度处理 ====================

/**
 * 为颜色添加透明度
 */
export const addAlpha = (color: string, alpha: number): string => {
  // 确保alpha在0-1之间
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  
  // 如果是十六进制颜色
  if (color.startsWith('#')) {
    const _hex = color.slice(1);
    const alphaHex = Math.round(normalizedAlpha * 255).toString(16).padStart(2, '0');
    return `${color}${alphaHex}`;
  }
  
  // 如果已经是rgba格式
  if (color.startsWith('rgba')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${normalizedAlpha})`);
  }
  
  // 如果是rgb格式，转换为rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${normalizedAlpha})`);
  }
  
  return color;
};

/**
 * 生成主题色的透明度变体
 */
export const getThemeColorWithAlpha = (alpha: number) => {
  return addAlpha(THEME_COLORS.PRIMARY, alpha);
};

/**
 * 生成状态色的透明度变体
 */
export const getStatusColorWithAlpha = (status: 'success' | 'error' | 'warning' | 'info', alpha: number) => {
  const baseColor = getStatusColor(status);
  return addAlpha(baseColor, alpha);
};

// ==================== 样式对象生成器 ====================

/**
 * 生成内联样式对象 - 按钮
 */
export const createButtonStyleObject = (variant: 'primary' | 'secondary' = 'primary') => {
  const scheme = getButtonStyle(variant);
  return {
    backgroundColor: scheme.background,
    color: scheme.text,
    border: `1px solid ${scheme.border}`,
  };
};

/**
 * 生成内联样式对象 - 卡片
 */
export const createCardStyleObject = () => {
  const scheme = getCardStyle();
  return {
    backgroundColor: scheme.background,
    color: scheme.text,
    border: `1px solid ${scheme.border}`,
    boxShadow: `0 1px 3px 0 ${scheme.shadow}`,
    borderRadius: '8px',
  };
};

/**
 * 生成内联样式对象 - 输入框
 */
export const createInputStyleObject = () => {
  const scheme = getInputStyle();
  return {
    backgroundColor: scheme.background,
    color: scheme.text,
    border: `1px solid ${scheme.border}`,
  };
};

// ==================== CSS变量生成器 ====================

/**
 * 生成CSS自定义属性对象
 */
export const createCSSVariables = () => {
  return {
    '--theme-primary': THEME_COLORS.PRIMARY,
    '--theme-primary-light': THEME_COLORS.PRIMARY_LIGHT,
    '--theme-primary-dark': THEME_COLORS.PRIMARY_DARK,
    '--bg-page': BACKGROUND_COLORS.PAGE,
    '--bg-card': BACKGROUND_COLORS.CARD,
    '--text-primary': TEXT_COLORS.PRIMARY,
    '--text-secondary': TEXT_COLORS.SECONDARY,
    '--border-base': BORDER_COLORS.BASE,
    '--status-success': STATUS_COLORS.SUCCESS,
    '--status-error': STATUS_COLORS.ERROR,
    '--status-warning': STATUS_COLORS.WARNING,
  } as React.CSSProperties;
};

// ==================== 导出所有颜色常量 ====================
export {
  THEME_COLORS,
  STATUS_COLORS,
  BACKGROUND_COLORS,
  TEXT_COLORS,
  BORDER_COLORS,
  SHADOW_COLORS,
  COLOR_SCHEMES,
};

// ==================== 使用示例 ====================
/*
// 在React组件中使用
import { getThemeColor, getTextColor, createButtonStyleObject } from '@/utils/colors';

const MyComponent = () => {
  const buttonStyle = createButtonStyleObject('primary');
  const titleColor = getTextColor('primary');
  
  return (
    <View style={{ color: titleColor }}>
      <Button style={buttonStyle}>
        点击按钮
      </Button>
    </View>
  );
};

// 在内联样式中使用颜色变量
const iconStyle = {
  backgroundColor: getThemeColor('primary'),
  color: getTextColor('white'),
  '--icon-url': `url(${iconSrc})`
} as React.CSSProperties;
*/ 
