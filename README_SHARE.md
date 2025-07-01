# 微信小程序分享功能完整指南

## 功能概述

nkuwiki小程序现已全面支持分享功能，包括：
- **帖子详情分享**：智能生成包含帖子信息的分享卡片
- **应用页面分享**：首页、发现页、搜索页等主要页面的分享
- **用户资料分享**：个人主页和用户详情页的分享
- **URL Link生成**：用于微信内直接跳转的链接
- **朋友圈分享**：支持分享到微信朋友圈

## 技术架构

### 1. 双重分享机制

#### URL Link机制（后端生成）
- **位置**: `cloudfunctions/generateUrlLink/`
- **用途**: 生成微信官方的小程序链接，可在微信内直接跳转
- **集成**: 发帖时自动生成并存储到数据库

#### 小程序原生分享（前端处理）
- **位置**: 各页面的`onShareAppMessage`和`onShareTimeline`方法
- **用途**: 用户主动分享时的内容定制
- **优势**: 响应速度快，内容个性化

### 2. 分享工具库

**文件位置**: `utils/share.js`

**核心函数**:
```javascript
// 生成帖子分享内容
generatePostShareContent(post, options)

// 生成朋友圈分享内容
generateTimelineShareContent(post, options)

// 生成通用页面分享内容
generatePageShareContent(pageInfo)

// 获取当前页面路径
getCurrentPagePath()

// 创建分享混入对象
createShareMixin(config)
```

## 页面分享功能详解

### 1. 帖子详情页 (`pages/post/detail/detail.js`)

**分享特性**:
- 自动提取帖子标题、作者、图片
- 智能截断过长标题
- 优先使用帖子内图片作为分享图
- 分享路径包含帖子ID，确保准确跳转

**分享内容示例**:
```
标题: "南开大学新生指南攻略... - @张同学"
路径: "/pages/post/detail/detail?id=123"
图片: 帖子中的第一张图片或默认logo
```

### 2. 首页 (`pages/index/index.js`)

**分享特性**:
- 展示应用的核心价值
- 统一的品牌形象
- 引导新用户了解平台

**分享内容**:
```
标题: "nkuwiki - 南开校园知识分享"
描述: "南开大学校园知识分享平台，汇聚学习交流、校园生活、就业创业等优质内容"
```

### 3. 发现页 (`pages/discover/discover.js`)

**分享特性**:
- 包含当前日期的洞察信息
- 突出每日更新的特色
- 吸引用户了解校园动态

**分享内容示例**:
```
标题: "nkuwiki 每日洞察 2024-01-15 - 发现校园新动态"
描述: "了解南开校园最新动态，发现官方资讯、社区热点和集市活动"
```

### 4. 搜索页 (`pages/search/search.js`)

**分享特性**:
- 根据搜索类型动态调整内容
- 包含搜索关键词信息
- 区分RAG问答和普通搜索

**分享内容示例**:
```javascript
// 普通搜索
"nkuwiki 帖子搜索 \"学习方法\" - 发现更多精彩内容"

// RAG问答
"nkuwiki问答 \"如何选课\" - 南开小知为你解答"

// 知识库搜索  
"nkuwiki 知识库搜索 \"奖学金\" - 发现更多精彩内容"
```

### 5. 用户详情页 (`pages/user/user.js`)

**分享特性**:
- 展示用户昵称、头像、简介
- 个性化的分享内容
- 引导关注优质用户

**分享内容示例**:
```
标题: "李同学的个人主页 - nkuwiki"
描述: "计算机专业，热爱技术分享 | 在nkuwiki分享校园知识"
图片: 用户头像
```

### 6. 个人中心页 (`pages/profile/profile.js`)

**分享特性**:
- 区分自己和他人的资料分享
- 自己的资料用第一人称表达
- 他人资料用第三人称表达

**分享内容示例**:
```javascript
// 分享自己的资料
"我在nkuwiki分享校园知识 - 王同学"

// 分享他人资料
"李同学的个人主页 - nkuwiki"
```

## 朋友圈分享特色

### 1. 更长的标题支持
朋友圈分享支持更长的标题（50字符 vs 30字符），可以包含更多信息。

### 2. 个性化表达
针对朋友圈的社交特性，采用更加个人化的表达方式：
```javascript
// 帖子分享到朋友圈
"南开大学新生指南攻略 | 张同学 在nkuwiki分享"

// 用户资料分享到朋友圈
"张同学：计算机专业，热爱技术分享 | 我在nkuwiki分享校园知识"
```

### 3. Query参数支持
朋友圈分享通过query参数传递信息，确保点击后能正确跳转到相关页面。

## 分享内容优化策略

### 1. 智能标题截断
```javascript
// 帖子标题过长时智能截断
let shareTitle = post.title || '南开校园分享';
if (shareTitle.length > maxTitleLength) {
  shareTitle = shareTitle.substring(0, maxTitleLength - 3) + '...';
}
```

### 2. 图片优先级
1. 帖子中的第一张图片
2. 用户头像（用户相关页面）
3. 应用默认logo (`/icons/logo.png`)

### 3. 内容层次化
- **主标题**：核心信息（帖子标题、页面名称）
- **副标题**：补充信息（作者、类型）
- **描述**：详细说明（简介、平台介绍）

## 开发指南

### 1. 为新页面添加分享功能

```javascript
// 1. 导入分享工具
const { generatePageShareContent } = require('../../utils/index');

// 2. 添加分享方法
onShareAppMessage(res) {
  return generatePageShareContent({
    title: '页面标题',
    path: '/pages/example/example',
    imageUrl: '/icons/logo.png',
    desc: '页面描述'
  });
},

onShareTimeline() {
  return {
    title: '朋友圈标题',
    query: '',
    imageUrl: '/icons/logo.png'
  };
}
```

### 2. 使用分享混入（Mixin）

```javascript
const { createShareMixin } = require('../../utils/index');

Page({
  // 其他页面配置
  
  // 混入分享功能
  ...createShareMixin({
    generateContent(res) {
      // 自定义分享内容生成逻辑
      return {
        title: '自定义标题',
        path: '/pages/custom/custom',
        imageUrl: '/icons/logo.png'
      };
    }
  })
});
```

### 3. 测试分享功能

**测试URL Link生成**:
```javascript
const { testGenerateUrlLink } = require('../../utils/test_urllink');

// 测试生成url_link
await testGenerateUrlLink('test_post_id');
```

**测试分享内容**:
1. 在微信开发者工具中打开页面
2. 点击模拟器右上角的分享按钮
3. 检查分享卡片的标题、图片、路径是否正确

## 最佳实践

### 1. 分享内容要求
- **标题简洁有力**：30字符内，突出核心信息
- **描述详细准确**：补充必要的背景信息
- **图片高质量**：优先使用内容相关的图片
- **路径准确性**：确保分享链接能正确跳转

### 2. 用户体验优化
- **加载速度**：分享内容生成要快速响应
- **内容相关性**：分享内容要与页面内容高度相关
- **个性化**：根据用户身份调整分享内容
- **一致性**：保持品牌形象和表达方式一致

### 3. 错误处理
```javascript
onShareAppMessage(res) {
  try {
    // 分享内容生成逻辑
    return generateShareContent();
  } catch (e) {
    logger.error('生成分享内容失败', e);
    // 返回默认分享内容
    return generatePageShareContent();
  }
}
```

## 监控与优化

### 1. 分享数据追踪
- 分享次数统计
- 分享渠道分析（微信好友 vs 朋友圈）
- 分享内容点击率

### 2. 持续优化
- A/B测试不同的分享标题
- 优化分享图片的选择策略
- 根据用户反馈调整分享内容

## 注意事项

### 1. 微信限制
- 分享标题不能过长
- 分享图片要符合微信规范
- URL Link有生成频率限制

### 2. 权限要求
- 小程序需要有生成URL Link的权限
- 朋友圈分享需要在小程序管理后台开启

### 3. 兼容性
- 不同微信版本对分享功能的支持可能不同
- 需要做好降级处理

通过这套完整的分享功能，nkuwiki用户可以轻松地将优质内容分享给朋友，促进知识的传播和平台的增长。 