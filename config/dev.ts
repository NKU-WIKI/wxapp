import type { UserConfigExport } from "@tarojs/cli";
import TerserPlugin from "terser-webpack-plugin";

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {},
  defineConstants: {
    "process.env.BASE_URL": JSON.stringify("https://nkuwiki.com"),
    // 'process.env.BASE_URL': JSON.stringify('http://localhost:8000'),
    "process.env.OPENAI_API_KEY": JSON.stringify(
      "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"
    ),
    "process.env.OPENAI_BASE_URL": JSON.stringify("https://api.openai.com/v1"),
  },
} satisfies UserConfigExport<"webpack5">;
