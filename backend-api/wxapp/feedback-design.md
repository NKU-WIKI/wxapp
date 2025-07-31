# 意见反馈功能前后端交互设计

## 概述

本文档详细说明了意见反馈功能的前后端交互设计，基于后端 `Feedback` 模型和前端实现，确保数据流转的完整性和一致性。

## 数据模型设计

### 后端 Feedback 模型 (wxapp.py)

```python
class Feedback(BaseTimeStamp):
    id: int                    # 反馈ID，自增唯一标识
    content: str               # 反馈内容，用户输入的详细描述
    type: str                  # 反馈类型：bug-功能异常, ux-体验问题, suggest-产品建议, other-其他
    contact: Optional[str]     # 联系方式（可选）
    image: List[str]           # 图片URL列表，无图片时为空列表
    device_info: Optional[DeviceInfo]  # 设备信息（可选）
    version: Optional[str]     # 应用版本号
    status: str                # 反馈状态：pending-待处理, processing-处理中, resolved-已解决, rejected-已拒绝
    admin_reply: Optional[str] # 管理员回复（可选）
    admin_id: Optional[str]    # 处理管理员ID（可选）
```

### 前端类型定义 (feedback.d.ts)

```typescript
export interface CreateFeedbackParams {
  content: string;
  type: 'bug' | 'ux' | 'suggest' | 'other';
  contact?: string;
  image?: string[];
  device_info?: DeviceInfo;
  version?: string;
}
```

## 前后端交互流程

### 1. 反馈类型映射

前端反馈类型与后端字段的映射关系：

```typescript
const FEEDBACK_TYPES = [
  { key: 'bug', label: '功能异常', icon: xCircleIcon },      // 对应后端 type: 'bug'
  { key: 'ux', label: '体验问题', icon: messageCircleIcon },  // 对应后端 type: 'ux'  
  { key: 'suggest', label: '产品建议', icon: lightbulbIcon }, // 对应后端 type: 'suggest'
  { key: 'other', label: '其他', icon: moreIcon },           // 对应后端 type: 'other'
];
```

### 2. 设备信息收集

前端自动收集以下设备信息：

```typescript
const deviceInfo = {
  brand: systemInfo.brand,           // 设备品牌
  model: systemInfo.model,           // 设备型号
  system: systemInfo.system,         // 操作系统版本
  platform: systemInfo.platform,     // 客户端平台
  SDKVersion: systemInfo.SDKVersion, // 客户端基础库版本
  version: systemInfo.version,       // 微信版本号
  app_version: '1.0.0'              // 应用版本号
};
```

### 3. 图片上传流程

1. 用户选择图片（最多3张）
2. 前端调用图片上传接口获取URL
3. 将图片URL列表传递给反馈提交接口
4. 无图片时传递空数组 `[]`

### 4. 提交数据格式

```typescript
const feedbackData = {
  content: desc.trim(),              // 用户输入的反馈内容
  type,                             // 选中的反馈类型
  image: imageUrls,                 // 图片URL列表或空数组
  device_info: deviceInfo,          // 设备信息对象
  version: appVersion               // 应用版本号
};
```

## 业务逻辑设计

### 1. 反馈ID生成
- 后端自动生成自增的反馈ID
- 确保每个反馈的唯一性

### 2. 反馈内容存储
- 将用户输入的详细描述存储为字符串
- 支持多行文本输入

### 3. 反馈类型限制
- 仅支持四种类型：bug（功能异常）、ux（体验问题）、suggest（产品建议）、other（其他）
- 前端通过下拉选择限制用户输入

### 4. 图片处理
- 有图片时：存储图片URL列表
- 无图片时：传入空数组 `[]`
- 支持最多3张图片上传

### 5. 版本号存储
- 直接读取前端传入的应用版本号并存储
- 便于问题定位和版本管理

### 6. 状态管理
- 新提交的反馈状态默认为 `pending`（待处理）
- 支持状态流转：pending → processing → resolved/rejected

## 错误处理机制

### 前端错误处理

```typescript
try {
  const result = await dispatch(submitFeedback(feedbackData)).unwrap();
  Taro.showToast({ title: '反馈提交成功', icon: 'success' });
} catch (error) {
  Taro.showToast({ 
    title: error?.message || '提交失败，请重试', 
    icon: 'none' 
  });
}
```

### 常见错误码

- `400`: 请求参数错误
- `401`: 未授权访问
- `500`: 服务器内部错误

## 安全考虑

1. **输入验证**：前端和后端都需要验证反馈内容的长度和格式
2. **图片限制**：限制图片大小和数量，防止恶意上传
3. **频率限制**：限制用户提交反馈的频率，防止垃圾信息
4. **权限控制**：只有登录用户才能提交反馈

## 性能优化

1. **图片压缩**：前端上传前压缩图片，减少传输时间
2. **分页加载**：反馈列表采用分页加载，避免一次性加载大量数据
3. **缓存策略**：对设备信息等静态数据进行缓存

## 测试文件

反馈示例文件已归档到 `backend-api/wxapp/feedback-examples/` 目录：

- `feedback-example.json` - 带图片的反馈示例
- `feedback-example-no-image.json` - 无图片的反馈示例

这些文件展示了后端存储的完整反馈信息格式，可用于测试和验证。 