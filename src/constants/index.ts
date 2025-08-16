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

// 默认开发用 Token
export const DEFAULT_DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidGVuYW50X2lkIjoiZjYzMDM4OTktYTUxYS00NjBhLTljZDgtZmUzNTYwOTE1MWViIiwibmlja25hbWUiOiJuYW5rYWlfdXNlciIsInJvbGVzIjpbInVzZXIiXSwiZXhwIjoxNzU3OTIxNTcwfQ.D2ob-m3rx7Ri3QNSamIAPA202eqd78cv6KUjZ1dQ9aI"; 