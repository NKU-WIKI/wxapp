import { View, Image, Input } from '@tarojs/components'

import searchIcon from '@/assets/search.svg'
import xIcon from '@/assets/x.svg'

import styles from './index.module.scss'

interface SearchBarProps {
  keyword: string
  placeholder?: string
  readonly?: boolean
  onInput?: (_e: any) => void
  onSearch?: () => void
  onClear?: () => void
  onClick?: () => void
}

const SearchBar = ({
  keyword,
  placeholder = '搜索...',
  readonly = false,
  onInput,
  onSearch,
  onClear,
  onClick,
}: SearchBarProps) => {
  const handleContainerClick = () => {
    if (onClick) {
      onClick()
    }
  }

  // 阻止事件冒泡，避免点击输入框时触发容器的 onClick
  const handleInputClick = (e) => {
    if (onClick) {
      e.stopPropagation()
    }
  }

  return (
    <View className={styles.searchContainer} onClick={handleContainerClick}>
      <Image
        src={searchIcon}
        className={styles.searchIcon}
        style={{ width: '18px', height: '18px' }}
        onClick={onSearch}
      />
      <Input
        className={styles.searchInput}
        placeholder={placeholder}
        value={keyword}
        onInput={onInput}
        onConfirm={onSearch}
        confirmType='search'
        disabled={readonly} // 使用 disabled 属性实现只读效果
        onClick={handleInputClick}
        adjustPosition
      />
      {keyword && !readonly && (
        <Image src={xIcon} className={styles.clearIcon} onClick={onClear} />
      )}
    </View>
  )
}

export default SearchBar
