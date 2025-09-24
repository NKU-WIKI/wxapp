# 颜色常量化迁移指南

## 📋 迁移目标

将项目中所有硬编码的颜色值替换为统一的颜色常量，实现：

- 统一的设计规范
- 便于主题切换
- 提高可维护性
- 减少设计规范不一致的问题

## 🎨 颜色映射表

### 旧颜色值 → 新常量映射

#### 主题色

```scss
// 旧版本 → 新常量
#4F46E5 → $theme-primary
#8B5CF6 → $theme-primary-light
#7C3AED → $theme-primary-dark

// 旧版本（移除）
#4A90E2 → $theme-primary（统一使用紫色系）
```

#### 背景色

```scss
// 页面背景
#F8F8F8 → $bg-page
#F5F5F5 → $bg-page-gray
#F9FAFB → $bg-page-cool
#FAFAFA → $bg-page-light

// 卡片背景
#FFFFFF → $bg-card
#F9FAFB → $bg-card-hover

// 输入框背景
#F5F5F5 → $bg-input
#F3F4F6 → $bg-input-focus
```

#### 文字颜色

```scss
// 主要文字
#333333 → $text-primary
#111827 → $text-primary-dark
#1F2937 → $text-primary-medium

// 次要文字
#666666 → $text-secondary
#888888 → $text-secondary-light
#9B9B9B → $text-secondary-gray

// 辅助文字
#999999 → $text-helper
#6B7280 → $text-helper-light
#9CA3AF → $text-helper-gray

// 占位符文字
#C7C7C7 → $text-placeholder
```

#### 边框颜色

```scss
#E5E5E5 → $border-base
#F0F0F0 → $border-light
#E5E7EB → $border-gray
#F3F4F6 → $border-cool
#D1D5DB → $border-input
```

#### 状态色

```scss
// 成功色
#22C55E → $status-success
#4ADE80 → $status-success-light

// 错误色
#EF4444 → $status-error
#F87171 → $status-error-light

// 警告色
#F59E0B → $status-warning
```

## 🔄 迁移步骤

### 第一步：引入颜色变量

在SCSS文件顶部添加导入：

```scss
@import '../../styles/variables.scss';
```

### 第二步：替换硬编码颜色

```scss
// ❌ 旧写法
.container {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e5e5e5;
}

// ✅ 新写法
.container {
  background-color: $bg-card;
  color: $text-primary;
  border: 1px solid $border-base;
}
```

### 第三步：使用预定义mixin

```scss
// ❌ 旧写法
.card {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
  border-radius: 8px;
}

// ✅ 新写法
.card {
  @include card-style;
}
```

### 第四步：TypeScript中使用颜色常量

```typescript
// ❌ 旧写法
const buttonStyle = {
  backgroundColor: '#4F46E5',
  color: '#FFFFFF',
}

// ✅ 新写法
import { THEME_COLORS, TEXT_COLORS } from '@/constants/colors'

const buttonStyle = {
  backgroundColor: THEME_COLORS.PRIMARY,
  color: TEXT_COLORS.WHITE,
}
```

## 📝 迁移优先级

### 🔴 高优先级

需要立即迁移的文件：

- `src/pages/*/index.module.scss` - 所有页面样式
- `src/components/*/index.module.scss` - 核心组件样式
- `src/app.scss` - 全局样式

### 🟡 中优先级

逐步迁移的文件：

- `src/pages/*/components/*.module.scss` - 页面组件样式
- `src/components/button/index.module.scss` - 基础组件样式

### 🟢 低优先级

最后迁移的文件：

- 临时样式文件
- 测试用样式文件

## 🛠️ 实用工具

### VS Code 替换正则表达式

批量替换常用颜色值：

```regex
// 查找：#4F46E5
// 替换：$theme-primary

// 查找：#FFFFFF
// 替换：$bg-card

// 查找：#333333
// 替换：$text-primary

// 查找：#F8F8F8
// 替换：$bg-page
```

### 验证工具

检查是否还有遗漏的硬编码颜色：

```bash
# 搜索十六进制颜色值
grep -r "#[0-9A-Fa-f]{6}" src/ --include="*.scss"

# 搜索rgb/rgba值
grep -r "rgba\?\(" src/ --include="*.scss"
```

## 📋 检查清单

在每个文件迁移完成后，检查：

- [ ] 已添加 `@import "../../styles/variables.scss"`
- [ ] 已替换所有硬编码的颜色值
- [ ] 使用了合适的颜色变量
- [ ] 考虑使用预定义的mixin
- [ ] 移除了注释中的旧颜色值
- [ ] 在浏览器中验证视觉效果无差异

## 🎯 重构示例

### 示例1：卡片组件重构

```scss
// 重构前
.postCard {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  color: #333;
}

// 重构后
@import '../../styles/variables.scss';

.postCard {
  @include card-style;
  padding: 12px;
  margin-bottom: 4px;
}
```

### 示例2：按钮组件重构

```scss
// 重构前
.loginButton {
  background-color: #4a90e2;
  color: #fff;
  border-radius: 24px;
  border: none;
}

// 重构后
@import '../../styles/variables.scss';

.loginButton {
  @include button-primary;
  border-radius: 24px;
}
```

### 示例3：搜索框重构

```scss
// 重构前
.searchContainer {
  background-color: #f5f5f5;
  border: 1px solid #e5e5e5;
  color: #666;
}

// 重构后
@import '../../styles/variables.scss';

.searchContainer {
  background-color: $bg-input;
  border: 1px solid $border-base;
  color: $text-secondary;
}
```

## ⚠️ 注意事项

1. **渐进式迁移**：不要一次性修改所有文件，分批次进行
2. **测试验证**：每次迁移后都要在浏览器中验证视觉效果
3. **团队协作**：确保团队成员都了解新的颜色规范
4. **文档更新**：及时更新设计规范文档

## 🔗 相关文件

- 颜色常量定义：`src/constants/colors.ts`
- SCSS变量文件：`src/styles/variables.scss`
- 全局样式文件：`src/app.scss`
