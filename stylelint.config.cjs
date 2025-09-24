/** @type {import('stylelint').Config} */
module.exports = {
  customSyntax: "postcss-scss",
  plugins: [
    "stylelint-scss"
  ],
  rules: {
    // 基本语法规则
    "color-no-invalid-hex": true,
    "font-family-no-duplicate-names": true,
    "function-calc-no-unspaced-operator": true,
    "string-no-newline": true,
    "property-no-unknown": true,
    "declaration-block-no-duplicate-properties": true,

    // 微信小程序特殊规则
    "unit-no-unknown": [
      true,
      {
        ignoreUnits: ["rpx"] // 微信小程序单位
      }
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "local"] // CSS Modules
      }
    ],
    "selector-type-no-unknown": [
      true,
      {
        ignore: ["custom-elements"],
        ignoreTypes: [
          // 微信小程序原生组件
          "page", "view", "scroll-view", "swiper", "swiper-item", "movable-view",
          "movable-area", "cover-view", "cover-image", "icon", "text", "rich-text",
          "progress", "button", "checkbox", "checkbox-group", "editor", "form",
          "input", "label", "picker", "picker-view", "picker-view-column",
          "radio", "radio-group", "slider", "switch", "textarea", "navigator",
          "functional-page-navigator", "image", "video", "camera", "live-player",
          "live-pusher", "map", "canvas", "web-view", "ad", "official-account",
          "open-data", "audio"
        ]
      }
    ],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          // SCSS at-rules
          "mixin", "include", "function", "return", "if", "else", "for", "each",
          "while", "import", "use", "forward", "extend", "at-root", "debug",
          "warn", "error", "content"
        ]
      }
    ],

    // SCSS 特定规则
    "scss/at-rule-no-unknown": null,
    "scss/dollar-variable-no-missing-interpolation": true,
    "scss/operator-no-newline-after": true,
    "scss/operator-no-newline-before": true,
    "scss/operator-no-unspaced": true,

    // 放宽的规则
    "block-no-empty": null,
    "no-duplicate-selectors": null,
    "selector-class-pattern": null,
    "keyframes-name-pattern": null,
    "font-family-no-missing-generic-family-keyword": null,
    "no-descending-specificity": null,
    "function-no-unknown": null,
    "scss/no-duplicate-dollar-variables": null,
    "declaration-property-value-keyword-no-deprecated": null,
  },
};