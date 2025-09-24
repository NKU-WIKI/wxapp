import { View, Image, Input, Text } from '@tarojs/components'
import { useState, memo, useCallback } from 'react'

// 图片资源使用字符串路径引用

import styles from './index.module.scss'

export interface SearchSuggestion {
  title: string
  desc?: string
  icon?: string
}

export interface SearchMode {
  key: string
  desc?: string
  prefix: string
}

interface SearchBarProps {
  // 基础属性
  keyword: string
  placeholder?: string
  readonly?: boolean

  // 事件处理
  onInput?: (_e: any) => void
  onSearch?: () => void
  onClear?: () => void
  onClick?: () => void
  onFocus?: () => void
  onBlur?: () => void

  // 高级功能
  mode?: string | null
  modeDesc?: string
  showSuggestions?: boolean
  showDynamicSuggestions?: boolean
  suggestions?: SearchSuggestion[]
  dynamicSuggestions?: string[]
  hotSearches?: string[]

  // 回调函数
  onSuggestionClick?: (_suggestion: SearchSuggestion) => void
  onDynamicSuggestionClick?: (_suggestion: string) => void

  // 样式和行为
  confirmType?: 'search' | 'done' | 'go' | 'next' | 'send'
  adjustPosition?: boolean
  // 当为 true 时，即使 keyword 为空也显示清空按钮
  alwaysShowClear?: boolean
}

const SearchBar = ({
  keyword,
  placeholder = '搜索...',
  readonly = false,
  onInput,
  onSearch,
  onClear,
  onClick,
  onFocus,
  onBlur,
  mode = null,
  modeDesc = '',
  showSuggestions = false,
  showDynamicSuggestions = false,
  suggestions = [],
  dynamicSuggestions = [],
  hotSearches = [],
  onSuggestionClick,
  onDynamicSuggestionClick,
  confirmType = 'search',
  adjustPosition = true,
  alwaysShowClear = false,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleContainerClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (onFocus) {
      onFocus()
    }
  }, [onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    if (onBlur) {
      onBlur()
    }
  }, [onBlur])

  // 处理输入变化
  const handleInput = useCallback(
    (e: any) => {
      if (onInput) {
        // 如果有mode，需要重新构建完整的keyword
        if (mode) {
          const displayValue = e.detail?.value || ''
          const fullValue = `@${mode} ${displayValue}`.trim()
          onInput({
            ...e,
            detail: {
              ...e.detail,
              value: fullValue,
            },
          })
        } else {
          onInput(e)
        }
      }
    },
    [onInput, mode]
  )

  const handleSuggestionClick = useCallback(
    (_suggestion: SearchSuggestion) => {
      if (onSuggestionClick) {
        onSuggestionClick(_suggestion)
      }
    },
    [onSuggestionClick]
  )

  const handleDynamicSuggestionClick = useCallback(
    (_suggestion: string) => {
      if (onDynamicSuggestionClick) {
        onDynamicSuggestionClick(_suggestion)
      }
    },
    [onDynamicSuggestionClick]
  )

  // 渲染前缀标签
  const renderPrefixLabel = useCallback(() => {
    if (!mode) return null
    return (
      <View className={styles.prefixLabelContainer}>
        <Text className={styles.prefixLabel}>@{mode}</Text>
      </View>
    )
  }, [mode])

  // 获取显示值
  const getDisplayValue = useCallback(() => {
    if (mode) {
      return keyword.replace(new RegExp(`^@${mode}\\s*`), '')
    }
    return keyword
  }, [keyword, mode])

  // 渲染建议列表
  const renderSuggestions = useCallback(() => {
    if (!showSuggestions || suggestions.length === 0) return null

    return (
      <View className={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <View
            key={index}
            className={styles.suggestionItem}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion.icon && <Image src={suggestion.icon} className={styles.suggestionIcon} />}
            <View className={styles.suggestionText}>
              <Text className={styles.suggestionTitle}>{suggestion.title}</Text>
              {suggestion.desc && <Text className={styles.suggestionDesc}>{suggestion.desc}</Text>}
            </View>
          </View>
        ))}
        {showDynamicSuggestions && dynamicSuggestions.length > 0 && (
          <View className={styles.dynamicSuggestions}>
            {dynamicSuggestions.map((suggestion, index) => (
              <View
                key={index}
                className={styles.dynamicSuggestionItem}
                onClick={() => handleDynamicSuggestionClick(suggestion)}
              >
                <Text className={styles.dynamicSuggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }, [
    showSuggestions,
    suggestions,
    showDynamicSuggestions,
    dynamicSuggestions,
    handleSuggestionClick,
    handleDynamicSuggestionClick,
  ])

  // 渲染热门搜索
  const renderHotSearches = useCallback(() => {
    if (hotSearches.length === 0) return null

    return (
      <View className={styles.hotSearchSection}>
        <Text className={styles.hotTitle}>热门搜索</Text>
        <View className={styles.hotTags}>
          {hotSearches.map((tag, index) => (
            <View
              key={index}
              className={styles.hotTag}
              onClick={() => handleDynamicSuggestionClick(tag)}
            >
              <Text className={styles.hotTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }, [hotSearches, handleDynamicSuggestionClick])

  return (
    <View className={styles.searchWrapper}>
      <View className={styles.searchContainer} onClick={handleContainerClick}>
        <Image
          src="/assets/search.svg"
          className={styles.searchIcon}
          style={{ width: '18px', height: '18px' }}
          onClick={onSearch}
        />
        <View className={styles.inputWrapper}>
          {renderPrefixLabel()}
          <Input
            className={styles.searchInput}
            placeholder={mode && modeDesc ? modeDesc : placeholder}
            value={getDisplayValue()}
            onInput={handleInput}
            onConfirm={onSearch}
            confirmType={confirmType}
            disabled={readonly}
            onFocus={handleFocus}
            onBlur={handleBlur}
            adjustPosition={adjustPosition}
          />
        </View>
        {(!!keyword || alwaysShowClear) && !readonly && (
          <Image src="/assets/x.svg" className={styles.clearIcon} onClick={onClear} />
        )}
      </View>

      {/* 建议和热门搜索 */}
      {(showSuggestions || showDynamicSuggestions || hotSearches.length > 0) && isFocused && (
        <View className={styles.dropdownContainer}>
          {renderSuggestions()}
          {renderHotSearches()}
        </View>
      )}
    </View>
  )
}

// 使用 memo 优化性能，防止不必要的重新渲染
export default memo(SearchBar)
