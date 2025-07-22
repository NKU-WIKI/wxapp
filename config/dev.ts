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
