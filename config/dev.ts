import type { UserConfigExport } from "@tarojs/cli";

/**
 * 开发环境配置
 *
 * 文档: https://taro-docs.jd.com/docs/next/config-detail#dev
 */
export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {},
  defineConstants: {
    "process.env.BASE_URL": JSON.stringify("https://nkuwiki.com"),
    "process.env.NODE_ENV": JSON.stringify("development")
  },
} satisfies UserConfigExport<"webpack5">;
