# 经验值与等级模块 API 文档

## 说明

- 用户在登录时，后端应自动读取其当前经验值，并根据下方等级区间推算出对应等级。
- 等级区间如下：
  - LV0：0
  - LV1：1-50
  - LV2：51-200
  - LV3：201-450
  - LV4：451-900
  - LV5：901-1500
  - LV6：1501-3000
  - LV7：3001及以上
- 经验值的增加规则：
  1. 每日登录 +2（每天仅可获得一次）
  2. 自己的帖子被点赞，每次 +1
  3. 评论他人帖子，每日仅可获得一次 +3

---

## 1. 获取用户等级信息

- **接口描述**：获取当前用户的经验值、等级、升级进度及等级规则等信息。
- **请求方式**：`GET`
- **请求路径**：`/wxapp/level/info`
- **请求参数**：

| 参数名 | 类型   | 必填 | 说明         | 位置   |
| ------ | ------ | ---- | ------------ | ------ |
| token  | string | 是   | 用户登录凭证 | Header |

- **响应参数**：

| 字段名           | 类型     | 说明                       |
| ---------------- | -------- | -------------------------- |
| level            | number   | 当前等级（0-7）            |
| exp              | number   | 当前经验值                 |
| next_level_exp   | number   | 升级到下一级所需总经验值   |
| prev_level_exp   | number   | 上一级所需总经验值         |
| progress         | number   | 当前等级进度百分比（0-100）|
| level_name       | string   | 当前等级名称（如LV3）      |
| next_level_name  | string   | 下一级等级名称             |
| rules            | Rule[]   | 等级规则列表（见下方说明） |

#### Rule 结构

| 字段名     | 类型   | 说明         |
| ---------- | ------ | ------------ |
| level      | number | 等级         |
| name       | string | 等级名称     |
| min_exp    | number | 达到该等级所需最小经验值 |
| max_exp    | number | 该等级最大经验值（不含） |

- **响应示例**：

```json
{
  "level": 3,
  "exp": 220,
  "next_level_exp": 451,
  "prev_level_exp": 201,
  "progress": 13,
  "level_name": "LV3",
  "next_level_name": "LV4",
  "rules": [
    { "level": 0, "name": "LV0", "min_exp": 0, "max_exp": 1 },
    { "level": 1, "name": "LV1", "min_exp": 1, "max_exp": 51 },
    { "level": 2, "name": "LV2", "min_exp": 51, "max_exp": 201 },
    { "level": 3, "name": "LV3", "min_exp": 201, "max_exp": 451 },
    { "level": 4, "name": "LV4", "min_exp": 451, "max_exp": 901 },
    { "level": 5, "name": "LV5", "min_exp": 901, "max_exp": 1501 },
    { "level": 6, "name": "LV6", "min_exp": 1501, "max_exp": 3001 },
    { "level": 7, "name": "LV7", "min_exp": 3001, "max_exp": null }
  ]
}
```

---

## 2. 获取经验值明细（成长记录）

- **接口描述**：分页获取当前用户的经验值获取明细（如发帖、评论、签到等）。
- **请求方式**：`GET`
- **请求路径**：`/wxapp/level/records`
- **请求参数**：

| 参数名 | 类型   | 必填 | 说明         | 位置   |
| ------ | ------ | ---- | ------------ | ------ |
| token  | string | 是   | 用户登录凭证 | Header |
| page   | number | 否   | 页码，默认1  | Query  |
| size   | number | 否   | 每页数量，默认20 | Query  |

- **响应参数**：

| 字段名     | 类型         | 说明           |
| ---------- | ------------ | -------------- |
| list       | Record[]     | 经验明细列表   |
| total      | number       | 总条数         |
| page       | number       | 当前页码       |
| size       | number       | 每页数量       |

#### Record 结构

| 字段名     | 类型   | 说明         |
| ---------- | ------ | ------------ |
| id         | number | 记录ID       |
| type       | string | 获得经验类型（如 daily_login、post_liked、comment_others）|
| desc       | string | 说明         |
| exp        | number | 获得/扣除经验值（正为获得，负为扣除）|
| created_at | string | 时间（ISO8601）|

- **响应示例**：

```json
{
  "list": [
    { "id": 1, "type": "daily_login", "desc": "每日登录", "exp": 2, "created_at": "2024-07-24T12:00:00Z" },
    { "id": 2, "type": "post_liked", "desc": "帖子被点赞", "exp": 1, "created_at": "2024-07-24T13:00:00Z" },
    { "id": 3, "type": "comment_others", "desc": "评论他人帖子", "exp": 3, "created_at": "2024-07-24T14:00:00Z" }
  ],
  "total": 3,
  "page": 1,
  "size": 20
}
```

---

## 3. 经验值规则说明

- **接口描述**：获取所有经验值获取/扣除的规则说明。
- **请求方式**：`GET`
- **请求路径**：`/wxapp/level/rules`
- **请求参数**：无

- **响应参数**：

| 字段名     | 类型         | 说明           |
| ---------- | ------------ | -------------- |
| rules      | RuleDetail[] | 规则列表       |

#### RuleDetail 结构

| 字段名     | 类型   | 说明         |
| ---------- | ------ | ------------ |
| type       | string | 行为类型（如 daily_login、post_liked、comment_others）|
| desc       | string | 行为说明     |
| exp        | number | 获得/扣除经验值 |
| limit      | string | 限制说明（如“每日一次”）|

- **响应示例**：

```json
{
  "rules": [
    { "type": "daily_login", "desc": "每日登录", "exp": 2, "limit": "每日一次" },
    { "type": "post_liked", "desc": "自己的帖子被点赞", "exp": 1, "limit": "每次" },
    { "type": "comment_others", "desc": "评论他人帖子", "exp": 3, "limit": "每日一次" }
  ]
}
```

---

## 备注

- 所有接口需校验用户身份（token）。
- 经验值、等级、规则等需与前端页面展示字段一一对应。
- 用户登录时应自动返回经验值与等级。
- 若有升级事件发生，建议通过消息推送或接口返回升级提示。

---

如需补充“升级提示”或“主动领取奖励”等功能，可再补充接口。
如需更详细的字段或交互说明，请告知！ 