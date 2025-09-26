// eslint.config.js
import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

/** @type {import('eslint').Linter.Config} */
export default [
  {
    // 全局忽略文件
    ignores: [
      'node_modules/',
      'dist/',
      'config/',
      'scripts/',
      '.idea/',
      '.vscode/',
      'project.config.json',
      'project.private.config.json',
    ],
  },
  // 配置文件的 Node.js 环境
  {
    files: ['*.config.js', '*.config.cjs', 'babel.config.js', 'stylelint.config.cjs'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
      },
    },
  },
  // 基础配置 (JS)
  eslintJs.configs.recommended,
  // TypeScript 配置
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  {
    // 针对 TS/TSX 文件的规则
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // React 配置
  {
    files: ['src/**/*.jsx', 'src/**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    languageOptions: {
      ...reactPlugin.configs.recommended.languageOptions,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Taro 4.x React 18 之后不再需要
      'react/jsx-uses-react': 'off', // 同上
      'react-hooks/exhaustive-deps': 'warn', // 依赖检查
      'react/prop-types': 'off', // 在 TypeScript 项目中禁用 prop-types
      'react/display-name': 'error', // 要求组件必须有 displayName
      'react-refresh/only-export-components': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
      },
    },
  },
  // Prettier 配置 (必须放在最后)
  prettierConfig,
];
