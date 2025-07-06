/**
 * API 请求成功返回码
 */
export const RESPONSE_SUCCESS_CODE = 200;

/**
 * 不需要全局错误提示的业务码
 * 例如：某些接口在特定条件下返回的特定code，需要业务代码自行处理
 */
export const NO_ERROR_TOAST_CODES: number[] = [
  // 示例：1001 表示需要特殊处理的错误
  // 1001,
];
export const BASE_URL = 'https://nkuwiki.com';
/**
 * 请求头的 Branch Key
 */
export const HEADER_BRANCH_KEY = 'X-Branch';

/**
 * 当前请求环境（dev/main）
 */
export const REQUEST_BRANCH = process.env.NODE_ENV === 'development' ? 'dev' : 'main'; 