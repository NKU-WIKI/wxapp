module.exports = {
  extends: [
    'taro/react'
  ],
  rules: {
    // 可以在这里添加或覆盖规则
    'react/react-in-jsx-scope': 'off', // React 17+ 不需要导入React
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': ['error', {
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    'no-console': 'error',
    'import/first': 'error' // 确保绝对导入在相对导入之前
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
