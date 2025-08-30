# BBS 通知系统使用指南

## 📋 概述

本文档说明如何在 BBS 相关操作中使用通知创建功能，包括点赞、评论、关注、收藏和@提及等操作。

## 🚀 快速开始

### 1. 导入通知辅助工具

```typescript
import { 
  handleLikeNotification,
  handleCommentNotification,
  handleFollowNotification,
  handleCollectNotification,
  handleMentionNotification 
} from '@/utils/notificationHelper';
```

### 2. 或者直接使用 API 服务

```typescript
import { createBBSNotification } from '@/services/api/notification';
```

## 💡 使用示例

### 点赞操作

```typescript
// 在点赞操作完成后调用
const handleLike = async (postId: string, postTitle: string, authorId: string) => {
  try {
    // 执行点赞逻辑
    const result = await likePost(postId);
    
    // 创建点赞通知
    await handleLikeNotification({
      postId,
      postTitle,
      postAuthorId: authorId,
      currentUserId: getCurrentUserId(),
      isLiked: result.isLiked
    });
    
    Taro.showToast({ title: '点赞成功', icon: 'success' });
  } catch (error) {
    console.error('点赞失败:', error);
  }
};
```

### 评论操作

```typescript
// 在评论发布成功后调用
const handleComment = async (postId: string, postTitle: string, authorId: string, commentContent: string) => {
  try {
    // 执行评论逻辑
    await createComment(postId, commentContent);
    
    // 创建评论通知
    await handleCommentNotification({
      postId,
      postTitle,
      postAuthorId: authorId,
      currentUserId: getCurrentUserId(),
      commentContent
    });
    
    Taro.showToast({ title: '评论成功', icon: 'success' });
  } catch (error) {
    console.error('评论失败:', error);
  }
};
```

### 关注操作

```typescript
// 在关注操作完成后调用
const handleFollow = async (targetUserId: string, targetUserNickname: string) => {
  try {
    // 执行关注逻辑
    const result = await followUser(targetUserId);
    
    // 创建关注通知
    await handleFollowNotification({
      targetUserId,
      currentUserId: getCurrentUserId(),
      currentUserNickname: getCurrentUserNickname(),
      isFollowing: result.isFollowing
    });
    
    Taro.showToast({ 
      title: result.isFollowing ? '关注成功' : '取消关注成功', 
      icon: 'success' 
    });
  } catch (error) {
    console.error('关注操作失败:', error);
  }
};
```

### 收藏操作

```typescript
// 在收藏操作完成后调用
const handleCollect = async (postId: string, postTitle: string, authorId: string) => {
  try {
    // 执行收藏逻辑
    const result = await collectPost(postId);
    
    // 创建收藏通知
    await handleCollectNotification({
      postId,
      postTitle,
      postAuthorId: authorId,
      currentUserId: getCurrentUserId(),
      isCollected: result.isCollected
    });
    
    Taro.showToast({ 
      title: result.isCollected ? '收藏成功' : '取消收藏成功', 
      icon: 'success' 
    });
  } catch (error) {
    console.error('收藏操作失败:', error);
  }
};
```

### @提及操作

```typescript
// 在帖子发布时检查@用户
const handlePostPublish = async (postData: {
  title: string;
  content: string;
}) => {
  try {
    // 发布帖子
    const newPost = await createPost(postData);
    
    // 处理@提及通知
    await handlePostPublishNotifications({
      postId: newPost.id,
      postTitle: newPost.title,
      postContent: newPost.content,
      authorId: getCurrentUserId(),
      authorNickname: getCurrentUserNickname()
    });
    
    Taro.showToast({ title: '发布成功', icon: 'success' });
  } catch (error) {
    console.error('发布失败:', error);
  }
};
```

## 🔧 高级用法

### 直接使用 API 服务

如果需要更精细的控制，可以直接使用 API 服务：

```typescript
import { createBBSNotification } from '@/services/api/notification';

// 创建自定义点赞通知
const customLikeNotification = async () => {
  try {
    await createBBSNotification.like({
      recipient_id: 'user123',
      sender_id: 'currentUser456',
      post_id: 'post789',
      post_title: '这是一个很棒的帖子'
    });
  } catch (error) {
    console.error('创建通知失败:', error);
  }
};
```

### 批量创建通知

```typescript
// 给多个用户发送提及通知
const notifyMultipleUsers = async (userIds: string[], postInfo: any) => {
  try {
    const promises = userIds.map(userId => 
      createBBSNotification.mention({
        recipient_id: userId,
        sender_id: getCurrentUserId(),
        post_id: postInfo.id,
        post_title: postInfo.title,
        sender_nickname: getCurrentUserNickname()
      })
    );
    
    await Promise.all(promises);
    console.log(`成功向 ${userIds.length} 个用户发送通知`);
  } catch (error) {
    console.error('批量发送通知失败:', error);
  }
};
```

## 📝 注意事项

1. **错误处理**: 通知创建失败不应该影响主要的业务操作
2. **避免自我通知**: 用户不应该收到自己操作产生的通知
3. **性能考虑**: 通知创建是异步操作，不阻塞主要流程
4. **权限检查**: 确保用户有权限进行相应操作后再创建通知
5. **内容长度**: 注意通知内容的长度限制

## 🌐 API 接口

### 创建通知

- **接口**: `POST /api/v1/notifications`
- **请求格式**: 参考 `NotificationCreateRequest` 类型
- **响应格式**: 参考 `NotificationCreateResponse` 类型

### 支持的通知类型

- `message` - 互动消息（点赞、评论、关注、收藏）
- `mention` - @提及通知
- `activity` - 活动通知
- `system` - 系统通知
- `announcement` - 公告通知

### 支持的业务类型

在 `message` 类型下：
- `like` - 点赞
- `comment` - 评论  
- `follow` - 关注
- `collect` - 收藏

## 🔄 与现有系统集成

通知创建功能已经集成到现有的通知页面中，用户可以在消息页面的"互动消息"标签下看到这些通知。

通知页面会自动按照业务类型进行分类显示，并提供未读数量统计和批量标记已读功能。