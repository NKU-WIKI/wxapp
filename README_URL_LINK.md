# 微信小程序URL Link功能

本功能为帖子生成微信小程序的分享链接（url_link），可以在微信内直接跳转到帖子详情页面。

## 功能概述

当用户发布帖子时，系统会自动：
1. 创建帖子到后端数据库
2. 调用微信API生成该帖子的url_link
3. 将url_link更新到后端帖子数据中

生成的url_link可以：
- 在微信聊天中直接点击跳转到小程序的帖子详情页
- 分享给其他用户
- 用于推广和传播

## 技术实现

### 1. 云函数 generateUrlLink

**位置**: `cloudfunctions/generateUrlLink/`

**功能**: 调用微信官方API生成小程序页面的url_link

**参数**:
- `postId`: 帖子ID

**返回**:
```json
{
  "code": 200,
  "message": "success", 
  "data": {
    "urlLink": "https://wxaurl.cn/xxxxxxxxx"
  }
}
```

### 2. 工具函数 generatePostUrlLink

**位置**: `utils/urlLink.js`

**功能**: 封装云函数调用，提供友好的API接口

**使用方法**:
```javascript
const { generatePostUrlLink } = require('../utils/index');

const urlLink = await generatePostUrlLink(postId);
if (urlLink) {
  console.log('生成的分享链接:', urlLink);
}
```

### 3. 发帖流程集成

**位置**: `behaviors/postBehavior.js` 的 `_createPost` 方法

**流程**:
1. 创建帖子到后端
2. 获取帖子ID
3. 调用云函数生成url_link
4. 更新帖子，将url_link保存到后端

## 部署步骤

### 1. 部署云函数

在微信开发者工具中：
1. 右键点击 `cloudfunctions/generateUrlLink/` 目录
2. 选择"上传并部署：云端安装依赖"
3. 等待部署完成

### 2. 配置权限

确保云函数具有调用`urllink.generate`接口的权限：
1. 在微信公众平台的云开发控制台
2. 进入云函数管理
3. 确认generateUrlLink函数的权限配置

### 3. 后端数据库

确保帖子表中有`url_link`字段：
```sql
ALTER TABLE wxapp_post ADD COLUMN url_link TEXT NULL;
```

## API文档更新

已在`api/wxapp/post.md`中添加`url_link`字段：

```markdown
| `url_link` | `string` | 否 | 微信小程序分享链接。 |
```

## 使用示例

### 发帖时自动生成
```javascript
// 用户发帖时自动处理，无需额外代码
const result = await this._createPost(postData);
console.log('帖子创建成功，url_link:', result.data.urlLink);
```

### 手动生成url_link
```javascript
const { generatePostUrlLink } = require('../utils/index');

// 为现有帖子生成分享链接
const urlLink = await generatePostUrlLink('12345');
if (urlLink) {
  // 可以保存到帖子或直接使用
  console.log('分享链接:', urlLink);
}
```

## 错误处理

- 云函数调用失败：记录警告日志，不影响帖子创建
- url_link生成失败：帖子正常创建，只是没有分享链接
- 后端更新失败：url_link仍返回给前端，只是不保存到数据库

## 注意事项

1. **权限要求**: 需要小程序具有生成url_link的权限
2. **频率限制**: 微信对url_link生成有频率限制，注意控制调用频次
3. **链接有效期**: 生成的url_link默认永久有效
4. **页面路径**: 目前固定跳转到 `pages/post/detail/detail?id={postId}`

## 错误排查

### 常见问题

1. **云函数部署失败**
   - 检查网络连接
   - 确认微信开发者工具版本
   - 检查云函数代码语法

2. **权限不足**
   - 在微信公众平台确认权限
   - 检查小程序类目是否支持

3. **url_link生成失败**
   - 查看云函数日志
   - 确认帖子ID格式正确
   - 检查页面路径是否存在

### 调试方法

1. **查看云函数日志**:
   ```javascript
   console.log('云函数调用结果:', res);
   ```

2. **本地调试**:
   ```javascript
   const { logger } = require('../utils/index');
   logger.debug('调试信息', { postId, urlLink });
   ```

## 扩展功能

可以基于此功能扩展：
- 帖子分享统计
- 自定义分享页面参数
- 批量生成多个帖子的分享链接
- 集成到帖子详情页的分享功能 