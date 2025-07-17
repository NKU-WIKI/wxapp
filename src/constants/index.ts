/**
 * API 请求成功返回码
 */
export const RESPONSE_SUCCESS_CODE = 200; // 成功的业务码
export const RESPONSE_NO_PERMISSION_CODE = 401; // 无权限
export const RESPONSE_NOT_FOUND_CODE = 404; // 未找到
export const RESPONSE_SERVER_ERROR_CODE = 500; // 服务器错误

/**
 * 不需要全局错误提示的业务码
 * 例如：某些接口在特定条件下返回的特定code，需要业务代码自行处理
 */
export const NO_ERROR_TOAST_CODES = [RESPONSE_NO_PERMISSION_CODE];

// 请求头中用于标识环境分支的 Key
export const HEADER_BRANCH_KEY = 'X-Branch';

/**
 * 当前请求环境（dev/main）
 */
export const REQUEST_BRANCH = process.env.NODE_ENV === 'development' ? 'dev' : 'main'; 