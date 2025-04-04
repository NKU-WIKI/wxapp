# nkuwiki API文档

本文档包含nkuwiki平台的所有API接口，主要分为两类：
1. 微信小程序API：提供给微信小程序客户端使用的API
2. Agent智能体API：提供AI聊天和知识检索功能

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
    "token_count": 100,
    "like_count": 10,
    "favorite_count": 5,
    "post_count": 8,
    "follower_count": 20,
    "follow_count": 15,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": {"school": "南开大学"}
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
    "token_count": 0,
    "like_count": 0,
    "favorite_count": 0,
    "post_count": 0,
    "follower_count": 0,
    "follow_count": 0,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": null
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
    "token_count": 0,
    "like_count": 0,
    "favorite_count": 0,
    "post_count": 0,
    "follower_count": 0,
    "follow_count": 0,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": {}
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 1.3 查询用户列表

**接口**：`GET /api/wxapp/user/list`  
**描述**：获取用户列表  
**参数**：
- `limit` - 查询参数，返回记录数量限制，默认10，最大100
- `offset` - 查询参数，分页偏移量，默认0

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "data": [
      {
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
        "token_count": 0,
        "like_count": 0,
        "favorite_count": 0,
        "post_count": 0,
        "follower_count": 0,
        "follow_count": 0,
        "create_time": "2023-01-01 12:00:00",
        "update_time": "2023-01-01 12:00:00",
        "last_login": "2023-01-01 12:00:00",
        "platform": "wxapp",
        "status": 1,
        "is_deleted": 0,
        "extra": {}
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 10,
      "offset": 0
    }
  },
  "details": {
    "message": "获取用户列表成功"
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
    "token_count": 100,
    "like_count": 10,
    "favorite_count": 5,
    "post_count": 8,
    "follower_count": 20,
    "follow_count": 15,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-02 14:30:00",
    "last_login": "2023-01-01 12:00:00",
    "platform": "wxapp",
    "status": 1,
    "is_deleted": 0,
    "extra": {
      "school": "南开大学",
      "major": "计算机科学与技术"
    }
  },
  "details": {
    "message": "用户信息更新成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```
### 1.5 获取用户收藏列表

**接口**：`GET /api/wxapp/user/favorite`  
**描述**：获取用户收藏的帖子列表  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `offset` - 查询参数，分页偏移量，默认0
- `limit` - 查询参数，每页数量，默认10

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
      "openid": "发帖人openid",
      "nickname": "发帖人昵称",
      "avatar": "发帖人头像",
      "create_time": "2024-01-01 12:00:00"
    }
  ],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 10
  }
}
```

### 1.6 获取用户点赞列表

**接口**：`GET /api/wxapp/user/like`  
**描述**：获取用户点赞的帖子列表  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `offset` - 查询参数，分页偏移量，默认0
- `limit` - 查询参数，每页数量，默认10

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
      "openid": "发帖人openid",
      "nickname": "发帖人昵称",
      "avatar": "发帖人头像",
      "create_time": "2024-01-01 12:00:00"
    }
  ],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 10
  }
}
```

### 1.7 获取用户评论列表

**接口**：`GET /api/wxapp/user/comment`  
**描述**：获取用户的评论列表  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `offset` - 查询参数，分页偏移量，默认0
- `limit` - 查询参数，每页数量，默认10

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "content": "评论内容",
      "openid": "评论人openid",
      "nickname": "评论人昵称",
      "avatar": "评论人头像",
      "create_time": "2024-01-01 12:00:00",
      "post": {
        "id": 1,
        "title": "帖子标题",
        "content": "帖子内容"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 10
  }
}
```

### 1.8 获取用户粉丝列表

**接口**：`GET /api/wxapp/user/follower`  
**描述**：获取用户的粉丝列表  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `offset` - 查询参数，分页偏移量，默认0
- `limit` - 查询参数，每页数量，默认10

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "openid": "粉丝openid",
      "nickname": "粉丝昵称",
      "avatar": "粉丝头像",
      "bio": "个人简介"
    }
  ],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 10
  }
}
```

### 1.9 获取用户关注列表

**接口**：`GET /api/wxapp/user/following`  
**描述**：获取用户关注的用户列表  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `offset` - 查询参数，分页偏移量，默认0
- `limit` - 查询参数，每页数量，默认10

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "openid": "被关注者openid",
      "nickname": "被关注者昵称", 
      "avatar": "被关注者头像",
      "bio": "个人简介"
    }
  ],
  "pagination": {
    "total": 100,
    "offset": 0,
    "limit": 10
  }
}
```

### 1.10 关注用户

**接口**：`POST /api/wxapp/user/follow`  
**描述**：关注/取消关注用户，根据当前状态自动判断是关注还是取消关注  
**请求体**：

```json
{
  "followed_id": "被关注用户的openid", // 必填
  "openid": "关注用户的openid" // 必填
}
```

**响应**：

1. 关注成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "followed",
    "is_following": true
  },
  "details": {
    "message": "关注成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

2. 取消关注成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "unfollowed",
    "is_following": false
  },
  "details": {
    "message": "取消关注成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

**错误响应**：

```json
{
  "code": 400,
  "message": "error",
  "data": null,
  "details": {
    "message": "不能关注自己"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```
### 1.11 获取用户状态

**接口**：`GET /api/wxapp/user/status`  
**描述**：获取用户的交互状态，包括关注状态和统计数据  
**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| openid | string | 是 | 当前用户openid |
| target_id | string | 是 | 目标用户openid |

**响应**：

1. 成功响应：
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
    "like_count": 30
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

**响应字段说明**：

| 字段 | 类型 | 描述 |
|------|------|------|
| is_following | boolean | 当前用户是否关注目标用户 |
| is_self | boolean | 是否是当前用户自己 |
| post_count | integer | 目标用户的帖子总数 |
| follower_count | integer | 目标用户的粉丝总数 |
| following_count | integer | 目标用户的关注总数 |
| like_count | integer | 目标用户获得的点赞总数 |

2. 错误响应：
```json
{
  "code": 404,
  "message": "error",
  "data": null,
  "details": {
    "message": "用户不存在"
  },
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
  "images": ["图片URL1", "图片URL2"], // 可选
  "tags": ["标签1", "标签2"], // 可选
  "category_id": 1, // 可选，默认为0
  "location": { // 可选
    "latitude": 39.12345,
    "longitude": 116.12345,
    "name": "位置名称",
    "address": "详细地址"
  },
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
    "nickname": "用户昵称",
    "avatar": "用户头像URL",
    "bio": "用户个人简介",
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
**描述**：获取帖子列表  
**参数**：
- `page` - 查询参数，页码，默认1
- `limit` - 查询参数，每页数量，默认10，最大100
- `category_id` - 查询参数，按分类ID筛选，可选
- `tag` - 查询参数，按标签筛选，可选
- `status` - 查询参数，帖子状态筛选，1-正常，0-禁用，默认1
- `order_by` - 查询参数，排序方式，默认"update_time DESC"

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,              // 帖子ID，主键
      "openid": "发布用户openid",
      "nickname": "用户昵称",
      "avatar": "用户头像URL",
      "bio": "用户个人简介",
      "category_id": 1,
      "title": "帖子标题",
      "content": "帖子内容",
      "image": ["图片URL1", "图片URL2"],
      "tag": ["标签1", "标签2"],
      "view_count": 10,
      "like_count": 5,
      "comment_count": 3,
      "collect_count": 0,
      "status": 1,          // 帖子状态：1-正常，0-禁用
      "is_deleted": 0,      // 是否删除：0-未删除，1-已删除
      "create_time": "2023-01-01T12:00:00",
      "update_time": "2023-01-01T12:00:00"
    }
  ],
  "details": {
    "message": "查询帖子列表成功"
  },
  "timestamp": "2023-01-01T12:00:00",
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10
  }
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
  "tag": ["标签1","标签2"] // 可选，标签数组
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

**接口**：`POST /api/wxapp/post/delete`  
**描述**：删除帖子（标记删除）  
**请求体**：

```json
{
  "post_id": 1, // 必填，整数类型
  "openid": "用户openid" // 必填，用于验证操作权限
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "删除帖子成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 2.6 点赞帖子

**接口**：`POST /api/wxapp/post/like`  
**描述**：点赞/取消点赞帖子，根据当前状态自动判断是点赞还是取消点赞  
**请求体**：

```json
{
  "post_id": 1, // 必填，整数类型
  "openid": "点赞用户的openid" // 必填
}
```

**响应**：

1. 点赞成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "liked",
    "like_count": 6,
    "is_liked": true
  },
  "details": {
    "message": "点赞成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

2. 取消点赞成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "unliked",
    "like_count": 5,
    "is_liked": false
  },
  "details": {
    "message": "取消点赞成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 2.7 收藏帖子

**接口**：`POST /api/wxapp/post/favorite`  
**描述**：收藏/取消收藏帖子，根据当前状态自动判断是收藏还是取消收藏  
**请求体**：

```json
{
  "post_id": 1, // 必填，整数类型
  "openid": "收藏用户的openid" // 必填
}
```

**响应**：

1. 收藏成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "favorited",
    "favorite_count": 6,
    "is_favorited": true
  },
  "details": {
    "message": "收藏成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

2. 取消收藏成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "unfavorited",
    "favorite_count": 5,
    "is_favorited": false
  },
  "details": {
    "message": "取消收藏成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 2.8 获取帖子状态

**接口**：`GET /api/wxapp/post/status`  
**描述**：获取帖子的交互状态，包括点赞、收藏、评论数等信息，支持批量查询  
**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| post_id | string | 是 | 帖子ID，多个ID用逗号分隔，如"1,2,3" |
| openid | string | 是 | 用户openid |

**响应**：

1. 成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "1": {
      "exist": true,
      "is_liked": true,
      "is_favorited": false,
      "is_author": false,
      "like_count": 10,
      "favorite_count": 5,
      "comment_count": 3,
      "view_count": 100
    },
    "2": {
      "exist": false,
      "is_liked": false,
      "is_favorited": false,
      "is_author": false,
      "like_count": 0,
      "favorite_count": 0,
      "comment_count": 0,
      "view_count": 0
    }
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

**响应字段说明**：

| 字段 | 类型 | 描述 |
|------|------|------|
| [post_id] | object | 以帖子ID为key的状态对象 |
| exist | boolean | 帖子是否存在 |
| is_liked | boolean | 当前用户是否点赞 |
| is_favorited | boolean | 当前用户是否收藏 |
| is_author | boolean | 当前用户是否是作者 |
| like_count | integer | 帖子点赞总数 |
| favorite_count | integer | 帖子收藏总数 |
| comment_count | integer | 帖子评论总数 |
| view_count | integer | 帖子浏览总数 |

2. 错误响应：
```json
{
  "code": 404,
  "message": "error",
  "data": null,
  "details": {
    "message": "帖子不存在"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

## 三、评论接口

### 3.1 创建评论

**接口**：`POST /api/wxapp/comment`  
**描述**：创建新评论  
**请求体**：

```json
{
  "openid": "评论用户openid", // 必填
  "post_id": 1, // 必填，整数类型
  "content": "评论内容", // 必填
  "parent_id": null, // 可选，父评论ID，整数类型
  "nickname": "用户昵称", // 可选，如不提供则从用户表获取
  "avatar": "用户头像URL", // 可选，如不提供则从用户表获取
  "image": [] // 可选，评论图片
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "comment_id": 1,
    "message": "评论创建成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 3.2 获取评论详情

**接口**：`GET /api/wxapp/comment/detail`  
**描述**：获取指定评论的详情  
**参数**：
- `comment_id` - 查询参数，评论ID（必填，整数类型）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "评论用户openid",
    "post_id": 1,
    "content": "评论内容",
    "parent_id": null,
    "nickname": "用户昵称",
    "avatar": "用户头像URL",
    "image": [],
    "like_count": 0,
    "liked_users": [],
    "reply_count": 0,
    "reply_preview": [],
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "status": 1,
    "is_deleted": 0
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 3.3 获取帖子评论列表

**接口**：`GET /api/wxapp/comment/list`  
**描述**：获取指定帖子的评论列表  
**参数**：
- `post_id` - 查询参数，帖子ID（必填，整数类型）
- `parent_id` - 查询参数，父评论ID，可选（整数类型，为null时获取一级评论）
- `limit` - 查询参数，返回记录数量限制，默认20，最大100
- `offset` - 查询参数，分页偏移量，默认0
- `openid` - 查询参数，用户openid，可选（用于查询点赞状态）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 2,
      "post_id": 3,
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
  "details": null,
  "timestamp": "2025-03-31T23:02:27.686667",
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
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
**描述**：点赞/取消点赞评论，根据当前状态自动判断是点赞还是取消点赞  
**请求体**：

```json
{
  "comment_id": 1, // 必填，整数类型
  "openid": "点赞用户的openid" // 必填
}
```

**响应**：

1. 点赞成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "liked",
    "like_count": 6,
    "is_liked": true
  },
  "details": {
    "message": "点赞成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

2. 取消点赞成功：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "status": "unliked",
    "like_count": 5,
    "is_liked": false
  },
  "details": {
    "message": "取消点赞成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 3.6 获取评论状态

**接口**：`GET /api/wxapp/comment/status`  
**描述**：获取评论的交互状态，包括点赞数等信息，支持批量查询  
**请求参数**：

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| comment_id | string | 是 | 评论ID，多个ID用逗号分隔，如"1,2,3" |
| openid | string | 是 | 用户openid |

**响应**：

1. 成功响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "1": {
      "exist": true,
      "is_liked": true,
      "is_author": false,
      "like_count": 10,
      "reply_count": 3
    },
    "2": {
      "exist": false,
      "is_liked": false,
      "is_author": false,
      "like_count": 0,
      "reply_count": 0
    }
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

**响应字段说明**：

| 字段 | 类型 | 描述 |
|------|------|------|
| [comment_id] | object | 以评论ID为key的状态对象 |
| exist | boolean | 评论是否存在 |
| is_liked | boolean | 当前用户是否点赞 |
| is_author | boolean | 当前用户是否是作者 |
| like_count | integer | 评论点赞总数 |
| reply_count | integer | 评论回复总数 |

2. 错误响应：
```json
{
  "code": 404,
  "message": "error",
  "data": null,
  "details": {
    "message": "评论不存在"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

## 四、通知接口

nkuwiki平台中的通知系统负责处理用户交互（点赞、评论、收藏、关注等）触发的通知。

### 4.1 获取通知列表

**接口**：`GET /api/wxapp/notification`  
**描述**：获取用户的通知列表，同时返回用户未读通知数量  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `type` - 查询参数，通知类型：如comment-评论, like-点赞, follow-关注等（可选）
- `is_read` - 查询参数，是否已读：1-已读，0-未读（可选）
- `limit` - 查询参数，返回记录数量限制，默认10
- `offset` - 查询参数，分页偏移量，默认0

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "sender": {"openid": "发送者openid"},
        "receiver": "接收者用户openid",
        "content": "用户评论了你的帖子「帖子标题」",
        "type": "comment",
        "is_read": 0,
        "target_id": "123",
        "target_type": "comment",
        "create_time": "2023-01-01 12:00:00"
      }
    ],
    "unread_count": 5
  },
  "pagination": {
    "total": 20,
    "limit": 10,
    "offset": 0,
    "has_more": true
  },
  "details": {
    "message": "获取通知列表成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

> 注意：响应中同时包含通知列表和未读通知数量，无需额外调用获取未读数量接口

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
    "content": "用户评论了你的帖子「帖子标题」",
    "type": "comment",
    "is_read": 0,
    "target_id": "123",
    "target_type": "comment",
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00",
    "is_deleted": 0
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.3 获取通知汇总信息

**接口**：`GET /api/wxapp/notification/summary`  
**描述**：获取用户各类型通知汇总信息  
**参数**：
- `openid` - 查询参数，用户openid（必填）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "unread_count": 5,
    "type_counts": {
      "system": 2,
      "comment": 10,
      "like": 8,
      "follow": 3,
      "favorite": 2
    }
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.4 标记通知已读

**接口**：`POST /api/wxapp/notification/read`  
**描述**：标记单个通知为已读  
**请求体**：

```json
{
  "notification_id": 1  // 必填，通知ID
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "已标记通知为已读"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.5 批量标记全部通知已读

**接口**：`POST /api/wxapp/notification/read-all`  
**描述**：批量标记用户所有通知为已读  
**请求体**：

```json
{
  "openid": "用户openid", // 必填
  "type": "comment"       // 可选，通知类型，不传则标记所有类型
}
```

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "已标记所有通知为已读"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.6 删除通知

**接口**：`POST /api/wxapp/notification/delete`  
**描述**：删除通知（标记删除）  
**请求体**：

```json
{
  "notification_id": 1  // 必填，通知ID
}
```

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

### 4.7 创建通知

**接口**：`POST /api/wxapp/notification`  
**描述**：创建新通知  
**请求体**：

```json
{
  "receiver": "接收者用户openid",
  "sender": "发送者信息",
  "type": "通知类型",
  "content": "通知内容",
  "target_id": "目标ID",
  "target_type": "目标类型"
}
```

**请求参数说明**：
- `receiver` - 字符串，必填，接收通知的用户openid
- `sender` - 任意类型，可选，发送者信息，默认为"system"
- `type` - 字符串，必填，通知类型：comment/like/follow/favorite等
- `content` - 字符串，必填，通知内容
- `target_id` - 字符串，可选，目标ID，如帖子ID、评论ID等
- `target_type` - 字符串，可选，目标类型，如post/comment/user等

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "notification_id": 123,
    "message": "创建通知成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 4.8 通知触发机制

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

### 4.9 通知数据结构

通知记录包含以下字段：

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 通知ID |
| receiver | string | 接收通知的用户ID |
| sender | object/string | 发送者信息，包含openid或为"system" |
| content | string | 通知内容 |
| type | string | 通知类型(comment/like/follow/favorite) |
| is_read | int | 是否已读：0-未读，1-已读 |
| target_id | string | 目标ID (帖子ID、评论ID等) |
| target_type | string | 目标类型 (post/comment/user等) |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |
| is_deleted | int | 是否删除：0-未删除，1-已删除 |

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
  "image": ["图片URL1", "图片URL2"],
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
- `image` - 数组，可选，图片URL列表
- `device_info` - 对象，可选，设备信息

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "feedback_id": 1,
    "message": "反馈创建成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 5.2 获取反馈列表

**接口**：`GET /api/wxapp/feedback/list`  
**描述**：获取用户的反馈列表  
**参数**：
- `openid` - 查询参数，用户openid（必填）
- `type` - 查询参数，反馈类型（可选）
- `status` - 查询参数，反馈状态（可选）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "feedbacks": [
      {
        "id": 1,
        "openid": "用户openid",
        "content": "反馈内容",
        "type": "suggestion",
        "contact": "联系方式",
        "image": ["图片URL1", "图片URL2"],
        "status": 1,
        "reply": null,
        "create_time": "2023-01-01 12:00:00",
        "update_time": "2023-01-01 12:00:00"
      }
    ]
  },
  "details": {
    "message": "获取反馈列表成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 5.3 获取反馈详情

**接口**：`GET /api/wxapp/feedback/detail`  
**描述**：获取反馈详情  
**参数**：
- `feedback_id` - 查询参数，反馈ID（必填）

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
    "image": ["图片URL1", "图片URL2"],
    "status": 1,
    "reply": null,
    "create_time": "2023-01-01 12:00:00",
    "update_time": "2023-01-01 12:00:00"
  },
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 5.4 更新反馈

**接口**：`POST /api/wxapp/feedback/update`  
**描述**：更新反馈内容  
**请求体**：

```json
{
  "feedback_id": 1,
  "content": "更新后的反馈内容",
  "type": "bug",
  "contact": "更新的联系方式",
  "image": ["新的图片URL1", "新的图片URL2"]
}
```

**请求参数说明**：
- `feedback_id` - 整数，必填，反馈ID
- `content` - 字符串，可选，反馈内容
- `type` - 字符串，可选，反馈类型
- `contact` - 字符串，可选，联系方式
- `image` - 数组，可选，图片URL列表

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "反馈更新成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 5.5 删除反馈

**接口**：`POST /api/wxapp/feedback/delete`  
**描述**：删除反馈  
**请求体**：

```json
{
  "feedback_id": 1
}
```

**请求参数说明**：
- `feedback_id` - 整数，必填，反馈ID

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": null,
  "details": {
    "message": "反馈删除成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

## 六、搜索接口

### 6.1 综合搜索

**接口**：`GET /api/wxapp/search`  
**描述**：根据关键词搜索帖子和用户  
**参数**：
- `keyword` - 查询参数，搜索关键词（必填）
- `search_type` - 查询参数，搜索类型，可选值：all(默认)、post、user
- `page` - 查询参数，页码，默认值：1
- `limit` - 查询参数，每页结果数量，默认值：10

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "测试帖子",
      "content": "这是测试内容",
      "type": "post",
      "like_count": 10,
      "comment_count": 5,
      "view_count": 100,
      "update_time": "2023-01-01 12:00:00"
    },
    {
      "id": 2,
      "openid": "用户openid",
      "nickname": "测试用户",
      "avatar": "头像URL",
      "bio": "用户简介",
      "type": "user"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "page_size": 10,
    "total_pages": 5
  },
  "details": {
    "keyword": "测试",
    "search_type": "all"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

> 注意：搜索操作会自动记录用户的搜索历史，无需额外调用接口。

### 6.2 获取搜索建议

**接口**：`GET /api/wxapp/suggestion`  
**描述**：根据输入的关键词获取搜索建议  
**参数**：
- `keyword` - 查询参数，搜索关键词（必填）

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    "测试帖子",
    "测试用户",
    "测试内容",
    "测试数据",
    "测试信息"
  ],
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

### 6.3 获取搜索历史

**接口**：`GET /api/wxapp/history`  
**描述**：获取指定用户的搜索历史记录  
**参数**：
- `openid` - 查询参数，用户的OpenID（必填）
- `limit` - 查询参数，返回结果数量，默认值：10

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "keyword": "测试帖子",
      "search_time": "2023-01-01 12:00:00"
    },
    {
      "keyword": "测试用户",
      "search_time": "2023-01-01 11:00:00"
    }
  ],
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

> 注意：搜索历史结果已经去重，并按最近搜索时间排序。

### 6.4 清空搜索历史

**接口**：`POST /api/wxapp/history/clear`  
**描述**：清空指定用户的所有搜索历史记录  
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
  "data": null,
  "details": {
    "message": "清空搜索历史成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 6.5 获取热门搜索

**接口**：`GET /api/wxapp/hot`  
**描述**：获取平台热门搜索关键词  
**参数**：
- `limit` - 查询参数，返回结果数量，默认值：10

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "keyword": "测试帖子",
      "count": 100
    },
    {
      "keyword": "测试用户",
      "count": 80
    },
    {
      "keyword": "测试内容",
      "count": 50
    }
  ],
  "details": null,
  "timestamp": "2023-01-01 12:00:00"
}
```

> 注意：热门搜索统计的是最近7天内的搜索次数。

## 七、智能体接口

本章描述了nkuwiki平台的智能体相关接口，包括状态查询、聊天和RAG（检索增强生成）功能。

### 7.1 获取智能体状态

**接口**：`GET /api/agent/status`  
**描述**：获取智能体服务运行状态，用于检查智能体服务是否正常运行  
**参数**：无

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "ok"
  },
  "details": {
    "message": "获取agent状态成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 7.2 智能体聊天

**接口**：`POST /api/agent/chat`  
**描述**：与智能体进行自由对话，获取回答  
**请求体**：

```json
{
  "openid": "用户openid",
  "query": "南开大学的历史简介",
  "bot_tag": "default",
  "stream": false
}
```

**请求参数说明**：
- `openid` - 字符串，必填，用户的openid
- `query` - 字符串，必填，用户的问题或指令
- `bot_tag` - 字符串，必填，机器人标识，默认为"default"
- `stream` - 布尔值，必填，是否使用流式返回，默认为false

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "南开大学创建于1919年，由爱国教育家严范孙、张伯苓创办...",
    "format": "markdown",
    "usage": {
      "prompt_tokens": 120,
      "completion_tokens": 350,
      "total_tokens": 470
    },
    "finish_reason": "stop"
  },
  "details": {
    "message": "对话成功"
  },
  "timestamp": "2023-01-01 12:00:00"
}
```

### 7.3 检索增强生成

**接口**：`POST /api/agent/rag`  
**描述**：基于nkuwiki平台的数据进行信息检索并生成回答  
**请求体**：

```json
{
  "openid": "用户openid", 
  "query": "南开大学的校训是什么",
  "tables": ["wxapp_posts", "website_nku", "wechat_nku"],
  "max_results": 3,
  "stream": false,
  "format": "markdown"
}
```

**请求参数说明**：
- `openid` - 字符串，必填，用户的openid
- `query` - 字符串，必填，用户的问题
- `tables` - 字符串数组，必填，要检索的数据表列表：
  - `wxapp_posts` - 小程序帖子
  - `wxapp_comments` - 小程序评论
  - `wechat_nku` - 微信公众号文章
  - `website_nku` - 南开网站文章
  - `market_nku` - 校园集市帖子
- `max_results` - 整数，可选，每个数据源返回的最大结果数，默认为5
- `stream` - 布尔值，可选，是否使用流式返回，默认为false
- `format` - 字符串，可选，返回格式：markdown或text，默认为markdown

**响应**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "original_query": "南开大学的校训是什么",
    "rewritten_query": "南开大学校训",
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