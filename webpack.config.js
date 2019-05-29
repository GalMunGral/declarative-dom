const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'demo/index.ts'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}