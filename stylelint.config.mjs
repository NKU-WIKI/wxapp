/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-standard-scss"
  ],
  plugins: [
    "stylelint-scss",
    "stylelint-order"
  ],
  rules: {
    // SCSS规则
    "scss/at-rule-no-unknown": true,
    "scss/selector-no-redundant-nesting-selector": true,
    "scss/no-duplicate-dollar-variables": true,
    
    // 属性顺序
    "order/properties-alphabetical-order": true,
    
    // 命名规则
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]*$|^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "custom-property-pattern": "^[a-z][a-zA-Z0-9]*$|^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    
    // 禁用规则
    "no-descending-specificity": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        "ignorePseudoClasses": ["global"]
      }
    ],
    
    // 颜色规则
    "color-named": "never",
    "color-no-hex": null,
    
    // 单位规则
    "unit-allowed-list": ["px", "em", "rem", "%", "vh", "vw", "deg", "s", "ms"]
  },
  ignoreFiles: [
    "dist/**/*",
    "lib/**/*",
    "node_modules/**/*"
  ]
};
