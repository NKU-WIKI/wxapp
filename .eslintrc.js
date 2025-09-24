module.exports = {
  extends: [
    'taro/react'
  ],
  rules: {
    // React 17+ 不需要导入React
    'react/react-in-jsx-scope': 'off',

    // 2025年最佳实践：严格的React Hooks规则
    'react-hooks/exhaustive-deps': 'error', // 改为error级别
    'react-hooks/rules-of-hooks': 'error',

    // 变量使用规则：支持下划线前缀的未使用变量
    'no-unused-vars': ['error', {
      'varsIgnorePattern': '^(_|Nerv|React)',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true,
      'caughtErrorsIgnorePattern': '^_'
    }],

    // 2025年最佳实践：严格的import规则
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],

    // 禁止console语句（生产环境）
    'no-console': 'error',

    // 2025年最佳实践：类型检查规则
    '@typescript-eslint/no-unused-vars': ['error', {
      'varsIgnorePattern': '^(_|Nerv|React)',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],

    // 2025年最佳实践：其他重要规则
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off', // 现代TS配置中通常关闭
    '@typescript-eslint/no-empty-function': 'warn',
    'prefer-const': 'error', // 移除@typescript-eslint/prefer-const，使用ESLint原生规则

    // 代码质量规则
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-dupe-keys': 'error',
    'no-dupe-args': 'error',
    'no-duplicate-imports': 'error',

    // 2025年最佳实践：性能相关
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-key': ['error', { 'checkFragmentShorthand': true }],

    // 2025年最佳实践：可访问性
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn'
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      'typescript': {},
      'alias': {
        'map': [
          ['@', './src']
        ],
        'extensions': ['.ts', '.tsx', '.js', '.jsx', '.json']
      }
    }
  },
  plugins: ['@typescript-eslint', 'import', 'jsx-a11y'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-unused-vars': 'off', // 由@typescript-eslint/no-unused-vars替代
        '@typescript-eslint/no-unused-vars': ['error', {
          'varsIgnorePattern': '^(_|Nerv|React)',
          'argsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }],
        'prefer-const': 'off' // 由ESLint原生prefer-const规则替代
      }
    }
  ]
}
