module.exports = {
  extends: 'standard-with-typescript',
  ignorePatterns: ['*.pug', '*.png', '*.bat', '*.md', '*.json', 'LICENSE'],
  rules: {
    '@typescript-eslint/no-misused-promises': 'off'
  }
}
