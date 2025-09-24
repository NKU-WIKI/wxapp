/**
 * @description 发布相关常量
 */

/**
 * @description AI 润色写作风格选项
 */
export const WRITING_STYLES = ['正式', '轻松', '幽默', '专业'] as const

/**
 * @description 写作风格类型
 */
export type WritingStyle = (typeof WRITING_STYLES)[number]
