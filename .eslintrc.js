module.exports = {
  extends: ['standard-with-typescript'],
  ignorePatterns: [
    '*.pug',
    '*.png',
    '*.bat',
    '*.md',
    '*.css',
    '*.scss',
    '*.json',
    'LICENSE',
    '**/.github/*',
    '**/modules/*',
    '**/dist/*',
    '**/build/*',
    '**/types/*'
  ],
  rules: {
    '@typescript-eslint/no-misused-promises': 'off'
  },
  parserOptions: {
    project: './tsconfig.json'
  }
}
