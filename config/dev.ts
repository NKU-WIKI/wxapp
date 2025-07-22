import type { UserConfigExport } from "@tarojs/cli";
import TerserPlugin from 'terser-webpack-plugin';

export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {},
  defineConstants: {
    'process.env.BASE_URL': JSON.stringify("https://nkuwiki.com"),
    // 'process.env.BASE_URL': JSON.stringify('http://localhost:8000'),
    'process.env.OPENAI_API_KEY': JSON.stringify('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'),
    'process.env.OPENAI_BASE_URL': JSON.stringify('https://api.openai.com/v1')
  },
} satisfies UserConfigExport<"webpack5">;
