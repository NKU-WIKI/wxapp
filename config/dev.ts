import type { UserConfigExport } from "@tarojs/cli"

export default {
   logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {},
  defineConstants: {
    BASE_URL: JSON.stringify('https://nkuwiki.com'),
  },
} satisfies UserConfigExport<'webpack5'>
