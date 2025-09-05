import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getNotifications } from '@/services/api/notification';
import { NotificationType } from '@/types/api/notification.d';

interface NotificationState {
  unreadCounts: {
    [NotificationType._Message]?: number;
    [NotificationType._Activity]?: number;
    [NotificationType._System]?: number;
    [NotificationType._Announcement]?: number;
    total?: number;
  };
  loading: boolean;
  lastUpdated: number | null;
}

const initialState: NotificationState = {
  unreadCounts: {},
  loading: false,
  lastUpdated: null
};

// 获取未读消息总数的异步thunk
export const fetchUnreadCounts = createAsyncThunk(
  'notification/fetchUnreadCounts',
  async () => {
    
    try {
      const notificationTypes = [
        NotificationType._Message,
        NotificationType._Activity,
        NotificationType._System,
        NotificationType._Announcement
      ];
      
      const unreadCountData: Partial<NotificationState['unreadCounts']> = {};
      let totalUnread = 0;
      
      // 并发查询各类型的未读数量
      const promises = notificationTypes.map(async (type) => {
        try {
          const res = await getNotifications({
            type,
            is_read: false,  // 只获取未读的
            page: 1,
            page_size: 1    // 只需要总数，不需要具体数据
          });
          
          console.log(`🔧 [Redux调试] ${type} 未读查询结果`, { 
            code: res.code, 
            total: res.data?.pagination?.total,
            type 
          });
          
          if (res.code === 0 && res.data?.pagination) {
            const count = res.data.pagination.total || 0;
            unreadCountData[type] = count;
            totalUnread += count;
            return count;
          }
          return 0;
        } catch (error) {
          console.warn(`⚠️ [NotificationSlice] 获取 ${type} 未读数量失败:`, error);
          return 0;
        }
      });
      
      await Promise.all(promises);
      
      // 设置未读数量统计
      const finalUnreadCounts = {
        ...unreadCountData,
        total: totalUnread
      };
      
      console.log('🔧 [Redux调试] 最终未读数量统计', finalUnreadCounts);
      
      return finalUnreadCounts;
    } catch (error) {
      console.error('❌ [NotificationSlice] 获取未读消息统计失败:', error);
      throw error;
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // 手动更新未读数量
    updateUnreadCounts: (state, action: PayloadAction<NotificationState['unreadCounts']>) => {
      state.unreadCounts = { ...state.unreadCounts, ...action.payload };
      state.lastUpdated = Date.now();
    },
    
    // 标记特定类型的消息为已读（将该类型的未读数设为0）
    markTypeAsRead: (state, action: PayloadAction<NotificationType>) => {
      const type = action.payload;
      
      if (state.unreadCounts[type]) {
        // 从总数中减去该类型的未读数
        const typeCount = state.unreadCounts[type] || 0;
        state.unreadCounts.total = Math.max(0, (state.unreadCounts.total || 0) - typeCount);
        state.unreadCounts[type] = 0;
        state.lastUpdated = Date.now();
      }
    },
    
    // 标记所有消息为已读
    markAllAsRead: (state) => {
      state.unreadCounts = {
        [NotificationType._Message]: 0,
        [NotificationType._Activity]: 0,
        [NotificationType._System]: 0,
        [NotificationType._Announcement]: 0,
        total: 0
      };
      state.lastUpdated = Date.now();
    },
    
    // 增加未读数量（当收到新消息时）
    incrementUnreadCount: (state, action: PayloadAction<{ type: NotificationType; count?: number }>) => {
      const { type, count = 1 } = action.payload;
      
      state.unreadCounts[type] = (state.unreadCounts[type] || 0) + count;
      state.unreadCounts.total = (state.unreadCounts.total || 0) + count;
      state.lastUpdated = Date.now();
    },
    
    // 重置状态
    resetNotificationState: (state) => {
      state.unreadCounts = {};
      state.loading = false;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCounts = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchUnreadCounts.rejected, (state, action) => {
        state.loading = false;
        console.error('❌ [NotificationSlice] fetchUnreadCounts 失败:', action.error.message);
        // 失败时不重置数据，保持上次的状态
      });
  }
});

export const {
  updateUnreadCounts,
  markTypeAsRead,
  markAllAsRead,
  incrementUnreadCount,
  resetNotificationState
} = notificationSlice.actions;

export default notificationSlice.reducer;
