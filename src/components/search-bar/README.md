# SearchBar 组件使用指南

## 概述

SearchBar 是一个强大的通用搜索组件，支持多种搜索场景和交互方式。

## 功能特性

- ✅ **基础搜索**：简单关键词输入和搜索
- ✅ **导航模式**：作为按钮跳转到其他页面
- ✅ **搜索建议**：智能显示搜索建议
- ✅ **热门搜索**：显示热门搜索词
- ✅ **搜索模式**：支持 `@` 前缀模式切换
- ✅ **动态建议**：实时过滤搜索建议
- ✅ **清空功能**：一键清空输入内容

## 基础用法

### 1. 简单搜索模式

```tsx
import SearchBar from '@/components/search-bar'

function MyPage() {
  const [keyword, setKeyword] = useState('')

  return (
    <SearchBar
      keyword={keyword}
      placeholder="搜索内容"
      onInput={(e) => setKeyword(e.detail.value)}
      onSearch={() => handleSearch(keyword)}
      onClear={() => setKeyword('')}
    />
  )
}
```

### 2. 导航模式

```tsx
<SearchBar
  keyword=""
  placeholder="搜索校园知识"
  readonly
  onClick={() => {
    Taro.switchTab({ url: '/pages/explore/index' })
  }}
/>
```

### 3. 高级搜索模式（完整功能）

```tsx
import { SearchSuggestion } from '@/components/search-bar'

function AdvancedSearchPage() {
  const [keyword, setKeyword] = useState('')
  const [searchMode, setSearchMode] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions: SearchSuggestion[] = [
    { title: '@book 书籍教材', desc: '搜索书籍和教材', icon: '/assets/book.svg' },
    { title: '@computer 电脑电子', desc: '搜索电脑和电子产品', icon: '/assets/computer.svg' },
  ]

  const hotSearches = ['MacBook', 'iPhone', '教材', '校园卡']

  return (
    <SearchBar
      keyword={keyword}
      placeholder="搜索..."
      mode={searchMode}
      showSuggestions={showSuggestions}
      suggestions={suggestions}
      hotSearches={hotSearches}
      onInput={(e) => {
        const value = e.detail.value
        setKeyword(value)

        // 检测 @ 前缀
        if (value.startsWith('@')) {
          setShowSuggestions(true)
        } else {
          setShowSuggestions(false)
        }
      }}
      onSearch={() => handleSearch(keyword)}
      onClear={() => {
        setKeyword('')
        setShowSuggestions(false)
      }}
      onSuggestionClick={(suggestion) => {
        setKeyword(suggestion.title)
        setShowSuggestions(false)
      }}
      onDynamicSuggestionClick={(suggestion) => {
        setKeyword(suggestion)
        setShowSuggestions(false)
      }}
    />
  )
}
```

## API 参考

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `keyword` | `string` | `''` | 搜索关键词 |
| `placeholder` | `string` | `'搜索...'` | 占位符文本 |
| `readonly` | `boolean` | `false` | 是否只读（导航模式） |
| `mode` | `string \| null` | `null` | 当前搜索模式 |
| `modeDesc` | `string` | `''` | 模式描述 |
| `showSuggestions` | `boolean` | `false` | 是否显示建议列表 |
| `showDynamicSuggestions` | `boolean` | `false` | 是否显示动态建议 |
| `suggestions` | `SearchSuggestion[]` | `[]` | 搜索建议列表 |
| `dynamicSuggestions` | `string[]` | `[]` | 动态建议列表 |
| `hotSearches` | `string[]` | `[]` | 热门搜索词 |
| `onInput` | `(e: any) => void` | - | 输入回调 |
| `onSearch` | `() => void` | - | 搜索回调 |
| `onClear` | `() => void` | - | 清空回调 |
| `onClick` | `() => void` | - | 点击回调 |
| `onFocus` | `() => void` | - | 聚焦回调 |
| `onBlur` | `() => void` | - | 失焦回调 |
| `onSuggestionClick` | `(_suggestion: SearchSuggestion) => void` | - | 建议点击回调 |
| `onDynamicSuggestionClick` | `(_suggestion: string) => void` | - | 动态建议点击回调 |

### SearchSuggestion 接口

```typescript
interface SearchSuggestion {
  title: string        // 建议标题
  desc?: string        // 建议描述
  icon?: string        // 建议图标路径
}
```

## 使用场景

### 场景 1：首页导航搜索
```tsx
<SearchBar
  keyword=""
  placeholder="搜索校园知识"
  readonly
  onClick={() => Taro.switchTab({ url: '/pages/explore/index' })}
/>
```

### 场景 2：商品搜索
```tsx
<SearchBar
  keyword={searchKeyword}
  placeholder="搜索二手商品"
  onInput={(e) => setSearchKeyword(e.detail.value)}
  onSearch={() => searchProducts(searchKeyword)}
  onClear={() => setSearchKeyword('')}
/>
```

### 场景 3：高级搜索界面
```tsx
<SearchBar
  keyword={keyword}
  mode={searchMode}
  showSuggestions={isFocused}
  suggestions={searchSuggestions}
  hotSearches={hotSearches}
  onInput={handleInputChange}
  onSearch={handleSearch}
  onClear={handleClear}
  onSuggestionClick={handleSuggestionClick}
  onDynamicSuggestionClick={handleDynamicSuggestionClick}
/>
```

## 样式定制

组件使用 CSS Modules，可以通过覆盖样式来自定义外观：

```scss
// 自定义搜索框样式
.searchContainer {
  background-color: #f0f0f0;
  border-radius: 20px;
}

// 自定义输入框样式
.searchInput {
  font-size: 16px;
  color: #333;
}

// 自定义下拉菜单样式
.dropdownContainer {
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
```

## 注意事项

1. **事件冒泡**：在导航模式下，点击输入框不会触发容器的 `onClick` 事件
2. **焦点管理**：组件内部管理焦点状态，自动显示/隐藏建议列表
3. **响应式**：在小屏幕设备上会自动调整样式
4. **性能**：建议列表大量数据时考虑虚拟滚动优化

## 示例项目

查看以下页面了解完整用法：
- `src/pages/home/index.tsx` - 导航模式示例
- `src/pages/subpackage-commerce/pages/second-hand/home/index.tsx` - 简单搜索模式示例
