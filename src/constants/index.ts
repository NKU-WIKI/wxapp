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
export const DEFAULT_DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZDk2M2QyYS03NjcyLTRiNGEtOWE2YS1iMzYwNWQwYjJkNTIiLCJ0ZW5hbnRfaWQiOiJmNjMwMzg5OS1hNTFhLTQ2MGEtOWNkOC1mZTM1NjA5MTUxZWIiLCJuaWNrbmFtZSI6Im5hbmthaV91c2VyIiwicm9sZXMiOlsidXNlciJdLCJleHAiOjE3NTgzNzE1OTh9.Jnp_KrgFF6t9lmW--NDTB-EbE8qAc-KCzK7I-f7aa2k"; 

/**
 * 多租户：当前租户ID（用于RAG等需要tenant_id的接口）
 */
export const TENANT_ID = "f6303899-a51a-460a-9cd8-fe35609151eb";

/**
 * 未登录态的占位用户ID。
 *
 * 说明：当后端返回的当前用户 user_id 等于该 UUID 时，表示并未真正登录，
 * 前端应视为未登录状态（isLoggedIn=false），忽略 currentUser。
 */
export const NON_LOGGED_IN_USER_ID = "8d963d2a-7672-4b4a-9a6a-b3605d0b2d52";

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