# 关于我们页面

## 页面概述

这是一个完整的"关于我们"页面，展示了应用的基本信息、愿景目标、相关链接、开发团队和公司信息。

## 功能特性

### 1. 页面布局

- **顶部导航栏**: 64px高度，包含返回按钮和页面标题
- **应用信息区域**: 居中显示Logo、应用名称、版本号和副标题
- **内容区域**: 包含愿景目标、相关链接、开发团队、注册公司等信息
- **底部版权**: 显示版权信息

### 2. 交互功能

- **返回按钮**: 点击返回上一页
- **链接点击**: 点击相关链接会复制对应内容到剪贴板并显示提示
- **响应式设计**: 适配375px宽度的移动端布局

### 3. 数据配置

页面数据通过 `companyInfo` 对象配置，包含：

- `appName`: 应用名称
- `version`: 版本号
- `website`: 官方网站
- `email`: 联系邮箱
- `github`: GitHub链接
- `teamName`: 开发团队名称
- `companyName`: 注册公司名称

## 文件结构

```
src/pages/about/
├── index.config.ts      # 页面配置文件
├── index.module.scss    # 样式文件
├── index.tsx           # 主组件文件
└── README.md           # 说明文档

src/components/about-icons/
├── index.tsx           # 图标组件
└── index.module.scss   # 图标样式

src/types/
└── about.d.ts          # 类型定义
```

## 使用方法

### 1. 页面跳转

```typescript
import Taro from '@tarojs/taro'

// 跳转到关于我们页面
Taro.navigateTo({
  url: '/pages/about/index',
})
```

### 2. 自定义数据

修改 `src/pages/about/index.tsx` 中的 `companyInfo` 对象：

```typescript
const companyInfo: CompanyInfo = {
  appName: 'your-app-name',
  version: 'Version 1.0.0',
  website: 'https://your-website.com',
  email: 'support@your-email.com',
  github: 'your-github-repo',
  teamName: 'your-team-name',
  companyName: 'your-company-name',
}
```

### 3. 样式定制

修改 `src/pages/about/index.module.scss` 中的样式变量：

```scss
// 主色调
$primary-color: #4a90e2;
$text-color: #000000;
$secondary-color: #9b9b9b;

// 布局尺寸
$header-height: 64px;
$container-max-width: 375px;
$logo-size: 120px;
```

## 技术实现

### 1. 组件架构

- 使用函数式组件和React Hooks
- 模块化SCSS样式
- TypeScript类型安全

### 2. 图标系统

- 自定义SVG图标组件
- 支持动态颜色和尺寸
- 本地资源，无外部依赖

### 3. 交互处理

- 使用Taro API进行页面导航
- 剪贴板操作和用户反馈
- 错误处理和边界情况

## 注意事项

1. **样式兼容性**: 确保样式在小程序环境中正常显示
2. **数据更新**: 定期更新公司信息和链接
3. **性能优化**: 图标使用SVG格式，体积小且可缩放
4. **用户体验**: 提供清晰的视觉反馈和操作提示

## 扩展功能

可以考虑添加以下功能：

- 多语言支持
- 主题切换
- 分享功能
- 用户反馈入口
- 更新日志展示
