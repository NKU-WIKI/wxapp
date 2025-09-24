/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // 2025年最佳实践：SCSS特定规则
    'scss/at-rule-no-unknown': null, // 允许SCSS特有的@规则
    'scss/dollar-variable-colon-space-after': 'always', // 变量冒号后必须有空格
    'scss/dollar-variable-colon-space-before': 'never', // 变量冒号前不能有空格
    'scss/double-slash-comment-whitespace-inside': 'always', // 双斜杠注释内侧必须有空格

    // 2025年最佳实践：现代CSS规则
    'color-hex-case': 'lower', // 十六进制颜色值使用小写
    'color-hex-length': 'short', // 优先使用短格式十六进制颜色
    'color-named': 'never', // 禁止使用命名颜色
    'function-comma-space-after': 'always-single-line', // 函数逗号后必须有空格
    'function-comma-space-before': 'never', // 函数逗号前不能有空格
    'function-max-empty-lines': 0, // 函数内不允许空行
    'function-name-case': 'lower', // 函数名使用小写
    'function-parentheses-space-inside': 'never', // 函数括号内侧不能有空格
    'function-url-quotes': 'always', // URL必须使用引号
    'number-leading-zero': 'always', // 小数前必须有0
    'number-no-trailing-zeros': true, // 移除小数末尾的0
    'unit-case': 'lower', // 单位使用小写
    'unit-no-unknown': true, // 禁止未知单位
    'value-list-comma-space-after': 'always-single-line', // 值列表逗号后必须有空格
    'value-list-comma-space-before': 'never', // 值列表逗号前不能有空格
    'value-list-max-empty-lines': 0, // 值列表中不允许空行

    // 2025年最佳实践：声明块规则
    'declaration-bang-space-after': 'never', // !后不能有空格
    'declaration-bang-space-before': 'always', // !前必须有空格
    'declaration-block-semicolon-space-after': 'always-single-line', // 分号后必须有空格
    'declaration-block-semicolon-space-before': 'never', // 分号前不能有空格
    'declaration-block-trailing-semicolon': 'always', // 声明块末尾必须有分号
    'declaration-colon-space-after': 'always-single-line', // 冒号后必须有空格
    'declaration-colon-space-before': 'never', // 冒号前不能有空格

    // 2025年最佳实践：选择器规则
    'selector-attribute-brackets-space-inside': 'never', // 属性选择器括号内侧不能有空格
    'selector-attribute-operator-space-after': 'never', // 属性操作符后不能有空格
    'selector-attribute-operator-space-before': 'never', // 属性操作符前不能有空格
    'selector-combinator-space-after': 'always', // 组合器后必须有空格
    'selector-combinator-space-before': 'always', // 组合器前必须有空格
    'selector-pseudo-class-case': 'lower', // 伪类使用小写
    'selector-pseudo-element-case': 'lower', // 伪元素使用小写
    'selector-type-case': 'lower', // 类型选择器使用小写

    // 2025年最佳实践：规则和媒体查询
    'media-feature-colon-space-after': 'always', // 媒体特性冒号后必须有空格
    'media-feature-colon-space-before': 'never', // 媒体特性冒号前不能有空格
    'media-feature-name-case': 'lower', // 媒体特性名使用小写
    'media-feature-parentheses-space-inside': 'never', // 媒体特性括号内侧不能有空格
    'media-feature-range-operator-space-after': 'always', // 范围操作符后必须有空格
    'media-feature-range-operator-space-before': 'always', // 范围操作符前必须有空格

    // 2025年最佳实践：代码组织
    'order/properties-order': [
      // CSS属性分组和排序
      'positioning', // 定位相关
      'box-model', // 盒模型
      'typography', // 排版
      'visual', // 视觉效果
      'animation', // 动画
      'misc', // 其他
    ],
    'order/properties-alphabetical-order': null, // 允许自定义顺序

    // 2025年最佳实践：性能和兼容性
    'at-rule-no-vendor-prefix': true, // 禁止@规则的厂商前缀
    'media-feature-name-no-vendor-prefix': true, // 禁止媒体特性的厂商前缀
    'property-no-vendor-prefix': true, // 禁止属性的厂商前缀
    'selector-no-vendor-prefix': true, // 禁止选择器的厂商前缀
    'value-no-vendor-prefix': true, // 禁止值的厂商前缀

    // 2025年最佳实践：现代CSS特性支持
    'custom-property-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$', // 自定义属性命名模式
    'selector-class-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$', // 类选择器命名模式
    'selector-id-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$', // ID选择器命名模式

    // 2025年最佳实践：可维护性
    'max-nesting-depth': 3, // 最大嵌套深度
    'selector-max-compound-selectors': 3, // 最大复合选择器数量
    'selector-max-specificity': '0,2,0', // 最大特异性
    'selector-max-type': 2, // 最大类型选择器数量
  },
  plugins: ['stylelint-scss', 'stylelint-order'],
  overrides: [
    {
      files: ['*.scss', '**/*.scss'],
      rules: {
        // SCSS特有的规则
        'scss/at-import-partial-extension': null, // 允许不使用下划线前缀的SCSS文件导入
        'scss/at-import-partial-extension-whitelist': null,
        'scss/double-slash-comment-empty-line-before': null, // 允许双斜杠注释前有空行
      }
    }
  ]
};
