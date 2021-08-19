module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['*.pug'],
  rules: {
    "@typescript-eslint/no-misused-promises": "off"
  }
}
