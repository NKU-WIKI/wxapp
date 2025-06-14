# 南开Wiki API文档

本文档包含南开Wiki平台的所有API接口，主要分为三类：
1. 微信小程序API：提供给微信小程序客户端使用的API
2. Agent智能体API：提供AI聊天和RAG功能
3. 知识库API：提供知识库检索和搜索功能

## 后端API规范

所有接口必须遵循以下规范：

1. **请求方法限制**：只能使用GET和POST请求方法
   - GET：用于幂等操作，使用查询参数，禁止使用路径参数和请求体
   - POST：用于非幂等操作，使用请求体，禁止使用查询参数和路径参数

2. **参数传递方式**：
   - 查询参数：通过URL中的?key=value传递，适用于GET请求
   - 请求体参数：JSON格式，适用于POST请求

3. **路由命名规范**：
   - 所有接口路径使用小写
   - 单词间用短横线-分隔，不使用下划线
   - 例如：`/api/wxapp/notification/mark-read-batch`

4. **响应格式**：统一使用标准JSON响应格式（详见下文）

## 字段命名规范

为保持系统一致性，接口返回和请求中的字段命名遵循以下规范：

1. **统一单数形式**：所有字段使用单数形式命名，例如：
   - `image` 而非 `images`（图片字段）
   - `tag` 而非 `tags`（标签字段）

2. **计数字段特殊规范**：
   - `like_count`（点赞数）
   - `favorite_count`（收藏数）
   - `post_count`（帖子数）
   - `follower_count`（粉丝数）
   - `following_count`（关注数）
   - `comment_count`（评论数）
   - `view_count`（浏览数）

3. **严格命名规范**：所有API接口请求和响应中请使用标准字段名命名。

接口处理过程中会严格遵循上述命名规范，使用非标准字段名可能导致数据处理错误。

## 接口前缀

所有API都有对应的前缀路径：
- 微信小程序API：`/api/wxapp/*`
- Agent智能体API：`/api/agent/*`
- 知识库API：`/api/knowledge/*`

如，用户接口的完整路径为 `/api/wxapp/user/profile`


## 后端响应标准格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

响应字段说明：
- `code` - 状态码：200表示成功，4xx表示客户端错误，5xx表示服务器错误
- `message` - 响应消息，成功或错误描述
- `data` - 响应数据，可能是对象、数组或null
- `details` - 额外详情，通常在发生错误时提供更详细的信息
- `timestamp` - 响应时间戳
- `pagination` - 分页信息，包含分页相关参数，详见下文

## 分页数据标准格式

所有包含分页数据的接口均使用标准的分页格式：

```json
{
  "code": 200,
  "message": "success",
  "data": [...],
  "pagination": {
    "total": 100,         // 总记录数
    "page": 1,            // 当前页码
    "page_size": 10,      // 每页数量
    "total_pages": 10,    // 总页数
    "has_more": true      // 是否有更多数据
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

分页参数说明：
- `page` - 当前页码，从1开始
- `page_size` - 每页记录数
- `total` - 总记录数
- `total_pages` - 总页数，根据 total 和 page_size 计算得出：Math.ceil(total / page_size)
- `has_more` - 是否有更多数据，当 page < total_pages 时为 true

分页查询参数：
- 请求时使用 `page` 表示页码（从1开始），而不是 offset
- 请求时使用 `page_size` 表示每页条数，而不是 limit
- 例如：`/api/wxapp/post/list?page=2&page_size=20`

## 错误响应格式：

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "details": {
    "message": "openid字段为必填项"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

常见错误响应示例：

1. **参数缺失错误**：
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "details": {
    "message": "缺少必填参数: openid"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

2. **参数格式错误**：
```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "details": {
    "message": "参数格式错误: post_id 必须是整数"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

3. **资源不存在错误**：
```json
{
  "code": 404,
  "message": "资源不存在",
  "data": null,
  "details": {
    "message": "找不到ID为123的帖子"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

4. **权限错误**：
```json
{
  "code": 403,
  "message": "权限不足",
  "data": null,
  "details": {
    "message": "您没有权限执行此操作"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

5. **服务器错误**：
```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null,
  "details": {
    "message": "服务器处理请求时出现错误"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

## 参数类型说明

API接口的参数类型规范如下：

1. **ID类型参数**：
   - `post_id`、`comment_id`、`notification_id` 等ID参数必须是**整数类型**
   - `openid`、`unionid` 等用户标识必须是**字符串类型**

2. **布尔类型参数**：
   - 使用 `true`/`false` 表示，如 `is_read`

3. **日期时间类型参数**：
   - 使用 ISO 8601 格式：`YYYY-MM-DD HH:MM:SS`
   - 或简化的日期格式：`YYYY-MM-DD`

请严格按照上述类型规范传递参数，否则可能导致请求失败。

## 一、用户接口

### 1.1 同步用户信息

**接口**：`POST /api/wxapp/user/sync`  
**描述**：同步用户信息，如果用户不存在则创建新用户，存在则返回用户信息  
**请求体**：

```json
{
  "openid": "微信用户唯一标识",         // 必填，微信小程序用户唯一标识
  "unionid": "微信开放平台唯一标识",    // 可选，微信开放平台唯一标识
  "nickname": "用户昵称",             // 可选，用户昵称（如不提供则自动生成默认昵称）
  "avatar": "头像URL",                // 可选，头像URL（若为空则使用默认头像）
  "gender": 1,                        // 可选，性别：0-未知, 1-男, 2-女
  "bio": "个人简介",                   // 可选，个人简介
  "country": "国家",                   // 可选，国家
  "province": "省份",                  // 可选，省份
  "city": "城市",                      // 可选，城市
  "language": "语言",                  // 可选，语言
  "birthday": "2004-06-28",           // 可选，生日
  "wechatId": "微信号",                // 可选，微信号
  "qqId": "QQ号",                      // 可选，QQ号
  "phone": "手机号",                   // 可选，手机号
  "university": "大学",                // 可选，大学
  "extra": {                          // 可选，扩展字段
    "school": "南开大学"
  }
}
```

**响应**：
1. **已有用户返回**：包含完整用户信息，`details`字段包含`"message": "用户已存在"`
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "微信用户唯一标识",
    "unionid": "微信开放平台唯一标识",
    "nickname": "用户昵称",
    "avatar": "头像URL（如果为空，会自动设置为默认头像）",
    "gender": 1,
    "bio": "个人简介",
    "country": "国家",
    "province": "省份",
    "city": "城市",
    "language": "语言",
    "birthday": "2004-06-28",
    "wechatId": "微信号",
    "qqId": "QQ号",
    "phone": "手机号",
    "university": "大学",
    "token_count": 100,
    "like_count": 10,
    "favorite_count": 5,
    "post_count": 8,
    "follower_count": 20,
    "following_count": 15,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": {"school": "南开大学"},
    "role": "admin"
  },
  "details": {"message": "用户已存在"},
  "timestamp": "2023-01-01 12:00:00"
}
```

2. **新用户返回**：包含新创建的用户信息，`details`字段包含`"message": "新用户创建成功"`
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 10002,
    "openid": "微信用户唯一标识",
    "unionid": null,
    "nickname": "用户_ABCDEF（自动生成的默认昵称）",
    "avatar": "cloud://nkuwiki-xxxx/default/default-avatar.png（默认头像URL）",
    "gender": 0,
    "bio": null,
    "country": null,
    "province": null,
    "city": null,
    "language": null,
    "birthday": null,
    "wechatId": null,
    "qqId": null,
    "phone": null,
    "university": null,
    "token_count": 0,
    "like_count": 0,
    "favorite_count": 0,
    "post_count": 0,
    "follower_count": 0,
    "following_count": 0,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": null,
    "role": "admin"
  },
  "details": {"message": "新用户创建成功"},
  "timestamp": "2023-01-01 12:00:00"
}
```

### 1.2 获取用户信息

**接口**：`GET /api/wxapp/user/profile`  
**描述**：获取指定用户的信息，如果传入的是当前登录用户的openid，则返回当前用户信息  
**参数**：
- `openid` - 查询参数，用户openid（必填）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "微信用户唯一标识",
    "unionid": "微信开放平台唯一标识",
    "nickname": "用户昵称",
    "avatar": "头像URL",
    "gender": 0,
    "bio": "个人简介",
    "country": "国家",
    "province": "省份",
    "city": "城市",
    "language": "语言",
    "birthday": "2004-06-28",
    "wechatId": "微信号",
    "qqId": "QQ号",
    "phone": "手机号",
    "university": "大学",
    "token_count": 0,
    "like_count": 0,
    "favorite_count": 0,
    "post_count": 0,
    "follower_count": 0,
    "following_count": 0,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": {},
    "role": "admin"
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 1.3 查询用户列表

**接口**：`GET /api/wxapp/user/list`  
**描述**：获取用户列表，支持获取所有用户、粉丝列表和关注列表  
**参数**：
- `type` - 查询参数，列表类型：all(所有用户，默认)、follower(粉丝)、following(关注)
- `openid` - 查询参数，用户openid（当type为follower或following时必填）
- `page_size` - 查询参数，每页记录数量，默认10，最大100
- `page` - 查询参数，页码，从1开始，默认1

**响应**：

当type=all或未指定时，返回所有用户列表：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "openid": "微信用户唯一标识",
      "nickname": "用户昵称",
      "avatar": "头像URL",
      "bio": "个人简介",
      "create_time": "2023-01-01 12:00:00",
      "update_time": "2023-01-01 12:00:00"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10,
    "has_more": true
  },
  "details": {
    "message": "获取用户列表成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

当type=follower时，返回粉丝列表：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "openid": "粉丝用户的openid",
      "nickname": "粉丝昵称",
      "avatar": "头像URL",
      "bio": "个人简介",
      "post_count": 5,
      "follower_count": 10,
      "following_count": 20,
      "follow_time": "2023-01-01 12:00:00"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "page_size": 10,
    "total_pages": 2,
    "has_more": true
  },
  "details": {
    "message": "获取粉丝列表成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

当type=following时，返回关注列表：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "openid": "被关注用户的openid",
      "nickname": "被关注用户昵称",
      "avatar": "头像URL",
      "bio": "个人简介",
      "post_count": 8,
      "follower_count": 15,
      "following_count": 5,
      "follow_time": "2023-01-01 12:00:00"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "page_size": 10,
    "total_pages": 3,
    "has_more": true
  },
  "details": {
    "message": "获取关注列表成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 1.4 更新用户信息

**接口**：`POST /api/wxapp/user/update`  
**描述**：更新用户信息  
**请求体**：

```json
{
  "openid": "微信用户唯一标识",         // 必填，用户openid
  "nickname": "新昵称",              // 可选，用户昵称
  "avatar": "新头像URL",              // 可选，头像URL（若为空则使用默认头像）
  "gender": 1,                        // 可选，性别：0-未知, 1-男, 2-女
  "bio": "新个人简介",                // 可选，个人简介
  "country": "新国家",                // 可选，国家
  "province": "新省份",               // 可选，省份
  "city": "新城市",                   // 可选，城市
  "language": "新语言",               // 可选，语言
  "birthday": "2004-06-28",           // 可选，生日
  "wechatId": "微信号",               // 可选，微信号
  "qqId": "QQ号",                     // 可选，QQ号
  "phone": "手机号",                  // 可选，手机号
  "university": "大学",               // 可选，大学
  "status": 1,                        // 可选，用户状态：1-正常, 0-禁用
  "extra": {                          // 可选，扩展字段
    "school": "南开大学",
    "major": "计算机科学与技术"
  }
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "微信用户唯一标识",
    "unionid": "微信开放平台唯一标识",
    "nickname": "新昵称",
    "avatar": "新头像URL",
    "gender": 1,
    "bio": "新个人简介",
    "country": "新国家",
    "province": "新省份",
    "city": "新城市",
    "language": "新语言",
    "birthday": "2004-06-28",
    "wechatId": "微信号",
    "qqId": "QQ号",
    "phone": "手机号",
    "university": "大学",
    "token_count": 100,
    "like_count": 10,
    "favorite_count": 5,
    "post_count": 8,
    "follower_count": 20,
    "following_count": 15,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-02 14:30:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": {
      "school": "南开大学",
      "major": "计算机科学与技术"
    },
    "role": "admin"
  },
  "details": {
    "message": "用户信息更新成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```


### 1.5 关注用户

**接口**：`POST /api/wxapp/user/follow`  
**描述**：将当前用户设为目标用户的粉丝（或者取消关注）  
**请求体**：
- `follower_id` - 关注者的openid（必填）
- `followed_id` - 被关注者的openid（必填）

**响应**：

```json
{"code":200,"message":"success","data":{"success":true,"status":"followed","is_following":true},"details":{"message":"关注成功"},"timestamp":"2025-04-12T21:10:26.320996","pagination":null}
{"code":200,"message":"success","data":{"success":true,"status":"unfollowed","is_following":false},"details":{"message":"取消关注成功"},"timestamp":"2025-04-12T21:10:01.431815","pagination":null}
```

### 1.6 获取用户交互状态

**接口**：`GET /api/wxapp/user/status`  
**描述**：获取当前用户与目标用户之间的交互状态  
**参数**：
- `openid` - 查询参数，当前用户openid（必填）
- `target_id` - 查询参数，目标用户openid（必填）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "is_following": true,
    "is_self": false,
    "post_count": 10,
    "follower_count": 20,
    "following_count": 15,
    "like_count": 50
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

## 二、帖子接口

### 2.1 创建帖子

**接口**：`POST /api/wxapp/post`  
**描述**：创建新帖子，成功后会增加用户的发帖计数(post_count)  
**请求体**：

```json
{
  "openid": "发布用户openid", // 必填
  "title": "帖子标题", // 必填
  "content": "帖子内容", // 必填
  "image": ["图片URL1", "图片URL2"], // 可选
  "tag": ["标签1", "标签2"], // 可选
  "category_id": 1, // 可选，默认为0
  "location": { // 可选
    "latitude": 39.12345,
    "longitude": 116.12345,
    "name": "位置名称",
    "address": "详细地址"
  },
  "phone": "手机号", // 可选
  "wechatId": "微信号", // 可选
  "qqId": "QQ号", // 可选
  "nickname": "用户昵称", // 可选，如不提供则从用户表获取
  "avatar": "用户头像URL" // 可选，如不提供则从用户表获取
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "发布用户openid",
    "title": "帖子标题",
    "content": "帖子内容",
    "image": ["图片URL1", "图片URL2"],
    "tag": ["标签1", "标签2"],
    "category_id": 1,
    "location": {
      "latitude": 39.12345,
      "longitude": 116.12345,
      "name": "位置名称",
      "address": "详细地址"
    },
    "phone": "手机号",
    "wechatId": "微信号",
    "qqId": "QQ号",
    "nickname": "用户昵称",
    "avatar": "用户头像URL",
    "view_count": 0,
    "like_count": 0,
    "comment_count": 0,
    "favorite_count": 0,
    "liked_users": [],
    "favorite_users": [],
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "status": 1,
    "platform": "wxapp",
    "is_deleted": 0,
    "post_count": 1
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 2.2 获取帖子详情

**接口**：`GET /api/wxapp/post/detail`  
**描述**：获取帖子详细信息  
**参数**：
- `post_id` - 查询参数，帖子ID（必填，整数类型）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "发布用户openid",
    "title": "帖子标题",
    "content": "帖子内容",
    "image": ["图片URL1", "图片URL2"],
    "tag": ["标签1", "标签2"],
    "category_id": 1,
    "location": "位置信息",
    "phone": "手机号",
    "wechatId": "微信号",
    "qqId": "QQ号",
    "nickname": "用户昵称",
    "avatar": "用户头像URL",
    "view_count": 1,
    "like_count": 0,
    "comment_count": 0,
    "favorite_count": 0,
    "liked_users": [],
    "favorite_users": [],
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "status": 1,             // 帖子状态：1-正常，0-禁用
    "platform": "wxapp",
    "is_deleted": 0,
    "post_count": 1
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 2.3 查询帖子列表

**接口**：`GET /api/wxapp/post/list`  
**描述**：查询帖子列表，支持多种筛选条件  
**参数**：
- `page` - 查询参数，页码，默认1
- `limit` - 查询参数，每页数量，默认10
- `category_id` - 查询参数，分类ID（可选）
- `tag` - 查询参数，标签（可选）
- `openid` - 查询参数，用户openid，查询该用户的帖子或收藏的帖子（可选）
- `favorite` - 查询参数，布尔值，默认false。为true时使用openid参数查询用户收藏的帖子
- `order_by` - 查询参数，排序方式，默认为"create_time DESC"，支持：
  - `create_time DESC/ASC`（创建时间）
  - `update_time DESC/ASC`（更新时间）
  - `view_count DESC/ASC`（浏览数）
  - `like_count DESC/ASC`（点赞数）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "帖子标题",
      "content": "帖子内容",
      "image": ["图片URL1", "图片URL2"],
      "openid": "发布用户openid",
      "nickname": "用户昵称",
      "avatar": "头像URL",
      "bio": "用户简介",
      "view_count": 10,
      "like_count": 5,
      "comment_count": 3,
      "favorite_count": 2,
      "is_favorited": true,      // 当使用favorite=true参数时，所有返回的帖子都标记为true
      "allow_comment": 1,
      "is_public": 1,
      "create_time": "2023-01-01 12:00:00",
      "update_time": "2023-01-01 12:00:00",
      "tag": ["标签1", "标签2"],
      "category_id": 1,
      "user": {                  // 补充查询得到的作者信息
        "openid": "作者openid",
        "nickname": "作者昵称",
        "avatar": "作者头像URL",
        "bio": "作者简介"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10,
    "has_more": true
  },
  "details": {"message": "查询帖子列表成功"},
  "timestamp": "2023-01-01 12:00:00"
}
```

### 2.4 更新帖子

**接口**：`POST /api/wxapp/post/update`  
**描述**：更新帖子信息  
**请求体**：

```json
{
  "post_id": 1, // 必填，整数类型
  "openid": "发帖用户openid", // 必填
  "content": "更新后的内容", // 可选，帖子内容
  "title": "更新后的标题", // 可选，帖子标题
  "category_id": 2, // 可选，整数类型，分类ID
  "image": ["图片URL1","图片URL2"], // 可选，图片URL数组
  "tag": ["标签1","标签2"], // 可选，标签数组
  "phone": "手机号", // 可选
  "wechatId": "微信号", // 可选
  "qqId": "QQ号" // 可选
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "发布用户openid",
    "title": "新标题",
    "content": "新内容",
    "image": ["新图片URL1", "新图片URL2"],
    "tag": ["新标签1", "新标签2"],
    "category_id": 2,
    "location": {
      "latitude": 39.12345,
      "longitude": 116.12345,
      "name": "位置名称",
      "address": "详细地址"
    },
    "phone": "手机号",
    "wechatId": "微信号",
    "qqId": "QQ号",
    "nickname": "用户昵称", 
    "avatar": "用户头像URL",
    "view_count": 10,
    "like_count": 5,
    "comment_count": 3,
    "favorite_count": 0,
    "liked_users": ["用户openid1", "用户openid2", "用户openid3", "用户openid4", "用户openid5"],
    "favorite_users": [],
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 13:00:00",
    "status": 1,
    "platform": "wxapp",
    "is_deleted": 0,
    "post_count": 1
  },
  "details": null,
  "timestamp": "2023-01-01 13:00:00"
}
```

### 2.5 删除帖子

**接口**：`DELETE /api/wxapp/post/delete`  
**描述**：删除帖子（标记删除）  
**参数**：
- `post_id` - 查询参数，帖子ID（必填，整数类型）
- `openid` - 查询参数，用户openid（必填，用于验证操作权限）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "message": "帖子已删除"
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 2.6 点赞帖子

**接口**：`POST /api/wxapp/post/like`  
**描述**：点赞帖子或取消点赞（如果已点赞）  
**请求体**：

```json
{
  "post_id": 1, // 必填，整数类型
  "openid": "点赞用户的openid" // 必填
}
```

**响应**：

```json
{"code":200,"message":"success","data":{"success":true,"status":"liked","like_count":1,"is_liked":true},"details":{"message":"点赞成功"},"timestamp":"2025-04-12T20:56:23.008762","pagination":null}
{"code":200,"message":"success","data":{"success":true,"status":"unliked","like_count":0,"is_liked":false},"details":{"message":"取消点赞成功"},"timestamp":"2025-04-12T20:56:14.207527","pagination":null}

```

### 2.7 收藏帖子

**接口**：`POST /api/wxapp/post/favorite`  
**描述**：收藏帖子或取消收藏（如果已收藏）  
**请求体**：

```json
{
  "post_id": 1, // 必填，整数类型
  "openid": "收藏用户的openid" // 必填
}
```

**响应**：

```json
{"code":200,"message":"success","data":{"success":true,"status":"favorited","favorite_count":1,"is_favorited":true},"details":{"message":"收藏成功"},"timestamp":"2025-04-12T20:54:08.462333","pagination":null}
```
```json
{"code":200,"message":"success","data":{"success":true,"status":"unfavorited","favorite_count":0,"is_favorited":false},"details":{"message":"取消收藏成功"},"timestamp":"2025-04-12T20:54:22.807428","pagination":null}
```    

### 2.8 获取帖子互动状态

**接口**：`GET /api/wxapp/post/status`  
**描述**：获取用户与帖子的交互状态（是否点赞、收藏等）  
**参数**：
- `post_id` - 查询参数，帖子ID（必填）
- `openid` - 查询参数，用户openid（必填）

**响应**：

```json
{"code":200,"message":"success","data":{"20":{"exist":true,"is_liked":false,"is_favorited":false,"is_commented":false,"is_author":false,"is_following":false,"like_count":0,"favorite_count":0,"comment_count":0,"view_count":2}},"details":null,"timestamp":"2025-04-12T21:08:44.098526","pagination":null}
```

**响应字段说明**：
- `exist` - 帖子是否存在
- `is_liked` - 当前用户是否已点赞该帖子
- `is_favorited` - 当前用户是否已收藏该帖子
- `is_commented` - 当前用户是否对该帖子有评论
- `is_author` - 当前用户是否为该帖作者
- `is_following` - 当前用户是否已关注该帖作者
- `like_count` - 点赞数
- `favorite_count` - 收藏数
- `comment_count` - 评论数
- `view_count` - 浏览数


## 三、评论接口

### 3.1 创建评论

**接口**：`POST /api/wxapp/comment`  
**描述**：创建新评论  
**请求体**：

```json
{
  "openid": "评论用户openid", // 必填
  "resource_id": 1, // 必填，整数类型
  "resource_type": "post", // 必填，资源类型：post-帖子, knowledge-知识
  "content": "评论内容", // 必填
  "parent_id": null, // 可选，父评论ID，整数类型
  "image": [] // 可选，评论图片
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 5,
    "resource_id": 1,
    "resource_type": "post",
    "parent_id": null,
    "openid": "评论用户openid",
    "nickname": null,
    "avatar": null,
    "content": "评论内容",
    "image": "[]",
    "like_count": 0,
    "reply_count": 0,
    "status": 1,
    "is_deleted": 0,
    "create_time": "2025-04-05T20:24:11",
    "update_time": "2025-04-05T20:24:11"
  },
  "details": null,
  "timestamp": "2025-04-05T20:24:11.177597",
  "pagination": null
}
```

> **注意**：创建评论时，如果评论的是资源（parent_id为null），并且评论者不是资源作者，则会自动向资源作者发送通知；如果评论的是评论（提供parent_id），并且评论者不是父评论作者，则会自动向父评论作者发送通知。

### 3.2 获取评论详情

**接口**：`GET /api/wxapp/comment/detail`  
**描述**：获取指定评论的详情  
**参数**：
- `openid` - 查询参数，用户OpenID（必填）
- `comment_id` - 查询参数，评论ID（必填，整数类型）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "评论用户openid",
    "resource_id": 1,
    "resource_type": "post",
    "content": "评论内容",
    "parent_id": null,
    "nickname": "用户昵称",
    "avatar": "用户头像URL",
    "image": [],
    "like_count": 0,
    "replies": [],
    "liked": false,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "status": 1,
    "is_deleted": 0
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 3.3 获取评论列表

**接口**：`GET /api/wxapp/comment/list`  
**描述**：获取指定资源的评论列表  
**参数**：
- `resource_id` - 查询参数，资源ID（必填，整数类型）
- `resource_type` - 查询参数，资源类型：post-帖子, knowledge-知识（必填，字符串类型）
- `parent_id` - 查询参数，父评论ID，可选（整数类型，为null时获取一级评论）
- `page_size` - 查询参数，每页记录数量，默认20，最大100
- `page` - 查询参数，页码，从1开始，默认1
- `openid` - 查询参数，用户openid，可选（用于查询点赞状态）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 2,
      "resource_id": 3,
      "resource_type": "post",
      "parent_id": null,
      "openid": "用户openid",
      "nickname": "用户昵称",
      "avatar": "头像URL",
      "content": "评论内容",
      "image": null,
      "like_count": 0,
      "reply_count": 0,
      "status": 1,
      "is_deleted": 0,
      "create_time": "2025-03-31T22:40:21",
      "update_time": "2025-03-31T22:40:21",
      "liked": false,
      "reply_preview": []
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "page_size": 20,
    "total_pages": 1,
    "has_more": false
  },
  "details": null,
  "timestamp": "2025-03-31T23:02:27.686667"
}
```

### 3.4 删除评论

**接口**：`POST /api/wxapp/comment/delete`  
**描述**：删除评论（标记删除）  
**请求体**：

```json
{
  "comment_id": 1, // 必填，评论ID，整数类型
  "openid": "评论用户openid" // 必填，用于验证操作权限
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "评论删除成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 3.5 点赞评论

**接口**：`POST /api/wxapp/comment/like`  
**描述**：点赞评论或取消点赞（如果已点赞）  
**请求体**：

```json
{
  "comment_id": 1, // 必填，评论ID，整数类型
  "openid": "点赞用户的openid" // 必填
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "like_count": 4,
    "message": "点赞成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

## 四、通知接口

南开Wiki平台中的通知系统负责处理用户交互（点赞、评论、关注等）触发的通知。

### 4.1 获取通知列表

**接口**：`GET /api/wxapp/notification`  
**描述**：获取用户的通知列表  
**参数**：
- `openid` - 查询参数，用户openid（必填，可以使用receiver代替）
- `type` - 查询参数，通知类型：如comment-评论, like-点赞, follow-关注等（可选）
- `is_read` - 查询参数，是否已读：true/false（可选）
- `page_size` - 查询参数，每页记录数量，默认20
- `page` - 查询参数，页码，从1开始，默认1

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "sender": {"openid": "发送者openid"},
      "receiver": "接收者用户openid",
      "title": "收到新评论",
      "content": "用户评论了你的帖子「帖子标题」",
      "type": "comment",
      "is_read": false,
      "target_id": "123",
      "target_type": "comment",
      "create_time": "2023-01-01 12:00:00",
      "update_time": "2023-01-01 12:00:00",
      "status": 1
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "page_size": 20,
    "total_pages": 1,
    "has_more": false
  },
  "details": {
    "message": "获取用户通知列表成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.2 获取通知详情

**接口**：`GET /api/wxapp/notification/detail`  
**描述**：获取通知详情  
**参数**：
- `notification_id` - 查询参数，通知ID（必填，整数类型）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "sender": {"openid": "发送者openid"},
    "receiver": "接收者用户openid",
    "title": "收到新评论",
    "content": "用户评论了你的帖子「帖子标题」",
    "type": "comment",
    "is_read": false,
    "target_id": "123",
    "target_type": "comment",
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "status": 1
  },
  "details": {
    "message": "获取通知详情成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.3 获取未读通知数量

**接口**：`GET /api/wxapp/notification/count`  
**描述**：获取用户未读通知数量  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `type` - 查询参数，通知类型：如comment-评论, like-点赞, follow-关注等（可选）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "count": 5
  },
  "details": {
    "message": "获取未读通知数量成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.4 标记通知已读

**接口**：`POST /api/wxapp/notification/mark-read`  
**描述**：标记单个通知为已读  
**请求体**：

```json
{
  "notification_id": "123",
  "openid": "用户openid"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "标记已读成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.5 批量标记通知已读

**接口**：`POST /api/wxapp/notification/mark-read-batch`  
**描述**：批量标记通知为已读  
**说明**：只能标记属于自己（openid）的通知为已读，否则会返回403权限错误  
**请求体**：

```json
{
  "openid": "用户openid",
  "notification_ids": [1, 2, 3]
}
```

**请求参数说明**：
- `openid` - 字符串，必填，用户的openid（可以使用receiver代替）
- `notification_ids` - 整数数组，必填，要标记为已读的通知ID列表

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "成功标记 3 条通知为已读"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

**错误响应**：

```json
{
  "code": 403,
  "message": "Permission denied",
  "data": null,
  "details": {
    "message": "无权限操作此通知"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.6 删除通知

**接口**：`POST /api/wxapp/notification/delete`  
**描述**：删除通知  
**请求体**：

```json
{
  "notification_id": "123",
  "openid": "用户openid"
}
```

**请求参数说明**：
- `notification_id` - 字符串，必填，通知ID
- `openid` - 字符串，必填，用户的openid（可以使用receiver代替）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "删除通知成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.7 通知触发机制

系统会在以下情况自动触发通知：

1. **评论通知**：
   - 当用户A评论用户B的帖子时，用户B会收到评论通知
   - 当用户A回复用户B的评论时，用户B会收到回复通知

2. **点赞通知**：
   - 当用户A点赞用户B的帖子时，用户B会收到点赞通知
   - 当用户A点赞用户B的评论时，用户B会收到点赞通知

3. **关注通知**：
   - 当用户A关注用户B时，用户B会收到关注通知

4. **收藏通知**：
   - 当用户A收藏用户B的帖子时，用户B会收到收藏通知

### 4.8 通知数据结构

通知记录包含以下字段：

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 通知ID |
| openid | string | 接收通知的用户ID |
| title | string | 通知标题 |
| content | string | 通知内容 |
| type | string | 通知类型(comment/like/follow/favorite) |
| is_read | boolean | 是否已读 |
| sender | object | 发送者信息，包含openid |
| target_id | string | 目标ID (帖子ID、评论ID等) |
| target_type | string | 目标类型 (post/comment/user等) |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |
| status | int | 状态：1-正常, 0-禁用 |

## 五、反馈接口

反馈系统用于收集用户反馈、建议和问题报告。

### 5.1 提交反馈

**接口**：`POST /api/wxapp/feedback`  
**描述**：提交意见反馈  
**请求体**：

```json
{
  "openid": "用户openid",
  "content": "反馈内容",
  "type": "suggestion",
  "contact": "联系方式",
  "device_info": {
    "system": "iOS 14.7.1",
    "model": "iPhone 12",
    "platform": "ios",
    "brand": "Apple"
  }
}
```

**请求参数说明**：
- `openid` - 字符串，必填，用户的openid
- `content` - 字符串，必填，反馈内容
- `type` - 字符串，可选，反馈类型：suggestion-建议，bug-问题报告，question-咨询，other-其他
- `contact` - 字符串，可选，联系方式
- `device_info` - 对象，可选，设备信息

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "用户openid",
    "content": "反馈内容",
    "type": "suggestion",
    "contact": "联系方式",
    "device_info": {
      "system": "iOS 14.7.1",
      "model": "iPhone 12",
      "platform": "ios",
      "brand": "Apple"
    },
    "status": 1,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00"
  },
  "details": {
    "message": "提交反馈成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 5.2 获取反馈列表

**接口**：`GET /api/wxapp/feedback/list`  
**描述**：获取用户的反馈列表  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `page_size` - 查询参数，每页记录数量，默认10
- `page` - 查询参数，页码，从1开始，默认1

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "openid": "用户openid",
      "content": "反馈内容",
      "type": "suggestion",
      "contact": "联系方式",
      "device_info": {
        "system": "iOS 14.7.1",
        "model": "iPhone 12",
        "platform": "ios",
        "brand": "Apple"
      },
      "status": 1,
      "admin_reply": null,
      "create_time": "2023-01-01 12:00:00",
      "update_time": "2023-01-01 12:00:00"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "page_size": 10,
    "total_pages": 1,
    "has_more": false
  },
  "details": {
    "message": "获取反馈列表成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

## 六、知识库接口

南开Wiki知识库接口提供多种检索方式，满足不同场景的搜索需求：

- **综合搜索** (`/search`)：基础的多平台内容搜索
- **搜索建议** (`/suggestion`)：智能搜索补全功能
- **Elasticsearch检索** (`/es-search`)：支持通配符的快速检索，响应速度最快
- **高级检索** (`/advanced-search`)：使用RAG管道的智能检索，支持向量+BM25混合检索
- **小程序搜索** (`/search-wxapp`)：专为小程序优化的帖子和用户搜索

### 6.1 综合搜索

**接口**：`GET /api/knowledge/search`  
**描述**：根据关键词搜索多平台内容，支持相关度排序和分页  
**参数**：
- `query` - 查询参数，搜索关键词（必填）
- `openid` - 查询参数，用户openid（必填）
- `platform` - 查询参数，平台标识，可选值：wechat/website/market/wxapp
- `tag` - 查询参数，标签，多个用逗号分隔
- `max_results` - 查询参数，单表最大结果数，默认10
- `page` - 查询参数，分页页码，默认1
- `page_size` - 查询参数，每页结果数，默认10
- `sort_by` - 查询参数，排序方式：relevance-相关度，time-时间，默认relevance

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "create_time": "2025-04-07T16:13:49",
      "update_time": "2025-04-07T16:13:49",
      "author": "作者",
      "platform": "平台标识",
      "original_url": "原文链接",
      "tag": "标签",
      "title": "标题",
      "content": "内容",
      "relevance": 0.85
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 描述 |
|------|------|------|
| create_time | string | 创建时间 |
| update_time | string | 更新时间 |
| author | string | 作者 |
| platform | string | 平台标识 |
| original_url | string | 原文链接 |
| tag | string | 标签 |
| title | string | 标题 |
| content | string | 内容 |
| relevance | float | 相关度分数，范围0-1，越高表示越相关 |
| is_official | boolean | 是否为官方内容 |

**分页信息**：

| 字段 | 类型 | 描述 |
|------|------|------|
| total | integer | 总记录数 |
| page | integer | 当前页码 |
| page_size | integer | 每页记录数 |
| total_pages | integer | 总页数 |

**排序方式**：
- `relevance`：按相关度排序，考虑标题和内容的匹配程度
- `time`：按更新时间排序，最新的在前

**示例**：
1. 搜索南开相关的内容：
```
GET /api/agent/search?query=南开&openid=test&platform=wechat
```

2. 按时间排序搜索：
```
GET /api/agent/search?query=南开&openid=test&sort_by=time
```

3. 分页搜索：
```
GET /api/agent/search?query=南开&openid=test&page=2&page_size=20
```

### 6.2 搜索建议

**接口**：`GET /api/knowledge/suggestion`  
**描述**：获取搜索建议  
**参数**：
- `query` - 查询参数，搜索前缀（必填）
- `openid` - 查询参数，用户openid（必填）
- `page_size` - 查询参数，返回结果数量，默认5

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    "南开大学",
    "南开大学校训",
    "南开大学图书馆",
    "南开大学简介",
    "南开大学专业"
  ],
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 6.3 Elasticsearch检索

**接口**：`GET /api/knowledge/es-search`  
**描述**：仅使用Elasticsearch进行检索，支持通配符查询和数据源筛选，适用于快速搜索场景  
**参数**：
- `query` - 查询参数，搜索关键词，支持通配符 * 和 ?（必填）
- `openid` - 查询参数，用户openid（必填）
- `platform` - 查询参数，平台筛选，支持指定特定表查询，多个用逗号分隔（可选）
- `page` - 查询参数，分页页码，默认1
- `page_size` - 查询参数，每页结果数，默认10
- `max_content_length` - 查询参数，内容最大长度，默认300，超过将被截断

**特色功能**：
- **通配符支持**：支持 `*`（任意字符）和 `?`（单个字符）通配符
- **前缀匹配**：如 `南开*` 匹配所有以"南开"开头的内容
- **后缀匹配**：如 `*大学` 匹配所有以"大学"结尾的内容
- **数据源筛选**：支持指定特定表查询，提高检索精度
- **快速检索**：不依赖向量数据库，响应速度更快
- **智能权重**：标题匹配权重高于内容匹配

**支持的数据源**：
- `website_nku`：南开大学官方网站内容
- `wechat_nku`：微信公众号文章
- `market_nku`：校园集市信息
- `wxapp_post`：小程序用户帖子
- `wxapp_comment`：小程序评论

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "title": "南开大学简介",
      "content": "南开大学是教育部直属重点综合性大学...",
      "original_url": "https://www.nankai.edu.cn/about",
      "publish_time": "2024-01-15T10:30:00",
      "pagerank_score": 0.8567,
      "platform": "website_nku",
      "relevance": 12.34,
      "is_truncated": false,
      "is_official": true
    }
  ],
  "pagination": {
    "total": 1523,
    "page": 1,
    "page_size": 10,
    "total_pages": 153
  },
  "details": {
    "message": "ES检索成功",
    "query": "南开*",
    "response_time": 0.125
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 描述 |
|------|------|------|
| title | string | 文档标题 |
| content | string | 文档内容（可能被截断） |
| original_url | string | 原文链接 |
| publish_time | string | 发布时间 |
| pagerank_score | float | PageRank权威性分数，0-1之间 |
| platform | string | 平台标识 |
| relevance | float | Elasticsearch相关性分数 |
| is_truncated | boolean | 内容是否被截断 |
| is_official | boolean | 是否为官方内容 |

**通配符查询示例**：

1. 前缀匹配：
```
GET /api/knowledge/es-search?query=南开*&openid=user123
```

2. 后缀匹配：
```
GET /api/knowledge/es-search?query=*大学&openid=user123
```

3. 中间匹配：
```
GET /api/knowledge/es-search?query=南开*大学&openid=user123
```

4. 普通查询：
```
GET /api/knowledge/es-search?query=计算机学院&openid=user123
```

5. 指定数据源查询：
```
GET /api/knowledge/es-search?query=南开大学&platform=website_nku&openid=user123
```

6. 多数据源查询：
```
GET /api/knowledge/es-search?query=南开&platform=website_nku,wechat_nku&openid=user123
```

7. 仅查询小程序帖子：
```
GET /api/knowledge/es-search?query=*学习*&platform=wxapp_post&openid=user123
```

**错误响应**：

1. ES服务不可用：
```json
{
  "code": 503,
  "message": "ES检索失败: 无法连接到Elasticsearch (localhost:9200)",
  "data": null
}
```

2. 索引不存在：
```json
{
  "code": 404,
  "message": "ES检索失败: 索引 'nkuwiki' 不存在",
  "data": null
}
```

### 6.4 高级检索（RAG）

**接口**：`GET /api/knowledge/advanced-search`  
**描述**：使用ES-search召回文档，然后通过LLM生成回答的高级检索接口  
**参数**：
- `query` - 查询参数，搜索关键词（必填）
- `openid` - 查询参数，用户openid，用于个性化推荐（必填）
- `platform` - 查询参数，平台筛选，支持指定特定表查询，多个用逗号分隔（可选）
- `top_k` - 查询参数，召回文档数量，默认10（可选）

**特色功能**：
- **智能召回**：使用Elasticsearch进行高效文档召回
- **数据源筛选**：支持指定特定数据源进行精准检索
- **LLM生成**：基于召回文档生成智能回答
- **上下文返回**：同时返回原始文档供用户参考

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "answer": "根据检索到的5个相关文档，关于'南开大学'的信息如下：\n\n• 南开大学简介\n• 南开大学历史沿革\n• 南开大学学科建设",
    "contexts": [
      {
        "content": "南开大学是教育部直属重点综合性大学...",
        "relevance": 12.34,
        "metadata": {
          "title": "南开大学简介",
          "original_url": "https://www.nankai.edu.cn/about",
          "platform": "website_nku",
          "publish_time": "2024-01-15T10:30:00",
          "pagerank_score": 0.8567,
          "is_official": true
        }
      }
    ]
  },
  "details": {
    "message": "高级检索成功",
    "retrieval_method": "elasticsearch",
    "documents_retrieved": 5,
    "response_time": 0.156,
    "platform_filter": "all"
  }
}
```

**查询示例**：

1. 基础查询：
```
GET /api/knowledge/advanced-search?query=南开大学&openid=user123
```

2. 指定数据源查询：
```
GET /api/knowledge/advanced-search?query=计算机学院&platform=website_nku&openid=user123
```

3. 多数据源查询：
```
GET /api/knowledge/advanced-search?query=南开&platform=website_nku,wechat_nku&openid=user123&top_k=15
```

### 6.5 小程序搜索

**接口**：`GET /api/knowledge/search-wxapp`  
**描述**：专为小程序优化的搜索接口，支持帖子和用户的综合搜索  
**参数**：
- `query` - 查询参数，搜索关键词（必填）
- `search_type` - 查询参数，搜索类型：all(全部)、post(帖子)、user(用户)，默认all
- `page` - 查询参数，页码，默认1
- `page_size` - 查询参数，每页记录数量，默认10
- `sort_by` - 查询参数，排序方式：time(时间)、relevance(相关度)，默认time

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      // 帖子类型结果
      "id": 1,
      "title": "帖子标题",
      "content": "帖子内容",
      "type": "post",
      "like_count": 10,
      "comment_count": 5,
      "view_count": 100,
      "update_time": "2023-01-01 12:00:00",
      "openid": "发布者openid",
      "relevance": 0.85,
      "user": {
        "openid": "作者openid",
        "nickname": "作者昵称",
        "avatar": "作者头像URL",
        "bio": "作者简介"
      }
    },
    {
      // 用户类型结果
      "id": 2,
      "openid": "用户openid",
      "nickname": "用户昵称",
      "avatar": "用户头像URL",
      "bio": "用户简介",
      "type": "user",
      "relevance": 0.75
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10,
    "has_more": true
  },
  "details": {
    "query": "搜索关键词",
    "search_type": "all",
    "sort_by": "time"
  }
}
```

**响应字段说明**：

1. 帖子类型结果字段：
- `id` - 帖子ID
- `title` - 帖子标题
- `content` - 帖子内容
- `type` - 结果类型，固定为"post"
- `like_count` - 点赞数
- `comment_count` - 评论数
- `view_count` - 浏览数
- `update_time` - 更新时间
- `openid` - 发布者openid
- `relevance` - 相关度分数（当sort_by=relevance时）
- `user` - 作者信息对象

2. 用户类型结果字段：
- `id` - 用户ID
- `openid` - 用户openid
- `nickname` - 用户昵称
- `avatar` - 用户头像URL
- `bio` - 用户简介
- `type` - 结果类型，固定为"user"
- `relevance` - 相关度分数（当sort_by=relevance时）

**排序说明**：
- `time`：按更新时间降序排序
- `relevance`：按相关度分数降序排序，相关度基于以下因素计算：
  - 标题/昵称匹配度
  - 内容/简介匹配度
  - 更新时间权重（仅对帖子有效）

**示例**：

1. 搜索所有内容：
```
GET /api/knowledge/search-wxapp?query=南开大学&search_type=all
```

2. 仅搜索帖子：
```
GET /api/knowledge/search-wxapp?query=南开大学&search_type=post
```

3. 仅搜索用户：
```
GET /api/knowledge/search-wxapp?query=南开大学&search_type=user
```

4. 按相关度排序：
```
GET /api/knowledge/search-wxapp?query=南开大学&sort_by=relevance
```

### 6.4 搜索历史

**接口**：`GET /api/knowledge/history`  
**描述**：获取用户搜索历史  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `page_size` - 查询参数，返回结果数量，默认10

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "openid": "用户openid",
      "query": "南开大学",
      "create_time": "2023-01-01 12:00:00"
    },
    {
      "id": 2,
      "openid": "用户openid",
      "query": "张伯苓",
      "create_time": "2023-01-02 13:00:00"
    }
  ],
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 6.5 清除搜索历史

**接口**：`POST /api/knowledge/history/clear`  
**描述**：清除用户搜索历史  
**请求体**：

```json
{
  "openid": "用户openid"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "count": 5
  },
  "details": {
    "message": "已清除5条搜索记录"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 6.6 热门搜索

**接口**：`GET /api/knowledge/hot`  
**描述**：获取热门搜索关键词  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `page_size` - 查询参数，返回结果数量，默认10

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "query": "南开大学",
      "count": 1235
    },
    {
      "query": "校园卡",
      "count": 987
    },
    {
      "query": "选课",
      "count": 875
    }
  ],
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

## 七、智能体接口

### 7.1 与Agent对话

**接口**：`POST /api/agent/chat`  
**描述**：与AI智能体进行对话，支持普通对话和流式返回  
**请求体**：

```json
{
  "openid": "用户openid"
}
```

**响应**：

```json
{
  "query": "南开大学的校训是什么？",
  "messages": [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！我是南开Wiki智能助手，有什么可以帮助你的吗？"}
  ],
  "stream": false,
  "format": "markdown",
  "openid": "user_openid"
}
```

**参数说明**：
- `query` - 必填，用户当前的问题
- `messages` - 可选，对话历史消息列表，按时间顺序排列
- `stream` - 可选，是否使用流式返回，默认为 false
- `format` - 可选，返回格式，支持 "text"、"markdown" 或 "html"，默认为 "markdown"
- `openid` - 可选，用户标识符

**普通响应**（`stream=false`）：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "response": "南开大学的校训是"允公允能，日新月异"。这八个字出自《论语》，体现了南开大学追求公能日新的办学理念。",
    "sources": [
      {
        "type": "小程序帖子",
        "title": "南开大学简介",
        "content": "南开大学校训为"允公允能，日新月异"，出自《论语》...",
        "author": "南开百科"
      }
    ],
    "suggested_questions": [
      "南开大学的校徽有什么含义？",
      "南开大学是什么时候创立的？",
      "南开大学的创始人是谁？"
    ],
    "format": "markdown"
  },
  "details": null,
  "timestamp": "2025-03-27 16:47:42"
}
```

**流式响应**（`stream=true`）：

当 `stream` 参数设置为 `true` 时，服务器将返回 `text/event-stream` 格式的数据流，客户端需要按照 Server-Sent Events (SSE) 的标准解析响应。每个事件以 `data: ` 开头，最后以 `data: [DONE]` 标记结束。

```
data: 南开
data: 大学
data: 的
data: 校训
data: 是
data: "
data: 允公
data: 允能
data: ，
data: 日新月异
data: "
data: 。
data: 这
data: 八个
data: 字
data: 出自
data: 《
data: 论语
data: 》
data: ，
data: 体现
data: 了
data: 南开大学
data: 追求
data: 公能
data: 日新
data: 的
data: 办学
data: 理念
data: 。
data: [DONE]
```

客户端可以累积这些片段以重建完整响应，或实时显示打字效果。

**注意**：
1. 流式响应会考虑历史消息的上下文，但为了性能考虑，会以更高效的方式处理历史记录
2. 流式响应不会返回知识源和推荐问题，这些信息只在非流式响应中提供
3. 流式响应有 90 秒的超时设置，超时后会自动结束流
4. 在出现错误时，流式响应会返回相应错误信息并结束流


### 7.2 检索增强生成

**接口**：`POST /api/agent/rag`  
**描述**：基于南开Wiki平台的数据进行信息检索并生成回答  
**请求体**：

```json
{
  "openid": "用户openid", 
  "query": "南开大学的校训是什么",
  "platform": "wechat，website,market,wxapp",
  "max_results": 3,
  "stream": false,
  "format": "markdown"
}
```

**请求参数说明**：
- `openid` - 字符串，必填，用户的openid
- `query` - 字符串，必填，用户的问题
- `platform` - 平台标识，可选值：wechat/website/market/wxapp，多个用逗号分隔
- `tag`: 标签，可选多个用逗号分隔，默认nku，其他标签没啥意义，数据库里也没有（
- `max_results` - 整数，可选，每个数据源返回的最大结果数，默认为3
- `stream` - 布尔值，可选，是否使用流式返回，默认为false。流式暂不支持。
- `format` - 字符串，可选，返回格式：markdown或text，默认为markdown

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "original_query": "南开大学的校训是什么",
    "rewritten_query": "校训",
    "response": "南开大学的校训是"允公允能，日新月异"。\n\n这八个字出自...",
    "sources": [
      {
        "type": "南开网站文章", 
        "title": "南开大学校训的由来",
        "content": "南开大学校训"允公允能，日新月异"出自...",
        "author": "南开新闻网"
      }
    ],
    "suggested_questions": [
      "南开大学校训的含义是什么？",
      "南开大学的校歌是什么？",
      "南开大学的校徽有什么特点？"
    ],
    "format": "markdown",
    "retrieved_count": 5,
    "response_time": 1.23
  },
  "details": {
    "message": "查询成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

**流式响应格式**：

**还在测试中，暂无。**
当 `stream=true` 时，返回SSE格式数据流，每个事件包含以下数据类型之一：

1. 查询信息:
```json
{
  "type": "query",
  "original": "原始查询",
  "rewritten": "改写后的查询"
}
```

2. 内容块:
```json
{
  "type": "content",
  "chunk": "回答的一部分内容"
}
```

3. 来源信息:
```json
{
  "type": "sources",
  "sources": [来源对象数组]
}
```

4. 推荐问题:
```json
{
  "type": "suggested",
  "questions": ["问题1", "问题2", "问题3"]
}
```

5. 完成标记:
```json
{
  "type": "done"
}
```

## 三、Agent智能体API

### 3.1 RAG检索增强生成

**接口**：`POST /api/agent/rag`  
**描述**：提供完整的检索增强生成（RAG）功能。该接口首先对用户查询进行智能改写，然后调用Elasticsearch进行高效的相关文档检索（不进行重排），最后将检索结果作为上下文，交由Coze AI生成流畅、准确的自然语言回答。  
**核心流程**：
1.  **查询改写**：使用AI模型优化用户原始查询，提升检索意图的准确性。
2.  **Elasticsearch检索**：仅使用Elasticsearch进行文档检索，支持通配符查询，并按相关度分数排序。
3.  **Coze答案生成**：将检索到的文档作为上下文，调用Coze模型生成最终答案和相关建议问题。

**请求体**：

```json
{
  "query": "南开大学的校训是什么？",   // 必填，用户原始查询
  "openid": "用户的openid",         // 必填，用于个性化和记录
  "platform": "website,wechat",    // 可选，指定检索的平台，多个用逗号分隔，不传则检索所有平台
  "max_results": 5,                // 可选，检索文档的总数上限，默认5
  "stream": false                    // 可选，是否使用流式响应，默认false
}
```

**响应** (`stream: false`):
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "original_query": "南开大学的校训是什么？",
    "rewritten_query": "南开大学的官方校训是什么",
    "response": "南开大学的校训是"允公允能，日新月异"。",
    "sources": [
      {
        "title": "校训",
        "content": "允公允能，日新月异",
        "author": "未知",
        "platform": "website",
        "original_url": "http://nankai.edu.cn/111/list.htm",
        "relevance": 15.8
      }
    ],
    "suggested_questions": [
      "南开大学的建校历史是怎样的？",
      "介绍一下南开大学的知名校友"
    ],
    "retrieved_count": 1,
    "response_time": 3.45
  }
}
```

**流式响应** (`stream: true`):
如果设置 `stream: true`，接口将以 `text/event-stream` 的形式返回一系列事件：
- **query**: 包含原始查询和改写后查询
- **content**: 包含生成答案的文本块
- **sources**: 包含引用的来源文档列表
- **suggestions**: 包含建议的相关问题
- **end**: 标志着响应结束
- **error**: 如果发生错误，会发送此事件

---

## 四、知识库API

### 4.1 高级混合检索

**接口**: `GET /api/knowledge/advanced-search`  
**描述**: 调用后端RAG管道执行高级检索。此接口集成了多种检索与重排序策略，专注于提供高质量的文档检索结果，**不生成AI回答**。它允许调用者灵活组合不同的策略，以应对多样的查询需求。

**核心特性**:
- **多策略检索**: 支持混合检索（向量+BM25）、纯向量、纯BM25、Elasticsearch等多种检索方式。
- **智能重排**: 支持BGE-Reranker、个性化排序等多种重排序算法，显著提升结果相关性。
- **灵活配置**: 可通过参数动态选择检索和重排策略，满足不同场景下的性能和质量要求。

**请求参数** (Query Parameters):

| 参数 | 类型 | 必须 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `query` | `string` | 是 | - | 搜索关键词。 |
| `openid` | `string` | 是 | - | 用户openid，用于个性化推荐。 |
| `top_k_retrieve` | `integer` | 否 | `20` | 召回（Retrieve）阶段返回的文档数量，建议值10-50。 |
| `top_k_rerank` | `integer` | 否 | `10` | 重排（Rerank）阶段返回的文档数量，建议值5-20。 |
| `retrieval_strategy` | `string` | 否 | `auto` | 检索策略。可选值: `auto`, `hybrid`, `vector_only`, `bm25_only`, `es_only`。 |
| `rerank_strategy` | `string` | 否 | `bge_reranker` | 重排策略。可选值: `bge_reranker`, `st_reranker`, `personalized`, `no_rerank`。 |

**响应**:
返回一个经过检索和重排序的文档对象列表。
```json
{
  "code": 200,
  "message": "高级检索成功",
  "data": [
    {
      "title": "文档标题",
      "content": "文档内容摘要...",
      "original_url": "http://example.com/doc1",
      "author": "作者",
      "platform": "website",
      "tag": "标签",
      "relevance": 18.5,
      "create_time": "2023-10-01T10:00:00",
      "update_time": "2023-10-01T10:00:00",
      "is_truncated": true,
      "is_official": true,
      "view_count": 120,
      "like_count": 15,
      "comment_count": 3,
      "pagerank_score": 0.85
    }
  ],
  "details": {
    "retrieval_strategy": "hybrid",
    "rerank_strategy": "bge_reranker",
    "documents_retrieved": 20,
    "documents_reranked": 10
  }
}
```