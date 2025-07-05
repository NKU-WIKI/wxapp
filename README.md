# NKU-Wiki
> 基于 Taro 框架构建的高质量、可维护、性能优良的南开大学信息聚合微信小程序。

本 README 文档旨在为开发者提供一个清晰、全面的项目指南，覆盖了从项目启动、技术选型到代码规范、工作流的方方面面，以确保团队协作的高效性和项目代码的健壮性。

## 🎯 项目目标

本项目的核心目标是利用 Taro 框架，为南开大学师生打造一个集信息获取、内容分享和社区互动于一体的微信小程序。我们致力于提供卓越的用户体验，并保证项目代码的高质量、可维护性和优良性能。

**核心功能模块**:
- **首页 (Home)**: 采用信息流展示推荐内容、热点和校园热榜。
- **发现 (Explore)**: 集合校园热点、AI 助手、校园活动和学习资源等卡片式入口。
- **发布 (Publish)**: 提供富文本编辑器，支持标题、正文、图片、话题标签，并集成 AI 润色建议。
- **消息 (Notifications)**: 分类展示点赞、收藏和评论。
- **我的 (Profile)**: 展示用户基本信息、动态、社交数据，并提供收藏、评论、点赞、草稿箱等入口。

## 🛠️ 技术栈与核心依赖

- **核心框架**: [Taro 4.x](https://docs.taro.zone/docs) (插件化架构)
- **UI 语言**: [React](https://reactjs.org/) (Hooks-first)
- **UI 组件库**: 优先使用微信原生组件库（如 [WeUI](https://weui.io/)），其次使用 [Taro UI](https://taro-ui.jd.com/)
- **状态管理**: [Redux](https://redux.js.org/) (推荐使用 [Redux Toolkit](https://redux-toolkit.js.org/))
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **CSS 预处理器**: [SCSS](https://sass-lang.com/) (使用 `.module.scss`)
- **主要目标平台**: 微信小程序 (`weapp`)

## 🚀 快速开始

在开始之前，请确保你已安装了 [Node.js](https://nodejs.org/en/) (推荐 v16+) 和 [pnpm](https://pnpm.io/)。

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-repo/taro-wxapp.git
    cd taro-wxapp
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **开发**
    运行以下命令，启动微信小程序平台的开发模式。
    ```bash
    npm run dev:weapp
    ```
    之后，请使用**微信开发者工具**打开项目根目录。

## 📦 可用脚本

在 `package.json` 文件中，我们定义了以下核心脚本：

- `npm run dev:weapp`: 启动微信小程序环境的监听和编译。
- `npm run build:weapp`: 构建生产版本的微信小程序代码。
- `npm run new`: 快速创建新的页面或组件。
- `npm run prepare`: 自动安装 Git hooks（通过 Husky）。

## 📁 项目结构

项目遵循官方推荐的目录结构，并进行了精细化划分，以提升代码的可维护性。
```
.
├── config/                  # Taro 编译配置
├── src/                     # 源码目录
│   ├── app.config.ts        # 全局配置
│   ├── app.scss             # 全局样式
│   ├── app.tsx              # 入口组件
│   ├── assets/              # 静态资源
│   ├── components/          # 全局可复用组件
│   ├── core/                # 核心代码 (非业务)
│   │   ├── hooks/           # 通用 Hooks
│   │   └── utils/           # 通用工具函数
│   ├── pages/               # 页面
│   ├── services/            # API 请求服务
│   ├── store/               # Redux store
│   └── types/               # TypeScript 类型定义
└── package.json
```

## ✍️ 代码风格与规范

我们约定了严格的代码风格和命名规范，以保证代码的一致性和可读性。所有规范都通过工具链强制执行。

- **命名**:
    - 目录和非组件文件: `kebab-case` (e.g., `user-list`, `request.ts`)
    - React 组件: `PascalCase` (e.g., `UserList.tsx`)
- **样式**: 强制使用 `*.module.scss` 以避免全局样式污染。
- **TypeScript**: 开启 `strict` 模式，明确定义类型。
- **React**:
    - 全面使用函数式组件和 Hooks。
    - 使用 `useMemo` 和 `useCallback` 进行性能优化。
    - 超过 100 行的组件建议拆分。
- **代码检查**:
    - `ESLint`: 检查 JavaScript/TypeScript 代码质量。
    - `Prettier`: 统一代码格式。
    - `stylelint`: 检查样式文件规范。

## ✅ 最佳实践

- **路径别名**: 在 `config/index.ts` 中配置了 `@` 作为 `src` 目录的别名，请在导入模块时积极使用。
- **性能优化**:
    - **分包加载**: 对非核心页面和资源使用 `subPackages` 配置。
    - **图片压缩**: `src/assets` 中的图片资源在部署前应进行压缩。
    - **虚拟列表**: 对于长列表，考虑使用虚拟列表技术。
    - **移除 console**: 生产环境中自动移除 `console`。
- **自定义导航栏**: 必须通过 `Taro.getSystemInfoAsync()` 获取 `statusBarHeight` 进行适配。
- **全局盒模型**: 在 `src/app.scss` 中全局设置 `box-sizing: border-box;`。

## 🌿 Git 工作流

- **分支模型**: 遵循 `Git Flow`。
    - `main`: 主分支，用于发布。
    - `develop`: 开发主分支。
    - `feature/xxx`: 功能分支。
    - `fix/xxx`: Bug 修复分支。

- **Commit Message**:
    - **规范**: 遵循 [Angular 提交规范](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)。
    - **格式**: `<type>(<scope>): <subject>` (e.g., `feat(profile): add user avatar component`)。
    - **常用类型 (`type`)**:
        - `feat`: 新增功能 (feature)
        - `fix`: 修复 Bug
        - `docs`: 仅修改文档 (documentation)
        - `style`: 修改代码格式，不影响代码逻辑 (空格、格式化等)
        - `refactor`: 代码重构，既不是新增功能也不是修复 Bug
        - `perf`: 提升性能的修改
        - `test`: 增加或修改测试用例
        - `build`: 修改项目构建系统或外部依赖
        - `ci`: 修改 CI/CD 配置文件或脚本
        - `chore`: 其他不修改 `src` 或测试文件的杂项变动
    - **自动化工具**:
        - **`commitizen`**: 通过 `npm run commit` 引导式地创建规范的 commit message。
        - **`commitlint`**: 在 `commit-msg` 钩子中自动校验 message 格式。
        - **`lint-staged`**: 在 `pre-commit` 钩子中自动格式化和检查暂存区代码。

## 🤝 参与贡献

欢迎所有开发者参与贡献！在提交代码前，请确保：
1.  遵循本文档中定义的所有规范。
2.  你的代码已经通过了本地的 `lint` 和 `test` 检查。
3.  Commit message 格式正确。

## 📄 License

[MIT](./LICENSE) 