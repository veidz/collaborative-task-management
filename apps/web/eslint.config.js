import reactConfig from '@packages/eslint-config/react.js'

export default [
  ...reactConfig,
  {
    ignores: ['dist', 'node_modules', '.vite'],
  },
]
