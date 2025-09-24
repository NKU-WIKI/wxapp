# ActionBar 组件 - 增强版登录鉴权功能

## 功能概述

ActionBar 组件现在支持强大的登录鉴权功能，能够自动处理未登录用户的交互，提供更好的用户体验。

## 🔐 核心特性

### 1. 自动登录检查

- **点赞、收藏、关注** 操作自动检查登录状态
- 未登录用户点击时显示友好的登录提示
- 支持自定义提示消息

### 2. 可配置按钮禁用

- 未登录时可选择禁用需要权限的按钮
- 提供视觉反馈（按钮变灰）
- 点击禁用按钮时显示提示信息

### 3. 灵活的鉴权配置

- **全局配置**：适用于所有按钮
- **按钮级别配置**：针对特定按钮定制
- **自动判断**：默认规则（点赞/收藏/关注需要登录）

## 📋 配置选项

### ActionButtonConfig 接口

```typescript
interface ActionButtonConfig {
  type: 'like' | 'favorite' | 'follow' | 'share' | 'comment' | 'custom'
  icon: string
  activeIcon?: string
  text?: string
  onClick?: () => void

  // 🔐 新的鉴权配置选项
  requireAuth?: boolean // 是否需要登录权限
  disabledWhenNotLoggedIn?: boolean // 未登录时是否禁用按钮
}
```

### ActionBarProps 接口

```typescript
interface ActionBarProps {
  // ... 其他属性
  authConfig?: {
    disabledWhenNotLoggedIn?: boolean // 全局禁用配置
    loginPrompt?: string // 自定义提示消息
  }
}
```

## 💡 使用示例

### 基础用法（自动鉴权）

```tsx
import ActionBar, { ActionButtonConfig } from '@/components/action-bar'

const buttons: ActionButtonConfig[] = [
  { type: 'like', icon: '/assets/heart-outline.svg', activeIcon: '/assets/heart-bold.svg' },
  { type: 'comment', icon: '/assets/message-circle.svg' },
  { type: 'favorite', icon: '/assets/star-outline.svg', activeIcon: '/assets/star-filled.svg' },
  { type: 'share', icon: '/assets/share.svg' },
]

;<ActionBar buttons={buttons} targetId="post-123" targetType="post" />
```

### 自定义鉴权配置

```tsx
<ActionBar
  buttons={buttons}
  targetId="post-123"
  targetType="post"
  authConfig={{
    disabledWhenNotLoggedIn: true, // 未登录时禁用按钮
    loginPrompt: '需要登录才能点赞和收藏哦', // 自定义提示消息
  }}
/>
```

### 按钮级别配置

```tsx
const buttons: ActionButtonConfig[] = [
  {
    type: 'like',
    icon: '/assets/heart-outline.svg',
    activeIcon: '/assets/heart-bold.svg',
    disabledWhenNotLoggedIn: false, // 即使全局配置禁用，也允许点击时提示
  },
  {
    type: 'comment',
    icon: '/assets/message-circle.svg',
    requireAuth: false, // 明确指定评论不需要登录
  },
]
```

## 🎯 鉴权规则

### 默认权限规则

- ✅ **点赞 (like)**: 需要登录
- ✅ **收藏 (favorite)**: 需要登录
- ✅ **关注 (follow)**: 需要登录
- ❌ **评论 (comment)**: 不需要登录
- ❌ **分享 (share)**: 不需要登录
- ❓ **自定义 (custom)**: 由 `requireAuth` 决定

### 禁用行为

- **禁用模式**: 按钮变灰，无法点击，点击时显示提示
- **提示模式**: 按钮正常显示，点击时显示登录提示并可跳转登录页

## 🔧 技术实现

### 鉴权流程

1. **检查登录状态**: 使用 Redux store 中的用户状态
2. **判断权限需求**: 根据按钮类型或配置决定是否需要登录
3. **执行鉴权逻辑**:
   - 已登录: 正常执行操作
   - 未登录 + 禁用模式: 显示禁用状态
   - 未登录 + 提示模式: 显示登录提示并可跳转

### 统一登录检查工具

组件使用了 `@/utils/auth.ts` 中的统一登录检查工具，提供：

- `checkLoginWithModal()`: 显示模态框提示用户登录
- `isLoggedIn()`: 检查当前登录状态
- `checkLoginWithToast()`: 显示简单 Toast 提示

## 🎨 用户体验

### 未登录用户体验

1. **视觉反馈**: 点赞/收藏按钮显示为禁用状态（变灰）
2. **交互提示**: 点击禁用按钮时显示友好提示
3. **引导登录**: 提供一键跳转到登录页面的选项
4. **无缝体验**: 登录后可立即进行操作

### 已登录用户体验

- 完全透明，无任何额外提示
- 保持原有操作流程和体验

## 🔄 向后兼容

所有现有代码都能正常工作，新功能完全向后兼容：

- 不传 `authConfig` 时使用默认配置
- 不设置按钮级别配置时使用自动判断
- 原有功能不受影响

## 📝 最佳实践

1. **统一配置**: 在应用级别使用全局 `authConfig`
2. **自定义提示**: 根据不同场景定制登录提示消息
3. **按钮级别控制**: 对特殊按钮进行个性化配置
4. **用户引导**: 提供清晰的登录引导流程

## 🐛 故障排除

### 常见问题

**Q: 按钮没有被禁用？**
A: 检查 `authConfig.disabledWhenNotLoggedIn` 配置，默认为 `true`

**Q: 提示消息没有生效？**
A: 确认使用了 `authConfig.loginPrompt` 或 ActionButton 的配置

**Q: 自定义按钮权限不生效？**
A: 为 `custom` 类型按钮明确设置 `requireAuth` 属性

**Q: 跳转登录页失败？**
A: 检查登录页面路径是否正确：`/pages/subpackage-profile/login/index`
