const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    main: './frontend/frontend-lib.ts'
  },
  output: {
    path: path.resolve(__dirname, './dist/frontend'),
    filename: '[name]-bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.d.ts']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules|\.d\.ts$/
      },
      {
        test: /\.d\.ts$/,
        loader: 'ignore-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'frontend' }]
    })
  ]
}
