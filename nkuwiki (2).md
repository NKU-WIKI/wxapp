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

# comments

<a id="opIdget_resource_comment_trees_api_v1_comments_resource__resource_type___resource_id__trees_get"></a>

## GET 获取资源的所有评论树

GET /api/v1/comments/resource/{resource_type}/{resource_id}/trees

获取指定资源的所有顶级评论及其评论树。

这个端点实现了分页的树形评论加载策略：
- 先分页获取顶级评论
- 对每个顶级评论构建有限深度的评论树
- 支持层级数量限制，避免性能问题

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|resource_type|path|string| 是 | Resource Type|资源类型，如'post'、'article'等|
|resource_id|path|string(uuid)| 是 | Resource Id|资源ID|
|skip|query|integer| 否 | Skip|跳过顶级评论数量|
|limit|query|integer| 否 | Limit|顶级评论数量上限|
|max_depth|query|integer| 否 | Max Depth|每棵树的深度限制|
|limit_per_level|query|integer| 否 | Limit Per Level|每层最大评论数量|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "resource_type": "string",
      "resource_id": "4d5215ed-38bb-48ed-879a-fdb9ca58522f",
      "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
      "content": "string",
      "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
      "root_id": "9b451279-6241-4fe6-9ea0-54b426fb7a24",
      "path": "string",
      "depth": 0,
      "likes_count": 0,
      "replies_count_immediate": 0,
      "has_liked": false,
      "attachments": {},
      "children": [
        {
          "id": null,
          "tenant_id": null,
          "created_at": null,
          "updated_at": null,
          "resource_type": null,
          "resource_id": null,
          "user_id": null,
          "content": null,
          "parent_id": null,
          "root_id": null,
          "path": null,
          "depth": null,
          "likes_count": null,
          "replies_count_immediate": null,
          "has_liked": null,
          "attachments": null,
          "children": null,
          "total_children_count": null,
          "tree_depth": null,
          "has_more_children": null,
          "is_expanded": null
        }
      ],
      "total_children_count": 0,
      "tree_depth": 1,
      "has_more_children": false,
      "is_expanded": false
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_List_CommentTreeRead__](#schemaapiresponse_list_commenttreeread__)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

# 数据模型

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

<h2 id="tocS_CommentTreeRead">CommentTreeRead</h2>

<a id="schemacommenttreeread"></a>
<a id="schema_CommentTreeRead"></a>
<a id="tocScommenttreeread"></a>
<a id="tocscommenttreeread"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "resource_type": "string",
  "resource_id": "4d5215ed-38bb-48ed-879a-fdb9ca58522f",
  "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
  "content": "string",
  "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
  "root_id": "9b451279-6241-4fe6-9ea0-54b426fb7a24",
  "path": "string",
  "depth": 0,
  "likes_count": 0,
  "replies_count_immediate": 0,
  "has_liked": false,
  "attachments": {},
  "children": [
    {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "resource_type": "string",
      "resource_id": "4d5215ed-38bb-48ed-879a-fdb9ca58522f",
      "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
      "content": "string",
      "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
      "root_id": "9b451279-6241-4fe6-9ea0-54b426fb7a24",
      "path": "string",
      "depth": 0,
      "likes_count": 0,
      "replies_count_immediate": 0,
      "has_liked": false,
      "attachments": {},
      "children": [
        {
          "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
          "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
          "created_at": "2019-08-24T14:15:22Z",
          "updated_at": "2019-08-24T14:15:22Z",
          "resource_type": "string",
          "resource_id": "4d5215ed-38bb-48ed-879a-fdb9ca58522f",
          "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
          "content": "string",
          "parent_id": {},
          "root_id": {},
          "path": "string",
          "depth": 0,
          "likes_count": 0,
          "replies_count_immediate": 0,
          "has_liked": false,
          "attachments": {},
          "children": [
            {}
          ],
          "total_children_count": 0,
          "tree_depth": 1,
          "has_more_children": false,
          "is_expanded": false
        }
      ],
      "total_children_count": 0,
      "tree_depth": 1,
      "has_more_children": false,
      "is_expanded": false
    }
  ],
  "total_children_count": 0,
  "tree_depth": 1,
  "has_more_children": false,
  "is_expanded": false
}

```

CommentTreeRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string(uuid)|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|resource_type|string|true|none|Resource Type|none|
|resource_id|string(uuid)|true|none|Resource Id|none|
|user_id|string(uuid)|true|none|User Id|none|
|content|string|true|none|Content|none|
|parent_id|any|false|none|Parent Id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string(uuid)|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|root_id|any|false|none|Root Id|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string(uuid)|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|path|string|true|none|Path|none|
|depth|integer|true|none|Depth|none|
|likes_count|integer|true|none|Likes Count|none|
|replies_count_immediate|integer|true|none|Replies Count Immediate|none|
|has_liked|boolean|false|none|Has Liked|none|
|attachments|any|false|none|Attachments|none|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|object|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|children|[[CommentTreeRead](#schemacommenttreeread)]|false|none|Children|子评论列表|
|total_children_count|integer|false|none|Total Children Count|子评论总数|
|tree_depth|integer|false|none|Tree Depth|树深度|
|has_more_children|boolean|false|none|Has More Children|是否有更多子评论|
|is_expanded|boolean|false|none|Is Expanded|是否已展开（前端使用）|

<h2 id="tocS_ApiResponse_List_CommentTreeRead__">ApiResponse_List_CommentTreeRead__</h2>

<a id="schemaapiresponse_list_commenttreeread__"></a>
<a id="schema_ApiResponse_List_CommentTreeRead__"></a>
<a id="tocSapiresponse_list_commenttreeread__"></a>
<a id="tocsapiresponse_list_commenttreeread__"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "resource_type": "string",
      "resource_id": "4d5215ed-38bb-48ed-879a-fdb9ca58522f",
      "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
      "content": "string",
      "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
      "root_id": "9b451279-6241-4fe6-9ea0-54b426fb7a24",
      "path": "string",
      "depth": 0,
      "likes_count": 0,
      "replies_count_immediate": 0,
      "has_liked": false,
      "attachments": {},
      "children": [
        {
          "id": null,
          "tenant_id": null,
          "created_at": null,
          "updated_at": null,
          "resource_type": null,
          "resource_id": null,
          "user_id": null,
          "content": null,
          "parent_id": null,
          "root_id": null,
          "path": null,
          "depth": null,
          "likes_count": null,
          "replies_count_immediate": null,
          "has_liked": null,
          "attachments": null,
          "children": null,
          "total_children_count": null,
          "tree_depth": null,
          "has_more_children": null,
          "is_expanded": null
        }
      ],
      "total_children_count": 0,
      "tree_depth": 1,
      "has_more_children": false,
      "is_expanded": false
    }
  ]
}

```

ApiResponse[List[CommentTreeRead]]

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|any|false|none|Data|负载数据|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[[CommentTreeRead](#schemacommenttreeread)]|false|none||[评论树输出模型，包含子评论和树形结构信息。]|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

