# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是 **NKU-Wiki**，基于 Taro 4.1.4 框架构建的南开大学信息分享微信小程序。项目使用 React 18、TypeScript、Redux Toolkit 状态管理和 SCSS 样式。

## 核心命令

### 开发命令
- `npm run dev:weapp` - 启动开发服务器并监听文件变化（开发时使用此命令）
- `npm run build:weapp` - 构建微信小程序生产版本
- `npm run analyze:weapp` - 构建并使用 webpack-bundle-analyzer 分析包大小

### 代码质量
- `npm run lint` - 在 src 目录运行 ESLint 检查
- `npm run lint:fix` - 自动修复可修复的 ESLint 错误
- `npm run stylelint` - 对 SCSS 文件运行 stylelint 检查
- `npm run stylelint:fix` - 自动修复 stylelint 错误

### 部署命令
- `npm run upload` - 上传到微信小程序平台（需要环境变量）
- `npm run preview` - 生成预览二维码

### Git 工作流
- `npm run commit` - 使用 Commitizen 进行标准化提交
- `npm run prepare` - 安装 Husky Git hooks（自动运行）

## 架构说明

### 技术栈
- **框架**: Taro 4.1.4（基于 React 的跨平台框架）
- **UI 库**: React 18 + Hooks
- **状态管理**: Redux Toolkit + Redux Persist
- **样式**: SCSS + CSS Modules（必须使用 *.module.scss 模式）
- **TypeScript**: 开启严格模式
- **构建工具**: Webpack 5 + Taro 插件

### 目录结构
```
src/
├── components/          # 可复用组件
├── pages/              # 页面组件
│   ├── home/           # 主要页面
│   ├── explore/
│   ├── discover/
│   ├── profile/
│   └── subpackage-*/   # 代码分包
├── services/           # API 服务
│   ├── api/           # 按业务域划分的 API 模块
│   └── request.ts     # HTTP 客户端配置
├── store/             # Redux 状态管理
│   └── slices/        # Redux Toolkit slices
├── constants/         # 应用常量
├── hooks/             # 自定义 React hooks
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
├── assets/            # 静态资源（图片、图标）
└── styles/            # 全局样式和变量
```

### 多租户 API 架构
- **基础URL**: API端点在 `services/request.ts` 中配置
- **认证方式**: Bearer token 认证
- **租户**: 默认租户ID `f6303899-a51a-460a-9cd8-fe35609151eb`（南开大学）
- **API文档**: 可在 kjxwr6px14.apifox.cn 和 nkuwiki.com/openapi.json 查看

## 开发规范

### 代码质量要求
- **ESLint 零错误零警告要求** - 使用 `npm run lint` 检查
- 未使用的变量必须添加 `_` 前缀（如 `_unusedVar`）
- 所有导入必须被使用，移除未使用的导入
- 导入顺序：外部库在前，相对导入在后
- React Hook 依赖必须完整准确

### 文件命名规范
- 目录和非组件文件：`kebab-case`
- React 组件：`PascalCase`
- CSS 模块：`*.module.scss`（强制要求）
- TypeScript 类型：`*.d.ts` 文件放在 `types/` 目录

### 组件开发
- 仅使用函数组件 + Hooks
- 优先使用微信原生组件，其次才是 Taro UI
- 自定义组件必须使用 CSS Modules
- 使用 `@/` 别名导入 `src/` 目录文件

### 样式规则
- **强制使用 CSS Modules**: 所有样式必须使用 `*.module.scss`
- **颜色管理**: 使用 `src/constants/colors.ts`（TS）或 `src/styles/variables.scss`（SCSS）中的常量
- **单位**: 使用 `px`（Taro 自动转换为 `rpx`）
- **禁止硬编码颜色**: 所有颜色必须来自常量定义

### 图片和资源处理
- **静态图片**: 使用字符串路径，不要使用 import 语句
  ```tsx
  // ✅ 正确
  const logo = '/assets/logo.png';
  <Image src={logo} />

  // ❌ 错误
  import logo from '@/assets/logo.png';
  ```
- **图标**: 从 Iconify Solar 下载 SVG 格式，存放在 `src/assets/`
- **移除 SVG 尺寸**: 移除 SVG 文件中的 `width` 和 `height` 属性

### 状态管理
- 在 `src/store/slices/` 中使用 Redux Toolkit slices
- 通过 `createAsyncThunk` 进行 API 调用
- 使用 `redux-persist` 持久化关键数据

### 布局要求
- **强制模式**: 所有页面必须使用 `<CustomHeader>` + `<ScrollView>` 结构
- **安全区域**: 右上角不能放置交互元素（避免与微信胶囊按钮冲突）
- **状态栏适配**: 使用 `Taro.getSystemInfoAsync()` 获取 `statusBarHeight`

## 测试账号（仅开发环境）
- **用户名**: nankai_user
- **密码**: Test@1234
- **租户ID**: f6303899-a51a-460a-9cd8-fe35609151eb
- **Token**: （过期时通过 `/api/v1/auth/login` 刷新）

## 微信小程序配置
- **App ID**: wxe0c82418cb888db0
- **构建输出**: `dist/` 目录
- **开发工具**: 微信开发者工具应打开 `dist/` 文件夹
- **构建**: 开发时使用 `npm run dev:weapp`（不要使用 `npm run build:weapp`）

## 重要注意事项
- **开发时不要运行构建** - 只使用 `npm run dev:weapp`
- **路径别名**: `@/` 映射到 `src/` 目录
- **分包**: 非核心页面通过分包进行代码分割以提升性能
- **API前缀**: `/api/v1/` 在请求配置中自动添加
- **代码检查**: 提交前所有代码必须通过 ESLint 和 stylelint 检查