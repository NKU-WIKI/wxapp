// .prettierrc.mjs
/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true, // 在 Taro 项目中，分号是推荐的
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  plugins: [],
};
