/**
 * API 请求成功返回码
 */
export const RESPONSE_SUCCESS_CODE = 0; // 成功的业务码
export const RESPONSE_NO_PERMISSION_CODE = 401; // 无权限
export const RESPONSE_NOT_FOUND_CODE = 404; // 未找到
export const RESPONSE_SERVER_ERROR_CODE = 500; // 服务器错误

/**
 * 不需要全局错误提示的业务码
 * 例如：某些接口在特定条件下返回的特定code，需要业务代码自行处理
 */
export const NO_ERROR_TOAST_CODES = [10001, 10002];

// 请求头中用于标识环境分支的 Key
export const HEADER_BRANCH_KEY = 'X-Branch';

/**
 * 当前请求环境（dev/main）
 */
export const REQUEST_BRANCH = 'dev';

/**
 * 默认租户名称（用于获取对应的 tenant_id）
 */
export const DEFAULT_TENANT_NAME = "南开大学";

/**
 * UI 界面配置常量
 */
/**
 * RAG结果折叠的字符数阈值
 * 当内容超过此长度时显示折叠按钮
 */
export const RAG_CONTENT_COLLAPSE_THRESHOLD = 400;

/**
 * 折叠时显示的最大高度（像素）
 */
export const RAG_CONTENT_MAX_HEIGHT = 300;