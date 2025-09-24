# API 数据模型 (Schemas)

## 核心业务模型

### UserCreate

> 用于用户注册时创建新用户。

| 字段名      | 数据类型              | 是否必需 | 描述/约束              |
| ----------- | --------------------- | -------- | ---------------------- |
| `nickname`  | string                | 是       | 用户的昵称             |
| `avatar`    | string \| null        | 否       | 用户头像的 URL         |
| `bio`       | string \| null        | 否       | 个人简介               |
| `birthday`  | string (date) \| null | 否       | 生日, 格式: YYYY-MM-DD |
| `school`    | string \| null        | 否       | 学校信息               |
| `college`   | string \| null        | 否       | 学院信息               |
| `location`  | string \| null        | 否       | 所在地                 |
| `wechat_id` | string \| null        | 否       | 微信号                 |
| `qq_id`     | string \| null        | 否       | QQ 号                  |
| `tel`       | string \| null        | 否       | 电话号码               |
| `username`  | string                | 是       | 登录用户名             |
| `password`  | string                | 是       | 登录密码               |

### UserRead

> 用于在 API 响应中返回用户的公开信息。

| 字段名       | 数据类型           | 是否必需 | 描述/约束                                        |
| ------------ | ------------------ | -------- | ------------------------------------------------ |
| `id`         | integer            | 是       | 用户唯一 ID                                      |
| `tenant_id`  | string (uuid)      | 是       | 租户 ID                                          |
| `created_at` | string (date-time) | 是       | 创建时间                                         |
| `updated_at` | string (date-time) | 是       | 更新时间                                         |
| `nickname`   | string             | 是       | 用户的昵称                                       |
| `avatar`     | string \| null     | 否       | 用户头像的 URL                                   |
| `bio`        | string \| null     | 否       | 个人简介                                         |
| `status`     | string             | 是       | 用户状态。可选值: `active`, `inactive`, `banned` |
| `...`        | ...                | ...      | 其他可选的个人资料字段                           |

### PostCreate

> 用于创建新的论坛帖子或动态。

| 字段名    | 数据类型       | 是否必需 | 描述/约束                                                             |
| --------- | -------------- | -------- | --------------------------------------------------------------------- |
| `title`   | string         | 是       | 帖子标题                                                              |
| `content` | string \| null | 否       | 帖子内容                                                              |
| `status`  | string         | 否       | 帖子状态, 默认: `published`。可选值: `published`, `draft`, `archived` |

### PostRead

> 用于返回帖子的详细信息。

| 字段名           | 数据类型         | 是否必需 | 描述/约束                                          |
| ---------------- | ---------------- | -------- | -------------------------------------------------- |
| `id`             | integer          | 是       | 帖子唯一 ID                                        |
| `title`          | string           | 是       | 帖子标题                                           |
| `content`        | string \| null   | 否       | 帖子内容                                           |
| `like_count`     | integer          | 是       | 点赞数                                             |
| `favorite_count` | integer          | 是       | 收藏数                                             |
| `view_count`     | integer          | 是       | 浏览数                                             |
| `status`         | string           | 是       | 帖子状态。可选值: `published`, `draft`, `archived` |
| `user`           | UserRead \| null | 否       | 发布帖子的用户信息对象                             |
| `...`            | ...              | ...      | 其他元数据                                         |

### CommentCreate

> 用于提交新的评论。

| 字段名          | 数据类型        | 是否必需 | 描述/约束                       |
| --------------- | --------------- | -------- | ------------------------------- |
| `content`       | string          | 是       | 评论内容                        |
| `resource_id`   | integer         | 是       | 被评论的资源 ID (如帖子 ID)     |
| `resource_type` | string          | 是       | 被评论的资源类型 (如 `post`)    |
| `parent_id`     | integer \| null | 否       | 如果是回复评论，则为父评论的 ID |

### ActionToggle

> 用于点赞、收藏、关注等交互操作。

| 字段名        | 数据类型 | 是否必需 | 描述/约束                                                     |
| ------------- | -------- | -------- | ------------------------------------------------------------- |
| `target_id`   | integer  | 是       | 交互目标的 ID (如 post_id, user_id)                           |
| `target_type` | string   | 是       | 目标的类型。可选值: `post`, `comment`, `user`                 |
| `action_type` | string   | 是       | 交互的类型。可选值: `like`, `favorite`, `follow`              |
| `active`      | boolean  | 否       | 期望的状态 (true 表示点赞/关注, false 表示取消)。默认: `true` |

---

## 认证 (Auth) & 授权模型

### LoginRequest

> 用于用户名/密码登录。

| 字段名      | 数据类型 | 是否必需 | 描述/约束            |
| ----------- | -------- | -------- | -------------------- |
| `username`  | string   | 是       | 用户名, 最小长度: 1  |
| `password`  | string   | 是       | 密码, 最小长度: 6    |
| `tenant_id` | string   | 是       | 租户 ID, 最小长度: 1 |

### UnifiedLoginRequest

> 统一登录请求体，支持多种登录模式。

| 字段名  | 数据类型                  | 是否必需 | 描述/约束                          |
| ------- | ------------------------- | -------- | ---------------------------------- |
| `mode`  | string                    | 是       | 登录模式。可选值: `local`, `weapp` |
| `local` | LoginRequest \| null      | 否       | 当 `mode` 为 `local` 时使用        |
| `weapp` | WeappLoginRequest \| null | 否       | 当 `mode` 为 `weapp` 时使用        |

### WeappLoginRequest

> 小程序登录专用。

| 字段名      | 数据类型 | 是否必需 | 描述/约束                    |
| ----------- | -------- | -------- | ---------------------------- |
| `code`      | string   | 是       | `wx.login()` 返回的临时 code |
| `tenant_id` | string   | 是       | 租户 ID                      |

### Token

> 登录成功后返回的令牌。

| 字段名         | 数据类型 | 是否必需 | 描述/约束                 |
| -------------- | -------- | -------- | ------------------------- |
| `access_token` | string   | 是       | 访问令牌                  |
| `token_type`   | string   | 是       | 令牌类型, 通常为 `bearer` |

---

## 电商 (E-commerce) 模型

### ProductCreate

> 用于商家创建商品。

| 字段名     | 数据类型         | 是否必需 | 描述/约束      |
| ---------- | ---------------- | -------- | -------------- |
| `title`    | string           | 是       | 商品标题       |
| `cover`    | string \| null   | 否       | 商品封面图 URL |
| `price`    | number \| string | 是       | 商品价格       |
| `store_id` | integer          | 是       | 所属店铺的 ID  |

### AddToCartRequest

> 用于将商品添加到购物车。

| 字段名       | 数据类型 | 是否必需 | 描述/约束 |
| ------------ | -------- | -------- | --------- |
| `product_id` | integer  | 是       | 商品 ID   |
| `quantity`   | integer  | 是       | 购买数量  |

### OrderRead

> 返回的订单信息。

| 字段名       | 数据类型             | 是否必需 | 描述/约束                                                                |
| ------------ | -------------------- | -------- | ------------------------------------------------------------------------ |
| `id`         | integer              | 是       | 订单唯一 ID                                                              |
| `user_id`    | integer              | 是       | 用户 ID                                                                  |
| `amount`     | string               | 是       | 订单总金额 (Decimal 字符串)                                              |
| `pay_amount` | string               | 是       | 实际支付金额 (Decimal 字符串)                                            |
| `status`     | string               | 是       | 订单状态。可选值: `pending`, `paid`, `shipped`, `delivered`, `cancelled` |
| `items`      | array[OrderItemRead] | 是       | 订单内的商品项列表                                                       |
| `...`        | ...                  | ...      | 其他元数据                                                               |

### OrderItemRead

> 订单中的单个商品项。

| 字段名           | 数据类型 | 是否必需 | 描述/约束                 |
| ---------------- | -------- | -------- | ------------------------- |
| `product_sku_id` | integer  | 是       | 商品 SKU ID               |
| `quantity`       | integer  | 是       | 购买数量                  |
| `price`          | string   | 是       | 成交单价 (Decimal 字符串) |

---

## AI 服务 (Agent) 模型

### ChatRequest

> 用于与 AI 聊天。

| 字段名          | 数据类型        | 是否必需 | 描述/约束                  |
| --------------- | --------------- | -------- | -------------------------- |
| `message`       | string          | 是       | 用户输入的消息             |
| `system_prompt` | string \| null  | 否       | 系统提示词 (System Prompt) |
| `temperature`   | number \| null  | 否       | 采样温度 (0-2), 默认: 0.7  |
| `max_tokens`    | integer \| null | 否       | 最大生成 token 数          |

### SummarizeRequest

> 用于请求文本摘要。

| 字段名       | 数据类型        | 是否必需 | 描述/约束                            |
| ------------ | --------------- | -------- | ------------------------------------ |
| `text`       | string          | 是       | 需要进行摘要的文本                   |
| `max_tokens` | integer \| null | 否       | 摘要的最大长度 (token 数), 默认: 256 |

### EmbeddingRequest

> 用于文本向量化。

| 字段名  | 数据类型      | 是否必需 | 描述/约束                     |
| ------- | ------------- | -------- | ----------------------------- |
| `texts` | array[string] | 是       | 待向量化的文本列表, 至少 1 项 |

---

## 文件上传 (tools/uploads) 模型

### FileUploadRead

> 文件上传成功后返回的元数据。

| 字段名         | 数据类型       | 是否必需 | 描述/约束                    |
| -------------- | -------------- | -------- | ---------------------------- |
| `id`           | integer        | 是       | 文件唯一 ID                  |
| `key`          | string         | 是       | 文件在对象存储中的路径 (key) |
| `bucket`       | string \| null | 否       | 存储桶名称                   |
| `filename`     | string         | 是       | 原始文件名                   |
| `content_type` | string \| null | 否       | 文件的 MIME 类型             |
| `size`         | integer        | 是       | 文件大小 (字节)              |
| `url`          | string \| null | 否       | 文件的可访问 URL             |

---

## 其他通用模型

### ViewHistoryCreate

> 用于上报浏览历史。

| 字段名        | 数据类型 | 是否必需 | 描述/约束                                         |
| ------------- | -------- | -------- | ------------------------------------------------- |
| `target_type` | string   | 是       | 浏览目标的类型。可选值: `post`, `product`, `user` |
| `target_id`   | integer  | 是       | 浏览目标的 ID                                     |

### FeedbackCreate

> 用于提交意见反馈。

| 字段名         | 数据类型       | 是否必需 | 描述/约束             |
| -------------- | -------------- | -------- | --------------------- |
| `content`      | string         | 是       | 反馈内容，最小长度: 1 |
| `contact_info` | string \| null | 否       | 用户的联系方式 (可选) |

### ApiResponse (`T`)

> 所有 API 响应的统一包装结构。

| 字段名    | 数据类型  | 是否必需 | 描述/约束                              |
| --------- | --------- | -------- | -------------------------------------- |
| `code`    | integer   | 是       | 业务码, 成功时为 `0`                   |
| `message` | string    | 是       | 简明中文信息, 成功时为 `success`       |
| `data`    | T \| null | 是       | 实际的负载数据，其具体结构见上述各模型 |
