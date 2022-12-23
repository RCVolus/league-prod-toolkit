module.exports = {
  extends: 'standard-with-typescript',
  ignorePatterns: ['*.pug', '*.png', '*.bat', '*.md', '*.json', 'LICENSE', '**/.github/*'],
  rules: {
    '@typescript-eslint/no-misused-promises': 'off'
  },
  parserOptions: {
    project: './tsconfig.json'
  }
}
