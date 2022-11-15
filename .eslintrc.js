module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['*.pug', '*.png', '*.bat', '*.md', '*.json', 'LICENSE'],
  rules: {
    '@typescript-eslint/no-misused-promises': 'off'
  }
}
