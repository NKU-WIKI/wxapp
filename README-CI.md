# 微信小程序 CI/CD 配置说明

## 概述

本项目已配置完整的 CI/CD 流水线，支持自动构建、测试和部署微信小程序到体验版。

## 配置步骤

### 1. 获取微信小程序私钥

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 在"小程序代码上传"部分，下载代码上传密钥
4. 保存私钥文件（通常是 `private.wxe0c82418cb888db0.key`）

### 2. 配置 GitHub Secrets

在 GitHub 仓库中设置以下 Secrets：

1. 进入仓库 -> Settings -> Secrets and variables -> Actions
2. 添加以下 Repository secrets：

```
WECHAT_APP_ID=wxe0c82418cb888db0
WECHAT_PRIVATE_KEY=私钥文件的完整内容
```

**重要**: `WECHAT_PRIVATE_KEY` 应该包含私钥文件的完整内容，包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`。

### 3. 工作流触发方式

#### 自动触发
- **推送到 main 分支**: 自动部署到生产环境（机器人1）
- **推送到 dev 分支**: 自动部署到开发环境（机器人2）
- **Pull Request**: 仅构建和测试，不部署

#### 手动触发
1. 进入 GitHub 仓库 -> Actions -> Deploy WeChat Mini Program
2. 点击 "Run workflow"
3. 填写参数：
   - **版本号**: 如 `1.0.0`
   - **版本描述**: 如 `新功能发布`
   - **机器人编号**: 1-30（不同机器人对应不同的体验版）
   - **生成预览二维码**: 可选

## 本地使用

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入实际配置

3. 将私钥文件放在项目根目录，命名为 `private.key`

### 本地命令

```bash
# 构建项目
npm run build:weapp

# 上传到微信小程序（需要先配置环境变量）
npm run upload

# 生成预览二维码
npm run preview
```

## 工作流程说明

### Build 阶段
1. 检出代码
2. 安装 Node.js 和依赖
3. 运行代码检查（ESLint + StyleLint）
4. 构建项目
5. 上传构建产物

### Deploy 阶段
1. 下载构建产物
2. 配置微信小程序私钥
3. 根据分支/手动输入设置版本信息
4. 上传到微信小程序平台
5. 可选：生成预览二维码
6. 清理敏感文件

## 版本管理

### 自动版本号
- 格式：`YYYY.MM.DD.{commit_hash}`
- 例如：`2023.12.25.a1b2c3d`

### 手动版本号
- 支持语义化版本号
- 例如：`1.0.0`, `1.2.3-beta.1`

## 机器人配置

不同的机器人编号对应不同的体验版：
- **机器人1**: 生产环境（main 分支默认）
- **机器人2**: 开发环境（dev 分支默认）
- **机器人3-30**: 可用于功能分支或特殊版本

## 安全注意事项

1. **私钥安全**: 私钥文件绝对不能提交到代码仓库
2. **GitHub Secrets**: 确保 Secrets 只有必要的人员能访问
3. **权限控制**: 建议只允许特定分支触发部署
4. **日志清理**: 工作流程会自动清理包含敏感信息的临时文件

## 故障排除

### 常见错误

1. **私钥格式错误**
   - 确保私钥内容完整，包含头尾标识
   - 检查是否有多余的空格或换行

2. **AppID 不匹配**
   - 确认 `WECHAT_APP_ID` 与项目配置一致

3. **权限不足**
   - 确认小程序账号已开启代码上传功能
   - 检查私钥是否正确绑定到对应的 AppID

4. **构建失败**
   - 检查代码是否通过 lint 检查
   - 确认所有依赖都已正确安装

### 调试方法

1. 查看 GitHub Actions 日志
2. 在本地使用相同的环境变量测试
3. 检查微信开发者工具的上传历史

## 更多配置

### 自定义构建设置

可以在 `scripts/upload.js` 中修改构建设置：

```javascript
setting: {
  es6: true,
  es7: true,
  minifyJS: true,
  minifyWXML: true,
  minifyWXSS: true,
  minify: true,
  codeProtect: false,  // 是否开启代码保护
  autoPrefixWXSS: true
}
```

### 添加钉钉/企业微信通知

可以在工作流中添加通知步骤，在部署成功/失败时发送消息通知。