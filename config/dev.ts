import type { UserConfigExport } from "@tarojs/cli";
import TerserPlugin from 'terser-webpack-plugin';

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {
    webpackChain: (chain) => {
      chain.merge({
        plugin: {
          install: {
            plugin: TerserPlugin,
            args: [
              {
                terserOptions: {
                  compress: true, // 默认使用terser压缩
                  // mangle: false,
                  keep_classnames: true, // 不改变class名称
                  keep_fnames: true, // 不改变函数名称
                },
              },
            ],
          },
        },
      });
    },
  },
  h5: {},
  defineConstants: {
    BASE_URL: JSON.stringify("https://nkuwiki.com"),
    // BASE_URL: JSON.stringify('http://localhost:8000')
  },
} satisfies UserConfigExport<"webpack5">;
