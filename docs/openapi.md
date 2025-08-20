好的，这是根据您提供的最新 OpenAPI JSON 文件重新整理的一版综合接口文档。

该文档按照功能模块（Tags）对所有端点进行了划分，并详细说明了每个接口的用途、请求参数、请求体结构和成功的响应格式，以便于开发和联调。

---

# nkuwiki API 接口文档

## 简介

`nkuwiki` 是一个功能丰富的社区和知识维基平台 API，涵盖了用户系统、内容管理（论坛、动态）、社交互动、即时消息、电子商务、AI 服务等多个模块。

## 认证

所有需要认证的接口都必须在请求头中包含 `Authorization` 字段。

**格式**: `Authorization: Bearer <your_access_token>`

访问令牌 (`access_token`) 可以通过 **`POST /api/v1/auth/login`** 接口获取。

---

## API 端点详解

### 认证 (auth)

#### `POST /api/v1/auth/login`
-   **用途**: 用户登录。
-   **描述**: 提交用户信息以获取访问令牌。
-   **请求体** (`application/json`):
    -   使用 `LoginRequest` 或 `UnifiedLoginRequest` 结构体。
    -   **核心字段**:
        -   `username` (string, required)
        -   `password` (string, required)
        -   `tenant_id` (string, required)
-   **成功响应 (200 OK)**:
    -   返回一个包含 `access_token` 和 `token_type` 的 `Token` 对象。

#### `POST /api/v1/auth/register`
-   **用途**: 用户注册。
-   **请求头**:
    -   `x-tenant-id` (string, optional): 租户 ID。
-   **请求体** (`application/json`):
    -   使用 `UserCreate` 结构体，包含 `username`, `password`, `nickname` 等字段。
-   **成功响应 (201 Created)**:
    -   返回新创建用户的 `UserRead` 对象。

### 用户 (users)

#### `GET /api/v1/users/me`
-   **用途**: 获取当前用户信息。
-   **描述**: 获取当前已认证用户的基本信息。
-   **成功响应 (200 OK)**:
    -   返回 `CurrentUser` 对象，包含 `user_id`, `tenant_id`, `nickname`, `roles`。

#### `GET /api/v1/users/me/profile`
-   **用途**: 获取当前用户的 Profile。
-   **成功响应 (200 OK)**:
    -   返回 `UserProfileRead` 对象，包含资产、兴趣标签等信息。

#### `PUT /api/v1/users/me/profile`
-   **用途**: 更新当前用户的 Profile。
-   **请求体** (`application/json`):
    -   使用 `UserProfileUpdate` 结构体，可更新 `assets` 和 `interest_tags`。
-   **成功响应 (200 OK)**:
    -   返回更新后的 `UserProfileRead` 对象。

#### `GET /api/v1/users/{user_id}/followers`
-   **用途**: 获取用户的粉丝列表。
-   **路径参数**:
    -   `user_id` (integer, required): 目标用户的 ID。
-   **查询参数**:
    -   `skip` (integer, optional, default: 0): 分页偏移。
    -   `limit` (integer, optional, default: 20): 每页数量。
-   **成功响应 (200 OK)**:
    -   返回 `UserRead` 对象的列表。

#### `GET /api/v1/users/{user_id}/following`
-   **用途**: 获取用户关注的列表。
-   **路径参数**:
    -   `user_id` (integer, required): 目标用户的 ID。
-   **查询参数**:
    -   `skip` (integer, optional, default: 0): 分页偏移。
    -   `limit` (integer, optional, default: 20): 每页数量。
-   **成功响应 (200 OK)**:
    -   返回 `UserRead` 对象的列表。

### 论坛 (forums)

#### `GET /api/v1/forums/categories`
-   **用途**: 获取论坛分类列表。
-   **成功响应 (200 OK)**:
    -   返回 `CategoryRead` 对象的列表。

#### `POST /api/v1/forums/posts`
-   **用途**: 创建论坛帖子。
-   **请求体** (`application/json`):
    -   使用 `PostCreate` 结构体，包含 `title`, `content`, `category_id` 等字段。
-   **成功响应 (200 OK)**:
    -   返回新创建帖子的 `PostRead` 对象。

#### `PUT /api/v1/forums/posts/{post_id}`
-   **用途**: 更新帖子。
-   **描述**: 仅帖子作者可操作。
-   **路径参数**:
    -   `post_id` (integer, required): 要更新的帖子 ID。
-   **请求体** (`application/json`):
    -   使用 `PostUpdate` 结构体，可更新 `title`, `content`, `status` 等。
-   **成功响应 (200 OK)**:
    -   返回更新后的 `PostRead` 对象。

#### `DELETE /api/v1/forums/posts/{post_id}`
-   **用途**: 删除帖子。
-   **描述**: 仅帖子作者可操作。
-   **路径参数**:
    -   `post_id` (integer, required): 要删除的帖子 ID。
-   **成功响应 (200 OK)**:
    -   返回一个标准的成功 `ApiResponse`。

#### `GET /api/v1/forums/me/drafts`
-   **用途**: 获取我的草稿箱列表。
-   **成功响应 (200 OK)**:
    -   返回状态为 `draft` 的 `PostRead` 对象列表。

### 评论 (comments)

#### `POST /api/v1/comments/`
-   **用途**: 创建新评论。
-   **请求体** (`application/json`):
    -   使用 `CommentCreate` 结构体，包含 `content`, `resource_type`, `resource_id` 和可选的 `parent_id`。
-   **成功响应 (200 OK)**:
    -   返回新创建评论的 `CommentRead` 对象。

#### `PUT /api/v1/comments/{comment_id}`
-   **用途**: 更新评论。
-   **描述**: 仅评论作者可操作。
-   **路径参数**:
    -   `comment_id` (integer, required): 要更新的评论 ID。
-   **请求体** (`application/json`):
    -   使用 `CommentUpdate` 结构体，仅包含 `content` 字段。
-   **成功响应 (200 OK)**:
    -   返回更新后的 `CommentRead` 对象。

#### `DELETE /api/v1/comments/{comment_id}`
-   **用途**: 删除评论。
-   **描述**: 仅评论作者可操作。
-   **路径参数**:
    -   `comment_id` (integer, required): 要删除的评论 ID。
-   **成功响应 (200 OK)**:
    -   返回一个标准的成功 `ApiResponse`。

### 即时消息 (messaging)

#### `GET /api/v1/messaging/conversations`
-   **用途**: 获取会话列表。
-   **成功响应 (200 OK)**:
    -   返回会话信息字典的列表。

#### `POST /api/v1/messaging/conversations/private`
-   **用途**: 创建或获取私聊会话。
-   **请求体** (`application/json`):
    -   `peer_user_id` (integer, required): 对方用户的 ID。
-   **成功响应 (200 OK)**:
    -   返回 `ConversationIdRead` 对象，包含会话 `id`。

#### `GET /api/v1/messaging/history`
-   **用途**: 获取历史消息。
-   **查询参数**:
    -   `conversation_id` (integer, required): 会话 ID。
    -   `cursor` (integer, optional): 消息 ID 游标，用于加载更早的消息。
-   **成功响应 (200 OK)**:
    -   返回消息信息字典的列表。

#### `POST /api/v1/messaging/send`
-   **用途**: 发送消息。
-   **请求体** (`application/json`):
    -   使用 `SendMessageRequest` 结构体，包含 `conversation_id` 和 `content`。
-   **成功响应 (200 OK)**:
    -   返回 `MessageIdRead` 对象，包含新消息的 `id`。

#### `PUT /api/v1/messaging/messages/{message_id}/retract`
-   **用途**: 撤回消息。
-   **描述**: 仅消息发送者可操作。
-   **路径参数**:
    -   `message_id` (integer, required): 要撤回的消息 ID。
-   **成功响应 (200 OK)**:
    -   返回 `MessageIdRead` 对象，包含被撤回消息的 `id`。

#### `DELETE /api/v1/messaging/messages/{message_id}`
-   **用途**: 删除消息。
-   **描述**: 物理删除，仅消息发送者可操作。
-   **路径参数**:
    -   `message_id` (integer, required): 要删除的消息 ID。
-   **成功响应 (200 OK)**:
    -   返回一个标准的成功 `ApiResponse`。

### 交互 (actions)

#### `POST /api/v1/actions/toggle`
-   **用途**: 切换用户交互状态 (点赞/收藏/关注)。
-   **请求体** (`application/json`):
    -   使用 `ActionToggle` 结构体，包含 `target_id`, `target_type`, `action_type`。
-   **成功响应 (200 OK)**:
    -   返回 `ActionToggleResult` 对象，包含 `is_active` 状态。

### 文件上传 (uploads)

#### `POST /api/v1/uploads/file`
-   **用途**: 上传单个文件/图片。
-   **请求体** (`multipart/form-data`):
    -   `file` (binary, required): 文件本身。
    -   `folder` (string, optional): 自定义存储文件夹前缀。
-   **成功响应 (200 OK)**:
    -   返回 `FileUploadRead` 对象，包含文件的元数据和 URL。

#### `GET /api/v1/uploads/presign/put`
-   **用途**: 获取用于客户端直传的 PUT 预签名 URL。
-   **查询参数**:
    -   `key` (string, required): 文件在对象存储中的完整路径。
-   **成功响应 (200 OK)**:
    -   返回一个包含预签名 URL 的字典。

### AI 服务 (agent)

#### `POST /api/v1/agent/chat`
-   **用途**: AI 聊天。
-   **请求体** (`application/json`):
    -   使用 `ChatRequest` 结构体，核心字段为 `message`。
-   **成功响应 (200 OK)**:
    -   返回 `ChatResponse` 对象，包含 AI 生成的 `content`。

#### `POST /api/v1/agent/chat/stream`
-   **用途**: AI 聊天 (流式)。
-   **描述**: SSE 流式输出，便于前端逐字呈现。
-   **请求体** (`application/json`):
    -   同上，使用 `ChatRequest` 结构体。
-   **成功响应 (200 OK)**:
    -   返回 SSE (Server-Sent Events) 流。

#### `POST /api/v1/agent/summarize`
-   **用途**: 文本摘要。
-   **请求体** (`application/json`):
    -   使用 `SummarizeRequest` 结构体，核心字段为 `text`。
-   **成功响应 (200 OK)**:
    -   返回 `SummarizeResponse` 对象，包含 `summary` 字段。