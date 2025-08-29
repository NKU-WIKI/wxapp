# Authentication

- oAuth2 authentication. 

    - Flow: password

    - Token URL = [/api/v1/auth/login](/api/v1/auth/login)

- HTTP Authentication, scheme: bearer

# notes

<a id="opIdcreate_note_api_v1_notes_post"></a>

## POST 创建笔记

POST /api/v1/notes

创建一篇新的笔记.

**功能特性:**
- 支持图文内容创作(可包含图片URL列表)
- 社交功能:支持@提及用户(通过mentioned_users字段)、地理位置标记
- 权限控制:灵活的可见性和分享权限设置
- 状态管理:支持草稿(draft)和发布(published)状态
- 内容审核:对公开笔记进行内容审核
- 分类管理:支持笔记分类和标签设置
- 字数统计和阅读时间估算

**核心字段:**
- title: 笔记标题(必填)
- content: 笔记内容(可选)
- images: 图片URL列表,用于图文笔记
- mentioned_users: 提及的用户ID列表,支持字符串或UUID格式
- location: 地理位置信息
- category_id: 分类ID
- tags: 标签列表
- visibility: 可见性设置(public/friends/private)
- allow_share: 是否允许转发
- allow_comment: 是否允许评论
- status: 笔记状态(draft/published)
- word_count: 字数统计
- reading_time_minutes: 预计阅读时间

**注意事项:**
- 标题长度限制:1-500字符
- 地理位置限制:最大200字符
- 支持的mentioned_users格式:UUID字符串或UUID对象
- 公开(visible=public)笔记会进行内容审核
- 创建成功后会自动刷新笔记数据
- 分类不存在时会返回400错误

> Body 请求参数

```json
{
  "title": "string",
  "content": "string",
  "summary": "string",
  "excerpt": "string",
  "category_id": "8de4c9fd-61a4-4c0b-bf88-0ed3a0fe3fa2",
  "tags": [
    "string"
  ],
  "link_info_id": "854a0b66-4dee-4332-ab18-7ca809adbfe6",
  "images": [
    "string"
  ],
  "mentioned_users": [
    "string"
  ],
  "location": "string",
  "visibility": "PUBLIC",
  "allow_share": true,
  "allow_comment": true,
  "status": "draft",
  "word_count": 0,
  "reading_time_minutes": 0,
  "is_featured": false,
  "featured_weight": 0
}
```

### 请求参数

|名称|位置|类型|必选|中文名|说明|
|---|---|---|---|---|---|
|body|body|[NoteCreate](#schemanotecreate)| 是 | NoteCreate|none|

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "title": "string",
    "content": "string",
    "summary": "string",
    "excerpt": "string",
    "category_id": "8de4c9fd-61a4-4c0b-bf88-0ed3a0fe3fa2",
    "tags": [
      "string"
    ],
    "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
    "link_info_id": "854a0b66-4dee-4332-ab18-7ca809adbfe6",
    "status": "draft",
    "images": [
      "string"
    ],
    "mentioned_users": [
      "497f6eca-6276-4993-bfeb-53cbbbba6f08"
    ],
    "location": "string",
    "visibility": "PUBLIC",
    "allow_share": true,
    "allow_comment": true,
    "view_count": 0,
    "like_count": 0,
    "favorite_count": 0,
    "comment_count": 0,
    "share_count": 0,
    "word_count": 0,
    "reading_time_minutes": 0,
    "last_read_at": "2019-08-24T14:15:22Z",
    "published_at": "2019-08-24T14:15:22Z",
    "is_featured": false,
    "featured_weight": 0,
    "version": 1,
    "parent_note_id": "04199f06-daca-4557-98f0-1c4f86dc42a2",
    "user": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
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
    "category": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "name": "string",
      "description": "string",
      "icon_url": "string",
      "color": "string",
      "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
      "sort_order": 0,
      "level": 1,
      "is_active": true,
      "is_system": false,
      "note_count": 0,
      "total_views": 0,
      "total_likes": 0,
      "parent": {
        "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "name": "string",
        "description": {},
        "icon_url": {},
        "color": {},
        "parent_id": {},
        "sort_order": 0,
        "level": 1,
        "is_active": true,
        "is_system": false,
        "note_count": 0,
        "total_views": 0,
        "total_likes": 0,
        "parent": {
          "id": null,
          "tenant_id": null,
          "created_at": null,
          "updated_at": null,
          "name": null,
          "description": null,
          "icon_url": null,
          "color": null,
          "parent_id": null,
          "sort_order": null,
          "level": null,
          "is_active": null,
          "is_system": null,
          "note_count": null,
          "total_views": null,
          "total_likes": null,
          "parent": null
        }
      }
    },
    "link_info": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "original_url": "string",
      "processed_url": "string",
      "title": "string",
      "description": "string",
      "favicon_url": "string",
      "link_type": "article",
      "status": "pending",
      "last_validated_at": "2019-08-24T14:15:22Z",
      "validation_error": "string",
      "http_status_code": 0,
      "content_type": "string",
      "content_length": 0,
      "domain": "string",
      "screenshot_url": "string",
      "access_count": 0,
      "last_accessed_at": "2019-08-24T14:15:22Z",
      "metadata": {}
    },
    "is_liked": false,
    "is_favorited": false
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[ApiResponse_NoteRead_](#schemaapiresponse_noteread_)|
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

<h2 id="tocS_UserRead">UserRead</h2>

<a id="schemauserread"></a>
<a id="schema_UserRead"></a>
<a id="tocSuserread"></a>
<a id="tocsuserread"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
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
|id|string(uuid)|true|none|Id|none|
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
|status|[UserStatus](#schemauserstatus)|true|none||用户状态枚举。<br /><br />ACTIVE: 正常用户，可以登录和使用所有功能<br />INACTIVE: 未激活用户，可能是注册后未验证邮箱<br />BANNED: 被禁用户，无法登录和使用功能|

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
|UserStatus|string|false|none|UserStatus|用户状态枚举。<br /><br />ACTIVE: 正常用户，可以登录和使用所有功能<br />INACTIVE: 未激活用户，可能是注册后未验证邮箱<br />BANNED: 被禁用户，无法登录和使用功能|

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

<h2 id="tocS_ApiResponse_NoteRead_">ApiResponse_NoteRead_</h2>

<a id="schemaapiresponse_noteread_"></a>
<a id="schema_ApiResponse_NoteRead_"></a>
<a id="tocSapiresponse_noteread_"></a>
<a id="tocsapiresponse_noteread_"></a>

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "title": "string",
    "content": "string",
    "summary": "string",
    "excerpt": "string",
    "category_id": "8de4c9fd-61a4-4c0b-bf88-0ed3a0fe3fa2",
    "tags": [
      "string"
    ],
    "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
    "link_info_id": "854a0b66-4dee-4332-ab18-7ca809adbfe6",
    "status": "draft",
    "images": [
      "string"
    ],
    "mentioned_users": [
      "497f6eca-6276-4993-bfeb-53cbbbba6f08"
    ],
    "location": "string",
    "visibility": "PUBLIC",
    "allow_share": true,
    "allow_comment": true,
    "view_count": 0,
    "like_count": 0,
    "favorite_count": 0,
    "comment_count": 0,
    "share_count": 0,
    "word_count": 0,
    "reading_time_minutes": 0,
    "last_read_at": "2019-08-24T14:15:22Z",
    "published_at": "2019-08-24T14:15:22Z",
    "is_featured": false,
    "featured_weight": 0,
    "version": 1,
    "parent_note_id": "04199f06-daca-4557-98f0-1c4f86dc42a2",
    "user": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
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
    "category": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "name": "string",
      "description": "string",
      "icon_url": "string",
      "color": "string",
      "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
      "sort_order": 0,
      "level": 1,
      "is_active": true,
      "is_system": false,
      "note_count": 0,
      "total_views": 0,
      "total_likes": 0,
      "parent": {
        "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "name": "string",
        "description": {},
        "icon_url": {},
        "color": {},
        "parent_id": {},
        "sort_order": 0,
        "level": 1,
        "is_active": true,
        "is_system": false,
        "note_count": 0,
        "total_views": 0,
        "total_likes": 0,
        "parent": {
          "id": null,
          "tenant_id": null,
          "created_at": null,
          "updated_at": null,
          "name": null,
          "description": null,
          "icon_url": null,
          "color": null,
          "parent_id": null,
          "sort_order": null,
          "level": null,
          "is_active": null,
          "is_system": null,
          "note_count": null,
          "total_views": null,
          "total_likes": null,
          "parent": null
        }
      }
    },
    "link_info": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "original_url": "string",
      "processed_url": "string",
      "title": "string",
      "description": "string",
      "favicon_url": "string",
      "link_type": "article",
      "status": "pending",
      "last_validated_at": "2019-08-24T14:15:22Z",
      "validation_error": "string",
      "http_status_code": 0,
      "content_type": "string",
      "content_length": 0,
      "domain": "string",
      "screenshot_url": "string",
      "access_count": 0,
      "last_accessed_at": "2019-08-24T14:15:22Z",
      "metadata": {}
    },
    "is_liked": false,
    "is_favorited": false
  }
}

```

ApiResponse[NoteRead]

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|code|integer|false|none|Code|业务码，成功为 0|
|message|string|false|none|Message|简明中文信息|
|data|[NoteRead](#schemanoteread)|false|none||负载数据|

<h2 id="tocS_LinkStatus">LinkStatus</h2>

<a id="schemalinkstatus"></a>
<a id="schema_LinkStatus"></a>
<a id="tocSlinkstatus"></a>
<a id="tocslinkstatus"></a>

```json
"pending"

```

LinkStatus

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|LinkStatus|string|false|none|LinkStatus|链接状态枚举|

#### 枚举值

|属性|值|
|---|---|
|LinkStatus|pending|
|LinkStatus|valid|
|LinkStatus|invalid|
|LinkStatus|expired|

<h2 id="tocS_NoteCategoryRead">NoteCategoryRead</h2>

<a id="schemanotecategoryread"></a>
<a id="schema_NoteCategoryRead"></a>
<a id="tocSnotecategoryread"></a>
<a id="tocsnotecategoryread"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "name": "string",
  "description": "string",
  "icon_url": "string",
  "color": "string",
  "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
  "sort_order": 0,
  "level": 1,
  "is_active": true,
  "is_system": false,
  "note_count": 0,
  "total_views": 0,
  "total_likes": 0,
  "parent": {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "name": "string",
    "description": "string",
    "icon_url": "string",
    "color": "string",
    "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
    "sort_order": 0,
    "level": 1,
    "is_active": true,
    "is_system": false,
    "note_count": 0,
    "total_views": 0,
    "total_likes": 0,
    "parent": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "name": "string",
      "description": "string",
      "icon_url": "string",
      "color": "string",
      "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
      "sort_order": 0,
      "level": 1,
      "is_active": true,
      "is_system": false,
      "note_count": 0,
      "total_views": 0,
      "total_likes": 0,
      "parent": {
        "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "name": "string",
        "description": {},
        "icon_url": {},
        "color": {},
        "parent_id": {},
        "sort_order": 0,
        "level": 1,
        "is_active": true,
        "is_system": false,
        "note_count": 0,
        "total_views": 0,
        "total_likes": 0,
        "parent": {
          "id": null,
          "tenant_id": null,
          "created_at": null,
          "updated_at": null,
          "name": null,
          "description": null,
          "icon_url": null,
          "color": null,
          "parent_id": null,
          "sort_order": null,
          "level": null,
          "is_active": null,
          "is_system": null,
          "note_count": null,
          "total_views": null,
          "total_likes": null,
          "parent": null
        }
      }
    }
  }
}

```

NoteCategoryRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string(uuid)|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|name|string|true|none|Name|分类名称|
|description|any|false|none|Description|分类描述|

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
|icon_url|any|false|none|Icon Url|分类图标|

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
|color|any|false|none|Color|分类颜色|

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
|parent_id|any|false|none|Parent Id|父分类ID|

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
|sort_order|any|false|none|Sort Order|排序权重|

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
|level|integer|false|none|Level|分类层级|
|is_active|boolean|false|none|Is Active|是否启用|
|is_system|boolean|false|none|Is System|是否系统分类|
|note_count|integer|false|none|Note Count|笔记数量|
|total_views|integer|false|none|Total Views|总浏览量|
|total_likes|integer|false|none|Total Likes|总点赞数|
|parent|[NoteCategoryRead](#schemanotecategoryread)|false|none||父分类|

<h2 id="tocS_NoteCreate">NoteCreate</h2>

<a id="schemanotecreate"></a>
<a id="schema_NoteCreate"></a>
<a id="tocSnotecreate"></a>
<a id="tocsnotecreate"></a>

```json
{
  "title": "string",
  "content": "string",
  "summary": "string",
  "excerpt": "string",
  "category_id": "8de4c9fd-61a4-4c0b-bf88-0ed3a0fe3fa2",
  "tags": [
    "string"
  ],
  "link_info_id": "854a0b66-4dee-4332-ab18-7ca809adbfe6",
  "images": [
    "string"
  ],
  "mentioned_users": [
    "string"
  ],
  "location": "string",
  "visibility": "PUBLIC",
  "allow_share": true,
  "allow_comment": true,
  "status": "draft",
  "word_count": 0,
  "reading_time_minutes": 0,
  "is_featured": false,
  "featured_weight": 0
}

```

NoteCreate

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|title|string|true|none|Title|笔记标题|
|content|any|false|none|Content|笔记内容|

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
|summary|any|false|none|Summary|内容摘要|

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
|excerpt|any|false|none|Excerpt|手动摘录|

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
|category_id|any|false|none|Category Id|分类ID|

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
|tags|any|false|none|Tags|标签列表|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[string]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|link_info_id|any|false|none|Link Info Id|链接信息ID|

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
|images|any|false|none|Images|图片URL列表|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[string]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|mentioned_users|any|false|none|Mentioned Users|提及的用户ID列表（支持字符串或UUID格式）|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[string]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[string]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|location|any|false|none|Location|位置信息|

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
|visibility|[Visibility](#schemavisibility)|false|none||可见性|
|allow_share|any|false|none|Allow Share|是否允许转发|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|boolean|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|allow_comment|any|false|none|Allow Comment|是否允许评论|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|boolean|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|status|[NoteStatus](#schemanotestatus)|false|none||笔记状态|
|word_count|any|false|none|Word Count|字数统计|

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
|reading_time_minutes|any|false|none|Reading Time Minutes|预计阅读时间|

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
|is_featured|any|false|none|Is Featured|是否精选|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|boolean|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|featured_weight|any|false|none|Featured Weight|精选权重|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|integer|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_NoteRead">NoteRead</h2>

<a id="schemanoteread"></a>
<a id="schema_NoteRead"></a>
<a id="tocSnoteread"></a>
<a id="tocsnoteread"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "title": "string",
  "content": "string",
  "summary": "string",
  "excerpt": "string",
  "category_id": "8de4c9fd-61a4-4c0b-bf88-0ed3a0fe3fa2",
  "tags": [
    "string"
  ],
  "user_id": "a169451c-8525-4352-b8ca-070dd449a1a5",
  "link_info_id": "854a0b66-4dee-4332-ab18-7ca809adbfe6",
  "status": "draft",
  "images": [
    "string"
  ],
  "mentioned_users": [
    "497f6eca-6276-4993-bfeb-53cbbbba6f08"
  ],
  "location": "string",
  "visibility": "PUBLIC",
  "allow_share": true,
  "allow_comment": true,
  "view_count": 0,
  "like_count": 0,
  "favorite_count": 0,
  "comment_count": 0,
  "share_count": 0,
  "word_count": 0,
  "reading_time_minutes": 0,
  "last_read_at": "2019-08-24T14:15:22Z",
  "published_at": "2019-08-24T14:15:22Z",
  "is_featured": false,
  "featured_weight": 0,
  "version": 1,
  "parent_note_id": "04199f06-daca-4557-98f0-1c4f86dc42a2",
  "user": {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
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
  "category": {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "name": "string",
    "description": "string",
    "icon_url": "string",
    "color": "string",
    "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
    "sort_order": 0,
    "level": 1,
    "is_active": true,
    "is_system": false,
    "note_count": 0,
    "total_views": 0,
    "total_likes": 0,
    "parent": {
      "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
      "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
      "created_at": "2019-08-24T14:15:22Z",
      "updated_at": "2019-08-24T14:15:22Z",
      "name": "string",
      "description": "string",
      "icon_url": "string",
      "color": "string",
      "parent_id": "1c6ca187-e61f-4301-8dcb-0e9749e89eef",
      "sort_order": 0,
      "level": 1,
      "is_active": true,
      "is_system": false,
      "note_count": 0,
      "total_views": 0,
      "total_likes": 0,
      "parent": {
        "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
        "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
        "created_at": "2019-08-24T14:15:22Z",
        "updated_at": "2019-08-24T14:15:22Z",
        "name": "string",
        "description": {},
        "icon_url": {},
        "color": {},
        "parent_id": {},
        "sort_order": 0,
        "level": 1,
        "is_active": true,
        "is_system": false,
        "note_count": 0,
        "total_views": 0,
        "total_likes": 0,
        "parent": {
          "id": null,
          "tenant_id": null,
          "created_at": null,
          "updated_at": null,
          "name": null,
          "description": null,
          "icon_url": null,
          "color": null,
          "parent_id": null,
          "sort_order": null,
          "level": null,
          "is_active": null,
          "is_system": null,
          "note_count": null,
          "total_views": null,
          "total_likes": null,
          "parent": null
        }
      }
    }
  },
  "link_info": {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
    "created_at": "2019-08-24T14:15:22Z",
    "updated_at": "2019-08-24T14:15:22Z",
    "original_url": "string",
    "processed_url": "string",
    "title": "string",
    "description": "string",
    "favicon_url": "string",
    "link_type": "article",
    "status": "pending",
    "last_validated_at": "2019-08-24T14:15:22Z",
    "validation_error": "string",
    "http_status_code": 0,
    "content_type": "string",
    "content_length": 0,
    "domain": "string",
    "screenshot_url": "string",
    "access_count": 0,
    "last_accessed_at": "2019-08-24T14:15:22Z",
    "metadata": {}
  },
  "is_liked": false,
  "is_favorited": false
}

```

NoteRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string(uuid)|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|title|string|true|none|Title|笔记标题|
|content|any|false|none|Content|笔记内容|

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
|summary|any|false|none|Summary|内容摘要|

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
|excerpt|any|false|none|Excerpt|手动摘录|

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
|category_id|any|false|none|Category Id|分类ID|

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
|tags|any|false|none|Tags|标签列表|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[string]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|user_id|string(uuid)|true|none|User Id|用户ID|
|link_info_id|any|false|none|Link Info Id|链接信息ID|

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
|status|[NoteStatus](#schemanotestatus)|true|none||笔记状态|
|images|any|false|none|Images|图片URL列表|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[string]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|mentioned_users|any|false|none|Mentioned Users|提及的用户ID列表|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|[string]|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|location|any|false|none|Location|位置信息|

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
|visibility|[Visibility](#schemavisibility)|true|none||可见性|
|allow_share|boolean|false|none|Allow Share|是否允许转发|
|allow_comment|boolean|false|none|Allow Comment|是否允许评论|
|view_count|integer|false|none|View Count|浏览量|
|like_count|integer|false|none|Like Count|点赞数|
|favorite_count|integer|false|none|Favorite Count|收藏数|
|comment_count|integer|false|none|Comment Count|评论数|
|share_count|integer|false|none|Share Count|分享数|
|word_count|integer|false|none|Word Count|字数统计|
|reading_time_minutes|integer|false|none|Reading Time Minutes|预计阅读时间|
|last_read_at|any|false|none|Last Read At|最后阅读时间|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string(date-time)|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|published_at|any|false|none|Published At|发布时间|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string(date-time)|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|is_featured|boolean|false|none|Is Featured|是否精选|
|featured_weight|integer|false|none|Featured Weight|精选权重|
|version|integer|false|none|Version|版本号|
|parent_note_id|any|false|none|Parent Note Id|父版本ID|

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
|user|[UserRead](#schemauserread)|false|none||用户信息|
|category|[NoteCategoryRead](#schemanotecategoryread)|false|none||分类信息|
|link_info|[apps__api__v1__schemas__note__LinkInfoRead](#schemaapps__api__v1__schemas__note__linkinforead)|false|none||链接信息|
|is_liked|boolean|false|none|Is Liked|当前用户是否点赞|
|is_favorited|boolean|false|none|Is Favorited|当前用户是否收藏|

<h2 id="tocS_NoteStatus">NoteStatus</h2>

<a id="schemanotestatus"></a>
<a id="schema_NoteStatus"></a>
<a id="tocSnotestatus"></a>
<a id="tocsnotestatus"></a>

```json
"draft"

```

NoteStatus

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|NoteStatus|string|false|none|NoteStatus|笔记状态枚举|

#### 枚举值

|属性|值|
|---|---|
|NoteStatus|draft|
|NoteStatus|published|
|NoteStatus|archived|
|NoteStatus|deleted|

<h2 id="tocS_apps__api__v1__schemas__note__LinkInfoRead">apps__api__v1__schemas__note__LinkInfoRead</h2>

<a id="schemaapps__api__v1__schemas__note__linkinforead"></a>
<a id="schema_apps__api__v1__schemas__note__LinkInfoRead"></a>
<a id="tocSapps__api__v1__schemas__note__linkinforead"></a>
<a id="tocsapps__api__v1__schemas__note__linkinforead"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "tenant_id": "34f5c98e-f430-457b-a812-92637d0c6fd0",
  "created_at": "2019-08-24T14:15:22Z",
  "updated_at": "2019-08-24T14:15:22Z",
  "original_url": "string",
  "processed_url": "string",
  "title": "string",
  "description": "string",
  "favicon_url": "string",
  "link_type": "article",
  "status": "pending",
  "last_validated_at": "2019-08-24T14:15:22Z",
  "validation_error": "string",
  "http_status_code": 0,
  "content_type": "string",
  "content_length": 0,
  "domain": "string",
  "screenshot_url": "string",
  "access_count": 0,
  "last_accessed_at": "2019-08-24T14:15:22Z",
  "metadata": {}
}

```

LinkInfoRead

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|id|string(uuid)|true|none|Id|none|
|tenant_id|string(uuid)|true|none|Tenant Id|none|
|created_at|string(date-time)|true|none|Created At|none|
|updated_at|string(date-time)|true|none|Updated At|none|
|original_url|string|true|none|Original Url|原始URL|
|processed_url|any|false|none|Processed Url|处理后URL|

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
|title|any|false|none|Title|页面标题|

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
|description|any|false|none|Description|页面描述|

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
|favicon_url|any|false|none|Favicon Url|网站图标|

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
|link_type|string|false|none|Link Type|链接类型|
|status|[LinkStatus](#schemalinkstatus)|true|none||链接状态|
|last_validated_at|any|false|none|Last Validated At|最后验证时间|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string(date-time)|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|validation_error|any|false|none|Validation Error|验证错误信息|

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
|http_status_code|any|false|none|Http Status Code|HTTP状态码|

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
|content_type|any|false|none|Content Type|MIME类型|

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
|content_length|any|false|none|Content Length|内容长度|

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
|domain|any|false|none|Domain|域名|

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
|screenshot_url|any|false|none|Screenshot Url|截图URL|

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
|access_count|integer|false|none|Access Count|访问次数|
|last_accessed_at|any|false|none|Last Accessed At|最后访问时间|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|string(date-time)|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

continued

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|metadata|any|false|none|Metadata|扩展元数据|

anyOf

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|object|false|none||none|

or

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» *anonymous*|null|false|none||none|

<h2 id="tocS_Visibility">Visibility</h2>

<a id="schemavisibility"></a>
<a id="schema_Visibility"></a>
<a id="tocSvisibility"></a>
<a id="tocsvisibility"></a>

```json
"PUBLIC"

```

Visibility

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|Visibility|string|false|none|Visibility|笔记可见性枚举|

#### 枚举值

|属性|值|
|---|---|
|Visibility|PUBLIC|
|Visibility|FRIENDS|
|Visibility|PRIVATE|

