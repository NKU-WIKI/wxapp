# CI/CD 集成指南

为了确保代码库的长期健康和高质量，我们强烈建议将代码质量检查集成到您的持续集成/持续部署 (CI/CD) 流程中。

## 核心检查流程

我们的项目已经通过 `husky` 和 `lint-staged` 配置了 `pre-commit` 钩子。这意味着在每次代码提交到 Git 仓库之前，都会在本地对暂存文件进行自动的 lint 检查和格式化。

然而，为了防止任何未经检查的代码被意外推送到远程仓库（例如，通过 `git commit --no-verify`），在 CI/CD 流程中增加一个服务器端的检查步骤是至关重要的。

## 在 CI/CD 中集成 Lint 检查

我们已经在 `package.json` 中提供了一个专门为 CI 环境设计的、更严格的 lint 脚本：`lint:ci`。

```json
"scripts": {
  // ...
  "lint:ci": "eslint src --max-warnings 0"
}
```

这个脚本与本地的 `lint` 命令有两个关键区别：

1.  它会检查 `src` 目录下的所有文件，而不仅仅是暂存文件。
2.  它使用了 `--max-warnings 0` 标志，这意味着**任何 ESLint 警告都会被视为错误**，从而导致检查失败。这对于逐步消除代码中的 `any` 类型等技术债非常有帮助。

### GitHub Actions 示例配置

您可以在您的 GitHub Actions 工作流中添加一个新的 `job` 来执行这个检查。这是一个示例配置，您可以将其添加到您的 `.github/workflows/main.yml` (或类似) 文件中：

```yaml
jobs:
  lint:
    name: Code Quality Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20" # 确保这里的版本与项目开发环境一致
          cache: "npm"

      - name: Install dependencies
        run: npm install

      - name: Run ESLint check
        run: npm run lint:ci

      - name: Run Stylelint check
        run: npm run stylelint
```

**工作流说明**:

1.  **Checkout repository**: 拉取最新的代码。
2.  **Set up Node.js**: 设置 Node.js 环境，并启用 `npm` 缓存以加快依赖安装速度。
3.  **Install dependencies**: 安装项目所需的所有依赖。
4.  **Run ESLint check**: 执行我们严格的 `lint:ci` 脚本。如果发现任何错误或警告，这个步骤将会失败，从而阻止后续的构建或部署流程。
5.  **Run Stylelint check**: 执行 Stylelint 检查，确保样式代码的规范性。

通过将这些检查集成到您的 CI 流程中，您可以确保所有合并到主分支的代码都始终符合项目设定的最高质量标准。
