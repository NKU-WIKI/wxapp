/**
 * API客户端工厂
 */

const storage = require('./storage');
const logger = require('./logger');
const http = require('./http');

// API客户端缓存，避免重复创建相同的客户端
const apiClientCache = {};

/**
 * 创建API客户端
 * @param {String} basePath API基础路径
 * @param {Object} endpoints API端点配置
 * @returns {Object} API客户端
 */
function createApiClient(basePath, endpoints = {}) {
  // 标准化基础路径，确保以/开头
  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  
  // 缓存key = 基础路径 + 端点JSON
  const cacheKey = `${normalizedBasePath}_${JSON.stringify(endpoints)}`;
  
  // 如果已缓存，直接返回缓存的客户端
  if (apiClientCache[cacheKey]) {
    return apiClientCache[cacheKey];
  }
  
  const client = {};
  
  // 构建每个端点的方法
  for (const [name, config] of Object.entries(endpoints)) {
    client[name] = async (data = {}) => {
      // 始终尝试获取openid并添加到请求数据中（如果API需要）
      if (config.params && config.params.openid) {
        // 先检查传入的数据中是否已有openid
        if (!data.openid) {
          // 尝试从storage获取
          const openid = storage.get('openid');
          // 如果存在，添加到请求数据
          if (openid && typeof openid === 'string') {
            data.openid = openid;
          }
          // 如果不存在且是必要参数，下面的必填参数验证会捕获这个错误
        } else if (data.openid && typeof data.openid !== 'string') {
          // 确保 openid 是字符串类型
          logger.debug('openid 参数不是字符串类型，将尝试转换');
          // 如果是对象，尝试从 storage 获取
          data.openid = storage.get('openid') || '';
        }
      }
      
      // 验证必填参数
      if (config.params) {
        const missingParams = Object.entries(config.params)
          .filter(([_, required]) => required === true)
          .map(([key]) => key)
          .filter(key => !data.hasOwnProperty(key) || data[key] === undefined || data[key] === null || data[key] === '');
        
        if (missingParams.length > 0) {
          logger.debug(`API请求缺少必填参数: ${missingParams.join(', ')}`);
          return {
            code: 400,
            message: `参数错误: 缺少${missingParams.join(', ')}`,
            data: null
          };
        }
      }
      
      // 构建请求路径
      let url = normalizedBasePath;
      if (config.path) {
        url = `${normalizedBasePath}${config.path.startsWith('/') ? config.path : `/${config.path}`}`;
      }
      
      // 设置请求方法（仅支持GET和POST）
      const method = (config.method || 'GET').toUpperCase();
      if (method !== 'GET' && method !== 'POST') {
        logger.debug(`不支持的请求方法: ${method}，将使用GET方法`);
        method = 'GET';
      }
      
      try {
        // 根据请求方法发送请求
        let response;
        if (method === 'GET') {
          response = await http.get(url, data);
        } else {
          response = await http.post(url, data);
        }
        
        // 确保返回标准格式
        if (response && typeof response === 'object' && 'code' in response) {
          return response;
        }
        
        // 包装非标准响应
        return {
          code: 200,
          message: 'success',
          data: response
        };
      } catch (err) {
        logger.debug(`API请求错误: ${url}`, err);
        return {
          code: err.code || 500,
          message: err.message || '网络请求失败',
          data: null,
          error: err
        };
      }
    };
  }
  
  // 缓存并返回客户端
  apiClientCache[cacheKey] = client;
  return client;
}

/**
 * 创建支持流式响应的API客户端
 * @param {String} basePath API基础路径
 * @param {Object} endpoints API端点配置
 * @returns {Object} 流式响应API客户端
 */
function createStreamApiClient(basePath, endpoints = {}) {
  // 标准化基础路径，确保以/开头
  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  
  // 缓存key = 基础路径 + 端点JSON + stream标识
  const cacheKey = `stream_${normalizedBasePath}_${JSON.stringify(endpoints)}`;
  
  // 如果已缓存，直接返回缓存的客户端
  if (apiClientCache[cacheKey]) {
    return apiClientCache[cacheKey];
  }
  
  const client = {};
  
  // 构建每个端点的方法
  for (const [name, config] of Object.entries(endpoints)) {
    client[name] = async (data = {}, callbacks = {}) => {
      // 解构回调函数
      const { onMessage, onComplete, onError } = callbacks;
      
      // 始终尝试获取openid并添加到请求数据中（如果API需要）
      if (config.params && config.params.openid) {
        // 先检查传入的数据中是否已有openid
        if (!data.openid) {
          // 尝试从storage获取
          const openid = storage.get('openid');
          // 如果存在，添加到请求数据
          if (openid && typeof openid === 'string') {
            data.openid = openid;
          }
        } else if (data.openid && typeof data.openid !== 'string') {
          // 确保 openid 是字符串类型
          logger.debug('流式请求: openid 参数不是字符串类型，将尝试转换');
          // 如果是对象，尝试从 storage 获取
          data.openid = storage.get('openid') || '';
        }
      }
      
      // 验证必填参数
      if (config.params) {
        const missingParams = Object.entries(config.params)
          .filter(([_, required]) => required === true)
          .map(([key]) => key)
          .filter(key => !data.hasOwnProperty(key) || data[key] === undefined || data[key] === null || data[key] === '');
        
        if (missingParams.length > 0) {
          const error = {
            code: 400,
            message: `参数错误: 缺少${missingParams.join(', ')}`,
            data: null
          };
          logger.debug(`API请求缺少必填参数: ${missingParams.join(', ')}`);
          if (onError) onError(error);
          return error;
        }
      }
      
      // 构建请求路径
      let url = normalizedBasePath;
      if (config.path) {
        url = `${normalizedBasePath}${config.path.startsWith('/') ? config.path : `/${config.path}`}`;
      }
      
      // 设置请求方法（仅支持GET和POST）
      const method = (config.method || 'POST').toUpperCase();
      if (method !== 'GET' && method !== 'POST') {
        logger.debug(`流式响应不支持的请求方法: ${method}，将使用POST方法`);
        method = 'POST';
      }
      
      try {
        // 从其他模块导入流式响应处理工具
        const { createChunkRes } = require('./chunkUtil');
        
        // 创建流式响应处理器
        const chunkRes = createChunkRes();
        
        // 准备请求数据
        const openid = storage.get('openid');
        const finalUrl = url.startsWith('/') ? url : '/' + url;
        const API_CONFIG = storage.get('API_CONFIG');
        const apiUrl = finalUrl.startsWith(API_CONFIG.api_prefix) ? finalUrl : API_CONFIG.api_prefix + finalUrl;
        
        let requestUrl = `${API_CONFIG.base_url}${apiUrl}`;
        let requestData = { ...data };
        
        // 对GET请求，构建查询字符串
        if (method === 'GET' && Object.keys(requestData).length) {
          const queryParams = Object.entries(requestData)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
          requestUrl += `${apiUrl.includes('?') ? '&' : '?'}${queryParams}`;
          requestData = {}; // GET请求不需要请求体
        }
        
        logger.debug(`流式${method}请求:`, requestUrl, requestData);
        
        // 创建请求任务
        const task = wx.request({
          url: requestUrl,
          method: method,
          data: method === 'POST' ? requestData : undefined,
          header: {
            ...API_CONFIG.headers,
            ...(openid ? {'X-User-OpenID': openid} : {})
          },
          enableChunked: true,  // 启用分块传输
          success: res => {
            logger.debug('流式响应完成:', res);
            // 处理最后的数据块
            const lastChunks = chunkRes.onComplateReturn();
            if (lastChunks && lastChunks.length > 0 && onComplete) {
              onComplete(lastChunks);
            }
          },
          fail: err => {
            logger.debug('流式请求失败:', err);
            if (onError) {
              onError({
                code: -1,
                message: err.errMsg || '网络请求失败',
                error: err
              });
            }
          }
        });
        
        // 监听数据块接收
        task.onChunkReceived(res => {
          // 处理数据块
          const chunks = chunkRes.onChunkReceivedReturn(res.data);
          if (chunks && chunks.length > 0 && onMessage) {
            onMessage(chunks);
          }
        });
        
        return task;
      } catch (err) {
        logger.error('创建流式请求失败:', err);
        if (onError) {
          onError({
            code: -1,
            message: '创建流式请求失败',
            error: err
          });
        }
        return null;
      }
    };
  }
  
  // 缓存并返回客户端
  apiClientCache[cacheKey] = client;
  return client;
}

module.exports = {
  createApiClient,
  createStreamApiClient
}; 