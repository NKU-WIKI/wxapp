---
title: nkuwiki
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# nkuwiki

Base URLs:

# Authentication

- oAuth2 authentication. 

    - Flow: password

    - Token URL = [/api/v1/auth/login](/api/v1/auth/login)

- HTTP Authentication, scheme: bearer

# forums

<a id="opIdlist_categories_api_v1_forums_categories_get"></a>

## GET 获取论坛分类列表

GET /api/v1/forums/categories

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "name": "string",
      "description": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_List_CategoryRead__](#schemaapiresponse_list_categoryread__)|

<a id="opIdget_community_feed_api_v1_forums_posts_feed_get"></a>

## GET 获取社区动态信息流

GET /api/v1/forums/posts/feed

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|skip|query|integer| 否 | Skip|起始偏移（默认 0）|
|limit|query|integer| 否 | Limit|返回条数上限（默认 20，最大 100）|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "title": "string",
      "content": "string",
      "category_id": 0,
      "like_count": 0,
      "favorite_count": 0,
      "comment_count": 0,
      "view_count": 0,
      "status": "published",
      "user": {
        "id": 0,
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "nickname": "string",
        "avatar": {},
        "bio": {},
        "birthday": {},
        "school": {},
        "college": {},
        "location": {},
        "wechat_id": {},
        "qq_id": {},
        "tel": {},
        "status": "["
      },
      "is_liked": false,
      "is_favorited": false,
      "is_commented": false,
      "is_following": false
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_List_PostRead__](#schemaapiresponse_list_postread__)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdlist_forum_posts_api_v1_forums_posts_get"></a>

## GET 获取论坛帖子列表

GET /api/v1/forums/posts

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|category_id|query|any| 否 | Category Id|按分类ID过滤|
|skip|query|integer| 否 | Skip|none|
|limit|query|integer| 否 | Limit|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "title": "string",
      "content": "string",
      "category_id": 0,
      "like_count": 0,
      "favorite_count": 0,
      "comment_count": 0,
      "view_count": 0,
      "status": "published",
      "user": {
        "id": 0,
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "nickname": "string",
        "avatar": {},
        "bio": {},
        "birthday": {},
        "school": {},
        "college": {},
        "location": {},
        "wechat_id": {},
        "qq_id": {},
        "tel": {},
        "status": "["
      },
      "is_liked": false,
      "is_favorited": false,
      "is_commented": false,
      "is_following": false
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_List_PostRead__](#schemaapiresponse_list_postread__)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdcreate_forum_post_api_v1_forums_posts_post"></a>

## POST 创建论坛帖子

POST /api/v1/forums/posts

> Body 请求参数

```json
{
  "title": "string",
  "content": "string",
  "category_id": 0,
  "status": "published"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[PostCreate](#schemapostcreate)| 是 | PostCreate|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "title": "string",
    "content": "string",
    "category_id": 0,
    "like_count": 0,
    "favorite_count": 0,
    "comment_count": 0,
    "view_count": 0,
    "status": "published",
    "user": {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "nickname": "string",
      "avatar": "string",
      "bio": "string",
      "birthday": "2019-08-24",
      "school": "string",
      "college": "string",
      "location": "string",
      "wechat_id": "string",
      "qq_id": "string",
      "tel": "string",
      "status": "active"
    },
    "is_liked": false,
    "is_favorited": false,
    "is_commented": false,
    "is_following": false
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_PostRead_](#schemaapiresponse_postread_)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdgenerate_ai_post_api_v1_forums_posts_feed_generate_post"></a>

## POST [内部] AI 生成社区动态

POST /api/v1/forums/posts/feed/generate

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|topic|query|string| 是 | Topic|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "title": "string",
    "content": "string",
    "category_id": 0,
    "like_count": 0,
    "favorite_count": 0,
    "comment_count": 0,
    "view_count": 0,
    "status": "published",
    "user": {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "nickname": "string",
      "avatar": "string",
      "bio": "string",
      "birthday": "2019-08-24",
      "school": "string",
      "college": "string",
      "location": "string",
      "wechat_id": "string",
      "qq_id": "string",
      "tel": "string",
      "status": "active"
    },
    "is_liked": false,
    "is_favorited": false,
    "is_commented": false,
    "is_following": false
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_PostRead_](#schemaapiresponse_postread_)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdcreate_comment_api_v1_forums_comments_post"></a>

## POST 创建新评论

POST /api/v1/forums/comments

> Body 请求参数

```json
{
  "content": "string",
  "resource_type": "string",
  "resource_id": 0,
  "parent_id": 0
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[CommentCreate](#schemacommentcreate)| 是 | CommentCreate|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "content": "string",
    "resource_type": "string",
    "author_nickname": "string",
    "author_avatar": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_CommentRead_](#schemaapiresponse_commentread_)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdupdate_post_api_v1_forums_posts__post_id__put"></a>

## PUT 更新帖子

PUT /api/v1/forums/posts/{post_id}

更新帖子，仅作者可操作。

> Body 请求参数

```json
{
  "title": "string",
  "content": "string",
  "category_id": 0,
  "status": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|post_id|path|integer| 是 | Post Id|none|
|body|body|[PostUpdate](#schemapostupdate)| 是 | PostUpdate|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "title": "string",
    "content": "string",
    "category_id": 0,
    "like_count": 0,
    "favorite_count": 0,
    "comment_count": 0,
    "view_count": 0,
    "status": "published",
    "user": {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "nickname": "string",
      "avatar": "string",
      "bio": "string",
      "birthday": "2019-08-24",
      "school": "string",
      "college": "string",
      "location": "string",
      "wechat_id": "string",
      "qq_id": "string",
      "tel": "string",
      "status": "active"
    },
    "is_liked": false,
    "is_favorited": false,
    "is_commented": false,
    "is_following": false
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_PostRead_](#schemaapiresponse_postread_)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIddelete_post_api_v1_forums_posts__post_id__delete"></a>

## DELETE 删除帖子

DELETE /api/v1/forums/posts/{post_id}

删除帖子，仅作者可操作。

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|post_id|path|integer| 是 | Post Id|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse](#schemaapiresponse)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdget_my_comments_api_v1_forums_comments_me_get"></a>

## GET 获取我的评论列表

GET /api/v1/forums/comments/me

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|skip|query|integer| 否 | Skip|none|
|limit|query|integer| 否 | Limit|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "content": "string",
      "resource_type": "string",
      "author_nickname": "string",
      "author_avatar": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_List_CommentRead__](#schemaapiresponse_list_commentread__)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdupdate_comment_api_v1_forums_comments__comment_id__put"></a>

## PUT 更新评论

PUT /api/v1/forums/comments/{comment_id}

更新评论，仅作者可操作。

> Body 请求参数

```json
{
  "content": "string"
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|comment_id|path|integer| 是 | Comment Id|none|
|body|body|[CommentUpdate](#schemacommentupdate)| 是 | CommentUpdate|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "content": "string",
    "resource_type": "string",
    "author_nickname": "string",
    "author_avatar": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_CommentRead_](#schemaapiresponse_commentread_)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIddelete_comment_api_v1_forums_comments__comment_id__delete"></a>

## DELETE 删除评论

DELETE /api/v1/forums/comments/{comment_id}

删除评论，仅作者可操作。

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|comment_id|path|integer| 是 | Comment Id|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse](#schemaapiresponse)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIddelete_draft_api_v1_forums_drafts__draft_id__delete"></a>

## DELETE 删除草稿

DELETE /api/v1/forums/drafts/{draft_id}

删除草稿，仅作者可操作。

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|draft_id|path|integer| 是 | Draft Id|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse](#schemaapiresponse)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdpromote_post_to_knowledge_api_v1_forums_posts__post_id__promote_post"></a>

## POST 将帖子提升为知识

POST /api/v1/forums/posts/{post_id}/promote

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|post_id|path|integer| 是 | Post Id|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse](#schemaapiresponse)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<a id="opIdget_my_drafts_api_v1_forums_me_drafts_get"></a>

## GET 获取我的草稿箱列表

GET /api/v1/forums/me/drafts

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|skip|query|integer| 否 | Skip|none|
|limit|query|integer| 否 | Limit|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "title": "string",
      "content": "string",
      "category_id": 0,
      "like_count": 0,
      "favorite_count": 0,
      "comment_count": 0,
      "view_count": 0,
      "status": "published",
      "user": {
        "id": 0,
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "nickname": "string",
        "avatar": {},
        "bio": {},
        "birthday": {},
        "school": {},
        "college": {},
        "location": {},
        "wechat_id": {},
        "qq_id": {},
        "tel": {},
        "status": "["
      },
      "is_liked": false,
      "is_favorited": false,
      "is_commented": false,
      "is_following": false
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_List_PostRead__](#schemaapiresponse_list_postread__)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

# 数据模型

<h2 id="tocS_ApiResponse_List_CategoryRead__">ApiResponse_List_CategoryRead__</h2>

<a id="schemaapiresponse_list_categoryread__"></a>
<a id="schema_ApiResponse_List_CategoryRead__"></a>
<a id="tocSapiresponse_list_categoryread__"></a>
<a id="tocsapiresponse_list_categoryread__"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "name": "string",
      "description": "string"
    }
  ]
}

```

ApiResponse[List[CategoryRead]]

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|any|false|none|Data|负载数据|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[[CategoryRead](#schemacategoryread)]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_ApiResponse_List_PostRead__">ApiResponse_List_PostRead__</h2>

<a id="schemaapiresponse_list_postread__"></a>
<a id="schema_ApiResponse_List_PostRead__"></a>
<a id="tocSapiresponse_list_postread__"></a>
<a id="tocsapiresponse_list_postread__"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "title": "string",
      "content": "string",
      "category_id": 0,
      "like_count": 0,
      "favorite_count": 0,
      "comment_count": 0,
      "view_count": 0,
      "status": "published",
      "user": {
        "id": 0,
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "nickname": "string",
        "avatar": {},
        "bio": {},
        "birthday": {},
        "school": {},
        "college": {},
        "location": {},
        "wechat_id": {},
        "qq_id": {},
        "tel": {},
        "status": "["
      },
      "is_liked": false,
      "is_favorited": false,
      "is_commented": false,
      "is_following": false
    }
  ]
}

```

ApiResponse[List[PostRead]]

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|any|false|none|Data|负载数据|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[[PostRead](#schemapostread)]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_ApiResponse_PostRead_">ApiResponse_PostRead_</h2>

<a id="schemaapiresponse_postread_"></a>
<a id="schema_ApiResponse_PostRead_"></a>
<a id="tocSapiresponse_postread_"></a>
<a id="tocsapiresponse_postread_"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "title": "string",
    "content": "string",
    "category_id": 0,
    "like_count": 0,
    "favorite_count": 0,
    "comment_count": 0,
    "view_count": 0,
    "status": "published",
    "user": {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "nickname": "string",
      "avatar": "string",
      "bio": "string",
      "birthday": "2019-08-24",
      "school": "string",
      "college": "string",
      "location": "string",
      "wechat_id": "string",
      "qq_id": "string",
      "tel": "string",
      "status": "active"
    },
    "is_liked": false,
    "is_favorited": false,
    "is_commented": false,
    "is_following": false
  }
}

```

ApiResponse[PostRead]

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|[PostRead](#schemapostread)|false|none||负载数据|

<h2 id="tocS_CategoryRead">CategoryRead</h2>

<a id="schemacategoryread"></a>
<a id="schema_CategoryRead"></a>
<a id="tocScategoryread"></a>
<a id="tocscategoryread"></a>

```json
{
  "id": 0,
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "name": "string",
  "description": "string"
}

```

CategoryRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|name|string|true|none|Name|none|
|description|any|false|none|Description|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_CommentCreate">CommentCreate</h2>

<a id="schemacommentcreate"></a>
<a id="schema_CommentCreate"></a>
<a id="tocScommentcreate"></a>
<a id="tocscommentcreate"></a>

```json
{
  "content": "string",
  "resource_type": "string",
  "resource_id": 0,
  "parent_id": 0
}

```

CommentCreate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|content|string|true|none|Content|none|
|resource_type|string|true|none|Resource Type|none|
|resource_id|integer|true|none|Resource Id|none|
|parent_id|any|false|none|Parent Id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|integer|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_HTTPValidationError">HTTPValidationError</h2>

<a id="schemahttpvalidationerror"></a>
<a id="schema_HTTPValidationError"></a>
<a id="tocShttpvalidationerror"></a>
<a id="tocshttpvalidationerror"></a>

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

```

HTTPValidationError

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|detail|[[ValidationError](#schemavalidationerror)]|false|none|Detail|none|

<h2 id="tocS_PostCreate">PostCreate</h2>

<a id="schemapostcreate"></a>
<a id="schema_PostCreate"></a>
<a id="tocSpostcreate"></a>
<a id="tocspostcreate"></a>

```json
{
  "title": "string",
  "content": "string",
  "category_id": 0,
  "status": "published"
}

```

PostCreate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|title|any|false|none|Title|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|content|string|true|none|Content|none|
|category_id|integer|true|none|Category Id|none|
|status|string|false|none|Status|none|

<h2 id="tocS_PostRead">PostRead</h2>

<a id="schemapostread"></a>
<a id="schema_PostRead"></a>
<a id="tocSpostread"></a>
<a id="tocspostread"></a>

```json
{
  "id": 0,
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "title": "string",
  "content": "string",
  "category_id": 0,
  "like_count": 0,
  "favorite_count": 0,
  "comment_count": 0,
  "view_count": 0,
  "status": "published",
  "user": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "nickname": "string",
    "avatar": "string",
    "bio": "string",
    "birthday": "2019-08-24",
    "school": "string",
    "college": "string",
    "location": "string",
    "wechat_id": "string",
    "qq_id": "string",
    "tel": "string",
    "status": "active"
  },
  "is_liked": false,
  "is_favorited": false,
  "is_commented": false,
  "is_following": false
}

```

PostRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|title|string|true|none|Title|none|
|content|any|false|none|Content|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|category_id|any|false|none|Category Id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|integer|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|like_count|integer|true|none|Like Count|none|
|favorite_count|integer|true|none|Favorite Count|none|
|comment_count|integer|false|none|Comment Count|none|
|view_count|integer|true|none|View Count|none|
|status|[PostStatus](#schemapoststatus)|true|none||none|
|user|[UserRead](#schemauserread)|false|none||none|
|is_liked|boolean|false|none|Is Liked|none|
|is_favorited|boolean|false|none|Is Favorited|none|
|is_commented|boolean|false|none|Is Commented|none|
|is_following|boolean|false|none|Is Following|none|

<h2 id="tocS_UserRead">UserRead</h2>

<a id="schemauserread"></a>
<a id="schema_UserRead"></a>
<a id="tocSuserread"></a>
<a id="tocsuserread"></a>

```json
{
  "id": 0,
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "nickname": "string",
  "avatar": "string",
  "bio": "string",
  "birthday": "2019-08-24",
  "school": "string",
  "college": "string",
  "location": "string",
  "wechat_id": "string",
  "qq_id": "string",
  "tel": "string",
  "status": "active"
}

```

UserRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|nickname|string|true|none|Nickname|none|
|avatar|any|false|none|Avatar|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|bio|any|false|none|Bio|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|birthday|any|false|none|Birthday|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string(date)|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|school|any|false|none|School|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|college|any|false|none|College|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|location|any|false|none|Location|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|wechat_id|any|false|none|Wechat Id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|qq_id|any|false|none|Qq Id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|tel|any|false|none|Tel|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|status|[UserStatus](#schemauserstatus)|true|none||none|

<h2 id="tocS_UserStatus">UserStatus</h2>

<a id="schemauserstatus"></a>
<a id="schema_UserStatus"></a>
<a id="tocSuserstatus"></a>
<a id="tocsuserstatus"></a>

```json
"active"

```

UserStatus

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|UserStatus|string|false|none|UserStatus|none|

#### 枚举值

|属性|值|
|---|---|
|UserStatus|active|
|UserStatus|inactive|
|UserStatus|banned|

<h2 id="tocS_ValidationError">ValidationError</h2>

<a id="schemavalidationerror"></a>
<a id="schema_ValidationError"></a>
<a id="tocSvalidationerror"></a>
<a id="tocsvalidationerror"></a>

```json
{
  "loc": [
    "string"
  ],
  "msg": "string",
  "type": "string"
}

```

ValidationError

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|loc|[anyOf]|true|none|Location|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|integer|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|msg|string|true|none|Message|none|
|type|string|true|none|Error Type|none|

<h2 id="tocS_ApiResponse">ApiResponse</h2>

<a id="schemaapiresponse"></a>
<a id="schema_ApiResponse"></a>
<a id="tocSapiresponse"></a>
<a id="tocsapiresponse"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}

```

ApiResponse

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|any|false|none|Data|负载数据|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|any|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_PostStatus">PostStatus</h2>

<a id="schemapoststatus"></a>
<a id="schema_PostStatus"></a>
<a id="tocSpoststatus"></a>
<a id="tocspoststatus"></a>

```json
"published"

```

PostStatus

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|PostStatus|string|false|none|PostStatus|none|

#### 枚举值

|属性|值|
|---|---|
|PostStatus|published|
|PostStatus|draft|
|PostStatus|archived|

<h2 id="tocS_ApiResponse_CommentRead_">ApiResponse_CommentRead_</h2>

<a id="schemaapiresponse_commentread_"></a>
<a id="schema_ApiResponse_CommentRead_"></a>
<a id="tocSapiresponse_commentread_"></a>
<a id="tocsapiresponse_commentread_"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 0,
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "content": "string",
    "resource_type": "string",
    "author_nickname": "string",
    "author_avatar": "string"
  }
}

```

ApiResponse[CommentRead]

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|[CommentRead](#schemacommentread)|false|none||负载数据|

<h2 id="tocS_ApiResponse_List_CommentRead__">ApiResponse_List_CommentRead__</h2>

<a id="schemaapiresponse_list_commentread__"></a>
<a id="schema_ApiResponse_List_CommentRead__"></a>
<a id="tocSapiresponse_list_commentread__"></a>
<a id="tocsapiresponse_list_commentread__"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 0,
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "content": "string",
      "resource_type": "string",
      "author_nickname": "string",
      "author_avatar": "string"
    }
  ]
}

```

ApiResponse[List[CommentRead]]

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|any|false|none|Data|负载数据|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[[CommentRead](#schemacommentread)]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_CommentRead">CommentRead</h2>

<a id="schemacommentread"></a>
<a id="schema_CommentRead"></a>
<a id="tocScommentread"></a>
<a id="tocscommentread"></a>

```json
{
  "id": 0,
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "content": "string",
  "resource_type": "string",
  "author_nickname": "string",
  "author_avatar": "string"
}

```

CommentRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|integer|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|content|string|true|none|Content|none|
|resource_type|string|true|none|Resource Type|none|
|author_nickname|any|false|none|Author Nickname|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|author_avatar|any|false|none|Author Avatar|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_CommentUpdate">CommentUpdate</h2>

<a id="schemacommentupdate"></a>
<a id="schema_CommentUpdate"></a>
<a id="tocScommentupdate"></a>
<a id="tocscommentupdate"></a>

```json
{
  "content": "string"
}

```

CommentUpdate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|content|string|true|none|Content|none|

<h2 id="tocS_PostUpdate">PostUpdate</h2>

<a id="schemapostupdate"></a>
<a id="schema_PostUpdate"></a>
<a id="tocSpostupdate"></a>
<a id="tocspostupdate"></a>

```json
{
  "title": "string",
  "content": "string",
  "category_id": 0,
  "status": "string"
}

```

PostUpdate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|title|any|false|none|Title|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|content|any|false|none|Content|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|category_id|any|false|none|Category Id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|integer|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|status|any|false|none|Status|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

