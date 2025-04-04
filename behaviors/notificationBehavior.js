/**
 * 通知行为
 * 提供通知检查和处理相关方法
 */
const { createApiClient, storage } = require('../utils/util');

// 通知API客户端
const notificationApi = createApiClient('/api/wxapp/notification', {
  getList: { method: 'GET', path: '', params: { openid: true } },
  read: { method: 'POST', path: '/read', params: { openid: true, notification_id: true } },
  readAll: { method: 'POST', path: '/read-all', params: { openid: true } },
  summary: { method: 'GET', path: '/summary', params: { openid: true } },
  delete: { method: 'POST', path: '/delete', params: { openid: true, notification_id: true } }
});

module.exports = Behavior({
  methods: {
    /**
     * 检查是否有未读通知
     * @returns {Promise<Boolean|Object>} 未读通知信息或false
     */
    async _checkUnreadNotification() {
      const openid = storage.get('openid');
      if (!openid) {
        console.debug('通知检查：用户未登录');
        return false;
      }

      try {
        const res = await notificationApi.summary({ openid });
        if (res.code === 200 && res.data) {
          return {
            hasUnread: res.data.unread_count > 0,
            count: res.data.unread_count
          };
        } else {
          console.debug('通知检查：API返回异常', res);
          return false;
        }
      } catch (err) {
        console.debug('通知检查：请求失败', err);
        return false;
      }
    },

    /**
     * 获取通知列表
     * @param {Object} params - 查询参数
     * @returns {Promise<Array|null>} 通知列表或null
     */
    async _getNotificationList(params = {}) {
      const openid = storage.get('openid');
      if (!openid) return null;

      try {
        const res = await notificationApi.getList({ openid, ...params });
        return res.code === 200 ? res.data : null;
      } catch (err) {
        console.debug('获取通知列表失败:', err);
        return null;
      }
    },

    /**
     * 标记通知为已读
     * @param {string} notificationId - 通知ID
     * @returns {Promise<boolean>} 是否成功
     */
    async _markNotificationAsRead(notificationId) {
      if (!notificationId) return false;
      const openid = storage.get('openid');
      if (!openid) return false;

      try {
        const res = await notificationApi.read({ 
          openid, 
          notification_id: notificationId 
        });
        return res.code === 200;
      } catch (err) {
        console.debug('标记通知已读失败:', err);
        return false;
      }
    },
    
    /**
     * 标记所有通知为已读
     * @returns {Promise<boolean>} 是否成功
     */
    async _markAllNotificationsAsRead() {
      const openid = storage.get('openid');
      if (!openid) return false;

      try {
        const res = await notificationApi.readAll({ openid });
        return res.code === 200;
      } catch (err) {
        console.debug('标记所有通知已读失败:', err);
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