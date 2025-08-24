## 🎯 项目目标

本项目的目标是使用 Taro 框架构建一个高质量、可维护、性能优良的微信小程序。

本规范应该不断根据最新信息和最佳实践进行迭代。

**禁止自己运行编译命令**
**不要随便修改 openai 交互部分，taro 框架处理实现微信小程序流式响应很复杂，目前的版本是经过验证的结果**

## 🛠️ 技术栈与核心依赖

- **核心框架**: Taro 4.x (插件化架构)
- **UI 语言**: React (Hooks-first)
- **UI 组件库**: 优先使用微信小程序原生组件库比如 weui，其次使用 Taro UI
- **状态管理**: Redux (配合 React Hooks)
- **开发语言**: TypeScript
- **CSS 预处理器**: SCSS (`.scss`)
- **主要目标平台**: 微信小程序 (`weapp`)

为了保证项目正常运行，除了 `package.json` 中的业务依赖外，请确保以下核心插件已安装在 `devDependencies` 中：

- **框架插件**: `@tarojs/plugin-framework-react`
- **平台插件**: `@tarojs/plugin-platform-weapp`
- **CLI 工具**: `@tarojs/cli`
- **Babel 预设**: `babel-preset-taro` (处理 TSX/JSX 语法)
- **代码检查与格式化**: `ESLint`, `Prettier`, `stylelint`
- **Git 工作流**: `Husky`, `lint-staged`, `commitizen`

## 📁 项目结构

遵循 Taro 官方推荐的目录结构，并建议对 `src` 目录进行更精细的划分，以提高代码的可维护性：

```
.
├── config                   # Taro 编译配置目录
│   ├── dev.ts
│   ├── index.ts             # 默认配置文件 (推荐使用 .ts)
│   └── prod.ts
├── src                      # 源码目录
│   ├── app.config.ts        # 全局配置文件
│   ├── app.scss             # 全局样式文件
│   ├── app.tsx              # 入口组件
│   ├── assets               # 静态资源 (图片、字体等)
│   ├── components           # 全局可复用组件
│   ├── constants            # 全局常量
│   ├── pages                # 页面目录
│   │   ├── home             # 主包页面
│   │   ├── explore          # ...
│   │   ├── discover
│   │   ├── profile
│   │   ├── subpackage-interactive # 分包-互动
│   │   │   └── chat         # 聊天页面
│   │   │       ├── index.config.ts
│   │   │       ├── index.module.scss
│   │   │       └── index.tsx
│   │   └── subpackage-profile   # 分包-个人中心
│   │       └── ...
│   ├── services             # API 请求服务
│   │   ├── api              # 按模块划分的 API
│   │   ├── mock.ts
│   │   └── request.ts
│   ├── store                # Redux store
│   │   ├── slices           # Redux Toolkit Slices
│   │   ├── rootReducer.ts   # Root Reducer
│   │   └── index.ts         # Store 配置
│   └── types                # TypeScript 类型定义 (业务)
│       └── api              # API 相关类型
├── types                    # TypeScript 类型定义 (全局)
│   └── global.d.ts
├── .cursorrules             # Cursor AI 配置文件
├── .editorconfig            # 编辑器配置文件
├── .eslintrc                # ESLint 配置文件
├── .gitignore               # Git 忽略文件配置
├── .npmrc                   # NPM 配置文件
├── babel.config.js          # Babel 配置文件
├── commitlint.config.mjs    # Commitlint 配置文件
├── package.json             # 项目依赖与脚本
├── project.config.json      # 小程序项目配置文件
├── stylelint.config.mjs     # Stylelint 配置文件
└── tsconfig.json            # TypeScript 配置文件
```

> **注意**: 推荐使用 `config/index.ts` 并配合 `defineConfig` 工具函数来获得类型提示与校验，提升配置代码的健壮性。

## 核心功能模块

- **首页 (Home)**: 采用信息流展示推荐内容、热点和校园热榜。
- **发现 (Explore)**: 集合校园热点、AI 助手、校园活动和学习资源等卡片式入口。
- **发布 (Publish)**: 提供富文本编辑器，支持标题、正文、图片、话题标签，并集成 AI 润色建议。
- **消息 (Notifications)**: 分类展示点赞、收藏和评论。
- **我的 (Profile)**: 展示用户基本信息、动态、社交数据，并提供收藏、评论、点赞、草稿箱等入口。

## 参考项目

本项目在开发过程中，积极参考了以下优秀的开源项目作为最佳实践范例：

1.  **[lsqy/taro-music](https://github.com/lsqy/taro-music)**

    - **学习重点**:
      - **Redux 状态管理**: 深入学习其在复杂应用中（如音乐播放器）的 Redux `store` 设计、`actions` 和 `reducers` 的组织方式。
      - **组件封装**: 参考其对 `Taro UI` 的深度使用和自定义业务组件（如歌词、播放器）的封装思路。
      - **项目结构**: 借鉴其清晰的目录划分，如 `services`、`utils`、`constants` 等。

2.  **[kala888/tixwork](https://github.com/kala888/tixwork)**
    - **学习重点**:
      - **业务逻辑与数据流**: 分析其在协作工具场景下，如何处理复杂的业务逻辑和多模块间的数据流转。
      - **DVA 状态管理**: 了解 DVA（基于 Redux 和 a-router）在项目中的应用模式，作为 Redux 实践的补充和对比。
      - **工程化实践**: 参考其在大型项目中可能包含的更全面的工程化配置和代码规范。

通过对这些项目的研究，我们可以更好地遵循社区的最佳实践，编写出高质量、可维护的代码。

## ✅ 最佳实践

- **跨端兼容**:
  - 优先使用 Taro 提供的跨端组件和 API。
  - 需要条件编译时，使用 `process.env.TARO_ENV` 变量。
- **性能优化**:
  - **分包加载**: 对非核心页面和资源使用 `subPackages` 配置。
  - **图片资源**: 统一存放于 `src/assets` 并压缩。对于小于 10KB 的图片，可配置 `url-loader` 将其转换为 Base64 编码，以减少网络请求。
  - **虚拟列表**: 对于长列表，考虑使用虚拟列表技术。
  - **包体积分析**: 使用 `webpack-bundle-analyzer` 定期分析项目打包后的体积，识别并优化过大的模块。
  - **移除 console**: 在生产环境中，配置 `babel-plugin-transform-remove-console` 自动移除代码中的 `console` 调用。
  - **lodash 按需加载**: 若项目中使用 `lodash`，配合 `babel-plugin-lodash` 和 `lodash-webpack-plugin` 实现按需加载，减小打包体积。
- **自定义导航栏适配**: 在实现自定义顶部导航栏时，必须通过 `Taro.getWindowInfo()` 和 `Taro.getMenuButtonBoundingClientRect()` API 精确计算导航栏尺寸，并封装为统一的 `<CustomHeader>` 组件。所有使用该组件的页面，必须在 `index.config.ts` 中设置 `navigationStyle: 'custom'`。
- **⚠️ 页面布局核心规范 (强制性)**
  所有页面**必须**遵循以下“防内容遮挡”的顶级布局结构，这是一个从实践中总结的、不可违反的硬性规定。

  ```tsx
  <View style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
    {/* 1. 顶部必须是统一的自定义导航栏 */}
    <CustomHeader />
    {/* 2. 页面主体内容必须包裹在这个 View 和 ScrollView 中 */}
    <View style={{ flex: 1, overflow: "hidden" }}>
      <ScrollView scrollY style={{ height: "100%" }}>
        {/* 页面所有可滚动内容都放在这里 */}
      </ScrollView>
    </View>
  </View>
  ```

  在 `index.config.ts` 中，也**必须**设置 `navigationStyle: 'custom'`。

- **⚠️ 右上角安全区域规范 (强制性)**
  **禁止**在自定义导航栏 (`<CustomHeader>`) 的右上角区域放置任何可交互的控件（如“发布”、“保存”、“菜单”等按钮）。该区域在刘海屏、水滴屏、挖孔屏等异形屏手机上，极易与前置摄像头或系统状态栏（时间、电量）重叠，导致用户无法点击。所有页面级别的主操作按钮，**必须**统一放置在页面底部的操作栏中（参考“编辑资料”和“发布”页面的实现）。此规范旨在保证应用在所有设备上的可用性和交互一致性。

- **全局盒模型**: 为从根源上解决布局偏移问题（如内容偏右），建议在全局样式文件 `src/app.scss` 中为通用容器或页面根元素设置 `box-sizing: border-box;`。
- **代码检查**: 集成 ESLint, Prettier 和 Stylelint, 并配置 `husky` 和 `lint-staged` 在 `pre-commit` 钩子中自动检查和格式化暂存区代码，保证代码质量。
- **移动端调试**: 在开发阶段，可以集成 `vconsole-webpack-plugin`，它会在开发包中注入一个轻量级的移动端调试面板，方便在真机上查看日志、网络请求等信息。

## Git 规范

- **分支模型**: 采用 `Git Flow`。
  - `main`: 主分支，用于发布。
  - `dev`: 开发主分支。
  - `feat-xxx`: 功能分支，开发新功能。
  - `fix-xxx`: Bug 修复分支。
  - `realease/0.0.9`: 发布版本归档。
- **Commit Message**: 遵循 `Angular` 提交规范，格式为 `<type>(<scope>): <subject>`。
  - `type`: feat, fix, docs, style, refactor, test, chore
  - `scope`: 可选，表示影响范围 (如: `home`, `profile`)
  - `subject`: 简短描述。
- **自动化规范**:
  - **Commitizen**: 推荐团队成员使用 `commitizen` 工具（通过 `npm run commit`）来规范化提交信息的格式。
  - **Husky + commitlint**: 配置 `husky` 的 `commit-msg` 钩子，结合 `commitlint` 自动校验提交信息是否符合规范。
  - **Husky + lint-staged**: 配置 `husky` 的 `pre-commit` 钩子，结合 `lint-staged` 对暂存区的代码文件自动执行 `ESLint` 校验和 `Prettier` 格式化，确保入库代码的质量。

## 代码测试

- **测试框架**: 项目采用 `Jest`作为单元测试和集成测试的框架。
- **测试工具**: 配合 `@tarojs/test-utils-react` 来辅助测试 Taro 组件。
- **测试文件**: 测试文件应与被测试文件放在同一目录下，并以 `.spec.ts` 或 `.test.ts` 结尾（例如 `button.test.ts`）。
- **测试覆盖率**: 鼓励编写测试用例，并关注核心业务逻辑的测试覆盖率。

## 持续集成 (CI/CD)

- **自动化部署**: 推荐使用 Taro 官方提供的 `@tarojs/plugin-mini-ci` 插件，实现小程序的自动化上传、预览等功能。
- **配置**: 在项目根目录的 `config` 文件夹下创建 `ci.config.js` 用于存放小程序密钥及机器人等配置信息。
- **脚本**: 在 `package.json` 的 `scripts` 中添加相应的 `upload` 和 `preview` 命令，即可通过命令行一键完成部署操作。
- **钩子**: CI 插件支持钩子函数，可以在部署的不同阶段执行自定义脚本，例如将预览二维码发送到飞书或钉钉群。

## AI 功能集成

- **服务封装**: AI 相关的功能（如内容润色、AI 助手）应封装在独立的 `services` 或 `hooks` 中。
- **按需加载**: AI 功能组件或逻辑应尽可能按需加载，避免影响应用启动性能。
- **用户反馈**: 为 AI 生成的内容提供明确的标识，并设置用户反馈机制（如"生成得不错"、"重新生成"）。

## 数据管理 (State Management)

- **状态管理库**: 项目选用 `Redux` 作为全局状态管理方案。强烈推荐使用 `Redux Toolkit (RTK)` 来简化 Redux 开发，它集成了 `Immer`、`Reselect` 和 `Redux Thunk`，能够有效减少模板代码。
- **开发中间件**: 在开发环境下，推荐引入 `redux-logger` 中间件，它可以清晰地在控制台打印出每一次 `action` 的派发、`action` 内容、变更前后的 `state` 以及 `state` 的变更内容，极大地提升了开发调试效率。
- **数据流**: 遵循 Redux 单向数据流原则。
- **目录结构**: 使用 RTK 时，推荐将 `actions`, `reducers`, `constants` 合 b 并到 `slice` 文件中，并按业务模块进行组织。
  - `src/store/slices`: 存放各业务模块的 `slice.ts` 文件。
  - `src/store/index.ts`: 组合 `slice` 并创建 Store。
- **数据持久化**: 对于需要持久化的数据（如用户 Token），考虑使用 `redux-persist` 配合 `Taro.setStorage` 进行处理。
- **接口请求**: 在 `src/services` 目录中统一管理 API 请求，返回的数据通过 `createAsyncThunk` (RTK 提供) 的流程更新到 `store`。
- **开发阶段数据模拟**: 在联调前，所有页面和组件所需的数据结构和模拟内容应在 `src/types` 和 `src/services/mock.ts` 中统一定义。这有助于前后端并行开发，并确保了组件间数据消费的一致性。

## 📡 API 对接工作流

为了保证与后端接口的高效、规范对接，所有涉及网络请求的代码都必须遵循以下工作流。这是一个**强制性规范**，旨在从根源上杜绝路径错误、参数不匹配和数据解析失败等问题。

1.  **第一步：定义类型 (Types)**

    - 在 `src/types/api/` 目录下为模块创建或更新类型定义文件（例如 `post.d.ts`）。
    - 定义请求参数 `interface` 和响应数据 `interface`。

2.  **第二步：创建或更新 API 服务 (Service)**

    - 在 `src/services/api/` 目录下创建或更新对应的服务文件（例如 `post.ts`）。
    - 所有请求**必须**使用 `src/services/request.ts` 中导出的 `http` 对象 (`http.get` 或 `http.post`)。
    - 在这一层，负责将前端的驼峰式参数 (`camelCase`) 转换为后端需要的蛇形参数 (`snake_case`)。

3.  **第三步：创建或更新 Redux Thunk (Slice)**

    - 在 `src/store/slices/` 中创建或更新对应的 `slice.ts` 文件。
    - 使用 `createAsyncThunk` 创建异步 action。
    - **关键**：在 `asyncThunk` 的 `payloadCreator` 函数中，调用 API service 后，**必须**对返回的响应体进行转换，将其适配为前端 Redux store 需要的统一数据结构（例如，将 `{ data: [...], pagination: {...} }` 转换为统一的 `PaginatedData` 对象）。

5.  **第四步：组件中使用**
    - 在组件中通过 `useDispatch` 派发异步 action。
    - 通过 `useSelector` 从 store 中获取数据并渲染。

### 🔗 网络请求规范

- **统一封装**: 在 `src/services/request.ts` 中封装 `Taro.request`，统一处理请求头、错误等。
- **加载提示 (Loading)**:
  - **完全静默 (默认)**：为了提供极致的流畅感，所有 API 请求，**包括页面跳转，默认都不显示**全局的“加载中”提示。应用的 UI 层应自行处理加载状态（如显示骨架屏）。
  - **按需开启 (特殊情况)**：如果遇到极特殊的、需要强制用户等待的长时间操作，可以通过以下方式手动开启加载提示。
    ```typescript
    // 示例：在 API service 中为某个请求开启加载提示
    http.post("/some/long/task", data, {
      header: {
        "X-Show-Loading": true,
      },
    });
    ```
- **API 管理**: 在 `src/services/api/` 目录下按模块统一管理所有接口。
- **环境配置**: 在 `config/dev.js` 和 `config/prod.js` 中管理项目的基础配置，如 `baseUrl` 等。
- **路径别名**: 在 `config/index.ts` 中配置 `@` 作为 `src` 目录的别名，简化模块导入路径。

## 🏷️ 命名规范

- **目录和非组件文件**: 使用 `kebab-case` (小写短横线连接)。例如: `user-list`, `request.ts`。
- **页面/组件**:
  - 文件夹: `kebab-case`。例如: `src/pages/user-list`。
  - React 组件文件: `PascalCase`。例如: `UserList.tsx`。如果目录内只有一个组件，可命名为 `index.tsx`。
- **变量**: `camelCase` (小驼峰)。例如: `const userName = 'Taro';`。
- **常量**: `UPPER_SNAKE_CASE` (大写下划线连接)。例如: `const MAX_COUNT = 10;`。
- **函数/方法**: `camelCase`。例如: `function getUserInfo() {}`。
- **CSS 类名**: `kebab-case` 或 BEM 规范。推荐使用 CSS Modules，在 `*.module.scss` 文件中编写。
- **推荐库**:
  - `classnames`: 便捷地、有条件地组合 CSS 类名。
  - `lodash`: 提供大量实用的工具函数，按需引入。

## ✍️ 代码风格与规范

### TypeScript

- 始终开启 `strict` 模式。
- 明确定义函数参数和返回值的类型。
- 优先使用 `interface` 定义对象类型，使用 `type` 定义联合类型、交叉类型等。

### React

- **函数式组件优先**: 全面使用函数式组件和 Hooks (`useState`, `useEffect`, `useContext` 等)。
- **Hooks**:
  - 使用 `useMemo` 和 `useCallback` 进行性能优化，避免不必要的重渲染。
  - 自定义 Hooks 应用于封装可复用的逻辑，应以 `use` 开头。推荐将项目通用的 Hooks 抽离至 `src/core/hooks` 中，例如封装一个 `useList` 来处理通用列表加载逻辑。
- **组件封装**:
  - 组件应保持功能单一。
  - 超过 100 行的组件建议拆分。
  - 避免使用匿名函数作为组件属性，如 `<View onClick={() => {}} />`。

### 样式 (SCSS) 与颜色管理

- **CSS Modules**: 强制使用 `*.module.scss` 避免全局样式污染。
- **全局样式**: 全局变量、主题等写入 `src/app.scss`。
- **单位**: 推荐使用 `px`，Taro 会自动转换为 `rpx`。

#### 🎨 颜色管理规范 (强制)

**严禁使用硬编码颜色值**，必须使用项目统一的颜色常量系统：

##### SCSS 中使用颜色变量

```scss
// ✅ 正确写法：使用预定义变量
@import "../../styles/variables.scss";

.container {
  background-color: $bg-card; // 卡片背景
  color: $text-primary; // 主要文字
  border: 1px solid $border-base; // 基础边框
}

// ❌ 错误写法：硬编码颜色
.container {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e5e5e5;
}
```

##### TypeScript 中使用颜色常量

```typescript
// ✅ 正确写法：导入颜色常量
import {
  THEME_COLORS,
  TEXT_COLORS,
  BACKGROUND_COLORS,
} from "@/constants/colors";

const buttonStyle = {
  backgroundColor: THEME_COLORS.PRIMARY,
  color: TEXT_COLORS.WHITE,
};

// ❌ 错误写法：硬编码颜色
const buttonStyle = {
  backgroundColor: "#4F46E5",
  color: "#FFFFFF",
};
```

##### 核心颜色变量对照表

| 用途类别   | SCSS 变量           | TypeScript 常量           | 颜色值  | 使用场景                 |
| ---------- | ------------------- | ------------------------- | ------- | ------------------------ |
| **主题色** | `$theme-primary`    | `THEME_COLORS.PRIMARY`    | #4F46E5 | 主要按钮、链接、选中状态 |
| **文字色** | `$text-primary`     | `TEXT_COLORS.PRIMARY`     | #333333 | 主要文字内容             |
|            | `$text-secondary`   | `TEXT_COLORS.SECONDARY`   | #666666 | 次要文字内容             |
|            | `$text-helper-gray` | `TEXT_COLORS.HELPER_GRAY` | #9CA3AF | 辅助文字、图标           |
| **背景色** | `$bg-card`          | `BACKGROUND_COLORS.CARD`  | #FFFFFF | 卡片、模态框背景         |
|            | `$bg-page`          | `BACKGROUND_COLORS.PAGE`  | #F8F8F8 | 页面主背景               |
|            | `$bg-input`         | `BACKGROUND_COLORS.INPUT` | #F5F5F5 | 输入框背景               |
| **边框色** | `$border-base`      | `BORDER_COLORS.BASE`      | #E5E5E5 | 基础边框                 |
|            | `$border-light`     | `BORDER_COLORS.LIGHT`     | #F0F0F0 | 分割线                   |
| **状态色** | `$status-success`   | `STATUS_COLORS.SUCCESS`   | #22C55E | 成功状态                 |
|            | `$status-error`     | `STATUS_COLORS.ERROR`     | #EF4444 | 错误状态                 |
|            | `$status-warning`   | `STATUS_COLORS.WARNING`   | #F59E0B | 警告状态                 |

##### 颜色常量文件结构

- **定义文件**: `src/constants/colors.ts` - TypeScript 颜色常量
- **SCSS 变量**: `src/styles/variables.scss` - SCSS 颜色变量
- **迁移指南**: `src/constants/colorMigrationGuide.md` - 硬编码颜色替换指南

##### 迁移检查清单

在每个 SCSS 文件中：

- [ ] 已添加 `@import "../../styles/variables.scss"`
- [ ] 已替换所有硬编码的十六进制颜色值 (#XXXXXX)
- [ ] 已替换所有硬编码的 rgba/rgb 值
- [ ] 使用了语义化的颜色变量名称
- [ ] 在浏览器中验证视觉效果无差异

##### 批量迁移工具

使用 VS Code 正则表达式批量替换：

```regex
查找: #4F46E5  替换: $theme-primary
查找: #FFFFFF  替换: $bg-card
查找: #333333  替换: $text-primary
查找: #F8F8F8  替换: $bg-page
```

验证是否还有遗漏：

```bash
# 搜索十六进制颜色值
grep -r "#[0-9A-Fa-f]{6}" src/ --include="*.scss"
# 搜索 rgba 值
grep -r "rgba\?\(" src/ --include="*.scss"
```

#### 新兴方案

- 可关注 `UnoCSS` 或 `TailwindCSS` 等原子化 CSS 方案，它们通过提供大量原子类来快速构建界面，可能会在特定场景下提升开发效率。

## 组件化开发

- **UI 组件库**: 优先使用微信小程序原生组件库（如 WeUI），其次是 `Taro UI`。
- **按需引入**: 在 `config/index.ts` 中配置 `taro-ui` 的按需引入，或在 `app.scss` 中全局引入样式。推荐按需引入以减小包体积。
  ```typescript
  // app.scss
  @import "~taro-ui/dist/style/index.scss";
  ```
  同时，为确保 `Taro UI` 能够被正确编译，需在 `config/index.ts` 中进行如下配置：
  ```typescript
  // config/index.ts
  const config = {
    // ...
    weapp: {
      esnextModules: ["taro-ui"],
    },
    h5: {
      esnextModules: ["taro-ui"],
    },
  };
  ```
- **自定义组件**: 对于 `Taro UI` 未提供的组件，或无法满足业务需求的场景，可在 `src/components` 目录下创建自定义组件。
- **原子组件**: 在 `src/components` 目录下，创建可复用的原子组件，如 `Button`, `Tag`, `Avatar`, `Card` 等。
- **业务组件**: 针对特定业务场景，封装业务组件，如 `PostItem` (帖子列表项), `CommentList` (评论列表) 等。
- **组件文档**: 建议为核心组件编写简单的使用文档或注释，说明其 `props` 和用法。
- **样式**: 组件样式优先使用 CSS Modules (`.module.scss`)，避免全局污染。

## UI/UX 规范

- **设计风格**: 简洁、卡片式布局，多采用圆角、留白和阴影。
- **色彩规范**:
  - 主色调: 蓝色 (#4A90E2)
  - 辅助色: 灰色 (#9B9B9B), 红色 (#D0021B)
  - 背景色: 浅灰 (#F5F5F5), 白色 (#FFFFFF)
- **字体规范**:
  - 标题: 18px, Bold
  - 正文: 16px, Regular
  - 辅助文字/标签: 14px, Regular
- **组件设计**:
  - **按钮**: 主要按钮使用主色调填充，次要按钮使用描边或灰色样式。所有按钮均带有圆角。
  - **列表**: 列表项之间保持足够间距，增加分割线以区分。
  - **图标**: 采用线性图标 (Line Icon)，风格统一。
