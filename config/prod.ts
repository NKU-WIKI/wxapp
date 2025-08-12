import type { UserConfigExport } from "@tarojs/cli";

export default {
  env: {
    NODE_ENV: '"production"',
    BASE_URL: '"https://nkuwiki.com"',
  },
  mini: {},
  h5: {
    compile: {
      include: [
        // 确保产物为 es5
        (filename) =>
          /node_modules\/(?!(@babel|core-js|style-loader|css-loader|react|react-dom))/.test(
            filename
          ),
      ],
    },
    /**
     * WebpackChain 思想贯穿 Taro 开发全过程。
     * 未加特殊说明，Devlopment 下的配置均适用于 Production。
     * 例如：扩展 Devlopment 下的 MiniProgram 体积 Gzip 功能。
     */
    // webpackChain (chain) {
    //   /**
    //    * 如果 h5 端编译后体积过大，可以使用 webpack-bundle-analyzer 插件对打包体积进行分析。
    //    * @docs https://github.com/webpack-contrib/webpack-bundle-analyzer
    //    */
    //   chain.plugin('analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
    //   /**
    //    * 如果 h5 端首屏加载时间过长，可以使用 prerender-spa-plugin 插件预加载首页。
    //    * @docs https://github.com/chrisvfritz/prerender-spa-plugin
    //    */
    //   const path = require('path')
    //   const Prerender = require('prerender-spa-plugin')
    //   const staticDir = path.join(__dirname, '..', 'dist')
    //   chain
    //     .plugin('prerender')
    //     .use(new Prerender({
    //       staticDir,
    //       routes: [ '/pages/index/index' ],
    //       postProcess: (context) => ({ ...context, outputPath: path.join(staticDir, 'index.html') })
    //     }))
    // }
  },
  defineConstants: {
    "process.env.BASE_URL": JSON.stringify("https://nkuwiki.com"),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
} satisfies UserConfigExport<"webpack5">;
