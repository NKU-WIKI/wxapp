/**
 * 消息通知行为 - 管理用户消息和通知
 */
const { createApiClient, storage } = require('../utils/index');

// 通知API客户端
const notificationApi = createApiClient('/api/wxapp/notification', {
  list:    { method: 'GET',  path: '/list' },
  detail:  { method: 'GET',  path: '/detail' },
  count:   { method: 'GET',  path: '/count' },
  summary: { method: 'GET',  path: '/summary' },
  read:    { method: 'POST', path: '/read' },    // body: { openid, notification_ids: [] }
  delete:  { method: 'POST', path: '/delete' }, // body: { openid, notification_id }
});

module.exports = Behavior({
  data: {
    _lastCheckTime: 0, // 上次检查时间
    _checkInterval: 60000, // 检查间隔，单位毫秒，例如60秒
  },

  methods: {
    /**
     * 检查是否有未读通知
     * @returns {Promise<{hasUnread: boolean, count: number}|false>} 未读通知信息或false
     */
    async _checkUnreadNotification() {
      const checkInterval = 60000;
      const lastCheckTime = storage.get('notification_last_check_time') || 0;
      const now = Date.now();
      
      if (now - lastCheckTime < checkInterval) {
        return false;
      }

      const openid = storage.get('openid');
      if (!openid) {
        return false;
      }

      try {
        const res = await notificationApi.count({ openid });
        if (res.code === 200 && res.data) {
          storage.set('notification_last_check_time', now);
          return {
            hasUnread: res.data.unread_count > 0,
            count: res.data.unread_count
          };
        }
        return false;
      } catch (err) {
        console.debug('通知检查请求失败', err);
        return false;
      }
    },

    /**
     * 获取通知列表
     * @param {Object} params - 查询参数 { page, page_size }
     * @returns {Promise<Object|null>} 通知数据和分页信息，或null
     */
    async _getNotificationList(params = {}) {
      const openid = storage.get('openid');
      if (!openid) return null;

      const apiParams = { 
        openid, 
        page: params.page || 1,
        page_size: params.page_size || 10
      };
      
      try {
        const res = await notificationApi.list(apiParams);
        
        if (res.code !== 200) {
          console.debug('获取通知列表API响应异常:', res);
          throw new Error(res.message || '获取通知列表失败');
        }
        
        return {
          data: res.data || [],
          pagination: res.pagination || {
            total: 0,
            page: apiParams.page,
            page_size: apiParams.page_size,
            has_more: false,
          }
        };
      } catch (err) {
        console.debug('获取通知列表失败:', err);
        throw err;
      }
    },

    /**
     * 标记一个或多个通知为已读
     * @param {string|string[]} notificationIds - 单个通知ID或ID数组
     * @returns {Promise<boolean>} 是否成功
     */
    async _markNotificationAsRead(notificationIds) {
      if (!notificationIds || notificationIds.length === 0) return false;
      const openid = storage.get('openid');
      if (!openid) return false;

      try {
        const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
        const res = await notificationApi.read({ 
          openid, 
          notification_ids: ids
        });
        return res.code === 200;
      } catch (err) {
        console.debug('标记通知已读失败:', err);
        return false;
      }
    },
    
    /**
     * 删除通知
     * @param {string} notificationId - 通知ID
     * @returns {Promise<boolean>} 是否成功
     */
    async _deleteNotification(notificationId) {
      if (!notificationId) return false;
      const openid = storage.get('openid');
      if (!openid) return false;
      
      try {
        const res = await notificationApi.delete({
          openid,
          notification_id: notificationId
        });
        return res.code === 200;
      } catch (err) {
        console.debug('删除通知失败:', err);
        return false;
      }
    }
  }
}); 