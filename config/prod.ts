import type { UserConfigExport } from "@tarojs/cli";

/**
 * 生产环境配置
 *
 * 文档: https://taro-docs.jd.com/docs/next/config-detail#prod
 */
export default {
  logger: {
    quiet: false,
    stats: false,
  },
  mini: {},
  h5: {
    compile: {
      include: [
        // 确保产物为 es5
        (filename) =>
          /node_modules\/(?!(@babel|core-js|style-loader|css-loader|react|react-dom))/.test(
            filename,
          ),
      ],
    },
  },
  defineConstants: {
    "process.env.BASE_URL": JSON.stringify("https://nkuwiki.com"),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
} satisfies UserConfigExport<"webpack5">;
