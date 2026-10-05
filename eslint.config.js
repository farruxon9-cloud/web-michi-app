import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist/**', 'dist-admin/**', 'android/**', 'ios/**', 'node_modules/**', 'src-tauri/**', '*.js', '*.cjs', 'scripts/**']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-dupe-keys': 'warn',
      'no-case-declarations': 'off',
      'no-useless-assignment': 'off',
      'no-unused-vars': 'warn',
      'react-refresh/only-export-components': 'off',
      'no-irregular-whitespace': 'warn',
      'no-empty': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off'
    }
  },
])
