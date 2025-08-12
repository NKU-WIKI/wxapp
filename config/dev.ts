import type { UserConfigExport } from "@tarojs/cli";

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {},
  defineConstants: {
    "process.env.BASE_URL": JSON.stringify("http://123.56.196.155:8001"),
    // 'process.env.BASE_URL': JSON.stringify('http://localhost:8000'),
  },
} satisfies UserConfigExport<"webpack5">;
