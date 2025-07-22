import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import dotenv from 'dotenv';

dotenv.config();
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import path from "path";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import devConfig from "./dev";
import prodConfig from "./prod";

const packageJson = require('../package.json');

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<"webpack5">(async (merge) => {
  const baseConfig: UserConfigExport<"webpack5"> = {
    projectName: "taro-wxapp",
    date: "2025-7-3",
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    plugins: ["@tarojs/plugin-generator", "@tarojs/plugin-html"],
    defineConstants: {
      APP_NAME: JSON.stringify(packageJson.name),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
    },
    copy: {
      patterns: [
        { from: "src/assets", to: "dist/assets" }
      ],
      options: {},
    },
    framework: "react",
    compiler: "webpack5",
    entry: 'src/app.tsx',
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    mini: {
      miniCssExtractPluginOption: {
        ignoreOrder: true,
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: true,
          // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module",
            // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
        
        // 处理普通图片文件（排除SVG）
        chain.module
          .rule('images')
          .test(/\.(png|jpe?g|gif)(\?.*)?$/)
          .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 4096, // 4k - 降低阈值以避免性能警告
            name: 'static/images/[name].[hash:8].[ext]'
          });

        if (process.env.NODE_ENV === 'production') {
          chain.optimization.minimizer('image-minimizer').use(
            new ImageMinimizerPlugin({
              minimizer: {
                implementation: ImageMinimizerPlugin.sharpMinify,
                options: {
                  encodeOptions: {
                    jpeg: { quality: 80 },
                    png: {
                      quality: 80,
                    },
                  },
                },
              },
            })
          );
        }

        if (process.env.ANALYZE === 'true') {
          chain
            .plugin('bundle-analyzer')
            .use(BundleAnalyzerPlugin)
        }
      },
      compile: {
        include: [
          (filename: string) => /taro-ui/.test(filename)
        ],
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      output: {
        filename: "js/[name].[hash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].js",
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[hash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module",
            // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
      },
      compile: {
        include: [
          (filename: string) =>
            /node_modules\/(?!(.pnpm|@babel|core-js|style-loader|css-loader|react|react-dom))(@?[^/]+)/.test(
              filename
            ),
          (filename: string) =>
            /node_modules\/(?!(.pnpm|@babel|core-js|style-loader|css-loader|react|react-dom))(@?[^/]+)/.test(
              filename
            ),
          (filename: string) =>
            /node_modules\/(?!(.pnpm|@babel|core-js|style-loader|css-loader|react|react-dom))(@?[^/]+)/.test(
              filename
            ),
          (filename: string) =>
            /node_modules\/(?!(.pnpm|@babel|core-js|style-loader|css-loader|react|react-dom))(@?[^/]+)/.test(
              filename
            ),
        ],
      },
    },
    rn: {
      appName: "taroDemo",
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
  };
  if (process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
