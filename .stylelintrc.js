module.exports = {
  extends: ['stylelint-config-standard'],
  customSyntax: 'postcss-scss',
  rules: {
    // 允许 SCSS 语法
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'use',
          'forward',
          'import',
          'mixin',
          'include',
          'function',
          'extend',
          'at-root',
          'error',
          'warn',
          'debug',
          'if',
          'each',
          'for',
          'while'
        ]
      }
    ],

    // 允许 CSS Modules 的 camelCase 类名
    'selector-class-pattern': null,

    // 允许 SCSS 变量
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['/^\\$/']
      }
    ],

    // 允许 rgba 函数
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'alpha-value-notation': null,

    // 减少空行要求
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,

    // 允许选择器特殊性降序
    'no-descending-specificity': null,

    // 允许动画名称使用 camelCase
    'keyframes-name-pattern': null,

    // 允许 SCSS 注释
    'no-invalid-double-slash-comments': null
  }
};