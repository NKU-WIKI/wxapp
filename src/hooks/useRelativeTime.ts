import { useState, useEffect, useCallback } from 'react'
import { formatRelativeTime } from '@/utils/time'

/**
 * 相对时间hook
 * 用于格式化时间为相对时间，并支持自动更新
 */
export interface UseRelativeTimeOptions {
  /** 是否启用自动更新 */
  autoUpdate?: boolean
  /** 更新间隔（毫秒），默认30秒 */
  updateInterval?: number
  /** 自定义格式化函数 */
  formatFunction?: (_time: string) => string
}

/**
 * 相对时间hook返回值
 */
export interface UseRelativeTimeReturn {
  /** 格式化后的相对时间 */
  formattedTime: string
  /** 原始时间字符串 */
  originalTime: string
  /** 更新时间的方法 */
  updateTime: () => void
}

/**
 * 相对时间hook
 * @param timeString - 时间字符串
 * @param options - 配置选项
 * @returns 相对时间相关信息和方法
 */
export const useRelativeTime = (
  timeString: string | undefined | null,
  options: UseRelativeTimeOptions = {}
): UseRelativeTimeReturn => {
  const {
    autoUpdate = true,
    updateInterval = 30000, // 30秒更新一次
    formatFunction = formatRelativeTime
  } = options

  const [formattedTime, setFormattedTime] = useState<string>('')

  // 更新时间的方法
  const updateTime = useCallback(() => {
    if (!timeString) {
      setFormattedTime('时间未知')
      return
    }

    const formatted = formatFunction(timeString)
    setFormattedTime(formatted)
  }, [timeString, formatFunction])

  // 初始化和手动更新
  useEffect(() => {
    updateTime()
  }, [updateTime])

  // 自动更新
  useEffect(() => {
    if (!autoUpdate || !timeString) return

    const interval = setInterval(() => {
      updateTime()
    }, updateInterval)

    return () => clearInterval(interval)
  }, [autoUpdate, updateInterval, timeString, updateTime])

  return {
    formattedTime,
    originalTime: timeString || '',
    updateTime
  }
}

/**
 * 批量处理相对时间的hook
 * @param timeStrings - 时间字符串数组
 * @param options - 配置选项
 * @returns 格式化后的时间数组
 */
export const useRelativeTimes = (
  timeStrings: (string | undefined | null)[],
  options: UseRelativeTimeOptions = {}
): string[] => {
  const {
    autoUpdate = true,
    updateInterval = 30000,
    formatFunction = formatRelativeTime
  } = options

  const [formattedTimes, setFormattedTimes] = useState<string[]>([])

  const updateTimes = useCallback(() => {
    const formatted = timeStrings.map(timeString => {
      if (!timeString) return '时间未知'
      return formatFunction(timeString)
    })
    setFormattedTimes(formatted)
  }, [timeStrings, formatFunction])

  // 初始化
  useEffect(() => {
    updateTimes()
  }, [updateTimes])

  // 自动更新
  useEffect(() => {
    if (!autoUpdate || timeStrings.length === 0) return

    const interval = setInterval(() => {
      updateTimes()
    }, updateInterval)

    return () => clearInterval(interval)
  }, [autoUpdate, updateInterval, timeStrings.length, updateTimes])

  return formattedTimes
}

/**
 * 获取当前时间戳的相对时间hook
 * @param timestamp - 时间戳（毫秒）
 * @param options - 配置选项
 * @returns 相对时间字符串
 */
export const useTimeAgo = (
  timestamp: number | undefined | null,
  options: Omit<UseRelativeTimeOptions, 'formatFunction'> = {}
): string => {
  const timeString = timestamp ? new Date(timestamp).toISOString() : null

  const { formattedTime } = useRelativeTime(timeString, options)

  return formattedTime
}
