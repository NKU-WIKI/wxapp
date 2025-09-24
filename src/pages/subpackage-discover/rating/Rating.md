# Rating API 完整文档

## 概述

Rating API 是 Blockbond 平台的评分系统核心接口，支持对各种资源类型进行多维度评分，包括课程、美食、游戏、娱乐、生活服务、运动健身等。系统采用1-5星评分制，支持匿名评分、标签系统、有用性投票等功能。

## 核心特性

- **多资源类型支持**：课程、美食、游戏、娱乐、生活、运动、其他
- **1-5星评分制**：直观的星级评分系统
- **匿名评分**：支持用户匿名发表评分
- **标签系统**：预设标签 + 自定义标签
- **有用性投票**：用户可以对评分进行有用/无用投票
- **实时统计**：自动计算平均分、分数分布等统计信息
- **内容审核**：集成敏感词过滤和内容审核
- **多租户隔离**：严格的数据隔离和权限控制

## 数据模型

### 1. Rating（评分主表）

| 字段名          | 类型        | 必填 | 描述           | 示例                                   |
| --------------- | ----------- | ---- | -------------- | -------------------------------------- |
| id              | UUID        | 是   | 评分唯一标识   | `550e8400-e29b-41d4-a716-446655440000` |
| tenant_id       | UUID        | 是   | 租户ID         | `f6303899-a51a-460a-9cd8-fe35609151eb` |
| rater_id        | UUID        | 是   | 评分者用户ID   | `8d963d2a-7672-4b4a-9a6a-b3605d0b2d52` |
| resource_type   | String(50)  | 是   | 资源类型       | `course`, `food`, `game`               |
| resource_id     | String(255) | 是   | 资源ID         | `math_101`, `restaurant_123`           |
| score           | Integer     | 是   | 评分（1-5星）  | `5`                                    |
| comment         | Text        | 否   | 评分评论       | `"课程内容很好，讲解清晰"`             |
| is_anonymous    | Boolean     | 否   | 是否匿名评分   | `false`                                |
| is_verified     | Boolean     | 否   | 是否为验证评分 | `false`                                |
| is_featured     | Boolean     | 否   | 是否为精选评分 | `false`                                |
| is_hidden       | Boolean     | 否   | 是否隐藏       | `false`                                |
| helpful_count   | Integer     | 否   | 有用投票数     | `10`                                   |
| unhelpful_count | Integer     | 否   | 无用投票数     | `2`                                    |
| tags            | JSON        | 否   | 评分标签       | `["内容丰富", "讲解清晰"]`             |
| evidence_urls   | JSON        | 否   | 证据图片链接   | `["https://example.com/image1.jpg"]`   |
| extra_data      | JSON        | 否   | 额外元数据     | `{"platform": "web"}`                  |
| created_at      | DateTime    | 是   | 创建时间       | `2024-01-15T10:30:00Z`                 |
| updated_at      | DateTime    | 是   | 更新时间       | `2024-01-15T10:30:00Z`                 |

### 2. RatingAggregate（评分聚合统计表）

| 字段名             | 类型        | 必填 | 描述         | 示例                                   |
| ------------------ | ----------- | ---- | ------------ | -------------------------------------- |
| id                 | UUID        | 是   | 聚合记录ID   | `550e8400-e29b-41d4-a716-446655440001` |
| tenant_id          | UUID        | 是   | 租户ID       | `f6303899-a51a-460a-9cd8-fe35609151eb` |
| resource_type      | String(50)  | 是   | 资源类型     | `course`                               |
| resource_id        | String(255) | 是   | 资源ID       | `math_101`                             |
| total_count        | Integer     | 否   | 总评分数     | `150`                                  |
| average_score      | Float       | 否   | 平均分       | `4.2`                                  |
| weighted_score     | Float       | 否   | 加权平均分   | `4.3`                                  |
| score_1_count      | Integer     | 否   | 1星数量      | `5`                                    |
| score_2_count      | Integer     | 否   | 2星数量      | `10`                                   |
| score_3_count      | Integer     | 否   | 3星数量      | `20`                                   |
| score_4_count      | Integer     | 否   | 4星数量      | `60`                                   |
| score_5_count      | Integer     | 否   | 5星数量      | `55`                                   |
| verified_count     | Integer     | 否   | 验证评分数   | `112`                                  |
| featured_count     | Integer     | 否   | 精选评分数   | `15`                                   |
| with_comment_count | Integer     | 否   | 有评论评分数 | `120`                                  |
| latest_rating_at   | String      | 否   | 最新评分时间 | `2024-01-15T10:30:00Z`                 |
| trend_data         | JSON        | 否   | 趋势统计数据 | `{"monthly": {...}}`                   |

### 3. RatingHelpfulness（评分有用性投票表）

| 字段名     | 类型        | 必填 | 描述         | 示例                                   |
| ---------- | ----------- | ---- | ------------ | -------------------------------------- |
| id         | UUID        | 是   | 投票ID       | `550e8400-e29b-41d4-a716-446655440002` |
| tenant_id  | UUID        | 是   | 租户ID       | `f6303899-a51a-460a-9cd8-fe35609151eb` |
| voter_id   | UUID        | 是   | 投票者ID     | `8d963d2a-7672-4b4a-9a6a-b3605d0b2d52` |
| rating_id  | UUID        | 是   | 被投票评分ID | `550e8400-e29b-41d4-a716-446655440000` |
| is_helpful | Boolean     | 是   | 是否有用     | `true`                                 |
| reason     | String(255) | 否   | 投票原因     | `"评分详细客观"`                       |
| created_at | DateTime    | 是   | 创建时间     | `2024-01-15T10:30:00Z`                 |
| updated_at | DateTime    | 是   | 更新时间     | `2024-01-15T10:30:00Z`                 |

## API 端点

### 基础路径

```
/api/v1/ratings
```

### 认证要求

所有接口都需要 JWT 认证，在请求头中携带：

```
Authorization: Bearer <jwt_token>
```

---

## 1. 评分CRUD操作

### 1.1 创建评分

**接口**: `POST /api/v1/ratings`

**描述**: 创建新的评分记录

**请求体**:

```json
{
  "resource_type": "course",
  "resource_id": "math_101",
  "score": 5,
  "comment": "课程内容很好，讲解清晰",
  "is_anonymous": false,
  "tags": ["内容丰富", "讲解清晰"],
  "evidence_urls": ["https://example.com/image1.jpg"]
}
```

**字段说明**:

- `resource_type` (必填): 资源类型，支持：`course`, `food`, `game`, `entertainment`, `life`, `sport`, `other`
- `resource_id` (必填): 资源唯一标识
- `score` (必填): 评分，范围1-5
- `comment` (可选): 评分评论，最大1000字符
- `is_anonymous` (可选): 是否匿名，默认false
- `tags` (可选): 评分标签数组
- `evidence_urls` (可选): 证据图片/文件链接数组

**响应示例**:

```json
{
  "code": 0,
  "message": "评分创建成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "f6303899-a51a-460a-9cd8-fe35609151eb",
    "rater_id": "8d963d2a-7672-4b4a-9a6a-b3605d0b2d52",
    "resource_type": "course",
    "resource_id": "math_101",
    "score": 5,
    "comment": "课程内容很好，讲解清晰",
    "is_anonymous": false,
    "is_verified": false,
    "is_featured": false,
    "is_hidden": false,
    "helpful_count": 0,
    "unhelpful_count": 0,
    "tags": ["内容丰富", "讲解清晰"],
    "evidence_urls": ["https://example.com/image1.jpg"],
    "extra_data": null,
    "rater_nickname": "nankai_user",
    "rater_avatar": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**业务规则**:

- 每个用户对同一资源只能评分一次
- 评分范围：1-5星
- 评论最大长度：1000字符
- 支持匿名评分但需要记录评分者ID
- 创建后会自动更新聚合统计

**错误码**:

- `409`: 用户已对此资源评分
- `400`: 内容包含不当词汇
- `422`: 参数验证失败

---

### 1.2 获取评分详情

**接口**: `GET /api/v1/ratings/{rating_id}`

**描述**: 获取指定评分的详细信息

**路径参数**:

- `rating_id`: 评分ID (UUID)

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_id": "f6303899-a51a-460a-9cd8-fe35609151eb",
    "rater_id": "8d963d2a-7672-4b4a-9a6a-b3605d0b2d52",
    "resource_type": "course",
    "resource_id": "math_101",
    "score": 5,
    "comment": "课程内容很好，讲解清晰",
    "is_anonymous": false,
    "is_verified": false,
    "is_featured": false,
    "is_hidden": false,
    "helpful_count": 10,
    "unhelpful_count": 2,
    "tags": ["内容丰富", "讲解清晰"],
    "evidence_urls": ["https://example.com/image1.jpg"],
    "extra_data": null,
    "rater_nickname": "nankai_user",
    "rater_avatar": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**错误码**:

- `404`: 评分不存在

---

### 1.3 更新评分

**接口**: `PUT /api/v1/ratings/{rating_id}`

**描述**: 更新已有评分

**路径参数**:

- `rating_id`: 评分ID (UUID)

**请求体**:

```json
{
  "score": 4,
  "comment": "更新后的评论内容",
  "tags": ["更新标签"]
}
```

**字段说明**:

- `score` (可选): 评分，范围1-5
- `comment` (可选): 评分评论，最大1000字符
- `is_anonymous` (可选): 是否匿名
- `tags` (可选): 评分标签数组
- `evidence_urls` (可选): 证据图片/文件链接数组

**响应示例**:

```json
{
  "code": 0,
  "message": "评分更新成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "score": 4,
    "comment": "更新后的评论内容",
    "tags": ["更新标签"],
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**业务规则**:

- 只能更新自己创建的评分
- 更新后会重新计算聚合统计
- 支持部分字段更新

**错误码**:

- `404`: 评分不存在
- `403`: 权限不足（不是评分创建者）
- `400`: 内容包含不当词汇

---

### 1.4 删除评分

**接口**: `DELETE /api/v1/ratings/{rating_id}`

**描述**: 删除评分

**路径参数**:

- `rating_id`: 评分ID (UUID)

**响应示例**:

```json
{
  "code": 0,
  "message": "评分删除成功",
  "data": true
}
```

**业务规则**:

- 只能删除自己创建的评分
- 删除后会重新计算聚合统计
- 删除操作不可撤销

**错误码**:

- `404`: 评分不存在
- `403`: 权限不足

---

## 2. 评分查询和列表

### 2.1 获取资源评分列表

**接口**: `GET /api/v1/ratings/resources/{resource_type}/{resource_id}`

**描述**: 获取指定资源的评分列表

**路径参数**:

- `resource_type`: 资源类型
- `resource_id`: 资源ID

**查询参数**:

- `dimension` (可选): 评分维度筛选
- `min_score` (可选): 最低评分筛选，范围1-5
- `max_score` (可选): 最高评分筛选，范围1-5
- `is_verified` (可选): 是否验证评分筛选
- `is_featured` (可选): 是否精选评分筛选
- `has_comment` (可选): 是否有评论筛选
- `sort_by` (可选): 排序字段，默认`created_at`
- `sort_order` (可选): 排序方向，默认`desc`
- `skip` (可选): 跳过数量，默认0
- `limit` (可选): 返回数量，默认20，最大100

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "rater_id": "8d963d2a-7672-4b4a-9a6a-b3605d0b2d52",
        "resource_type": "course",
        "resource_id": "math_101",
        "score": 5,
        "comment": "课程内容很好，讲解清晰",
        "is_anonymous": false,
        "tags": ["内容丰富", "讲解清晰"],
        "helpful_count": 10,
        "unhelpful_count": 2,
        "rater_nickname": "nankai_user",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "skip": 0,
    "limit": 20
  }
}
```

**使用场景**:

- 商品详情页显示用户评价
- 服务评价页面
- 用户评分历史查看

---

### 2.2 按标签搜索评分

**接口**: `GET /api/v1/ratings/search`

**描述**: 按标签搜索评分

**查询参数**:

- `tags` (必填): 搜索标签，多个标签用逗号分隔
- `resource_type` (可选): 资源类型筛选
- `skip` (可选): 跳过条数，默认0
- `limit` (可选): 返回条数，默认20，最大100

**请求示例**:

```
GET /api/v1/ratings/search?tags=味道好,服务佳&resource_type=food&skip=0&limit=20
```

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 45,
    "skip": 0,
    "limit": 20,
    "searched_tags": ["味道好", "服务佳"]
  }
}
```

**搜索逻辑**:

- 支持多标签搜索（OR逻辑，匹配任一标签即可）
- 支持按资源类型进一步筛选
- 结果按相关性和创建时间排序

---

### 2.3 获取我的评分列表

**接口**: `GET /api/v1/ratings/me`

**描述**: 获取当前用户的评分列表

**查询参数**:

- `resource_type` (可选): 资源类型筛选
- `skip` (可选): 跳过数量，默认0
- `limit` (可选): 返回数量，默认20

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 25,
    "skip": 0,
    "limit": 20
  }
}
```

**使用场景**:

- 用户查看自己的评分历史
- 评分管理页面
- 用户评分统计

---

## 3. 评分统计

### 3.1 获取资源评分统计

**接口**: `GET /api/v1/ratings/resources/{resource_type}/{resource_id}/statistics`

**描述**: 获取指定资源的评分统计信息

**路径参数**:

- `resource_type`: 资源类型
- `resource_id`: 资源ID

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "resource_type": "product",
    "resource_id": "prod_123",
    "total_ratings": 150,
    "average_score": 4.2,
    "dimension_stats": {
      "overall": { "count": 150, "average": 4.2 }
    },
    "score_distribution": {
      "1": 5,
      "2": 10,
      "3": 20,
      "4": 60,
      "5": 55
    },
    "monthly_trend": [
      {
        "month": "2024-01",
        "count": 45,
        "average": 4.1
      },
      {
        "month": "2024-02",
        "count": 52,
        "average": 4.3
      }
    ],
    "verified_percentage": 75.0,
    "comment_percentage": 80.0
  }
}
```

**统计内容**:

- 总评分数和平均分
- 分数分布（1-5星各有多少）
- 月度评分趋势
- 验证评分和有评论评分占比

**使用场景**:

- 商品评分概览
- 服务质量仪表板
- 用户满意度分析
- 数据报表生成

---

## 4. 批量操作

### 4.1 批量创建评分

**接口**: `POST /api/v1/ratings/batch`

**描述**: 批量创建多个评分

**请求体**:

```json
{
  "ratings": [
    {
      "resource_type": "product",
      "resource_id": "prod_123",
      "score": 5,
      "comment": "很好的商品"
    },
    {
      "resource_type": "product",
      "resource_id": "prod_124",
      "score": 4,
      "comment": "还不错"
    }
  ]
}
```

**响应示例**:

```json
{
  "code": 0,
  "message": "批量创建完成：成功1个，失败1个",
  "data": {
    "success_count": 1,
    "failed_count": 1,
    "total_count": 2,
    "success_ids": ["550e8400-e29b-41d4-a716-446655440000"],
    "errors": ["Product prod_124 not found"]
  }
}
```

**使用场景**:

- 导入历史评分数据
- 批量评分操作
- 数据迁移

**注意事项**:

- 部分成功时会返回详细的错误信息
- 每个评分仍需遵循业务规则
- 建议分批处理大量数据

---

## 5. 有用性投票

### 5.1 评分有用性投票

**接口**: `POST /api/v1/ratings/helpfulness`

**描述**: 对评分进行有用性投票

**请求体**:

```json
{
  "rating_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_helpful": true,
  "reason": "评分详细客观"
}
```

**字段说明**:

- `rating_id` (必填): 被投票评分ID
- `is_helpful` (必填): 是否有用（true=有用，false=无用）
- `reason` (可选): 投票原因，最大255字符

**响应示例**:

```json
{
  "code": 0,
  "message": "投票成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "voter_id": "8d963d2a-7672-4b4a-9a6a-b3605d0b2d52",
    "rating_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_helpful": true,
    "reason": "评分详细客观",
    "voter_nickname": "nankai_user",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**投票规则**:

- 不能对自己的评分投票
- 每个用户对同一评分只能投票一次
- 可以修改之前的投票
- 投票会影响评分的有用性统计

**使用场景**:

- 帮助其他用户识别有价值的评分
- 提升评分系统的整体质量
- 优质评分排序依据

---

## 6. 元数据和配置

### 6.1 获取评分类型列表

**接口**: `GET /api/v1/ratings/types`

**描述**: 获取支持的评分类型列表

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "value": "course",
      "label": "学习",
      "description": "课程、教材、学习资源评分"
    },
    {
      "value": "food",
      "label": "美食",
      "description": "餐厅、菜品、美食推荐评分"
    },
    {
      "value": "game",
      "label": "游戏",
      "description": "游戏、游戏攻略、游戏设备评分"
    },
    {
      "value": "entertainment",
      "label": "娱乐",
      "description": "影视、音乐、娱乐活动评分"
    },
    {
      "value": "life",
      "label": "生活",
      "description": "生活服务、日用品、生活技巧评分"
    },
    {
      "value": "sport",
      "label": "运动",
      "description": "运动场所、体育用品、健身课程评分"
    },
    {
      "value": "other",
      "label": "其他",
      "description": "不属于以上分类的内容评分"
    }
  ]
}
```

**使用场景**:

- 前端下拉选择组件
- 评分类型验证
- 系统配置界面

---

### 6.2 获取评分标签

**接口**: `GET /api/v1/ratings/tags`

**描述**: 获取指定资源类型的评分标签

**查询参数**:

- `resource_type` (必填): 资源类型

**响应示例**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "resource_type": "course",
    "preset_tags": ["内容丰富", "讲解清晰", "实用性强", "难度适中", "课件完整", "老师负责"],
    "popular_tags": ["值得推荐", "课件完整", "老师负责"]
  }
}
```

**标签类型**:

- **预设标签**: 系统为该资源类型预定义的常用标签
- **热门标签**: 用户使用频率较高的标签

**支持的资源类型**:

- `course`: 学习课程
- `food`: 美食餐饮
- `game`: 游戏娱乐
- `entertainment`: 影音娱乐
- `life`: 生活服务
- `sport`: 运动健身
- `other`: 其他内容

---

## 7. 预设标签配置

### 7.1 课程评分标签

```json
{
  "course": ["内容丰富", "讲解清晰", "实用性强", "难度适中", "课件完整", "老师负责"]
}
```

### 7.2 美食评分标签

```json
{
  "food": ["味道好", "性价比高", "环境舒适", "服务周到", "分量足", "新鲜"]
}
```

### 7.3 游戏评分标签

```json
{
  "game": ["画面精美", "操作流畅", "剧情有趣", "创意十足", "耐玩性强", "音效棒"]
}
```

### 7.4 娱乐评分标签

```json
{
  "entertainment": ["制作精良", "演技出色", "剧情吸引", "视觉效果", "音响效果", "值得重看"]
}
```

### 7.5 生活服务标签

```json
{
  "life": ["质量好", "性价比高", "包装精美", "发货快", "服务好", "实用"]
}
```

### 7.6 运动健身标签

```json
{
  "sport": ["设施完备", "环境好", "教练专业", "价格合理", "位置便利", "氛围佳"]
}
```

### 7.7 其他内容标签

```json
{
  "other": ["质量好", "实用性强", "设计美观", "功能齐全", "易于使用", "值得推荐"]
}
```

---

## 8. 错误码说明

### 8.1 HTTP状态码

- `200`: 请求成功
- `400`: 请求参数错误或业务规则违反
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突（如重复评分）
- `422`: 参数验证失败
- `500`: 服务器内部错误

### 8.2 业务错误码

- `1001`: 参数验证失败
- `1002`: 内容包含不当词汇
- `2001`: 用户已对此资源评分
- `2002`: 只能修改自己的评分
- `2003`: 不能对自己的评分投票
- `3001`: 评分不存在
- `4001`: 资源类型不支持

---

## 9. 使用示例

### 9.1 创建课程评分

```bash
curl -X POST "http://localhost:8001/api/v1/ratings" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resource_type": "course",
    "resource_id": "math_101",
    "score": 5,
    "comment": "课程内容很好，讲解清晰",
    "is_anonymous": false,
    "tags": ["内容丰富", "讲解清晰"]
  }'
```

### 9.2 获取商品评分列表

```bash
curl -X GET "http://localhost:8001/api/v1/ratings/resources/product/prod_123?limit=10&sort_by=created_at&sort_order=desc" \
  -H "Authorization: Bearer <jwt_token>"
```

### 9.3 获取评分统计

```bash
curl -X GET "http://localhost:8001/api/v1/ratings/resources/product/prod_123/statistics" \
  -H "Authorization: Bearer <jwt_token>"
```

### 9.4 对评分投票

```bash
curl -X POST "http://localhost:8001/api/v1/ratings/helpfulness" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_helpful": true,
    "reason": "评分详细客观"
  }'
```

---

## 10. 最佳实践

### 10.1 前端集成

- 使用预设标签提升用户体验
- 实现评分预览功能
- 支持图片上传作为证据
- 实现评分搜索和筛选

### 10.2 性能优化

- 使用分页加载大量评分数据
- 缓存评分统计信息
- 异步更新聚合统计数据
- 合理使用数据库索引

### 10.3 安全考虑

- 内容审核防止不当内容
- 用户权限验证
- 防止评分刷量
- 敏感信息脱敏

### 10.4 监控告警

- 评分创建频率监控
- 异常评分检测
- 系统性能监控
- 用户行为分析

---

## 11. 常见问题

### 11.1 评分重复问题

**Q**: 用户对同一资源多次评分怎么办？
**A**: 系统会返回409错误，提示用户已评分。用户需要先删除或更新现有评分。

### 11.2 匿名评分处理

**Q**: 匿名评分如何保护用户隐私？
**A**: 匿名评分在显示时隐藏评分者信息，但系统内部仍记录评分者ID用于权限控制。

### 11.3 评分统计更新

**Q**: 评分统计多久更新一次？
**A**: 评分统计在每次评分操作后实时更新，确保数据一致性。

### 11.4 标签管理

**Q**: 如何添加新的评分标签？
**A**: 系统支持自定义标签，用户可以在评分时输入任意标签，系统会记录并统计使用频率。

---

## 12. 更新日志

### v1.0.0 (2024-01-15)

- 初始版本发布
- 支持基础评分CRUD操作
- 支持多资源类型评分
- 支持标签系统和有用性投票
- 集成内容审核功能

---

## 13. 技术支持

如有技术问题或建议，请联系开发团队或提交Issue。

**文档版本**: v1.0.0  
**最后更新**: 2024-01-15  
**维护团队**: Blockbond开发团队
